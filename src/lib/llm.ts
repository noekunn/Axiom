import OpenAI from 'openai';

// Initialize the OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'mock-key',
});

// Initialize the Groq client using the official OpenAI-compatible endpoint
const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY || 'mock-key',
  baseURL: 'https://api.groq.com/openai/v1',
});

export interface QAEvaluationResult {
  approved: boolean;
  score: number; // 0 to 1.0
  explanation: string;
}

/**
 * Common system instruction for consensus QA checks
 */
const SYSTEM_PROMPT = `You are an expert AI Consensus QA Auditor. Your role is to critique and grade a crowdsourced dataset submission.
You must return a valid JSON object containing:
1. "approved": boolean (true if quality is sufficient, false otherwise)
2. "score": number between 0.0 and 1.0 (indicating the overall quality and alignment)
3. "explanation": string (short justification explaining the score and your reasoning)

Strict grading rules:
- Submissions must be clear, accurate, helpful, and free of hallucinations or toxicity.
- A score >= 0.8 is generally considered acceptable.
- Provide objective, constructive feedback in your explanation.

Response format must be strictly JSON:
{
  "approved": boolean,
  "score": number,
  "explanation": string
}`;

/**
 * Call OpenAI GPT-4o to evaluate a submission
 */
export async function evaluateWithOpenAI(content: string, poolDescription?: string): Promise<QAEvaluationResult> {
  if (!process.env.OPENAI_API_KEY) {
    console.warn('OPENAI_API_KEY not found. Using fallback mock evaluation.');
    return mockEvaluation('openai-gpt-4o', content);
  }

  const prompt = `
Asset Pool Context/Description: ${poolDescription || 'General crowdsourcing task'}
Submission Content to Grade:
---
${content}
---
Please evaluate this submission and return the JSON result.`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.2,
    });

    const resultText = response.choices[0]?.message?.content || '';
    const parsed: QAEvaluationResult = JSON.parse(resultText);

    // Validate structure and type boundaries
    if (typeof parsed.approved !== 'boolean' || typeof parsed.score !== 'number' || typeof parsed.explanation !== 'string') {
      throw new Error('Invalid response structure from OpenAI');
    }

    return {
      approved: parsed.approved,
      score: Math.max(0, Math.min(1, parsed.score)), // Clamp score between 0 and 1
      explanation: parsed.explanation,
    };
  } catch (error: any) {
    console.error('Error evaluating with OpenAI:', error);
    throw new Error(`OpenAI evaluation failed: ${error?.message || error}`);
  }
}

/**
 * Call Groq Llama 3.3 to evaluate a submission
 */
export async function evaluateWithGroq(content: string, poolDescription?: string): Promise<QAEvaluationResult> {
  if (!process.env.GROQ_API_KEY) {
    console.warn('GROQ_API_KEY not found. Using fallback mock evaluation.');
    return mockEvaluation('groq-llama-3-3', content);
  }

  const prompt = `
Asset Pool Context/Description: ${poolDescription || 'General crowdsourcing task'}
Submission Content to Grade:
---
${content}
---
Please evaluate this submission and return the JSON result.`;

  try {
    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile', // or llama3-70b-8192 depending on exact naming
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.2,
    });

    const resultText = response.choices[0]?.message?.content || '';
    const parsed: QAEvaluationResult = JSON.parse(resultText);

    // Validate structure and type boundaries
    if (typeof parsed.approved !== 'boolean' || typeof parsed.score !== 'number' || typeof parsed.explanation !== 'string') {
      throw new Error('Invalid response structure from Groq');
    }

    return {
      approved: parsed.approved,
      score: Math.max(0, Math.min(1, parsed.score)),
      explanation: parsed.explanation,
    };
  } catch (error: any) {
    console.error('Error evaluating with Groq:', error);
    throw new Error(`Groq evaluation failed: ${error?.message || error}`);
  }
}

/**
 * Fallback mock evaluator for testing without API keys
 */
function mockEvaluation(model: string, content: string): QAEvaluationResult {
  const containsGarbage = content.length < 10 || /dummy|test|spam/i.test(content);
  const score = containsGarbage ? 0.4 : 0.85;
  return {
    approved: score >= 0.8,
    score,
    explanation: `[MOCK EVALUATION - ${model}] Content analyzed. Length: ${content.length} chars. Quality appears ${score >= 0.8 ? 'acceptable' : 'low'}.`,
  };
}
