import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const body = await request.json();
  const { text, targetLanguage } = body;
  const translation = await translate(text, targetLanguage);
  return NextResponse.json({ translation });
}

async function translate(text: string, targetLanguage: string): Promise<string> {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const response = await openai.responses.create({
    model: "gpt-5-nano",
    input: [
      {
        "role": "developer",
        "content": [
          {
            "type": "input_text",
            "text": `Translate the following text into ${targetLanguage}.`,
          }
        ]
      },
      {
        "role": "user",
        "content": [
          {
            "type": "input_text",
            "text": text,
          }
        ]
      },
    ],
    text: {
      "format": {
        "type": "text",
      },
      "verbosity": "low",
    },
    reasoning: {
      "effort": "low",
    },
    tools: [],
    store: true,
  });

  return response.output_text;
}
