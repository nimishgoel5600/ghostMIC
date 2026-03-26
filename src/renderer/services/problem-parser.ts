import type { CodingSolution } from '../../shared/types';

/**
 * Parse a raw LLM response (expected in the ## Understanding / ## Approach / ## Solution format)
 * into a structured CodingSolution object.
 */
export function parseSolutionResponse(
  raw: string,
  problemId: string,
  language: string,
  model: string,
  solveTime: number
): CodingSolution {
  const understanding = extractSection(raw, 'Understanding') || '';
  const approach = extractSection(raw, 'Approach') || '';
  const code = extractCodeBlock(raw) || '';
  const complexity = extractSection(raw, 'Complexity') || '';
  const edgeCasesRaw = extractSection(raw, 'Edge Cases') || extractSection(raw, 'Edge Cases Handled') || '';

  // Parse complexity
  const timeMatch = complexity.match(/Time:\s*(.+)/i);
  const spaceMatch = complexity.match(/Space:\s*(.+)/i);

  // Parse edge cases
  const edgeCases = edgeCasesRaw
    .split('\n')
    .map((l) => l.replace(/^[-•*]\s*/, '').trim())
    .filter(Boolean);

  return {
    id: `solution-${Date.now()}`,
    problemId,
    understanding,
    approach,
    code,
    language: language as CodingSolution['language'],
    timeComplexity: timeMatch?.[1]?.trim() || 'Unknown',
    spaceComplexity: spaceMatch?.[1]?.trim() || 'Unknown',
    edgeCases,
    model: model as CodingSolution['model'],
    solveTime,
  };
}

function extractSection(text: string, sectionName: string): string | null {
  const pattern = new RegExp(`##\\s*${sectionName}[^\\n]*\\n([\\s\\S]*?)(?=##|$)`, 'i');
  const match = text.match(pattern);
  return match?.[1]?.trim() || null;
}

function extractCodeBlock(text: string): string | null {
  const match = text.match(/```[\w]*\n([\s\S]*?)```/);
  return match?.[1]?.trim() || null;
}
