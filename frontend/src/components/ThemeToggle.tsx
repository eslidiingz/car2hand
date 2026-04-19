"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export default function ThemeToggle({ className = "" }: { className?: string }) {
    const { resolvedTheme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);

    const isDark = mounted && resolvedTheme === "dark";
    const label = isDark ? "สลับเป็นโหมดสว่าง" : "สลับเป็นโหมดมืด";

    return (
        <button
            type="button"
            aria-label={label}
            title={label}
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className={`p-2 rounded-full text-gray-600 hover:text-primary hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white transition ${className}`}
        >
            {/* Render both with opacity swap to keep SSR/CSR output identical and avoid flashes */}
            <span className="relative block w-5 h-5">
                <Sun
                    size={20}
                    className={`absolute inset-0 transition-opacity ${isDark ? "opacity-0" : "opacity-100"}`}
                />
                <Moon
                    size={20}
                    className={`absolute inset-0 transition-opacity ${isDark ? "opacity-100" : "opacity-0"}`}
                />
            </span>
        </button>
    );
}
