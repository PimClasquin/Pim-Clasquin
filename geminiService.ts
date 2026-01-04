
import { GoogleGenAI, Type } from "@google/genai";
import { GameState, LEARNING_GOALS, Question, QuestionType, Difficulty } from "./types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

export async function generateQuestion(state: GameState): Promise<Question> {
  const currentGoal = LEARNING_GOALS[state.currentGoalIndex];
  
  // Adaptive difficulty logic based on previous performance
  let suggestedDifficulty = "gemiddeld";
  if (state.consecutiveWrong >= 2) suggestedDifficulty = "makkelijk";
  else if (state.correctAnswersInGoal >= 2) suggestedDifficulty = "moeilijk";

  const prompt = `
    Je bent een educatieve game-engine voor een economie game.
    Huidig leerdoel: ${currentGoal}
    Huidige voortgang in dit doel: ${state.correctAnswersInGoal} / 3
    Spelerniveau: ${state.playerLevel}
    Aanbevolen moeilijkheid: ${suggestedDifficulty}

    Genereer één unieke economische vraag over het leerdoel in een realistische context (bijv. brood, telefoons, benzine).
    Wissel af tussen meerkeuze, berekening, begrip en toepassing.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          learningGoal: { type: Type.STRING },
          questionType: { type: Type.STRING, enum: ['meerkeuze', 'berekening', 'begrip', 'toepassing'] },
          question: { type: Type.STRING },
          options: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          correctAnswer: { type: Type.STRING },
          explanation: { type: Type.STRING },
          difficulty: { type: Type.STRING, enum: ['makkelijk', 'gemiddeld', 'moeilijk'] }
        },
        required: ["learningGoal", "questionType", "question", "correctAnswer", "explanation", "difficulty"]
      }
    }
  });

  try {
    const data = JSON.parse(response.text);
    return data as Question;
  } catch (error) {
    console.error("Fout bij het parsen van AI response:", error);
    throw new Error("Kon geen geldige vraag genereren.");
  }
}
