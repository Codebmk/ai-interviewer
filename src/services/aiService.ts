import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface InterviewQuestion {
  question: string;
  rationale: string;
}

export async function generateInterviewQuestions(jobTitle: string): Promise<InterviewQuestion[]> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate 3 thoughtful, professional interview questions for the role of "${jobTitle}". 
      Include a brief rationale for why each question is important for this specific role.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: {
                type: Type.STRING,
                description: "The interview question text.",
              },
              rationale: {
                type: Type.STRING,
                description: "Why this question is relevant for the role.",
              },
            },
            required: ["question", "rationale"],
          },
        },
      },
    });

    if (!response.text) {
      throw new Error("No response from AI");
    }

    return JSON.parse(response.text.trim());
  } catch (error) {
    console.error("AI Service Error:", error);
    throw new Error("Failed to generate questions. Please try again later.");
  }
}
