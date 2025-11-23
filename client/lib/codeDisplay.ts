import hljs from "highlight.js";
import "highlight.js/styles/atom-one-dark.css";

export interface CodeBlock {
  code: string;
  language: string;
}

export const parseCodeBlocks = (text: string): (string | CodeBlock)[] => {
  const parts: (string | CodeBlock)[] = [];
  const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g;
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    const language = match[1] || "plaintext";
    const code = match[2].trim();

    parts.push({
      code,
      language,
    });

    lastIndex = codeBlockRegex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length === 0 ? [text] : parts;
};

export const highlightCode = (code: string, language: string): string => {
  try {
    if (language && hljs.getLanguage(language)) {
      return hljs.highlight(code, { language }).value;
    }
    return hljs.highlightAuto(code).value;
  } catch (err) {
    console.error("Syntax highlighting error:", err);
    return code;
  }
};

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error("Copy to clipboard error:", err);
    return false;
  }
};
