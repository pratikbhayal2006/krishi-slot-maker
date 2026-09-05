import { useSyncExternalStore } from "react";
import { store } from "@/lib/krishislot";

export function useKrishi() {
  return useSyncExternalStore(store.subscribe, store.get, store.getServer);
}
