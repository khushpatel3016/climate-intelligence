import { GoogleGenAI, Type } from "@google/genai";
const getApiKey = () => {
  if (typeof process !== "undefined" && process.env.GEMINI_API_KEY)
    return process.env.GEMINI_API_KEY;

  if (import.meta.env.VITE_GEMINI_API_KEY)
    return import.meta.env.VITE_GEMINI_API_KEY;

  return "";
};

const ai = new GoogleGenAI({ apiKey: getApiKey() });
export interface ProcessedRisk {
  score: number;
  label: string;
  color: string;
  bg: string;
}

export interface ClimateAnalysis {
  riskScore: number;
  primaryThreats: string[];
  mitigationStrategies: string[];
  futureProjection: string;
  confidenceLevel: string;
  processedRisk?: ProcessedRisk;
}

export function processRiskScore(rawScore?: number): ProcessedRisk {
  // Clamp score into realistic dashboard range
  const adjustedScore = Math.min(
    95,
    Math.max(15, Math.round(rawScore ?? 0))
  );

  const getRiskLevel = (score: number) => {
    if (score > 75)
      return {
        label: "Critical",
        color: "text-red-400",
        bg: "bg-red-500",
      };

    if (score > 55)
      return {
        label: "High",
        color: "text-orange-400",
        bg: "bg-orange-500",
      };

    if (score > 35)
      return {
        label: "Moderate",
        color: "text-yellow-400",
        bg: "bg-yellow-500",
      };

    return {
      label: "Low",
      color: "text-emerald-400",
      bg: "bg-emerald-500",
    };
  };

  const risk = getRiskLevel(adjustedScore);

  return {
    score: adjustedScore,
    ...risk,
  };
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export async function analyzeClimateData(
  location: string,
  currentTemp: number,
  humidity: number
): Promise<ClimateAnalysis> {
  const prompt = `
Analyze the climate risk for ${location} given current conditions:
Temperature ${currentTemp}°C, Humidity ${humidity}%.

Provide:
- risk score (0–100)
- primary threats
- mitigation strategies
- 10-year future projection
- confidence level.
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            riskScore: { type: Type.NUMBER },
            primaryThreats: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            mitigationStrategies: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            futureProjection: { type: Type.STRING },
            confidenceLevel: { type: Type.STRING },
          },
          required: [
            "riskScore",
            "primaryThreats",
            "mitigationStrategies",
            "futureProjection",
            "confidenceLevel",
          ],
        },
      },
    });

    const result = JSON.parse(response.text || "{}");

    return {
      ...result,
      processedRisk: processRiskScore(result.riskScore),
    };
  } catch (e) {
    console.warn(
      "Gemini analysis failed, using fallback simulation:",
      e
    );

    const riskBase = Math.min(
      100,
      Math.max(randomInt(5,10), (currentTemp - 15) * 2 + humidity / 5)
    );

    const processedRisk = processRiskScore(riskBase);

    return {
      riskScore: Math.round(riskBase),

      primaryThreats: [
        currentTemp > 30 ? "Extreme Heatwaves" : "Thermal Instability",
        humidity < 20 ? "Severe Drought Risk" : "Humidity Stress",
        "Ecosystem Degradation",
      ],

      mitigationStrategies: [
        "Infrastructure reinforcement",
        "Water conservation systems",
        "Reforestation initiatives",
      ],

      futureProjection: `Based on current trends in ${location}, we anticipate a ${Math.round(
        riskBase / 10
      )}% increase in thermal anomalies over the next decade.`,

      confidenceLevel: "Simulated (AI Offline)",

      processedRisk,
    };
  }
}

export async function getClimateInsights(
  globalStats: any
): Promise<string> {
  try {
    const response = (await Promise.race([
      ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `As a world-class climate scientist, provide a brief (2 sentences) insight about global climate conditions based on: ${JSON.stringify(
          globalStats
        )}`,
      }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Timeout")), 8000)
      ),
    ])) as any;

    return response.text || "Analyzing global climate patterns...";
  } catch {
    return "Monitoring global climate patterns. System active and analyzing thermal anomalies.";
  }
}