import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

/**
 * Get Gemini model instance
 */
export function getGeminiModel(modelName: string = 'gemini-1.5-flash') {
  return genAI.getGenerativeModel({ model: modelName });
}

/**
 * System prompt for the AI tutor
 */
export const TUTOR_SYSTEM_PROMPT = `You are a patient, encouraging AI tutor for Southeast Asian students.

Your teaching style:
- Break down concepts step-by-step
- Use simple, clear language appropriate for the student's level
- Check for understanding frequently with questions
- Provide examples relevant to ASEAN contexts (Singapore, Malaysia, Indonesia, Vietnam, Thailand, Philippines)
- Encourage critical thinking with guiding questions
- Celebrate effort and progress
- Be culturally sensitive and inclusive

Important guidelines:
- Base your answers ONLY on the provided context from the student's materials
- If the context doesn't contain relevant information, acknowledge this politely
- Ask if the student would like to upload additional materials
- Never overwhelm with too much information at once
- Use everyday examples that students can relate to
- Be supportive and never make students feel inadequate
- If a student struggles, offer alternative explanations
- Encourage questions and curiosity

Remember: You're not just answering questions, you're helping students learn how to learn.`;

/**
 * Generate chat response with context
 */
export async function generateTutorResponse(
  userQuestion: string,
  context: string,
  conversationHistory: Array<{ role: 'user' | 'model'; content: string }>
): Promise<string> {
  const model = getGeminiModel();
  
  // Build the full prompt with context
  const contextPrompt = context 
    ? `Context from student's materials:\n${context}\n\n`
    : 'No specific context available from uploaded materials.\n\n';
  
  const fullSystemPrompt = `${TUTOR_SYSTEM_PROMPT}\n\n${contextPrompt}`;
  
  // Start chat with history
  const chat = model.startChat({
    history: conversationHistory.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    })),
    generationConfig: {
      maxOutputTokens: 1000,
      temperature: 0.7,
      topP: 0.9,
      topK: 40,
    },
  });
  
  // Send message with system prompt prepended to first message
  const messageWithContext = conversationHistory.length === 0
    ? `${fullSystemPrompt}\n\nStudent question: ${userQuestion}`
    : userQuestion;
  
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
  const model = getGeminiModel();
  
  const contextPrompt = context 
    ? `Context from student's materials:\n${context}\n\n`
    : 'No specific context available from uploaded materials.\n\n';
  
  const fullSystemPrompt = `${TUTOR_SYSTEM_PROMPT}\n\n${contextPrompt}`;
  
  const chat = model.startChat({
    history: conversationHistory.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    })),
    generationConfig: {
      maxOutputTokens: 1000,
      temperature: 0.7,
    },
  });
  
  const messageWithContext = conversationHistory.length === 0
    ? `${fullSystemPrompt}\n\nStudent question: ${userQuestion}`
    : userQuestion;
  
  const result = await chat.sendMessageStream(messageWithContext);
  
  for await (const chunk of result.stream) {
    const chunkText = chunk.text();
    yield chunkText;
  }
}
