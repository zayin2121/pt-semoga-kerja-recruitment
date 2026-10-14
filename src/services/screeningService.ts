import mammoth from 'mammoth';
import { Job, ScreeningCriterion, ScreeningResult, ScreeningEvidence } from '../types/recruitment';

/**
 * Extracts plain text from a PDF ArrayBuffer by inspecting PDF text streams (BT ... ET, Tj, TJ)
 */
export function extractTextFromPdfBuffer(buffer: ArrayBuffer): string {
  try {
    const bytes = new Uint8Array(buffer);
    const textDecoder = new TextDecoder('latin1');
    const rawString = textDecoder.decode(bytes);

    // Look for text streams enclosed in BT (Begin Text) and ET (End Text)
    const textBlocks: string[] = [];
    const btRegex = /BT[\s\S]*?ET/g;
    let match: RegExpExecArray | null;
    while ((match = btRegex.exec(rawString)) !== null) {
      const block = match[0];
      // Match (string) Tj or [(array of strings)] TJ
      const tjRegex = /\(([^)]*)\)\s*Tj/g;
      let tjMatch: RegExpExecArray | null;
      while ((tjMatch = tjRegex.exec(block)) !== null) {
        textBlocks.push(tjMatch[1]);
      }
      // TJ array format
      const tjArrayRegex = /\[(.*?)\]\s*TJ/g;
      let tjArrayMatch: RegExpExecArray | null;
      while ((tjArrayMatch = tjArrayRegex.exec(block)) !== null) {
        const inner = tjArrayMatch[1];
        const stringParts = inner.match(/\(([^)]*)\)/g);
        if (stringParts) {
          const joined = stringParts.map(s => s.replace(/[()]/g, '')).join('');
          textBlocks.push(joined);
        }
      }
    }

    let extracted = textBlocks.join(' ').replace(/\\r|\\n/g, ' ').replace(/\s+/g, ' ').trim();

    // If PDF text streams were compressed or sparse, fallback to scanning readable ascii words (> 3 chars)
    if (extracted.length < 50) {
      const readableWords = rawString.match(/[a-zA-Z0-9.,@/+-]{3,}/g) || [];
      const filtered = readableWords.filter(
        w => !['obj', 'endobj', 'stream', 'endstream', 'xref', 'trailer', 'startxref', 'FlateDecode'].includes(w)
      );
      if (filtered.length > 30) {
        extracted = filtered.slice(0, 1500).join(' ');
      }
    }

    return extracted;
  } catch (err) {
    console.error('Error extracting text from PDF:', err);
    return '';
  }
}

/**
 * Extracts plain text from a DOCX ArrayBuffer using mammoth
 */
export async function extractTextFromDocxBuffer(buffer: ArrayBuffer): Promise<string> {
  try {
    const result = await mammoth.extractRawText({ arrayBuffer: buffer });
    return result.value || '';
  } catch (err) {
    console.error('Error extracting text from DOCX:', err);
    return '';
  }
}

/**
 * Parses CV file and extracts raw text
 */
export async function extractCvText(file: File): Promise<{ text: string; status: 'clean' | 'partial' | 'manual_review' }> {
  const buffer = await file.arrayBuffer();
  let text = '';
  const extension = file.name.split('.').pop()?.toLowerCase();

  if (extension === 'pdf') {
    text = extractTextFromPdfBuffer(buffer);
  } else if (extension === 'docx') {
    text = await extractTextFromDocxBuffer(buffer);
  }

  // Determine quality status
  if (!text || text.trim().length < 40) {
    return {
      text: '',
      status: 'manual_review', // likely scanned image PDF
    };
  } else if (text.length < 150) {
    return {
      text,
      status: 'partial',
    };
  }

  return {
    text,
    status: 'clean',
  };
}

/**
 * Evaluates candidate CV text against job requirements and screening criteria
 */
