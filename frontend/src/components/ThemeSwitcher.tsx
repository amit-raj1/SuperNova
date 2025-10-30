import { useTheme } from "../context/ThemeContext";
import { Palette, Moon, Sun } from "lucide-react";

const themes = [
	{ value: "neutral", label: "Neutral" },
	{ value: "emerald", label: "Emerald" },
	{ value: "amber", label: "Amber" },
	{ value: "rose", label: "Rose" },
	{ value: "plum", label: "Plum" },
];

const ThemeSwitcher = () => {
	const { theme, setTheme, isDark, toggleDark } = useTheme();

	return (
		<div className="flex items-center gap-3">
			<button
				title={isDark ? "Switch to light" : "Switch to dark"}
				onClick={toggleDark}
				className="inline-flex items-center justify-center w-9 h-9 rounded-md border border-border bg-secondary text-secondary-foreground hover:opacity-90"
			>
				{isDark ? <Sun size={16} /> : <Moon size={16} />}
			</button>
			<div className="relative">
				<div className="flex items-center gap-2">
					<Palette size={16} className="text-foreground/70" />
					<select
						value={theme}
						onChange={(e) => setTheme(e.target.value as any)}
						className="appearance-none bg-secondary text-secondary-foreground rounded-md px-3 py-2 pr-8 border border-border focus:outline-none focus:ring-2 focus:ring-primary"
					>
						{themes.map((t) => (
							<option key={t.value} value={t.value}>
								{t.label}
							</option>
						))}
					</select>
				</div>
				{/* Swatches */}
				<div className="mt-2 flex gap-2">
					{themes.map((t) => (
						<button
							key={t.value}
							onClick={() => setTheme(t.value as any)}
							title={t.label}
							className={`w-6 h-6 rounded-full border border-border ring-offset-2 ${
								theme === t.value ? "ring-2 ring-primary" : ""
							}`}
							style={{ background: "hsl(var(--primary))" }}
						/>
					))}
				</div>
			</div>
		</div>
	);
};

export default ThemeSwitcher;

