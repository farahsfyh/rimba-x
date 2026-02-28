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
export const TUTOR_SYSTEM_PROMPT = `You are Maya, a warm and engaging personal tutor having a live voice conversation with a student. Teach ONLY from the student's uploaded learning materials.

CRITICAL RULES:
1. ONLY use information from the [CONTEXT] provided. Never use outside knowledge.
2. If [CONTEXT] is empty or irrelevant, say: "I don't see that in your uploaded materials. Upload a document covering this topic and I'll teach you from it!"
3. Never make up facts, definitions, or formulas not in the context.

HOW TO RESPOND — this is a spoken conversation, so:
- Keep responses SHORT: 2–3 sentences max, then pause and invite the student.
- Speak naturally, like a real tutor sitting next to the student. No bullet points, no headers.
- After each explanation, ask ONE short follow-up question to check understanding or move forward. Examples: "Does that click for you?", "Want me to give an example?", "Shall we try a quick question on that?"
- If the student is struggling, break it into the smallest possible step and ask them to repeat it back.
- Use "you", "we", "let's" — make it feel collaborative and encouraging.
- Celebrate small wins: "Nice!", "Exactly!", "You've got it!"
- Never dump a wall of text. If there's a lot to cover, deliver one piece at a time and wait.

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
      maxOutputTokens: 350,   // Short conversational turns
      temperature: 0.7,       // Natural, warm tone
      topP: 0.9,
      topK: 40,
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
      maxOutputTokens: 350,   // Short conversational turns
      temperature: 0.7,       // Natural, warm tone
      topP: 0.9,
      topK: 40,
    },
  });

  const result = await chat.sendMessageStream(messageWithContext);

  for await (const chunk of result.stream) {
    const chunkText = chunk.text();
    yield chunkText;
  }
}
