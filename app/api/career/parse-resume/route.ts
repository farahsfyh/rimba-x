import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
        }

        const { file: base64, mimeType } = await request.json()
        if (!base64) {
            return new Response(JSON.stringify({ error: 'File data is required' }), { status: 400 })
        }

        const prompt = `
You are an AI assistant helping a user build a career profile for the Rimba-X learning platform.
Extract the following information from the attached resume document and format it STRICTLY as a JSON object with these exact keys:

{
  "full_name": "String (e.g., Ahmad Faris)",
  "current_level": "MUST be one of [SPM, Diploma, Bachelor, Master, PhD, Professional]",
  "field_of_study": "String (e.g., Computer Science)",
  "institution": "String (e.g., UTM Johor Bahru)",
  "current_skills": ["Skill 1", "Skill 2", ...],
  "work_experience": [
     { "company": "String", "role": "String", "duration_months": Number }
  ]
}

If any field is missing or cannot be inferred, return an empty string or empty array according to the key types. 
Duration in months should be estimated as a number.

Return ONLY JSON. No other conversational text wrapper.
`;

        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

        const pdfPart = {
            inlineData: {
                data: base64,
                mimeType: mimeType || 'application/pdf'
            }
        }

        const result = await model.generateContent([prompt, pdfPart])
        const responseText = result.response.text().trim()

        // Clean markdown blocks if present
        let cleaned = responseText;
        if (cleaned.startsWith('```')) {
            cleaned = cleaned.replace(/```json/g, '').replace(/```/g, '').trim();
        }

        const data = JSON.parse(cleaned);

        return new Response(JSON.stringify({ data }), {
            headers: { 'Content-Type': 'application/json' }
        })

    } catch (error: any) {
         console.error('[parse-resume] Error:', error)
         return new Response(JSON.stringify({ error: error.message || 'Failed to parse resume' }), { status: 500 })
    }
}
