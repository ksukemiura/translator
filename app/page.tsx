'use client';

import { useState } from "react";

export default function Home() {
  const [text, setText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [targetLanguage, setTargetLanguage] = useState("Japanese");
  const [model, setModel] = useState("gpt-4.1-nano");

  const translate = async () => {
    const res = await fetch("/api/translate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text, targetLanguage, model }),
    });

    const data = await res.json();
    setTranslatedText(data.translatedText);
  };

  return (
    <div className="container">
      <h1 className="title">Translator</h1>
      <div className="main-container">
        <div className="input-container">
          <textarea
            className="textarea"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter text to translate"
          />
        </div>
        <div className="output-container">
          <textarea
            className="textarea"
            value={translatedText}
            readOnly
            placeholder="Translation"
          />
        </div>
      </div>
      <div className="controls-container">
        <select
          className="select"
          value={model}
          onChange={(e) => setModel(e.target.value)}
        >
          <option value="gpt-4.1">gpt-4.1</option>
          <option value="gpt-4.1-mini">gpt-4.1-mini</option>
          <option value="gpt-4.1-nano">gpt-4.1-nano</option>
        </select>
        <select
          className="select"
          value={targetLanguage}
          onChange={(e) => setTargetLanguage(e.target.value)}
        >
          <option value="Japanese">Japanese</option>
          <option value="English">English</option>
          <option value="Spanish">Spanish</option>
          <option value="French">French</option>
          <option value="German">German</option>
          <option value="Chinese">Chinese</option>
        </select>
        <button className="button" onClick={translate}>
          Translate
        </button>
      </div>
    </div>
  );
}
