import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";

export type ThemeName = "neutral" | "emerald" | "amber" | "rose" | "plum";

type ThemeContextValue = {
	theme: ThemeName;
	setTheme: (t: ThemeName) => void;
	isDark: boolean;
	toggleDark: () => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const THEME_STORAGE_KEY = "app.theme";
const DARK_STORAGE_KEY = "app.dark";

export function ThemeProvider({ children }: { children: ReactNode }) {
	const [theme, setThemeState] = useState<ThemeName>(() => {
		const saved = (localStorage.getItem(THEME_STORAGE_KEY) as ThemeName) || "neutral";
		return saved;
	});
	const [isDark, setIsDark] = useState<boolean>(() => {
		const saved = localStorage.getItem(DARK_STORAGE_KEY);
		return saved ? saved === "true" : false;
	});

	useEffect(() => {
		localStorage.setItem(THEME_STORAGE_KEY, theme);
		const root = document.documentElement;
		root.classList.remove("theme-neutral", "theme-emerald", "theme-amber", "theme-rose", "theme-plum");
		root.classList.add(`theme-${theme}`);
	}, [theme]);

	useEffect(() => {
		localStorage.setItem(DARK_STORAGE_KEY, String(isDark));
		const root = document.documentElement;
		if (isDark) root.classList.add("dark");
		else root.classList.remove("dark");
	}, [isDark]);

	const value = useMemo<ThemeContextValue>(
		() => ({
			theme,
			setTheme: setThemeState,
			isDark,
			toggleDark: () => setIsDark((d) => !d),
		}),
		[theme, isDark]
	);

	return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
	const ctx = useContext(ThemeContext);
	if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
	return ctx;
}
