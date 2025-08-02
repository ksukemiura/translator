import { NextRequest, NextResponse } from "next/server";
import {
  createPartFromUri,
  createUserContent,
  GoogleGenAI,
  Type,
} from "@google/genai";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const formData = await request.formData();
    const audio = formData.get("audio") as File;

    if (!audio) {
      return NextResponse.json(
        { error: "No audio file provided" },
        { status: 400 }
      );
    }

    const transcription = await transcribe(audio);
    return NextResponse.json({ transcription });
  } catch (error) {
    console.error("Failed to transcribe audio:", error);
    return NextResponse.json(
      { error: "Failed to transcribe audio" },
      { status: 500 }
    );
  }
}

async function transcribe(audio: File): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("API key is missing or invalid. Please set GEMINI_API_KEY in the environment variables.");
  }
  const ai = new GoogleGenAI({
    apiKey,
  });
  const config = {
    thinkingConfig: {
      thinkingBudget: 0,
    },
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
  };
  const model = "gemini-2.5-flash";

  let file;
  try {
    file = await ai.files.upload({
      file: audio,
      config: { mimeType: audio.type || "audio/wav" },
    });

    if (!file.uri) {
      throw new Error("File upload failed: missing URI");
    }

    if (!file.mimeType) {
      throw new Error("File upload failed: missing MIME type");
    }

    const contents = createUserContent([
      createPartFromUri(file.uri, file.mimeType),
      "Generate a transcript of the speech. Return only the transcript without any additional text.",
    ]);

    const response = await ai.models.generateContent({
      model,
      config,
      contents,
    });

    const text = response.candidates?.[0].content?.parts?.[0].text;
    if (!text) {
      throw new Error("Transcription failed: no text returned");
    }
    const json = JSON.parse(text);
    return json.transcription;
  } catch (error) {
    console.error("Failed to transcribe audio:", error);
    throw error;
  } finally {
    if (file?.name) {
      await ai.files.delete({ name: file.name });
    }
  }
}
