import { io } from "socket.io-client";
import type { Source } from "../types/chat";

const socket = io();

interface SourcesPayload { id: string; results: Source[] }
interface ChunkPayload { id: string; token: string }
interface DonePayload { id: string }
interface ErrorPayload { id: string; error: string }

export const chatSocket = {
  send(id: string, text: string) {
    socket.emit("user_question", { id, text });
  },

  onSources(fn: (data: SourcesPayload) => void): () => void {
    socket.on("sources", fn);
    return () => { socket.off("sources", fn); };
  },

  onChunk(fn: (data: ChunkPayload) => void): () => void {
    socket.on("response_chunk", fn);
    return () => { socket.off("response_chunk", fn); };
  },

  onDone(fn: (data: DonePayload) => void): () => void {
    socket.on("response_done", fn);
    return () => { socket.off("response_done", fn); };
  },

  onError(fn: (data: ErrorPayload) => void): () => void {
    socket.on("error", fn);
    return () => { socket.off("error", fn); };
  },

  disconnect() {
    socket.disconnect();
  },

  connect() {
    socket.connect();
  },
};
