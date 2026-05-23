import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type AccentKey = "indigo" | "violet" | "emerald" | "rose" | "amber" | "cyan";
export type Density = "comfortable" | "compact";
export type PaletteKey = "default" | "ocean" | "sunset" | "forest" | "mono";

export interface Preferences {
  accent: AccentKey;
  density: Density;
  palette: PaletteKey;
  radius: number; // rem * 100
  animations: boolean;
}

const DEFAULTS: Preferences = {
  accent: "emerald",
  density: "comfortable",
  palette: "forest",
  radius: 75,
  animations: true,
};

export const ACCENTS: Record<AccentKey, { label: string; primary: string; accent: string; swatch: string }> = {
  emerald: { label: "Emerald (Brand)", primary: "oklch(0.55 0.14 165)", accent: "oklch(0.65 0.13 180)", swatch: "#1f9d6f" },
  indigo:  { label: "Indigo",  primary: "oklch(0.52 0.18 250)", accent: "oklch(0.6 0.18 285)", swatch: "#4f46e5" },
  violet:  { label: "Violet",  primary: "oklch(0.52 0.2 295)",  accent: "oklch(0.62 0.2 320)", swatch: "#7c3aed" },
  rose:    { label: "Rose",    primary: "oklch(0.58 0.2 15)",   accent: "oklch(0.65 0.2 35)",  swatch: "#e11d48" },
  amber:   { label: "Amber",   primary: "oklch(0.7 0.16 70)",   accent: "oklch(0.72 0.16 50)", swatch: "#d97706" },
  cyan:    { label: "Cyan",    primary: "oklch(0.6 0.13 220)",  accent: "oklch(0.65 0.14 200)", swatch: "#0891b2" },
};

export const PALETTES: Record<PaletteKey, { label: string; colors: [string, string, string, string, string] }> = {
  default: { label: "Default",  colors: ["oklch(0.55 0.18 250)", "oklch(0.62 0.18 285)", "oklch(0.7 0.16 200)", "oklch(0.7 0.16 150)", "oklch(0.7 0.16 50)"] },
  ocean:   { label: "Ocean",    colors: ["oklch(0.55 0.14 230)", "oklch(0.6 0.14 210)", "oklch(0.65 0.13 195)", "oklch(0.7 0.12 180)", "oklch(0.55 0.18 260)"] },
  sunset:  { label: "Sunset",   colors: ["oklch(0.65 0.2 30)", "oklch(0.7 0.18 50)", "oklch(0.72 0.18 70)", "oklch(0.6 0.2 10)", "oklch(0.55 0.2 350)"] },
  forest:  { label: "Forest",   colors: ["oklch(0.5 0.14 150)", "oklch(0.6 0.14 160)", "oklch(0.65 0.13 130)", "oklch(0.55 0.12 100)", "oklch(0.45 0.1 180)"] },
  mono:    { label: "Mono",     colors: ["oklch(0.3 0.02 260)", "oklch(0.45 0.02 260)", "oklch(0.6 0.02 260)", "oklch(0.72 0.02 260)", "oklch(0.85 0.02 260)"] },
};

const STORAGE_KEY = "image-i.preferences";

interface Ctx {
  prefs: Preferences;
  setPrefs: (p: Partial<Preferences>) => void;
  reset: () => void;
}
const PrefContext = createContext<Ctx | null>(null);

function applyPreferences(p: Preferences) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  const accent = ACCENTS[p.accent];
  root.style.setProperty("--primary", accent.primary);
  root.style.setProperty("--accent", accent.accent);
  root.style.setProperty("--ring", accent.primary);
  const palette = PALETTES[p.palette].colors;
  palette.forEach((c, i) => root.style.setProperty(`--chart-${i + 1}`, c));
  root.style.setProperty("--radius", `${p.radius / 100}rem`);
  root.dataset.density = p.density;
  root.dataset.animations = p.animations ? "on" : "off";
}

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [prefs, setState] = useState<Preferences>(DEFAULTS);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = { ...DEFAULTS, ...JSON.parse(raw) } as Preferences;
        setState(parsed);
        applyPreferences(parsed);
        return;
      }
    } catch {}
    applyPreferences(DEFAULTS);
  }, []);

  const setPrefs = (patch: Partial<Preferences>) => {
    setState((prev) => {
      const next = { ...prev, ...patch };
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      applyPreferences(next);
      return next;
    });
  };

  const reset = () => {
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
    setState(DEFAULTS);
    applyPreferences(DEFAULTS);
  };

  return <PrefContext.Provider value={{ prefs, setPrefs, reset }}>{children}</PrefContext.Provider>;
}

export function usePreferences() {
  const ctx = useContext(PrefContext);
  if (!ctx) throw new Error("usePreferences must be used inside PreferencesProvider");
  return ctx;
}
