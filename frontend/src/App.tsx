import { useEffect } from "react";
import ChatMessage from "./components/ChatMessage";
import ChatInput from "./components/ChatInput";
import { useChat } from "./hooks/useChat";
import { useScroll } from "./hooks/useScroll";
import "./App.css";

function App() {
  const { messages, sendMessage } = useChat();
  const { scrollRef, isAtBottom, scrollToBottom, handleScroll } = useScroll(80);

  useEffect(() => {
    scrollToBottom(false);
  }, [messages, scrollToBottom]);

  return (
    <div className="app">
      <div className="messages" ref={scrollRef} onScroll={handleScroll}>
        {messages.length === 0 ? (
          <div className="empty-state">
            <h1 className="empty-title">Ask anything</h1>
            <p className="empty-subtitle">Search the web with AI</p>
          </div>
        ) : (
          <div className="messages-inner">
            {messages.map((msg) => (
              <ChatMessage key={`${msg.id}-${msg.sender}`} message={msg} />
            ))}
          </div>
        )}
      </div>
      {!isAtBottom && messages.length > 0 && (
        <button
          className="scroll-bottom-btn"
          onClick={() => scrollToBottom(true)}
          aria-label="Scroll to bottom"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 10L3 6h8l-4 4z" fill="currentColor" />
          </svg>
        </button>
      )}
      <ChatInput onSend={sendMessage} />
    </div>
  );
}

export default App;
