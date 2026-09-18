"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "midnight";

const THEMES: { id: Theme; label: string; emoji: string }[] = [
  { id: "light", label: "Light", emoji: "☀️" },
  { id: "midnight", label: "Dark", emoji: "🌙" },
];

const ThemeContext = createContext<{
  theme: Theme;
  setTheme: (t: Theme) => void;
  themes: typeof THEMES;
}>({
  theme: "midnight",
  setTheme: () => {},
  themes: THEMES,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("midnight");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("sf-theme") as Theme | null;
    if (stored && THEMES.find(t => t.id === stored)) {
      setThemeState(stored);
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    // Remove all theme classes/attributes
    root.removeAttribute("data-theme");
    root.classList.remove("dark");

    if (theme === "light") {
      // Light theme is :root, no class needed
    } else {
      root.classList.add("dark");
      root.setAttribute("data-theme", theme);
    }
    localStorage.setItem("sf-theme", theme);
  }, [theme, mounted]);

  const setTheme = (t: Theme) => setThemeState(t);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
