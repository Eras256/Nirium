"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

type Theme = "dark" | "light";

/**
 * Theme toggle — flips the `data-theme` attribute on <html> and persists it.
 * The whole app follows via CSS variables (see globals.css / tailwind.config).
 * The initial attribute is set by the anti-FOUC script in the root layout.
 */
export function ThemeToggle({ className = "", compact = false }: { className?: string; compact?: boolean }) {
    const [theme, setTheme] = useState<Theme>("dark");

    useEffect(() => {
        const current = (document.documentElement.getAttribute("data-theme") as Theme) || "dark";
        setTheme(current);
    }, []);

    const toggle = () => {
        const next: Theme = theme === "dark" ? "light" : "dark";
        setTheme(next);
        document.documentElement.setAttribute("data-theme", next);
        try { localStorage.setItem("nirium_theme", next); } catch { /* private mode */ }
    };

    const label = theme === "dark" ? "Switch to light theme" : "Switch to dark theme";

    return (
        <button
            type="button"
            onClick={toggle}
            aria-label={label}
            title={label}
            className={
                (compact
                    ? "w-9 h-9 shrink-0 "
                    : "w-9 h-9 shrink-0 ") +
                "inline-flex items-center justify-center rounded-full border border-white/10 text-white/70 hover:text-white hover:border-white/25 hover:bg-white/5 transition-colors " +
                className
            }
        >
            {theme === "dark"
                ? <Sun className="w-[15px] h-[15px]" />
                : <Moon className="w-[15px] h-[15px]" />}
        </button>
    );
}
