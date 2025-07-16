import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI, Type } from "@google/genai";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const formData = await request.formData();
  const file = formData.get("audio");
  if (!file || !(file instanceof Blob)) {
    return NextResponse.json({ error: "No audio file provided" }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
  });

  const audioBase64 = Buffer.from(arrayBuffer).toString("base64");

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        required: ["transcription"],
        properties: {
          transcription: {
            type: Type.STRING,
          },
        },
      },
    },
    contents: [
      {
        role: "user",
        parts: [
          {
            text: "Transcribe the following audio.",
          },
          {
            inlineData: {
              mimeType: file.type || "audio/webm",
              data: audioBase64,
            },
          },
        ],
      },
    ],
  });

  const text = response.candidates?.[0].content?.parts?.[0].text ?? "{}";
  const data = JSON.parse(text);
  return NextResponse.json({ transcription: data.transcription ?? "" });
}
