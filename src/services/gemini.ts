import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface DiseaseAnalysis {
  disease: string;
  confidence: number;
  description: string;
  pesticide: string;
  insecticide: string;
  fertilizer: string;
  treatment: string;
}

export async function analyzeCropImage(base64Image: string, mimeType: string): Promise<DiseaseAnalysis> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: {
      parts: [
        {
          inlineData: {
            mimeType,
            data: base64Image.split(",")[1] || base64Image,
          },
        },
        {
          text: `Analyze this crop image and identify any diseases. Return a JSON object with the following fields: 
          - disease: Name of the disease (or "Healthy" if no disease)
          - confidence: A number between 0 and 1
          - description: Brief description of the findings
          - pesticide: Recommended pesticide
          - insecticide: Recommended insecticide
          - fertilizer: Recommended fertilizer
          - treatment: Step-by-step treatment plan`,
        },
      ],
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          disease: { type: Type.STRING },
          confidence: { type: Type.NUMBER },
          description: { type: Type.STRING },
          pesticide: { type: Type.STRING },
          insecticide: { type: Type.STRING },
          fertilizer: { type: Type.STRING },
          treatment: { type: Type.STRING },
        },
        required: ["disease", "confidence", "description", "pesticide", "insecticide", "fertilizer", "treatment"],
      },
    },
  });

  return JSON.parse(response.text || "{}");
}

export interface FarmingPredictions {
  soilMoisture: number;
  moistureStatus: string;
  irrigationAdvice: string;
  predictedYield: number;
  harvestTime: string;
  fertilizerAdvice: string;
}

export async function getFarmingPredictions(data: {
  cropType: string;
  soilType: string;
  temperature: number;
  humidity: number;
  rainfall: number;
  farmArea: number;
  growthStage: string;
}): Promise<FarmingPredictions> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Based on the following data, provide farming predictions:
    Crop: ${data.cropType}
    Soil: ${data.soilType}
    Temperature: ${data.temperature}°C
    Humidity: ${data.humidity}%
    Rainfall: ${data.rainfall}mm
    Area: ${data.farmArea} hectares
    Stage: ${data.growthStage}
    
    Return a JSON object with:
    - soilMoisture: Estimated percentage (0-100)
    - moistureStatus: "Low", "Moderate", or "High"
    - irrigationAdvice: Specific recommendation
    - predictedYield: Tons per hectare
    - harvestTime: Estimated days until harvest
    - fertilizerAdvice: Specific NPK or organic recommendation`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          soilMoisture: { type: Type.NUMBER },
          moistureStatus: { type: Type.STRING },
          irrigationAdvice: { type: Type.STRING },
          predictedYield: { type: Type.NUMBER },
          harvestTime: { type: Type.STRING },
          fertilizerAdvice: { type: Type.STRING },
        },
        required: ["soilMoisture", "moistureStatus", "irrigationAdvice", "predictedYield", "harvestTime", "fertilizerAdvice"],
      },
    },
  });

  return JSON.parse(response.text || "{}");
}
