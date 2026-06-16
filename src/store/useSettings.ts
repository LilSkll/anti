import { useSyncExternalStore } from "react";
import { settingsApi } from "@/store/settingsStore";

/**
 * React-хук для доступа к UI-настройкам (провайдер, модель).
 * Подписывается на изменения через useSyncExternalStore.
 */
export function useSettings() {
  const state = useSyncExternalStore(
    settingsApi.subscribe,
    settingsApi.getState,
    settingsApi.getState
  );
  return state;
}
