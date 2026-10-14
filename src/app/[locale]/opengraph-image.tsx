/* eslint-disable filenames/match-exported, filenames/match-regex */
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { getTranslations } from "next-intl/server";
import type { ReactElement } from "react";
import { routing } from "@/i18n/routing";

export const alt = "Chain";

export const size = { width: 1200, height: 630 };

export const contentType = "image/png";

/* ビルド時に焼く。動的なままだとアイコンとフォントが関数側に含まれず、
   本番で読めずに 500 になる */
export function generateStaticParams(): { locale: string }[] {
  return routing.locales.map((locale) => ({ locale }));
}

const TITLE = "Chain";

// 本体の org-chart.tsx と同じ色。カードがアプリの画面に見えるように揃える
const COLORS = {
  text: "#18181b",
  subtext: "#71717a",
  border: "#d4d4d8",
  line: "#a1a1aa",
  muted: "#a1a1aa",
};

/* 背景はアイコンと同じ水色系を濃くしたもの。白いタイムラインに置いても縁が溶けず、
   色だけで Chain とわかるようにする */
const BACKDROP = {
  background:
    "radial-gradient(circle at 88% 0%, rgba(34, 211, 238, 0.45) 0%, rgba(34, 211, 238, 0) 55%), linear-gradient(135deg, #04212b 0%, #0a4f63 100%)",
  title: "#ffffff",
  tagline: "#a5f3fc",
  arrow: "#ffffff",
  shadow: "0 28px 72px rgba(0, 0, 0, 0.45)",
};

type Department = {
  name: string;
  color: string;
  member: { name: string; position: string };
};

/* タイムラインでは幅500px前後まで縮むので、要素を絞って大きく描く。
   部署は2つ、人は3人まで */
const ROOT = { name: "Yamada", position: "CEO" };
const DEPARTMENTS: Department[] = [
  { name: "Design", color: "#3b82f6", member: { name: "Sato", position: "Lead" } },
  { name: "Sales", color: "#22c55e", member: { name: "Kato", position: "Manager" } },
];

const GUTTER = 64;
const HEADER = { top: 36, height: 148 };
const PANEL = { gap: 32, height: 370 };
const EDITOR_WIDTH = 420;
const ARROW_WIDTH = 96;
const CHART_WIDTH = size.width - GUTTER * 2 - EDITOR_WIDTH - ARROW_WIDTH;
const INDENT = 34;

const NODE = { width: 220, height: 88 };
const PILL = { width: 180, height: 48 };
const CENTER = CHART_WIDTH / 2;
const COLUMN_OFFSET = 140;
const COLUMNS = [CENTER - COLUMN_OFFSET, CENTER + COLUMN_OFFSET];
const ROW = { root: 32, branch: 146, pill: 172, member: 256 };
const LINE_WIDTH = 3;

function Line({
  x,
  y,
  width = LINE_WIDTH,
  height = LINE_WIDTH,
}: {
  x: number;
  y: number;
  width?: number;
  height?: number;
}): ReactElement {
  return (
    <div
      style={{ position: "absolute", left: x, top: y, width, height, background: COLORS.line }}
    />
  );
}

function Node({
  x,
  y,
  name,
  position,
  accent,
}: {
  x: number;
  y: number;
  name: string;
  position: string;
  accent?: string;
}): ReactElement {
  return (
    <div
      style={{
        position: "absolute",
        left: x - NODE.width / 2,
        top: y,
        width: NODE.width,
        height: NODE.height,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#ffffff",
        border: `2px solid ${COLORS.border}`,
        borderLeft: accent ? `8px solid ${accent}` : `2px solid ${COLORS.border}`,
        borderRadius: 8,
      }}
    >
      <div style={{ display: "flex", fontSize: 30, color: COLORS.text }}>{name}</div>
      <div style={{ display: "flex", fontSize: 22, marginTop: 2, color: COLORS.subtext }}>
        {position}
      </div>
    </div>
  );
}

function Pill({
  x,
  y,
  name,
  color,
}: {
  x: number;
  y: number;
  name: string;
  color: string;
}): ReactElement {
  return (
    <div
      style={{
        position: "absolute",
        left: x - PILL.width / 2,
        top: y,
        width: PILL.width,
        height: PILL.height,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 999,
        background: color,
        color: "#ffffff",
        fontSize: 24,
        fontWeight: 700,
      }}
    >
      {name}
    </div>
  );
}

type MarkdownLine = { depth: number; text: string; bold?: boolean };

const MARKDOWN: MarkdownLine[] = [
  { depth: 0, text: `${ROOT.name} (${ROOT.position})` },
  ...DEPARTMENTS.flatMap((department) => [
    { depth: 1, text: department.name, bold: true },
    { depth: 2, text: `${department.member.name} (${department.member.position})` },
  ]),
];

