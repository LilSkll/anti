import { Bar } from "react-chartjs-2";
import "@/components/charts/chartSetup";
import { CHART_FONT, CHART_GRID, CHART_TICK } from "@/components/charts/chartSetup";
import type { TextMetrics } from "@/types/analysis";
import { METRIC_DESCRIPTORS } from "@/lib/metrics";

interface ComparisonBarProps {
  metricsA: TextMetrics;
  metricsB: TextMetrics;
  labelA?: string;
  labelB?: string;
}

const COMPARE_KEYS = [
  "formality",
  "emotionality",
  "repetitiveness",
  "cohesion",
  "coherence",
  "terminologyDensity",
  "argumentationDensity",
] as const;

export function ComparisonBar({
  metricsA,
  metricsB,
  labelA = "Текст A",
  labelB = "Текст B",
}: ComparisonBarProps) {
  const labels = COMPARE_KEYS.map(
    (k) => METRIC_DESCRIPTORS.find((m) => m.key === k)?.short ?? k
  );

  const data = {
    labels,
    datasets: [
      {
        label: labelA,
        data: COMPARE_KEYS.map((k) => metricsA[k]),
        backgroundColor: "rgba(34, 211, 238, 0.7)",
        borderColor: "rgba(34, 211, 238, 1)",
        borderWidth: 1.5,
        borderRadius: 6,
      },
      {
        label: labelB,
        data: COMPARE_KEYS.map((k) => metricsB[k]),
        backgroundColor: "rgba(129, 140, 248, 0.7)",
        borderColor: "rgba(129, 140, 248, 1)",
        borderWidth: 1.5,
        borderRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: "rgba(226,232,240,0.9)",
          font: CHART_FONT,
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
      },
    },
    scales: {
      x: {
        grid: { color: CHART_GRID },
        ticks: { color: CHART_TICK, font: CHART_FONT },
      },
      y: {
        min: 0,
        max: 100,
        grid: { color: CHART_GRID },
        ticks: { color: CHART_TICK, font: CHART_FONT },
      },
    },
  };

  return (
    <div className="h-80 w-full">
      <Bar data={data} options={options} />
    </div>
  );
}
