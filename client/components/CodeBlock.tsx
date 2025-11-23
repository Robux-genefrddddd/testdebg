import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { highlightCode, copyToClipboard } from "@/lib/codeDisplay";

interface CodeBlockProps {
  code: string;
  language: string;
}

export default function CodeBlock({ code, language }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const success = await copyToClipboard(code);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const highlightedCode = highlightCode(code, language);

  return (
    <div className="my-4 rounded-lg overflow-hidden bg-[#282c34] border border-[#3f4451]">
      <div className="flex items-center justify-between bg-[#21252b] px-4 py-2 border-b border-[#3f4451]">
        <span className="text-sm font-mono text-[#abb2bf]">
          {language || "plaintext"}
        </span>
        <button
          onClick={handleCopy}
          className="p-1.5 hover:bg-[#3f4451] rounded transition-colors"
          title={copied ? "Copied!" : "Copy code"}
        >
          {copied ? (
            <Check size={16} className="text-green-400" />
          ) : (
            <Copy size={16} className="text-[#abb2bf]" />
          )}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 m-0">
        <code
          className="text-sm font-mono text-[#abb2bf]"
          dangerouslySetInnerHTML={{ __html: highlightedCode }}
        />
      </pre>
    </div>
  );
}
