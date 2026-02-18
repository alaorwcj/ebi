import { useState, useEffect } from "react";

/**
 * Hook para detectar viewport ≤ maxWidth (mobile-first).
 * @param {number} maxWidth - Largura máxima em px (ex: 768 para mobile)
 * @returns {boolean} true se viewport <= maxWidth
 */
export function useMediaQuery(maxWidth) {
  const [matches, setMatches] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(`(max-width: ${maxWidth}px)`).matches;
  });

  useEffect(() => {
    const media = window.matchMedia(`(max-width: ${maxWidth}px)`);
    const listener = (e) => setMatches(e.matches);
    media.addEventListener("change", listener);
    setMatches(media.matches);
    return () => media.removeEventListener("change", listener);
  }, [maxWidth]);

  return matches;
}

/** Breakpoint padrão mobile (≤768px) */
export const MOBILE_BREAKPOINT = 768;
