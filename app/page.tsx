"use client";

import { useCallback, useEffect, useState } from "react";
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
  const debounceDelay = 300; // milliseconds

  const translate = useCallback(async () => {
    if (!text.trim()) {
      setTranslation("");
      return;
    }

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
  }, [text, targetLanguage]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      translate();
    }, debounceDelay);

    return () => clearTimeout(timeoutId);
  }, [translate]);

  async function copyTranslation() {
    if (translation) {
      try {
        await navigator.clipboard.writeText(translation);
      } catch (error) {
        console.error("Failed to copy translation to clipboard:", error);
      }
    }
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
          onClick={copyTranslation}
          disabled={!translation}
        >
          Copy Translation
        </button>
      </div>
    </main>
  );
}
