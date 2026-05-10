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
  weakestDimensions?: string[];
  detailedAnalysis: {
    benchmarkedAnswer: string;
    toneCritique: string;
    vagueClaims: string[];
    passiveLanguage: string[];
  }[];
}

export async function getSessionFeedback(jobTitle: string, sessionData: { question: string; answer: string }[], round: number): Promise<SessionFeedback> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are an expert interview coach. Review the responses for the role of "${jobTitle}" for Round ${round} and provide a high-level summary and detailed analysis.
      
      Session Data:
      ${sessionData.map((d, i) => `Q${i + 1}: ${d.question}\nA${i + 1}: ${d.answer}`).join('\n\n')}
      
      Provide:
      1. One major strength observed.
      2. One specific thing to work on.
      3. ${round === 1 ? 'Identify exactly TWO professional dimensions (e.g., "Conflict Resolution", "Strategic Thinking", "Technical Depth") where the candidate was weakest in these answers.' : ''}
      4. For each question:
         - A "Gold Standard" benchmarked answer.
         - A tone critique focusing on clarity and ownership.
         - A list of vague claims found (e.g. "helped with" vs "led").
         - A list of any passive language found (e.g. "was done" vs "I did").`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            strength: { type: Type.STRING },
            improvement: { type: Type.STRING },
            weakestDimensions: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "Only provide if Round is 1. Exactly 2 weakest dimensions."
            },
            detailedAnalysis: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  benchmarkedAnswer: { type: Type.STRING },
                  toneCritique: { type: Type.STRING },
                  vagueClaims: { 
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  },
                  passiveLanguage: { 
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  },
                },
                required: ["benchmarkedAnswer", "toneCritique", "vagueClaims", "passiveLanguage"],
              }
            },
          },
          required: ["strength", "improvement", "detailedAnalysis"],
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

export async function generateFollowUpQuestions(jobTitle: string, sessionData: { question: string; answer: string }[], weakDimensions: string[]): Promise<InterviewQuestion[]> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are an expert interviewer for "${jobTitle}".
      Candidate has finished Round 1. Their weakest areas were: ${weakDimensions.join(', ')}.
      
      Generate 2 deep-dive follow-up questions specifically targeting these weak dimensions based on their previous answers.
      
      Previous Context:
      ${sessionData.map((d, i) => `Q: ${d.question}\nA: ${d.answer}`).join('\n\n')}
      
      Provide questions that force them to explain their logic or results in these specific areas.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  rationale: { type: Type.STRING },
                  framework: { type: Type.STRING },
                },
                required: ["question", "rationale", "framework"],
              },
            },
          },
          required: ["questions"],
        },
      },
    });

    if (!response.text) throw new Error("No response");
    const data = JSON.parse(response.text.trim());
    return data.questions;
  } catch (error) {
    console.error("AI Follow-up Error:", error);
    throw new Error("Failed to generate follow-up questions.");
  }
}

export async function generateCurveballQuestion(jobTitle: string): Promise<InterviewQuestion> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate 1 unexpected "curveball" question for the role of "${jobTitle}". 
      This should be a question designed to test the candidate's ability to think on their feet, their cultural fit, or their values (e.g. "If you could change one thing about our industry overnight, what would it be?").
      
      Provide the question, rationale, and a suggested framework.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            rationale: { type: Type.STRING },
            framework: { type: Type.STRING },
          },
          required: ["question", "rationale", "framework"],
        },
      },
    });

    if (!response.text) throw new Error("No response");
    return JSON.parse(response.text.trim());
  } catch (error) {
    console.error("AI Curveball Error:", error);
    throw new Error("Failed to generate curveball question.");
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
