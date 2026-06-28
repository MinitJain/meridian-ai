import type { Source } from "../types/chat";
import "./SourceChips.css";

function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function LinkIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="source-icon">
      <rect x="1" y="1" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="7" cy="7" r="4" stroke="currentColor" strokeWidth="1.2" />
      <path d="M7 5v4M5 7h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

export default function SourceChips({ sources }: { sources: Source[] }) {
  if (!sources?.length) return null;

  return (
    <div className="source-chips">
      {sources.map((source, i) => (
        <a
          key={i}
          href={source.url}
          target="_blank"
          rel="noopener noreferrer"
          className="source-chip"
        >
          <LinkIcon />
          <span className="source-title">{source.title}</span>
          <span className="source-domain">{getDomain(source.url)}</span>
        </a>
      ))}
    </div>
  );
}
