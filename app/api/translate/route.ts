import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  const { text, targetLanguage, model } = await req.json();

  const response = await openai.chat.completions.create({
    model: model,
    messages: [
      {
        role: 'system',
        content: `You are a translator. Translate the following text to ${targetLanguage}.`,
      },
      {
        role: 'user',
        content: text,
      },
    ],
  });

  return new Response(JSON.stringify({ translatedText: response.choices[0].message.content }), {
    headers: { 'Content-Type': 'application/json' },
  });
}
