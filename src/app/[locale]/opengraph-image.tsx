/* eslint-disable filenames/match-exported, filenames/match-regex */
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";

export const alt = "Chain";

export const size = { width: 1200, height: 630 };

export const contentType = "image/png";

/* ビルド時に焼く。動的なままだと背景とフォントが関数側に含まれず、
   本番で読めずに 500 になる */
export function generateStaticParams(): { locale: string }[] {
  return routing.locales.map((locale) => ({ locale }));
}

const TITLE = "Chain";

export default async function Image({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<ImageResponse> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "OgImage" });
  // satori は外部 URL を読みに行かないので、背景はデータ URI にして渡す。
  const [background, latin, latinBold, japanese] = await Promise.all([
    readFile(join(process.cwd(), "src/app/[locale]/opengraph-background.png")),
    readFile(join(process.cwd(), "assets/Geist-Regular-subset.ttf")),
    readFile(join(process.cwd(), "assets/Geist-Bold-subset.ttf")),
    readFile(join(process.cwd(), "assets/ZenKakuGothicNew-Regular-subset.ttf")),
  ]);
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
          {t("tagline")}
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
    {
      ...size,
      // 欧文は本体と同じ Geist。日本語はそこに無いので、Zen Kaku へ落とす
      fonts: [
        { data: latin, name: "Geist", style: "normal", weight: 400 },
        { data: latinBold, name: "Geist", style: "normal", weight: 700 },
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
