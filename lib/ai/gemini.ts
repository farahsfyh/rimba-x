import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

/**
 * Get Gemini model instance
 */
export function getGeminiModel(modelName: string = 'gemini-2.0-flash') {
  return genAI.getGenerativeModel({ model: modelName });
}

/**
 * System prompt for the AI tutor
 */
export const TUTOR_SYSTEM_PROMPT = `You are a focused AI tutor that teaches ONLY from the student's uploaded learning materials.

CRITICAL RULES — follow these absolutely:
1. ONLY answer using information explicitly present in the [CONTEXT] provided with each message.
2. If the [CONTEXT] is empty or does not contain relevant information, respond ONLY with: "I don't have enough information in your uploaded materials to answer this. Please upload a document that covers this topic."
3. Do NOT use your general training knowledge to fill in gaps. Do NOT speculate or infer beyond the provided context.
4. Do NOT make up facts, definitions, formulas, or explanations that are not in the context.
5. If the context partially answers the question, share only what the context says and clearly state what is not covered.

When the context DOES contain the answer:
- Break down the explanation step-by-step using only the material provided
- Quote or paraphrase directly from the context
- Use simple, clear language appropriate for the student's level
- Be encouraging and supportive
- Check for understanding with a follow-up question

Teaching style:
- Be culturally sensitive and inclusive for Southeast Asian students
- Celebrate effort and progress
- Never overwhelm with too much information at once

Your only knowledge source is the [CONTEXT] block. Nothing else.`;

/**
 * Generate chat response with context
 */
export async function generateTutorResponse(
  userQuestion: string,
  context: string,
  conversationHistory: Array<{ role: 'user' | 'model'; content: string }>
): Promise<string> {
  // Use systemInstruction for the static tutor persona
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    systemInstruction: TUTOR_SYSTEM_PROMPT,
  });

  // Always inject the retrieved context into each user message
  // Context is guaranteed non-empty here (route handler short-circuits otherwise)
  const contextBlock = `[CONTEXT FROM STUDENT'S UPLOADED MATERIALS — USE ONLY THIS]
${context}
[END CONTEXT]

IMPORTANT: Base your entire answer ONLY on the [CONTEXT] above. Do NOT use outside knowledge.`;

  const messageWithContext = `${contextBlock}\n\nStudent question: ${userQuestion}`;

  const chat = model.startChat({
    history: conversationHistory.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    })),
    generationConfig: {
      maxOutputTokens: 1200,
      temperature: 0.1,  // Very low — stay strictly on provided text
      topP: 0.85,
      topK: 10,
    },
  });

  const result = await chat.sendMessage(messageWithContext);
  return result.response.text();
}

/**
 * Generate streaming response
 */
export async function* generateStreamingResponse(
  userQuestion: string,
  context: string,
  conversationHistory: Array<{ role: 'user' | 'model'; content: string }>
): AsyncGenerator<string> {
  // Use systemInstruction for the static tutor persona
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    systemInstruction: TUTOR_SYSTEM_PROMPT,
  });

  // Always inject the retrieved context into each user message
  // Context is guaranteed non-empty here (route handler short-circuits otherwise)
  const contextBlock = `[CONTEXT FROM STUDENT'S UPLOADED MATERIALS — USE ONLY THIS]
${context}
[END CONTEXT]

IMPORTANT: Base your entire answer ONLY on the [CONTEXT] above. Do NOT use outside knowledge.`;

  const messageWithContext = `${contextBlock}\n\nStudent question: ${userQuestion}`;

  const chat = model.startChat({
    history: conversationHistory.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    })),
    generationConfig: {
      maxOutputTokens: 1200,
      temperature: 0.1,  // Very low — stay strictly on provided text
      topP: 0.85,
      topK: 10,
    },
  });

  const result = await chat.sendMessageStream(messageWithContext);

  for await (const chunk of result.stream) {
    const chunkText = chunk.text();
    yield chunkText;
  }
}
