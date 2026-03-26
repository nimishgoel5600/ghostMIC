import type { AppSettings, QAPair, CodingProblem } from '../../shared/types';

export function buildInterviewSystemPrompt(settings: AppSettings): string {
  const resume = settings.resumeParsed;
  const jd = settings.jobDescription;

  let resumeSection = 'No resume uploaded.';
  if (resume) {
    const expText = resume.experience
      .map((e) => `${e.role} at ${e.company} (${e.dates})\n${e.bullets.map((b) => `  - ${b}`).join('\n')}`)
      .join('\n\n');

    const eduText = resume.education
      .map((e) => `${e.degree} — ${e.institution} (${e.dates})`)
      .join('\n');

    const projText = resume.projects
      .map((p) => `${p.name}: ${p.description}`)
      .join('\n');

    resumeSection = `Name: ${resume.name}
Skills: ${resume.skills.join(', ')}
\nExperience:\n${expText}
\nEducation:\n${eduText}
\nProjects:\n${projText}
\nCertifications: ${resume.certifications.join(', ')}`;
  }

  // Extract role/company from JD
  const roleMatch = jd.match(/(?:role|position|title)[:\s]*(.+)/i);
  const companyMatch = jd.match(/(?:company|organization)[:\s]*(.+)/i);
  const roleTitle = roleMatch?.[1]?.trim() || 'the role';
  const companyName = companyMatch?.[1]?.trim() || 'the company';

  return `You are acting as the ideal candidate for the role of ${roleTitle} at ${companyName}.

CANDIDATE'S BACKGROUND (from resume):
${resumeSection}

JOB DESCRIPTION:
${jd || 'No job description provided.'}

ADDITIONAL CONTEXT:
${settings.additionalContext || 'None provided.'}

INSTRUCTIONS:
- You ARE the candidate. Answer in first person as if YOU have this experience.
- Give the answer that a SUPER INTELLIGENT, ideal candidate would give.
- Be specific — reference actual projects, metrics, technologies from the resume.
- If the question is behavioral, use STAR format (Situation, Task, Action, Result) with concrete examples from the resume.
- If the question is technical/system design, demonstrate deep expertise. Draw from resume projects but also show broader knowledge.
- If the question is about motivation/culture fit, connect your genuine experience to the company's mission.
- Keep the answer natural and conversational — not robotic or over-structured.
- Match the response length to the question complexity:
  - Simple questions → 3-4 sentences
  - Behavioral questions → 6-8 sentences with STAR
  - Technical deep-dives → comprehensive but organized
- If you don't have directly relevant experience in the resume, intelligently extrapolate from related experience.
- NEVER say "I don't have experience with that" — always find a connection.
- End with a brief insight or forward-looking statement when appropriate.

RESPONSE STYLE: ${settings.responseStyle}
TONE: ${settings.responseTone}`;
}

export function buildInterviewUserPrompt(
  question: string,
  conversationHistory: QAPair[]
): string {
  let historyText = '';
  if (conversationHistory.length > 0) {
    const recent = conversationHistory.slice(0, 5);
    historyText = '\nCONVERSATION HISTORY (most recent first):\n' +
      recent.map((qa) => `Q: ${qa.question}\nA: ${qa.answer}`).join('\n\n') +
      '\n\n';
  }

  return `${historyText}QUESTION: ${question}\n\nProvide your answer:`;
}

export function buildCodingSolverPrompt(
  problem: CodingProblem,
  settings: AppSettings
): { system: string; user: string } {
  const lang = settings.preferredLanguage;

  const system = `You are an expert competitive programmer and software engineer. Solve coding problems optimally.

${settings.codeIncludeComments ? 'Include clear inline comments.' : 'Minimal comments.'}
${settings.codeIncludeComplexity ? 'Include time and space complexity analysis.' : ''}
${settings.codeIncludeEdgeCases ? 'Handle and list edge cases.' : ''}
${settings.codeIncludeAlternatives ? 'Mention a simpler brute-force alternative if applicable.' : ''}`;

  const examplesText = problem.examples
    .map((ex, i) => `Example ${i + 1}:\n  Input: ${ex.input}\n  Output: ${ex.output}\n  Explanation: ${ex.explanation}`)
    .join('\n');

  const user = `PROBLEM: ${problem.title}

${problem.description}

CONSTRAINTS:
${problem.constraints || 'None specified.'}

EXAMPLES:
${examplesText || 'None provided.'}

PREFERRED LANGUAGE: ${lang}

Respond in this EXACT format:

## Understanding
(2-3 sentences about what the problem is asking)

## Approach
(What data structure/algorithm you'll use and WHY)

## Solution
\`\`\`${lang}
(complete, runnable code with imports)
\`\`\`

## Complexity
- Time: O(?) — (explanation)
- Space: O(?) — (explanation)

## Edge Cases Handled
- (edge case 1)
- (edge case 2)
...`;

  return { system, user };
}

export function buildProblemDetectionPrompt(ocrText: string): string {
  return `Analyze this text extracted from a screen capture. Is this a coding problem/assessment?

If YES, extract and return as JSON:
{
  "is_coding_problem": true,
  "platform_detected": "HackerRank|Glider|CodeSignal|LeetCode|CoderPad|Unknown",
  "title": "problem title if visible",
  "description": "full problem statement",
  "constraints": "any constraints mentioned",
  "examples": [{"input": "...", "output": "...", "explanation": "..."}],
  "tags": ["Array", "Hash Table", etc.],
  "difficulty": "Easy|Medium|Hard|Unknown"
}

If NO, return: {"is_coding_problem": false}

TEXT FROM SCREEN:
${ocrText}`;
}
