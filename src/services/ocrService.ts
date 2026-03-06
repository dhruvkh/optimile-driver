import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const extractAddressFromImage = async (base64Image: string): Promise<string | null> => {
  try {
    // Remove data URL prefix if present
    const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");

    const response = await ai.models.generateContent({
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
