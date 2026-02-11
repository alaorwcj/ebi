import { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "ebi-theme";

export function getStoredTheme() {
  return localStorage.getItem(STORAGE_KEY) || "light";
}

export function setStoredTheme(theme) {
  localStorage.setItem(STORAGE_KEY, theme);
  document.documentElement.setAttribute("data-theme", theme);
  document.documentElement.classList.toggle("dark", theme === "dark");
}

function initTheme() {
  const theme = getStoredTheme();
  document.documentElement.setAttribute("data-theme", theme);
  document.documentElement.classList.toggle("dark", theme === "dark");
}

initTheme();

export default function ThemeToggle() {
  const [theme, setTheme] = useState(getStoredTheme);
  const isDark = theme === "dark";

  useEffect(() => {
    const handler = () => setTheme(getStoredTheme());
    window.addEventListener("theme-change", handler);
    return () => window.removeEventListener("theme-change", handler);
  }, []);

  function handleClick() {
    const next = isDark ? "light" : "dark";
    setStoredTheme(next);
    window.dispatchEvent(new CustomEvent("theme-change", { detail: next }));
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={handleClick}
      title={isDark ? "Usar tema claro" : "Usar tema escuro"}
      aria-label={isDark ? "Usar tema claro" : "Usar tema escuro"}
    >
      <Sun className="h-5 w-5 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
      <Moon className="absolute h-5 w-5 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
    </Button>
  );
}
