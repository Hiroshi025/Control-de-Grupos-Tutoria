"use client";

import React, { useEffect, useState } from "react";

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  // Leer preferencia de tema al cargar
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    } else {
      setIsDark(false);
      document.documentElement.classList.remove("dark");
    }
  }, []);

  // Guardar preferencia y aplicar clase
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  return (
    <button
      onClick={() => setIsDark((prev) => !prev)}
      className={`flex items-center gap-2 px-4 py-2 rounded-full shadow-lg border border-border
        bg-card text-card-foreground transition-all duration-300
        hover:scale-105 hover:bg-primary hover:text-primary-foreground
        active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary`}
      aria-label="Cambiar tema"
      type="button"
    >
      <span className="transition-transform duration-300">
        {isDark ? (
          // Icono luna
          <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
            <path
              d="M21 12.79A9 9 0 0 1 12.21 3a1 1 0 0 0-1.13 1.36A7 7 0 1 0 19.64 14.92a1 1 0 0 0 1.36-1.13Z"
              fill="currentColor"
            />
          </svg>
        ) : (
          // Icono sol
          <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
            <path
              d="M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12Zm0-16v2m0 16v2m8-10h2M2 12H4m15.07 7.07l1.42 1.42M4.93 4.93 3.51 3.51m0 16.98 1.42-1.42M19.07 4.93l1.42-1.42"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </span>
      <span className="font-medium">{isDark ? "Oscuro" : "Claro"}</span>
    </button>
  );
}
