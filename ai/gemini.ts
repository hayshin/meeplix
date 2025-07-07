import { GoogleGenAI } from "@google/genai";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

const models = {
  gemini_flash_lite: "models/gemini-2.5-flash-lite-preview-06-17",
};
async function main() {
  // const response = await ai.models.list();
  const response = await ai.models.generateContent({
    model: models.gemini_flash_lite,
    contents: "Why is the sky blue?",
  });
  console.log(response.text);
}

main();
