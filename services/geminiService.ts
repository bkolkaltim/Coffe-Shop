import { GoogleGenAI } from "@google/genai";
import type { MenuItem } from "../types";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const generateDailySpecial = async (menuItems: MenuItem[]): Promise<string> => {
  try {
    if (menuItems.length === 0) {
      return "Chef's Choice: A delightful surprise awaits you today!";
    }
    const itemNames = menuItems.map(item => item.name).join(', ');
    const prompt = `
      You are the creative director for a trendy coffee shop.
      Based on the following menu items, suggest a creative and appealing "Special of the Day".
      Keep the name short and catchy, and the description to one sentence.
      Format the response as: "Special Name: Description".
      Do not use markdown.

      Menu: ${itemNames}
    `;

    // FIX: Updated generateContent call to pass prompt as a string and added thinkingConfig.
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: 0.8,
        maxOutputTokens: 50,
        thinkingConfig: { thinkingBudget: 25 },
      }
    });

    return response.text.trim();
  } catch (error) {
    console.error("Error generating content with Gemini:", error);
    throw new Error("Failed to communicate with the AI model.");
  }
};