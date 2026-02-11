import { useState, useEffect } from "react";
import { Toaster } from "sonner";

export default function ThemedToaster() {
  const [theme, setTheme] = useState(() =>
    document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light"
  );

  useEffect(() => {
    const handler = () => {
      setTheme(document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light");
    };
    window.addEventListener("theme-change", handler);
    return () => window.removeEventListener("theme-change", handler);
  }, []);

  return (
    <Toaster
      theme={theme}
      position="top-right"
      richColors
      closeButton
      toastOptions={{
        duration: 4000,
      }}
    />
  );
}
