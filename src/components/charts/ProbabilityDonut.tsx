import { Doughnut } from "react-chartjs-2";
import "@/components/charts/chartSetup";
import { CHART_FONT } from "@/components/charts/chartSetup";

interface ProbabilityDonutProps {
  human: number;
  ai: number;
}

export function ProbabilityDonut({ human, ai }: ProbabilityDonutProps) {
  // нормализуем пару к 100
  const sum = human + ai || 1;
  const h = Math.round((human / sum) * 100);
  const a = 100 - h;

  const data = {
    labels: ["Человек", "ИИ"],
    datasets: [
      {
        data: [h, a],
        backgroundColor: [
          "rgba(52, 211, 153, 0.85)",
          "rgba(34, 211, 238, 0.85)",
        ],
        borderColor: ["rgba(52, 211, 153, 1)", "rgba(34, 211, 238, 1)"],
        borderWidth: 2,
        hoverOffset: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "68%",
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          color: "rgba(226,232,240,0.9)",
          font: CHART_FONT,
          padding: 14,
          usePointStyle: true,
          pointStyle: "circle" as const,
        },
      },
      tooltip: {
        backgroundColor: "rgba(7, 10, 22, 0.95)",
        borderColor: "rgba(255,255,255,0.1)",
        borderWidth: 1,
        titleFont: CHART_FONT,
        bodyFont: CHART_FONT,
        callbacks: {
          label: (ctx: { parsed: number; label: string }) =>
            `${ctx.label}: ${ctx.parsed}%`,
        },
      },
    },
  };

  return (
    <div className="relative h-64 w-full">
      <Doughnut data={data} options={options} />
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center pb-10">
        <span className="font-mono text-3xl font-bold text-accent-emerald">
          {h}%
        </span>
        <span className="text-[10px] uppercase tracking-wider text-slate-400">
          человек
        </span>
      </div>
    </div>
  );
}
