"use client";

import { useTranslations } from "next-intl";
import { useMemo } from "react";

type MarkdownEditorProps = {
  onChange: (value: string) => void;
  value: string;
};

export function MarkdownEditor({ onChange, value }: MarkdownEditorProps): React.ReactNode {
  const t = useTranslations("HomePage");

  const minWidth = useMemo(() => {
    const lines = value.split("\n");
    const maxLength = Math.max(...lines.map((line) => line.length), 20);
    return `${maxLength + 8}ch`;
  }, [value]);

  return (
    <div className="relative h-full w-full bg-zinc-50">
      <div className="absolute inset-0 overflow-auto [scrollbar-width:none] [-webkit-overflow-scrolling:touch] [&::-webkit-scrollbar]:hidden">
        <textarea
          className="block min-h-full resize-none whitespace-pre border-0 bg-transparent p-4 font-mono text-sm focus:outline-none"
          onChange={(e) => onChange(e.target.value)}
          placeholder={t("editorPlaceholder")}
          value={value}
          wrap="off"
          style={{ minWidth }}
        />
      </div>
    </div>
  );
}
