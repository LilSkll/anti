import { Radar } from "react-chartjs-2";
import "@/components/charts/chartSetup";
import { CHART_FONT, CHART_GRID, CHART_TICK } from "@/components/charts/chartSetup";
import type { TextMetrics } from "@/types/analysis";
import { METRIC_DESCRIPTORS } from "@/lib/metrics";

const RADAR_KEYS = [
  "formality",
  "emotionality",
  "repetitiveness",
  "cohesion",
  "coherence",
  "terminologyDensity",
  "argumentationDensity",
] as const;

interface RadarMetricsProps {
  metrics: TextMetrics;
}

export function RadarMetrics({ metrics }: RadarMetricsProps) {
  const labels = RADAR_KEYS.map((k) => {
    const d = METRIC_DESCRIPTORS.find((m) => m.key === k);
    return d?.short ?? k;
  });
  const values = RADAR_KEYS.map((k) => metrics[k]);

  const data = {
    labels,
    datasets: [
      {
        label: "Профиль текста",
        data: values,
        backgroundColor: "rgba(34, 211, 238, 0.18)",
        borderColor: "rgba(34, 211, 238, 0.9)",
        borderWidth: 2,
        pointBackgroundColor: "rgba(129, 140, 248, 1)",
        pointBorderColor: "#0B1020",
        pointRadius: 3.5,
        pointHoverRadius: 5,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "rgba(7, 10, 22, 0.95)",
        borderColor: "rgba(255,255,255,0.1)",
        borderWidth: 1,
        titleFont: CHART_FONT,
        bodyFont: CHART_FONT,
        callbacks: {
          label: (ctx: { parsed: { r?: number }; label: string }) =>
            `${ctx.label}: ${Math.round(ctx.parsed.r ?? 0)}/100`,
        },
      },
    },
    scales: {
      r: {
        min: 0,
        max: 100,
        ticks: {
          stepSize: 25,
          color: CHART_TICK,
          backdropColor: "transparent",
          font: CHART_FONT,
        },
        grid: { color: CHART_GRID },
        angleLines: { color: CHART_GRID },
        pointLabels: {
          color: "rgba(226,232,240,0.9)",
          font: { ...CHART_FONT, size: 12, weight: 500 as const },
        },
      },
    },
  };

  return (
    <div className="h-72 w-full">
      <Radar data={data} options={options} />
    </div>
  );
}
