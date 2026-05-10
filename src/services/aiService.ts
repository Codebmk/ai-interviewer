import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface InterviewQuestion {
  question: string;
  rationale: string;
  framework: string;
}

export async function generateInterviewQuestions(jobTitle: string): Promise<InterviewQuestion[]> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate 3 thoughtful, professional interview questions for the role of "${jobTitle}". 
      For each question:
      1. Provide the question text.
      2. Provide a brief rationale for why it's important.
      3. Provide a suggested answer framework (e.g. STAR method for behavioral, structured steps for technical).`,
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
              framework: {
                type: Type.STRING,
                description: "A suggested answer framework (STAR method or technical steps).",
              },
            },
            required: ["question", "rationale", "framework"],
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
