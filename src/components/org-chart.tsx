"use client";

import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import type { CustomNodeElementProps, RawNodeDatum } from "react-d3-tree";
import type { OrgNode } from "@/lib/parse-markdown";

const Tree = dynamic(() => import("react-d3-tree").then((mod) => mod.Tree), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-zinc-500">
      <p>Loading...</p>
    </div>
  ),
});

type OrgChartProps = {
  nodes: OrgNode[];
};

export type OrgChartHandle = {
  exportPng: () => Promise<void>;
  exportSvg: () => Promise<void>;
  fitToView: () => void;
};

type TreeNodeDatum = RawNodeDatum & {
  position?: string;
};

function convertNode(node: OrgNode): TreeNodeDatum {
  return {
    name: node.name,
    position: node.position,
    children: node.children.map(convertNode),
  };
}

function convertToTreeData(nodes: OrgNode[]): TreeNodeDatum | null {
  if (nodes.length === 0) return null;
  if (nodes.length === 1) return convertNode(nodes[0]);

  return {
    name: "",
    children: nodes.map(convertNode),
  };
}

const COLORS = {
  bg: "#ffffff",
  border: "#d4d4d8",
  text: "#18181b",
  subtext: "#71717a",
  line: "#a1a1aa",
};

function renderNode({ nodeDatum }: CustomNodeElementProps): React.ReactElement {
  const data = nodeDatum as TreeNodeDatum;

  if (!data.name) {
    return <g />;
  }

  const hasPosition = Boolean(data.position);
  const height = hasPosition ? 48 : 36;
  const yOffset = height / 2;

  return (
    <g>
      <foreignObject x="-70" y={-yOffset} width="140" height={height}>
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: COLORS.bg,
            border: `1.5px solid ${COLORS.border}`,
            borderRadius: "4px",
            fontFamily: "system-ui, sans-serif",
            padding: "4px 8px",
            boxSizing: "border-box",
          }}
        >
          <span
            style={{
              color: COLORS.text,
              fontSize: "13px",
              fontWeight: 400,
              lineHeight: 1.2,
            }}
          >
            {data.name}
          </span>
          {hasPosition && (
            <span
              style={{
                color: COLORS.subtext,
                fontSize: "11px",
                fontWeight: 400,
                lineHeight: 1.2,
                marginTop: "2px",
              }}
            >
              {data.position}
            </span>
          )}
        </div>
      </foreignObject>
    </g>
  );
}

