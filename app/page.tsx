"use client";

import { useCallback, useEffect, useState, useRef } from "react";
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
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

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

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.addEventListener("dataavailable", (event) => {
        audioChunksRef.current.push(event.data);
      });

      mediaRecorder.addEventListener("stop", async () => {
        const audio = new Blob(audioChunksRef.current, { type: mediaRecorderRef.current?.mimeType || "audio/webm" });
        const transcription = await transcribe(audio);
        setText(transcription);
        stream.getTracks().forEach(track => track.stop());
      });

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error starting recording:", error);
    }
  }

  function stopRecording() {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }

  async function transcribe(audio: Blob): Promise<string> {
    try {
      const formData = new FormData();
      formData.append("audio", audio, "recording.wav");

      const response = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      return data.transcription;
    } catch (error) {
      console.error("Failed to transcribe audio:", error);
      throw error;
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
        <button
          className={styles.button}
          onClick={isRecording ? stopRecording : startRecording}
        >
          {isRecording ? "Stop Recording" : "Start Recording" }
        </button>
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