export function evaluateCandidateCv(
  cvText: string,
  candidateSkills: string[],
  job: Job,
  extractionStatus: 'clean' | 'partial' | 'manual_review'
): ScreeningResult {
  const criteria = job.screeningCriteria && job.screeningCriteria.length > 0
    ? job.screeningCriteria
    : generateDefaultCriteriaFromJob(job);

  const combinedSearchText = (cvText + ' ' + candidateSkills.join(' ')).toLowerCase();
  const evidenceList: ScreeningEvidence[] = [];

  let mandatoryTotalWeight = 0;
  let mandatoryEarnedWeight = 0;
  let optionalTotalWeight = 0;
  let optionalEarnedWeight = 0;

  for (const crit of criteria) {
    const isMandatory = crit.type === 'mandatory';
    const weight = crit.weight || (isMandatory ? 10 : 5);

    if (isMandatory) {
      mandatoryTotalWeight += weight;
    } else {
      optionalTotalWeight += weight;
    }

    // Check keywords
    const keywordsToSearch = crit.keywords && crit.keywords.length > 0
      ? crit.keywords
      : [crit.label];

    let foundKeyword = '';
    let foundIndex = -1;

    for (const kw of keywordsToSearch) {
      const idx = combinedSearchText.indexOf(kw.toLowerCase().trim());
      if (idx !== -1) {
        foundKeyword = kw;
        foundIndex = idx;
        break;
      }
    }

    const isFound = foundIndex !== -1;
    let snippet = '';

    if (isFound && cvText.length > 0) {
      // Find where in raw cvText it appears
      const rawIdx = cvText.toLowerCase().indexOf(foundKeyword.toLowerCase());
      if (rawIdx !== -1) {
        const start = Math.max(0, rawIdx - 40);
        const end = Math.min(cvText.length, rawIdx + foundKeyword.length + 60);
        snippet = `"...${cvText.substring(start, end).replace(/\s+/g, ' ').trim()}..."`;
      } else {
        snippet = `Dikonfirmasi dari keahlian formulir: "${foundKeyword}"`;
      }
    } else {
      snippet = 'Tidak ditemukan dalam dokumen';
    }

    if (isFound) {
      if (isMandatory) {
        mandatoryEarnedWeight += weight;
      } else {
        optionalEarnedWeight += weight;
      }
    }

    evidenceList.push({
      criterionId: crit.id,
      criterionLabel: crit.label,
      isMandatory,
      isFound,
      snippet,
    });
  }

  const mandatoryScore = mandatoryTotalWeight > 0
    ? Math.round((mandatoryEarnedWeight / mandatoryTotalWeight) * 100)
    : 100;
  const optionalScore = optionalTotalWeight > 0
    ? Math.round((optionalEarnedWeight / optionalTotalWeight) * 100)
    : 100;

  // Final weighted calculation: Mandatory 70%, Optional 30%
  const finalScore = Math.round(mandatoryScore * 0.7 + optionalScore * 0.3);
  const passedMandatory = mandatoryScore >= 60;

  const summary = extractionStatus === 'manual_review'
    ? 'Dokumen berbasis gambar / scan tanpa teks terbaca. Diperlukan pemeriksaan manual oleh tim HRD.'
    : `Pencocokan kriteria wajib: ${mandatoryScore}% (${evidenceList.filter(e => e.isMandatory && e.isFound).length}/${evidenceList.filter(e => e.isMandatory).length} kriteria). Kriteria tambahan: ${optionalScore}%.`;

  return {
    score: finalScore,
    mandatoryScore,
    optionalScore,
    passedMandatory,
    extractionStatus,
    evidence: evidenceList,
    summaryNote: summary,
    processedAt: new Date().toISOString(),
  };
}

/**
 * Generate fallback criteria if none configured
 */
export function generateDefaultCriteriaFromJob(job: Job): ScreeningCriterion[] {
  const criteria: ScreeningCriterion[] = [];

  job.requirementsMandatory?.forEach((req, idx) => {
    criteria.push({
      id: `mand-${idx}`,
      label: req,
      type: 'mandatory',
      weight: 10,
      keywords: extractKeywordsFromSentence(req),
    });
  });

  job.requirementsOptional?.forEach((req, idx) => {
    criteria.push({
      id: `opt-${idx}`,
      label: req,
      type: 'optional',
      weight: 5,
      keywords: extractKeywordsFromSentence(req),
    });
  });

  return criteria;
}

function extractKeywordsFromSentence(sentence: string): string[] {
  // Extract key technical words or phrases
  const stopWords = new Set(['yang', 'dan', 'di', 'ke', 'dari', 'untuk', 'pada', 'dengan', 'adalah', 'atau', 'minimal', 'bisa', 'mampu', 'memiliki', 'pengalaman', 'tahun', 'pendidikan', 'jurusan']);
  const words = sentence
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 2 && !stopWords.has(w.toLowerCase()));

  return words.slice(0, 4);
}
