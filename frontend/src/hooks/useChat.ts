import { useState, useEffect, useCallback } from "react";
import { chatSocket } from "../services/socket";
import type { Message } from "../types/chat";

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    const offSources = chatSocket.onSources(({ id, results }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === id && msg.sender === "bot"
            ? { ...msg, sources: results }
            : msg,
        ),
      );
    });

    const offChunk = chatSocket.onChunk(({ id, token }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === id && msg.sender === "bot"
            ? { ...msg, text: msg.text + token }
            : msg,
        ),
      );
    });

    const offDone = chatSocket.onDone(({ id }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === id && msg.sender === "bot"
            ? { ...msg, done: true }
            : msg,
        ),
      );
    });

    const offError = chatSocket.onError(({ id, error }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === id && msg.sender === "bot"
            ? { ...msg, error, done: true }
            : msg,
        ),
      );
    });

    return () => {
      offSources();
      offChunk();
      offDone();
      offError();
    };
  }, []);

  const sendMessage = useCallback((text: string) => {
    if (!text.trim()) return;
    const id = crypto.randomUUID();
    chatSocket.send(id, text);
    setMessages((prev) => [
      ...prev,
      { id, text: text.trim(), sender: "user", sources: null, done: true },
      { id, text: "", sender: "bot", sources: null, done: false },
    ]);
  }, []);

  return { messages, sendMessage, setMessages };
}
