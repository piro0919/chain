"use client";

import { useTranslations } from "next-intl";
import { useCallback, useRef, useState } from "react";
import { MarkdownEditor } from "@/components/markdown-editor";
import type { OrgChartHandle } from "@/components/org-chart";
import { OrgChart } from "@/components/org-chart";
import { parseMarkdown } from "@/lib/parse-markdown";

const DEFAULT_MARKDOWN = `- Taro Yamada (CEO)
  - **Engineering**
    - Jiro Suzuki (CTO)
      - Hanako Sato (Tech Lead)
        - Ken Ito (Senior Engineer)
        - Mika Ogawa (Engineer)
        - Yuta Kimura (Engineer)
      - Ryo Nakamura (Tech Lead)
        - Ai Yoshida (Engineer)
        - Sota Fujita (Engineer)
      - Emi Takahashi (Designer)
  - **Finance**
    - Saburo Kato (CFO)
      - Yuki Watanabe (Accounting Manager)
        - Naomi Abe (Accountant)
        - Koji Mori (Accountant)
      - Tomoko Inoue (Finance)
  - **Operations**
    - Kenji Hayashi (COO)
      - Mari Shimizu (HR Manager)
        - Rina Kobayashi (HR)
        - Daiki Saito (HR)
      - Shota Yamamoto (Sales Manager)
        - Ayumi Endo (Sales)
        - Ryota Matsuda (Sales)
        - Nana Okada (Sales)`;

export default function Home(): React.ReactNode {
  const t = useTranslations("HomePage");
  const [markdown, setMarkdown] = useState(DEFAULT_MARKDOWN);
  const [isEditorCollapsed, setIsEditorCollapsed] = useState(false);
  const orgChartRef = useRef<OrgChartHandle>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const nodes = parseMarkdown(markdown);

  const handleSave = useCallback(() => {
    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = "org-chart.md";
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  }, [markdown]);

  const handleLoad = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === "string") {
        setMarkdown(content);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }, []);

  return (
    <div className="flex h-screen flex-col">
      <header className="flex items-center justify-between border-b border-zinc-200 px-6 py-4">
        <div>
          <h1 className="text-xl font-bold">{t("title")}</h1>
          <p className="text-sm text-zinc-500">{t("subtitle")}</p>
        </div>
        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".md,.txt"
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            type="button"
            onClick={handleLoad}
            className="rounded border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-50"
          >
            {t("load")}
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="rounded border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-50"
          >
            {t("save")}
          </button>
          <button
            type="button"
            onClick={() => orgChartRef.current?.exportPng()}
            className="rounded border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-50"
          >
            {t("exportPng")}
          </button>
          <button
            type="button"
            onClick={() => orgChartRef.current?.exportSvg()}
            className="rounded border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-50"
          >
            {t("exportSvg")}
          </button>
        </div>
      </header>
      <main className="relative flex flex-1 overflow-hidden">
        <div
          className={`relative flex flex-col border-r border-zinc-200 transition-all duration-300 ${
            isEditorCollapsed ? "w-0 min-w-0 overflow-hidden border-r-0" : "w-1/4 min-w-[240px]"
          }`}
        >
          <MarkdownEditor onChange={setMarkdown} value={markdown} />
        </div>
        <button
          type="button"
          onClick={() => setIsEditorCollapsed(!isEditorCollapsed)}
          className={`absolute top-1/2 z-20 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full border border-zinc-300 bg-white text-zinc-400 shadow-sm transition-all duration-300 hover:bg-zinc-50 hover:text-zinc-600 ${
            isEditorCollapsed ? "left-3" : "left-[calc(25%-12px)]"
          }`}
          title={isEditorCollapsed ? t("expandEditor") : t("collapseEditor")}
        >
          {isEditorCollapsed ? "›" : "‹"}
        </button>
        <div className="flex-1 overflow-auto">
          <OrgChart ref={orgChartRef} nodes={nodes} />
        </div>
      </main>
    </div>
  );
}
