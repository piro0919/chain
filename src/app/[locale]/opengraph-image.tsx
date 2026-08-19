/* eslint-disable filenames/match-exported, filenames/match-regex */
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const alt = "Chain";

export const size = { width: 1200, height: 630 };

export const contentType = "image/png";

const TITLE = "Chain";
const DESCRIPTION = "Create organization charts from markdown.";

export default async function Image(): Promise<ImageResponse> {
  // satori は外部 URL を読みに行かないので、背景はデータ URI にして渡す。
  const background = await readFile(
    join(process.cwd(), "src/app/[locale]/opengraph-background.png"),
  );
  const backgroundSrc = `data:image/png;base64,${background.toString("base64")}`;

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        background: "#0b0b0f",
        color: "#ffffff",
      }}
    >
      {/* biome-ignore lint/performance/noImgElement: ImageResponse は satori で描画するため next/image は使えない */}
      <img
        alt=""
        height={size.height}
        src={backgroundSrc}
        style={{ position: "absolute", left: 0, top: 0 }}
        width={size.width}
      />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 90px",
          width: 660,
          height: "100%",
        }}
      >
        <div
          style={{
            display: "flex",
            width: 120,
            height: 10,
            borderRadius: 999,
            marginBottom: 44,
            background: "linear-gradient(90deg, #22d3ee 0%, #0891b2 100%)",
          }}
        />
        <div
          style={{
            display: "flex",
            fontSize: 84,
            fontWeight: 700,
            letterSpacing: -1,
          }}
        >
          {TITLE}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 32,
            marginTop: 28,
            lineHeight: 1.4,
            color: "#a1a1aa",
          }}
        >
          {DESCRIPTION}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 26,
            marginTop: 56,
            color: "#71717a",
          }}
        >
          kkweb.io
        </div>
      </div>
    </div>,
    size,
  );
}
