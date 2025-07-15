import { NextRequest, NextResponse } from "next/server";
import {
  GoogleGenAI,
  Type,
} from "@google/genai";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const body = await request.json();
  const { text, targetLanguage } = body;
  const response = await translate(text, targetLanguage);
  const data = JSON.parse(response);
  return NextResponse.json(data);
}

async function translate(text: string, targetLanguage: string): Promise<string> {
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
  });
  const config = {
    thinkingConfig: {
      thinkingBudget: 0,
    },
    responseMimeType: "application/json",
    responseSchema: {
      type: Type.OBJECT,
      required: ["translation"],
      properties: {
        translation: {
          type: Type.STRING,
        },
      },
    },
    systemInstruction: [
        {
          text: `You are a translator. Translate the following text into ${targetLanguage}.`,
        }
    ],
  };
  const model = "gemini-2.5-flash";
  const contents = [
    {
      role: "user",
      parts: [
        {
          text: text,
        },
      ],
    },
  ];

  const response = await ai.models.generateContent({
    model,
    config,
    contents,
  });
  return response.candidates?.[0].content?.parts?.[0].text ?? "";
}
