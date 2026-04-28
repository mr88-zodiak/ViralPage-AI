import { GoogleGenAI, Type } from "@google/genai";
import { GeneratorInputs, SalesPageData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateSalesPage(inputs: GeneratorInputs): Promise<SalesPageData> {
  const prompt = `
    Generate a high-converting sales page JSON for a product with the following details:
    - Product Name: ${inputs.productName}
    - Description: ${inputs.description}
    - Target Audience: ${inputs.targetAudience}
    - Tone: ${inputs.tone}
    - Unique Selling Point: ${inputs.uniqueSellingPoint}
    ${inputs.price ? `- Pricing: ${inputs.price}` : ""}

    Use copywriting frameworks like PAS (Problem-Agitation-Solution) or AIDA.
    The response must be a valid JSON object matching the requested schema.
    Icons for features should be Lucide icon names (e.g., 'Check', 'Zap', 'Shield', 'Globe', 'Users', 'Target').
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          hero: {
            type: Type.OBJECT,
            properties: {
              headline: { type: Type.STRING },
              subheadline: { type: Type.STRING },
              cta: { type: Type.STRING },
            },
            required: ["headline", "subheadline", "cta"],
          },
          problem: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
            },
            required: ["title", "description"],
          },
          solution: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              keyPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ["title", "description", "keyPoints"],
          },
          features: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              items: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    description: { type: Type.STRING },
                    icon: { type: Type.STRING },
                  },
                  required: ["title", "description", "icon"],
                },
              },
            },
            required: ["title", "items"],
          },
          testimonials: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                quote: { type: Type.STRING },
                author: { type: Type.STRING },
                role: { type: Type.STRING },
              },
              required: ["quote", "author", "role"],
            },
          },
          pricing: {
            type: Type.OBJECT,
            properties: {
              planName: { type: Type.STRING },
              price: { type: Type.STRING },
              features: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ["planName", "price", "features"],
          },
          faq: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                answer: { type: Type.STRING },
              },
              required: ["question", "answer"],
            },
          },
          footerCta: {
            type: Type.OBJECT,
            properties: {
              headline: { type: Type.STRING },
              cta: { type: Type.STRING },
            },
            required: ["headline", "cta"],
          },
        },
        required: ["hero", "problem", "solution", "features", "faq", "footerCta"],
      },
    },
  });

  if (!response.text) {
    throw new Error("No response from Gemini");
  }

  return JSON.parse(response.text);
}
