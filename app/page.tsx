"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

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

  async function toggleRecording() {
    if (recording) {
      mediaRecorderRef.current?.stop();
      setRecording(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => {
        chunksRef.current.push(e.data);
      };
      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const formData = new FormData();
        formData.append("audio", blob, "recording.webm");
        try {
          const res = await fetch("/api/transcribe", {
            method: "POST",
            body: formData,
          });
          const data = await res.json();
          if (data.transcription) {
            setText(data.transcription);
          }
        } catch (err) {
          console.error("Failed to transcribe audio:", err);
        }
      };
      mediaRecorder.start();
      setRecording(true);
    } catch (err) {
      console.error("Failed to start recording:", err);
    }
  }

  return (
    <main className={styles.main}>
      <h1 className={styles.title}>Translator</h1>
      <div className={styles.textareas}>
        <div className={styles.inputContainer}>
          <textarea
            className={styles.textarea}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter text to translate"
          >
          </textarea>
          <button
            className={styles.recordButton}
            onClick={toggleRecording}
          >
            {recording ? "Stop Recording" : "Record Speech"}
          </button>
        </div>
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
