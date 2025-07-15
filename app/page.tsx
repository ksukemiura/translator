"use client";

import { useState } from "react";
import styles from "./page.module.css";

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
    <main className={styles.main}>
      <h1 className={styles.title}>Translator</h1>
      <div className={styles.textareas}>
        <textarea
          className={styles.textarea}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter text to translate"
        >
        </textarea>
        <textarea
          className={styles.textarea}
          value={translation}
          placeholder="Translation"
          readOnly
        >
        </textarea>
      </div>
      <div className={styles.controls}>
        <select
          className={styles.select}
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
          className={styles.button}
          type="button"
          onClick={handleClick}
          >
            Translate
          </button>
      </div>
    </main>
  );
}
