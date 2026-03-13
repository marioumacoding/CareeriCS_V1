import type { CSSProperties, ReactNode } from "react";

interface MarkdownContentProps {
  content: string;
}

function normaliseInlineText(text: string): ReactNode[] {
  const tokens = text.split(/(\[[^\]]+\]\([^\)]+\))/g).filter(Boolean);

  return tokens.map((token, index) => {
    const match = token.match(/^\[([^\]]+)\]\(([^\)]+)\)$/);
    if (!match) return token;

    const label = match[1].replace(/^@[^@]+@/, "").trim();
    const href = match[2];

    return (
      <a
        key={`${href}-${index}`}
        href={href}
        target="_blank"
        rel="noreferrer"
        style={{ color: "var(--light-blue)" }}
      >
        {label || href}
      </a>
    );
  });
}

const paragraphStyle: CSSProperties = {
  margin: 0,
  color: "rgba(255, 255, 255, 0.85)",
  lineHeight: 1.75,
  whiteSpace: "pre-wrap",
};

export function MarkdownContent({ content }: MarkdownContentProps) {
  const blocks = content
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean);

  return (
    <div style={{ display: "grid", gap: "1rem" }}>
      {blocks.map((block, index) => {
        const lines = block.split("\n").map((line) => line.trimEnd());
        const heading = lines[0].match(/^(#{1,4})\s+(.*)$/);
        const bulletLines = lines.filter((line) => /^[-*]\s+/.test(line));
        const numberedLines = lines.filter((line) => /^\d+\.\s+/.test(line));

        if (heading) {
          const level = heading[1].length;
          const HeadingTag = (`h${Math.min(level + 1, 4)}` as keyof JSX.IntrinsicElements);
          return (
            <HeadingTag
              key={`heading-${index}`}
              style={{
                margin: 0,
                color: "white",
                fontFamily: "var(--font-nova-square)",
              }}
            >
              {normaliseInlineText(heading[2])}
            </HeadingTag>
          );
        }

        if (bulletLines.length === lines.length) {
          return (
            <ul key={`bullets-${index}`} style={{ margin: 0, paddingLeft: "1.2rem", display: "grid", gap: "0.65rem" }}>
              {bulletLines.map((line) => (
                <li key={line} style={paragraphStyle}>
                  {normaliseInlineText(line.replace(/^[-*]\s+/, ""))}
                </li>
              ))}
            </ul>
          );
        }

        if (numberedLines.length === lines.length) {
          return (
            <ol key={`ordered-${index}`} style={{ margin: 0, paddingLeft: "1.35rem", display: "grid", gap: "0.65rem" }}>
              {numberedLines.map((line) => (
                <li key={line} style={paragraphStyle}>
                  {normaliseInlineText(line.replace(/^\d+\.\s+/, ""))}
                </li>
              ))}
            </ol>
          );
        }

        return (
          <p key={`paragraph-${index}`} style={paragraphStyle}>
            {normaliseInlineText(lines.join("\n"))}
          </p>
        );
      })}
    </div>
  );
}