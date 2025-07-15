"use client";

import { useState } from "react";

export default function Home() {
  const languages = [
    "English",
    "Japanese",
    "Chinese",
  ];
  const [text, setText] = useState("");
  const [targetLanguage, setTargetLanguage] = useState(languages[0]);
  const [translation, setTranslation] = useState("");

  async function handleClick() {
    const response = await fetch("/api/translate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text,
        targetLanguage,
      }),
    });
    const data = await response.json();
    setTranslation(data.translation);
  }

  return (
    <>
      <h1>Translator</h1>
      <div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter text to translate"
        >
        </textarea>
        <textarea
          value={translation}
          placeholder="Translation"
          readOnly
        >
        </textarea>
      </div>
      <div>
        <select
          value={targetLanguage}
          onChange={(e) => setTargetLanguage(e.target.value)}
        >
          {languages.map((language) => (
            <option key={language} value={language}>
              {language}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={handleClick}
        >
          Translate
        </button>
      </div>
    </>
  );
}
