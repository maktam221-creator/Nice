import { GoogleGenAI, Type } from "@google/genai";
import { HowToStep } from "../../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

/**
 * Generates a step-by-step guide for a given topic using the Gemini API.
 * @param topic The topic for which to generate steps.
 * @returns A formatted string containing the steps.
 */
export const generateSteps = async (topic: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `أنشئ دليلاً إرشاديًا من عدة خطوات حول "${topic}". قدم استجابة JSON فقط.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            steps: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: {
                    type: Type.STRING,
                    description: "عنوان الخطوة.",
                  },
                  description: {
                    type: Type.STRING,
                    description: "شرح مفصل للخطوة.",
                  },
                },
                required: ["title", "description"],
              },
            },
          },
          required: ["steps"],
        },
      },
    });
    
    const jsonResponse = JSON.parse(response.text);
    const steps: HowToStep[] = jsonResponse.steps;

    if (!steps || steps.length === 0) {
        throw new Error("لم يتمكن الذكاء الاصطناعي من إنشاء خطوات.");
    }
    
    // Format the steps into a single string for the caption
    return steps
      .map((step, index) => `الخطوة ${index + 1}: ${step.title}\n${step.description}`)
      .join('\n\n');

  } catch (error) {
    console.error("Error generating steps with Gemini:", error);
    throw new Error("فشل في إنشاء المحتوى. يرجى المحاولة مرة أخرى.");
  }
};
