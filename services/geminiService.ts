
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { MissionConfig, SimulationResult } from "../types";

const BILINGUAL_TEXT_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    en: { type: Type.STRING, description: "Text in English (Concise, technical style)" },
    ja: { type: Type.STRING, description: "Text in Japanese (Friendly, educational style)" }
  },
  required: ["en", "ja"]
};

const SIMULATION_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    success: {
      type: Type.BOOLEAN,
      description: "Whether the mission was successful (returned to Earth with samples)."
    },
    score: {
      type: Type.INTEGER,
      description: "A score from 0 to 100 based on efficiency, scientific value, and cost."
    },
    sampleRetrieved: {
      type: Type.INTEGER,
      description: "Amount of sample retrieved in grams. 0 if mission failed before collection."
    },
    scientificValue: {
      type: Type.INTEGER,
      description: "Scientific value score (0-100)."
    },
    missionLog: {
      type: Type.ARRAY,
      items: BILINGUAL_TEXT_SCHEMA,
      description: "A chronological list of 5-7 short sentences describing key events."
    },
    failureReason: {
      ...BILINGUAL_TEXT_SCHEMA,
      description: "If success is false, describe why it failed in one sentence. If true, empty strings for both en/ja."
    },
    feedback: {
      ...BILINGUAL_TEXT_SCHEMA,
      description: "Educational feedback about the design choices."
    }
  },
  required: ["success", "score", "sampleRetrieved", "missionLog", "feedback", "scientificValue"]
};

export const runMissionSimulation = async (config: MissionConfig, launchScore: number): Promise<SimulationResult> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing");
  }

  const ai = new GoogleGenAI({ apiKey });

  const partsList = Object.entries(config.parts)
    .map(([cat, part]) => part ? `${cat}: ${part.name} (Rel:${part.reliability}%, Mass:${part.mass}kg)` : `${cat}: NONE`)
    .join('\n');

  // Interpret launch score
  let launchQuality = "Average";
  if (launchScore > 90) launchQuality = "Perfect (Critical Success)";
  else if (launchScore > 70) launchQuality = "Good";
  else if (launchScore < 30) launchQuality = "Poor (Potential issues)";

  const prompt = `
    You are the game engine for 'U-Space', a Japanese educational game for children (target age: 10-14).
    Simulate a space mission to Mars' moon Phobos based on the user's spacecraft design and mission plan.
    
    Target: Phobos (Moon of Mars).
    Goal: Retrieve samples and return to Earth.

    USER DESIGN:
    ${partsList}

    MISSION PLAN:
    Route: ${config.flightProfile}
    Landing: ${config.landingMethod}

    PLAYER ACTION RESULT (Launch Phase):
    Launch Timing Score: ${launchScore}/100 (${launchQuality})
    * A 'Perfect' launch saves fuel and ensures perfect trajectory.
    * A 'Poor' launch might cause minor damage or fuel waste, increasing failure risk.

    OUTPUT INSTRUCTIONS (CRITICAL):
    1. **BILINGUAL**: Provide all text fields with both an English ('en') and Japanese ('ja') version.
    2. **ENGLISH TONE**: Concise, semi-technical mission log style (e.g., "Orbit insertion confirmed.").
    3. **JAPANESE TONE**: Friendly, encouraging, and educational for kids (Desu/Masu form).
    4. **FEEDBACK STYLE**: 
       - Explain *why* the mission succeeded or failed based on physics/engineering principles.
       - If failed, give a hint for the next try.
       - If succeeded, praise the specific design choices (e.g., "The ion engine was slow but very light!").

    SIMULATION RULES:
    1. Check for critical missing parts (Propulsion, Power, Comm, Sampler, Computer). If any are missing, the mission fails immediately at launch.
    2. Analyze Power Balance: Does the power source (Solar/RTG) support the propulsion and computer? RTG is better for deep space reliability but lower output. Solar output drops at Mars distance.
    3. Analyze Propulsion vs Mass: Heavy ships with weak engines (Ion) on Fast Transit profiles might fail to decelerate.
    4. Calculate Probability: Use the reliability stats of parts AND the Launch Score. A Perfect launch can compensate for slightly lower reliability.
    5. Evaluate Sampling: 'Touch and Go' is safer but gets less sample. 'Full Landing' is risky but gets more.
    6. 'Sample Capacity' of the sampler limits the max sample retrieved.
    
    Output a JSON object describing the result.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: SIMULATION_SCHEMA,
        temperature: 0.7, 
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as SimulationResult;
  } catch (error) {
    console.error("Simulation failed", error);
    // Fallback in case of API error
    return {
      success: false,
      score: 0,
      sampleRetrieved: 0,
      scientificValue: 0,
      missionLog: [
        { en: "Communication Error", ja: "通信エラー発生" },
        { en: "Lost connection to simulation server.", ja: "シミュレーションサーバーとの接続が切れました。" }
      ],
      failureReason: { en: "API Error", ja: "APIエラーが発生しました" },
      feedback: { en: "Please check your internet connection.", ja: "インターネット接続を確認してください。" }
    };
  }
};
