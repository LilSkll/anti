import { useMemo } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Handle,
  Position,
  type Node,
  type Edge,
  type NodeProps,
  BackgroundVariant,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type { SemioticResult, SemioticNodeType } from "@/types/analysis";

interface SemioticGraphProps {
  data: SemioticResult;
  height?: number;
}

const TYPE_STYLES: Record<
  SemioticNodeType,
  { bg: string; border: string; label: string }
> = {
  concept: {
    bg: "linear-gradient(135deg, rgba(34,211,238,0.18), rgba(34,211,238,0.05))",
    border: "rgba(34, 211, 238, 0.7)",
    label: "Концепт",
  },
  sign: {
    bg: "linear-gradient(135deg, rgba(129,140,248,0.20), rgba(129,140,248,0.05))",
    border: "rgba(129, 140, 248, 0.8)",
    label: "Знак",
  },
  field: {
    bg: "linear-gradient(135deg, rgba(52,211,153,0.18), rgba(52,211,153,0.05))",
    border: "rgba(52, 211, 153, 0.7)",
    label: "Поле",
  },
  link: {
    bg: "linear-gradient(135deg, rgba(251,191,36,0.14), rgba(251,191,36,0.04))",
    border: "rgba(251, 191, 36, 0.6)",
    label: "Связь",
  },
};

function CustomNode({ data }: NodeProps) {
  const type = (data.type as SemioticNodeType) ?? "concept";
  const style = TYPE_STYLES[type];
  const weight = Number(data.weight ?? 5);
  const size = 60 + weight * 5;

  return (
    <div
      className="flex flex-col items-center justify-center rounded-2xl px-3 text-center shadow-card"
      style={{
        width: size,
        minWidth: 70,
        background: style.bg,
        border: `1.5px solid ${style.border}`,
        backdropFilter: "blur(6px)",
      }}
    >
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: "transparent", border: "none" }}
      />
      <div
        className="text-[9px] font-medium uppercase tracking-wider"
        style={{ color: style.border }}
      >
        {style.label}
      </div>
      <div className="mt-0.5 text-xs font-semibold leading-tight text-slate-100">
        {String(data.label ?? "")}
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: "transparent", border: "none" }}
      />
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: "transparent", border: "none" }}
      />
      <Handle
        type="source"
        position={Position.Right}
        style={{ background: "transparent", border: "none" }}
      />
    </div>
  );
}

const nodeTypes = { semiotic: CustomNode };

/** Простой круговой layout узлов */
function layoutNodes(
  nodes: SemioticResult["nodes"]
): Node[] {
  const n = nodes.length;
  if (n === 0) return [];
  const radius = Math.max(140, n * 26);
  const cx = 0;
  const cy = 0;

  return nodes.map((node, i) => {
    if (n === 1) {
      return {
        id: node.id,
        type: "semiotic",
        position: { x: cx, y: cy },
        data: { label: node.label, type: node.type, weight: node.weight },
      };
    }
    const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
    return {
      id: node.id,
      type: "semiotic",
      position: {
        x: cx + radius * Math.cos(angle),
        y: cy + radius * Math.sin(angle),
      },
      data: { label: node.label, type: node.type, weight: node.weight },
    };
  });
}

export function SemioticGraph({ data, height = 460 }: SemioticGraphProps) {
  const { nodes: rfNodes, edges: rfEdges } = useMemo(() => {
    const nodes = layoutNodes(data.nodes);
    const edges: Edge[] = data.edges.map((e, i) => ({
      id: `e_${e.source}_${e.target}_${i}`,
      source: e.source,
      target: e.target,
      label: e.label,
      labelStyle: { fill: "#cbd5e1", fontSize: 11 },
      labelBgStyle: { fill: "rgba(11,16,32,0.85)" },
      animated: e.weight >= 7,
      style: {
        stroke: `rgba(129, 140, 248, ${0.3 + (e.weight / 10) * 0.5})`,
        strokeWidth: 1 + e.weight / 6,
      },
    }));
    return { nodes, edges };
  }, [data]);

  if (data.nodes.length === 0) {
    return (
      <div
        className="grid place-items-center rounded-xl border border-dashed border-white/10 text-sm text-slate-500"
        style={{ height }}
      >
        Нет данных для построения графа
      </div>
    );
  }

  return (
    <div
      className="overflow-hidden rounded-xl border border-white/10 bg-ink-950/40"
      style={{ height }}
    >
      <ReactFlow
        nodes={rfNodes}
        edges={rfEdges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        proOptions={{ hideAttribution: true }}
        minZoom={0.3}
        maxZoom={2}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={22}
          size={1}
          color="rgba(255,255,255,0.06)"
        />
        <Controls showInteractive={false} />
        <MiniMap
          pannable
          zoomable
          nodeColor={(n) => {
            const t = n.data.type as SemioticNodeType;
            if (t === "concept") return "rgba(34,211,238,0.7)";
            if (t === "sign") return "rgba(129,140,248,0.8)";
            if (t === "field") return "rgba(52,211,153,0.7)";
            return "rgba(251,191,36,0.6)";
          }}
          maskColor="rgba(7,10,22,0.7)"
        />
      </ReactFlow>
    </div>
  );
}
