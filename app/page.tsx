"use client";

import { useCallback, useEffect, useState } from "react";
import styles from "./page.module.css";

const LANGUAGES = [
  "English",
  "Japanese",
  "Chinese",
];
const DEBOUNCE_DELAY = 300; // milliseconds

export default function Home() {
  const [text, setText] = useState("");
  const [targetLanguage, setTargetLanguage] = useState(LANGUAGES[0]);
  const [translation, setTranslation] = useState("");

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
    }, DEBOUNCE_DELAY);

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
          {LANGUAGES.map((language) => (
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
