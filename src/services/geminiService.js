import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { geminiClient } from "../utils/geminiClient";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};

class GeminiService {
  constructor() {
    this.flashModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    this.proModel = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });
  }

  async generateContent(prompt, useFlash = true) {
    const model = useFlash ? this.flashModel : this.proModel;
    const chat = model.startChat({
      generationConfig,
      history: [],
    });
    const result = await chat.sendMessage(prompt);
    return result.response.text();
  }
}

export const geminiService = new GeminiService();