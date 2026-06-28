export interface Source {
  title: string;
  url: string;
  content: string;
}

export interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  sources: Source[] | null;
  done: boolean;
  error?: string;
}