function Editor(): ReactElement {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        width: EDITOR_WIDTH,
        height: "100%",
        padding: "0 0 0 36px",
        background: "#f4f4f5",
        borderRadius: 20,
        boxShadow: BACKDROP.shadow,
        fontFamily: "Geist Mono",
        fontSize: 29,
        lineHeight: 1,
        color: "#3f3f46",
      }}
    >
      {MARKDOWN.map((line) => (
        <div
          key={line.text}
          style={{
            display: "flex",
            height: 58,
            alignItems: "center",
            paddingLeft: line.depth * INDENT,
            whiteSpace: "nowrap",
          }}
        >
          <span style={{ color: COLORS.muted, marginRight: 16 }}>-</span>
          {line.bold ? (
            <span style={{ display: "flex", color: COLORS.text }}>
              <span style={{ color: COLORS.muted }}>**</span>
              {line.text}
              <span style={{ color: COLORS.muted }}>**</span>
            </span>
          ) : (
            <span>{line.text}</span>
          )}
        </div>
      ))}
    </div>
  );
}

function Arrow(): ReactElement {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: ARROW_WIDTH,
        height: "100%",
      }}
    >
      <svg aria-hidden="true" fill="none" height="60" viewBox="0 0 48 44" width="66">
        <path
          d="M4 22h36M26 6l16 16-16 16"
          stroke={BACKDROP.arrow}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="6"
        />
      </svg>
    </div>
  );
}

function Chart(): ReactElement {
  const [first, last] = COLUMNS;

  return (
    <div
      style={{
        display: "flex",
        position: "relative",
        width: CHART_WIDTH,
        height: "100%",
        background: "#ffffff",
        borderRadius: 20,
        boxShadow: BACKDROP.shadow,
      }}
    >
      <Line
        height={ROW.branch - ROW.root - NODE.height}
        x={CENTER - LINE_WIDTH / 2}
        y={ROW.root + NODE.height}
      />
      <Line width={last - first} x={first - LINE_WIDTH / 2} y={ROW.branch} />
      {COLUMNS.map((x) => (
        <Line height={ROW.member - ROW.branch} key={x} x={x - LINE_WIDTH / 2} y={ROW.branch} />
      ))}
      <Node name={ROOT.name} position={ROOT.position} x={CENTER} y={ROW.root} />
      {DEPARTMENTS.map((department, index) => [
        <Pill
          color={department.color}
          key={`${department.name}-pill`}
          name={department.name}
          x={COLUMNS[index]}
          y={ROW.pill}
        />,
        <Node
          accent={department.color}
          key={`${department.name}-member`}
          name={department.member.name}
          position={department.member.position}
          x={COLUMNS[index]}
          y={ROW.member}
        />,
      ])}
    </div>
  );
}

export default async function Image({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<ImageResponse> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "OgImage" });
  // satori は外部 URL を読みに行かないので、アイコンはデータ URI にして渡す。
  const [icon, latin, latinBold, mono, japanese] = await Promise.all([
    readFile(join(process.cwd(), "src/app/icon.png")),
    readFile(join(process.cwd(), "assets/Geist-Regular-subset.ttf")),
    readFile(join(process.cwd(), "assets/Geist-Bold-subset.ttf")),
    readFile(join(process.cwd(), "assets/GeistMono-Regular-subset.ttf")),
    readFile(join(process.cwd(), "assets/ZenKakuGothicNew-Regular-subset.ttf")),
  ]);
  const iconSrc = `data:image/png;base64,${icon.toString("base64")}`;

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        padding: `${HEADER.top}px ${GUTTER}px 0`,
        background: BACKDROP.background,
        color: BACKDROP.title,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", height: HEADER.height }}>
        {/* biome-ignore lint/performance/noImgElement: ImageResponse は satori で描画するため next/image は使えない */}
        <img
          alt=""
          height={112}
          src={iconSrc}
          style={{ borderRadius: 26, border: "2px solid rgba(165, 243, 252, 0.35)" }}
          width={112}
        />
        <div style={{ display: "flex", flexDirection: "column", marginLeft: 32 }}>
          <div style={{ display: "flex", fontSize: 72, fontWeight: 700, letterSpacing: -2 }}>
            {TITLE}
          </div>
          <div style={{ display: "flex", fontSize: 34, color: BACKDROP.tagline }}>
            {t("tagline")}
          </div>
        </div>
      </div>
      <div style={{ display: "flex", marginTop: PANEL.gap, height: PANEL.height }}>
        <Editor />
        <Arrow />
        <Chart />
      </div>
    </div>,
    {
      ...size,
      // 欧文は本体と同じ Geist。日本語はそこに無いので、Zen Kaku へ落とす
      fonts: [
        { data: latin, name: "Geist", style: "normal", weight: 400 },
        { data: latinBold, name: "Geist", style: "normal", weight: 700 },
        { data: mono, name: "Geist Mono", style: "normal", weight: 400 },
        {
          data: japanese,
          name: "Zen Kaku Gothic New",
          style: "normal",
          weight: 400,
        },
      ],
    },
  );
}
