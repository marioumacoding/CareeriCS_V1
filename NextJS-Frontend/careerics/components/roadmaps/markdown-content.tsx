import type { CSSProperties, ReactNode } from "react";
import styles from "@/components/roadmaps/roadmap-theme.module.scss";

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
        style={{ color: "inherit" }}
      >
        {label || href}
      </a>
    );
  });
}

const paragraphStyle: CSSProperties = {
  margin: 0,
  color: "inherit",
  lineHeight: 1.75,
  whiteSpace: "pre-wrap",
};

export function MarkdownContent({ content }: MarkdownContentProps) {
  const blocks = content
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean);

  return (
    <div className={styles.markdown}>
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
              style={{ margin: 0, color: "inherit" }}
            >
              {normaliseInlineText(heading[2])}
            </HeadingTag>
          );
        }

        if (bulletLines.length === lines.length) {
          return (
            <ul key={`bullets-${index}`} className={styles.markdownList}>
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
            <ol key={`ordered-${index}`} className={styles.markdownList}>
              {numberedLines.map((line) => (
                <li key={line} style={paragraphStyle}>
                  {normaliseInlineText(line.replace(/^\d+\.\s+/, ""))}
                </li>
              ))}
            </ol>
          );
        }

        return (
          <p key={`paragraph-${index}`} className={styles.markdownParagraph} style={paragraphStyle}>
            {normaliseInlineText(lines.join("\n"))}
          </p>
        );
      })}
    </div>
  );
}