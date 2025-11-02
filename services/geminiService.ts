
import { GoogleGenAI } from "@google/genai";

export const enhancePost = async (text: string): Promise<string> => {
    const API_KEY = process.env.API_KEY;

    if (!API_KEY) {
        console.warn("API_KEY is not set. AI features will be disabled.");
        return text;
    }

    try {
        const ai = new GoogleGenAI({ apiKey: API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `أعد صياغة هذا المنشور ليكون أكثر جاذبية وإبداعًا، مع الحفاظ على جوهر الرسالة. اجعله موجزًا ومناسبًا لوسائل التواصل الاجتماعي. المنشور الأصلي: "${text}"`,
        });
        return response.text.trim();
    } catch (error) {
        console.error("Error enhancing post with Gemini:", error);
        // In case of an error, return the original text
        return text;
    }
};
