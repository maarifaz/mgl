import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";

// SƏNİN API AÇARIN
const API_KEY = "AIzaSyC6QGX8Jm3RVGdK7Jm9pY8aKqMTpIjZpGk";

const genAI = new GoogleGenerativeAI(API_KEY);

export async function analyzeReview(bookTitle: string, reviewText: string) {
  if (!API_KEY) {
    console.error("❌ API KEY YOXDUR!");
    return {
      approved: false,
      score: 0,
      analysis: "API Key yoxdur.",
      feedback: "Sistem xətası.",
    };
  }

  const model = genAI.getGenerativeModel({
    // DÜZƏLİŞ BURADADIR: Modelin tam adını yazdıq
    model: "gemini-2.5-flash",

    safetySettings: [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_NONE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
      },
    ],
  });

  const prompt = `
        Sən Azərbaycan dilində "Məktəb Kitabxanası" sisteminin ciddi moderatorusan.
        Şagird "${bookTitle}" kitabı haqqında bu rəyi yazıb: "${reviewText}".

        Vəzifən (Ardıcıllıqla):
        1. Rəyi yoxla: Söyüş, təhqir, arqo, siyasi şüarlar və ya mənasız hərflər (spam) varmı?
           - VARSA: "approved": false qaytar. "feedback": "Rəyinizdə qəbuledilməz ifadələr var."
        2. Əgər təmizdirsə: "approved": true qaytar.
        3. Rəyi təhlil et və Müəllim üçün qısa hesabat yaz ("analysis").
        4. Rəyə 0-100 arası xal ver ("score").

        Cavabı YALNIZ bu JSON formatında ver (Markdown istifadə etmə):
        {
            "approved": boolean,
            "score": number,
            "analysis": "string",
            "feedback": "string"
        }
    `;

  try {
    console.log("🤖 AI Təhlil edir...");
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    console.log("✅ AI Cavabı:", text);

    text = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();
    return JSON.parse(text);
  } catch (error: any) {
    console.error("❌ AI Xətası:", error);

    return {
      approved: false,
      score: 0,
      analysis: `Xəta: ${error.message}`,
      feedback: "Sistem xətası: Konsola baxın (F12).",
    };
  }
}
