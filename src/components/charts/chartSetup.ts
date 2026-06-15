import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement
);

export const CHART_FONT = {
  family: "Inter, system-ui, sans-serif",
  size: 11,
};

export const CHART_GRID = "rgba(255,255,255,0.08)";
export const CHART_TICK = "rgba(203,213,225,0.7)";

export default ChartJS;
