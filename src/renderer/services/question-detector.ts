const QUESTION_WORDS = [
  'who', 'what', 'where', 'when', 'why', 'how',
  'can you', 'could you', 'would you', 'will you',
  'tell me', 'describe', 'explain', 'walk me through',
  'what would you', 'how would you', 'what do you',
  'have you', 'did you', 'do you', 'are you', 'were you',
  'is there', 'was there', 'should', 'shall',
  'give me an example', 'what is', 'what are',
];

const IMPERATIVE_PATTERNS = [
  'implement', 'design', 'build', 'write', 'create', 'solve',
  'give me', 'show me', 'tell me about', 'walk me through',
  'talk about', 'share', 'discuss', 'elaborate',
];

const CODING_KEYWORDS = [
  'implement', 'write code', 'write a function', 'solve',
  'algorithm', 'data structure', 'function', 'class',
  'array', 'linked list', 'tree', 'graph', 'hash',
  'sort', 'search', 'binary', 'dynamic programming',
  'leetcode', 'hackerrank', 'coding', 'program',
  'reverse', 'find', 'count', 'maximum', 'minimum',
  'optimize', 'time complexity', 'space complexity',
];

export interface DetectionResult {
  isQuestion: boolean;
  isCodingQuestion: boolean;
  confidence: number;
}

export function detectQuestion(
  text: string,
  sensitivity: number = 60
): DetectionResult {
  const lower = text.toLowerCase().trim();

  if (lower.length < 5) {
    return { isQuestion: false, isCodingQuestion: false, confidence: 0 };
  }

  let score = 0;

  // Check for question mark — strong signal
  if (lower.endsWith('?')) {
    score += 50;
  }

  // Check for question words at the start — strong signal
  for (const word of QUESTION_WORDS) {
    if (lower.startsWith(word)) {
      score += 40;
      break;
    }
  }

  // Check for question words anywhere — moderate signal
  for (const word of QUESTION_WORDS) {
    if (lower.includes(word)) {
      score += 20;
      break;
    }
  }

  // Check for imperative patterns — strong signal
  for (const pattern of IMPERATIVE_PATTERNS) {
    if (lower.includes(pattern)) {
      score += 35;
      break;
    }
  }

  // Length heuristic — longer utterances are more likely questions
  const wordCount = lower.split(' ').length;
  if (wordCount > 15) {
    score += 15;
  } else if (wordCount > 8) {
    score += 10;
  }

  // Check if it's a coding question
  let codingScore = 0;
  for (const keyword of CODING_KEYWORDS) {
    if (lower.includes(keyword)) {
      codingScore += 20;
    }
  }
  const isCodingQuestion = codingScore >= 20;

  // Coding questions are always treated as questions too
  if (isCodingQuestion) {
    score += 20;
  }

  // Apply sensitivity threshold
  // sensitivity 60 → threshold 40, sensitivity 80 → threshold 20, sensitivity 100 → threshold 0
  const threshold = 100 - sensitivity;
  const isQuestion = score >= threshold;

  return {
    isQuestion,
    isCodingQuestion,
    confidence: Math.min(score, 100),
  };
}
