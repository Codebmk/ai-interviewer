import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface InterviewQuestion {
  question: string;
  rationale: string;
  framework: string;
}

export interface InterviewFeedback {
  observations: string;
  weakSentence: string | null;
  improvementTip: string;
  followUp: string;
}

export async function getFeedbackForAnswer(question: string, answer: string): Promise<InterviewFeedback> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are a brutally honest, expert senior interviewer. Critique the following candidate response.
      
      Question: "${question}"
      Candidate Answer: "${answer}"
      
      Instructions:
      1. Be brutally specific. Do not give participation trophies.
      2. If it's a behavioral question, identify EXACTLY which part of the STAR framework (Situation, Task, Action, Result) is missing or weak.
      3. Identify exactly ONE specific sentence in the answer that is the weakest or most problematic.
      4. Provide a "Pro-Tip" for improvement.
      
      Provide your response in JSON format with these exact keys:
      - observations: A direct critique (e.g., "You described the situation well but never stated what YOU specifically did").
      - weakSentence: The exact string from the candidate's answer that is weakest. If the answer is too short to pick one, use null.
      - improvementTip: A specific actionable tip to fix the weakness.
      - followUp: A logical, challenging follow-up question.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            observations: { type: Type.STRING },
            weakSentence: { type: Type.STRING, nullable: true },
            improvementTip: { type: Type.STRING },
            followUp: { type: Type.STRING },
          },
          required: ["observations", "weakSentence", "improvementTip", "followUp"],
        },
      },
    });

    if (!response.text) {
      throw new Error("No response from AI");
    }

    return JSON.parse(response.text.trim());
  } catch (error) {
    console.error("AI Feedback Error:", error);
    throw new Error("Failed to get feedback. Please try again.");
  }
}

export interface SessionFeedback {
  strength: string;
  improvement: string;
}

export async function getSessionFeedback(jobTitle: string, sessionData: { question: string; answer: string }[]): Promise<SessionFeedback> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are an expert interview coach. Review the following practice session for the role of "${jobTitle}" and provide a high-level summary.
      
      Session Data:
      ${sessionData.map((d, i) => `Q${i + 1}: ${d.question}\nA${i + 1}: ${d.answer}`).join('\n\n')}
      
      Provide:
      1. One major strength observed across the session.
      2. One specific thing to work on to improve for the real interview.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            strength: {
              type: Type.STRING,
              description: "One major strength observed.",
            },
            improvement: {
              type: Type.STRING,
              description: "One specific thing to work on.",
            },
          },
          required: ["strength", "improvement"],
        },
      },
    });

    if (!response.text) {
      throw new Error("No response from AI");
    }

    return JSON.parse(response.text.trim());
  } catch (error) {
    console.error("Session Feedback Error:", error);
    throw new Error("Failed to get session feedback.");
  }
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
