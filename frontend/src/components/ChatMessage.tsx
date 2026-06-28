import { memo, type ReactNode } from "react";
import SourceChips from "./SourceChips";
import ThinkingDots from "./ThinkingDots";
import type { Message } from "../types/chat";
import "./ChatMessage.css";

function defaultRenderText(text: string): ReactNode {
  return text;
}

interface ChatMessageProps {
  message: Message;
  renderText?: (text: string) => ReactNode;
}

function ChatMessage({ message, renderText = defaultRenderText }: ChatMessageProps) {
  if (message.sender === "user") {
    return <div className="message-user">{message.text}</div>;
  }

  if (message.error) {
    return (
      <div className="message-assistant">
        <div className="assistant-text assistant-error">{message.error}</div>
      </div>
    );
  }

  return (
    <div className="message-assistant">
      {message.sources && <SourceChips sources={message.sources} />}
      <div className="assistant-text">
        {message.text ? renderText(message.text) : <ThinkingDots />}
      </div>
    </div>
  );
}

export default memo(ChatMessage, (prev, next) =>
  prev.message.text === next.message.text &&
  prev.message.sources === next.message.sources &&
  prev.message.done === next.message.done
);
