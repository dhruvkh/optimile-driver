import { GoogleGenAI } from "@google/genai";

let ai: GoogleGenAI | null = null;

const getAIClient = () => {
  if (!ai) {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error(
        "VITE_GEMINI_API_KEY is not set. Please configure your environment variables."
      );
    }
    ai = new GoogleGenAI({ apiKey });
  }
  return ai;
};

export const extractAddressFromImage = async (base64Image: string): Promise<string | null> => {
  try {
    const aiClient = getAIClient();
    // Remove data URL prefix if present
    const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");

    const response = await aiClient.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: {
        parts: [
          {
            text: "Extract the full address from this image. Return ONLY the address string, nothing else. If no address is found, return 'null'.",
          },
          {
            inlineData: {
              data: base64Data,
              mimeType: "image/jpeg",
            },
          },
        ],
      },
    });

    const text = response.text;
    return (!text || text.trim() === 'null') ? null : text.trim();
  } catch (error) {
    console.error("OCR Error:", error);
    return null;
  }
};
