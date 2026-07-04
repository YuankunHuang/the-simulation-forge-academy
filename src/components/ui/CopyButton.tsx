import { useState } from "react";
import { Icon } from "@/components/icons";

export function CopyButton({ text, label = "复制" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // 剪贴板 API 不可用时回退
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors ${
        copied
          ? "border-moss/50 bg-moss/10 text-moss-deep"
          : "border-wood-light/40 bg-cream-50 text-ink-soft hover:bg-cream-200"
      }`}
    >
      <Icon name={copied ? "check" : "copy"} size={14} />
      {copied ? "已复制" : label}
    </button>
  );
}