export const OrgChart = forwardRef<OrgChartHandle, OrgChartProps>(function OrgChart(
  { nodes },
  ref,
): React.ReactNode {
  const t = useTranslations("HomePage");
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [zoom, setZoom] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 60 });
  const treeData = useMemo(() => convertToTreeData(nodes), [nodes]);
  const renderNodeCallback = useCallback((props: CustomNodeElementProps) => renderNode(props), []);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth;
        const height = containerRef.current.offsetHeight;
        setDimensions({ width, height });
        setTranslate({ x: width / 2, y: 60 });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  const handleZoomIn = useCallback(() => {
    setZoom((z) => Math.min(z * 1.2, 3));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom((z) => Math.max(z / 1.2, 0.3));
  }, []);

  const handleZoomReset = useCallback(() => {
    setZoom(1);
    if (containerRef.current) {
      setTranslate({ x: containerRef.current.offsetWidth / 2, y: 60 });
    }
  }, []);

  const handleFitToView = useCallback(() => {
    if (!containerRef.current) return;
    const svg = containerRef.current.querySelector("svg");
    if (!svg) return;

    const g = svg.querySelector("g.rd3t-g") as SVGGElement | null;
    if (!g) return;

    const bbox = g.getBBox();
    const containerWidth = containerRef.current.offsetWidth;
    const containerHeight = containerRef.current.offsetHeight;

    const padding = 60;
    const scaleX = (containerWidth - padding * 2) / bbox.width;
    const scaleY = (containerHeight - padding * 2) / bbox.height;
    const newZoom = Math.min(scaleX, scaleY, 1);

    const centerX = bbox.x + bbox.width / 2;
    const centerY = bbox.y + bbox.height / 2;

    setZoom(Math.max(newZoom, 0.3));
    setTranslate({
      x: containerWidth / 2 - centerX * newZoom,
      y: containerHeight / 2 - centerY * newZoom,
    });
  }, []);

  const prepareSvgForExport = useCallback(() => {
    if (!containerRef.current) return null;
    const svg = containerRef.current.querySelector("svg");
    if (!svg) return null;

    const g = svg.querySelector("g.rd3t-g") as SVGGElement | null;
    if (!g) return null;

    const bbox = g.getBBox();
    const padding = 40;
    const width = Math.ceil(bbox.width + padding * 2);
    const height = Math.ceil(bbox.height + padding * 2);

    const clonedSvg = svg.cloneNode(true) as SVGSVGElement;
    const clonedG = clonedSvg.querySelector("g.rd3t-g");
    if (clonedG) {
      clonedG.removeAttribute("transform");
    }

    clonedSvg.setAttribute("width", String(width));
    clonedSvg.setAttribute("height", String(height));
    clonedSvg.setAttribute("viewBox", `${bbox.x - padding} ${bbox.y - padding} ${width} ${height}`);
    clonedSvg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    clonedSvg.setAttribute("xmlns:xhtml", "http://www.w3.org/1999/xhtml");

    // Add background
    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute("x", String(bbox.x - padding));
    rect.setAttribute("y", String(bbox.y - padding));
    rect.setAttribute("width", String(width));
    rect.setAttribute("height", String(height));
    rect.setAttribute("fill", "#ffffff");
    clonedSvg.insertBefore(rect, clonedSvg.firstChild);

    // Add line styles
    const style = document.createElementNS("http://www.w3.org/2000/svg", "style");
    style.textContent = `.org-chart-link { stroke: ${COLORS.line}; stroke-width: 1.5px; fill: none; }`;
    clonedSvg.insertBefore(style, clonedSvg.firstChild);

    return { svg: clonedSvg, width, height };
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      fitToView: handleFitToView,
      exportPng: async () => {
        const result = prepareSvgForExport();
        if (!result) return;

        const { svg: clonedSvg, width, height } = result;

        try {
          const svgData = new XMLSerializer().serializeToString(clonedSvg);
          const svgBase64 = btoa(unescape(encodeURIComponent(svgData)));
          const dataUrl = `data:image/svg+xml;base64,${svgBase64}`;

          const img = new Image();
          img.onload = () => {
            const scale = 2;
            const canvas = document.createElement("canvas");
            canvas.width = width * scale;
            canvas.height = height * scale;
            const ctx = canvas.getContext("2d");
            if (!ctx) return;

            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.scale(scale, scale);
            ctx.drawImage(img, 0, 0, width, height);

            const link = document.createElement("a");
            link.download = "org-chart.png";
            link.href = canvas.toDataURL("image/png");
            link.click();
          };
          img.onerror = () => {
            // Fallback: download as SVG if PNG fails
            const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.download = "org-chart.svg";
            link.href = url;
            link.click();
            URL.revokeObjectURL(url);
          };
          img.src = dataUrl;
        } catch {
          // Export failed
        }
      },
      exportSvg: async () => {
        const result = prepareSvgForExport();
        if (!result) return;

        try {
          const svgData = new XMLSerializer().serializeToString(result.svg);
          const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
          const url = URL.createObjectURL(blob);

          const link = document.createElement("a");
          link.download = "org-chart.svg";
          link.href = url;
          link.click();

          URL.revokeObjectURL(url);
        } catch {
          // Export failed
        }
      },
    }),
    [prepareSvgForExport, handleFitToView],
  );

  if (!treeData) {
    return (
      <div className="flex h-full items-center justify-center text-zinc-500">
        <p>{t("emptyChart")}</p>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      <div className="absolute right-4 top-4 z-10 flex gap-1">
        <button
          type="button"
          onClick={handleFitToView}
          className="flex h-8 w-8 items-center justify-center rounded border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50"
          title={t("fitToView")}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
          </svg>
        </button>
        <button
          type="button"
          onClick={handleZoomOut}
          className="flex h-8 w-8 items-center justify-center rounded border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50"
          title={t("zoomOut")}
        >
          −
        </button>
        <button
          type="button"
          onClick={handleZoomReset}
          className="flex h-8 items-center justify-center rounded border border-zinc-300 bg-white px-2 text-sm text-zinc-700 hover:bg-zinc-50"
          title={t("zoomReset")}
        >
          {Math.round(zoom * 100)}%
        </button>
        <button
          type="button"
          onClick={handleZoomIn}
          className="flex h-8 w-8 items-center justify-center rounded border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50"
          title={t("zoomIn")}
        >
          +
        </button>
      </div>
      <div ref={containerRef} className="h-full w-full bg-white">
        {dimensions.width > 0 && (
          <Tree
            data={treeData}
            orientation="vertical"
            pathFunc="step"
            translate={translate}
            zoom={zoom}
            scaleExtent={{ min: 0.3, max: 3 }}
            nodeSize={{ x: 160, y: 90 }}
            separation={{ siblings: 1.2, nonSiblings: 1.5 }}
            renderCustomNodeElement={renderNodeCallback}
            pathClassFunc={() => "org-chart-link"}
            collapsible={false}
            zoomable
            draggable
            onUpdate={({ zoom: newZoom, translate: newTranslate }) => {
              setZoom(newZoom);
              setTranslate(newTranslate);
            }}
          />
        )}
        <style>{`
          .org-chart-link {
            stroke: ${COLORS.line};
            stroke-width: 1.5px;
            fill: none;
          }
        `}</style>
      </div>
    </div>
  );
});
