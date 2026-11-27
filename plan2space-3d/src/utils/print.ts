import { useStudio } from "@/store/useStudio";

/** Druckansicht öffnen (Browser-Dialog → "Als PDF speichern"). */
export function triggerPrint(variant: "costs" | "report") {
  useStudio.getState().setPrintVariant(variant);
  // kurz warten, bis der Report mit der gewählten Variante gerendert ist
  setTimeout(() => window.print(), 120);
}
