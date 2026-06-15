import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AnalysisBundle } from "@/types/analysis";
import { uid } from "@/lib/utils";

interface AnalysisState {
  /** История всех анализов */
  history: AnalysisBundle[];
  /** Текущий рабочий набор (для отчётов) */
  current: AnalysisBundle | null;

  setCurrent: (b: AnalysisBundle) => void;
  updateCurrent: (patch: Partial<AnalysisBundle>) => void;
  resetCurrent: (init?: Partial<AnalysisBundle>) => AnalysisBundle;
  commitCurrent: () => void;
  removeHistory: (id: string) => void;
  clearHistory: () => void;
}

function createBundle(init?: Partial<AnalysisBundle>): AnalysisBundle {
  return {
    id: uid("a_"),
    createdAt: Date.now(),
    title: init?.title ?? "Новый анализ",
    sourceText: init?.sourceText ?? "",
    ...init,
  };
}

export const useAnalysisStore = create<AnalysisState>()(
  persist(
    (set, get) => ({
      history: [],
      current: null,

      setCurrent: (b) => set({ current: b }),

      updateCurrent: (patch) =>
        set((s) =>
          s.current ? { current: { ...s.current, ...patch } } : s
        ),

      resetCurrent: (init) => {
        const b = createBundle(init);
        set({ current: b });
        return b;
      },

      commitCurrent: () => {
        const { current, history } = get();
        if (!current) return;
        const existsIdx = history.findIndex((h) => h.id === current.id);
        const next = [...history];
        if (existsIdx >= 0) next[existsIdx] = current;
        else next.unshift(current);
        // храним последние 25
        const trimmed = next.slice(0, 25);
        set({ history: trimmed });
      },

      removeHistory: (id) =>
        set((s) => ({ history: s.history.filter((h) => h.id !== id) })),

      clearHistory: () => set({ history: [] }),
    }),
    { name: "alda-history" }
  )
);
