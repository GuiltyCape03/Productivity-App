import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";

const config: Config = {
  darkMode: ["class"],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./modules/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "2rem"
    },
    extend: {
      colors: {
        surface: {
          base: "var(--surface-base)",
          elevated: "var(--surface-elevated)",
          muted: "var(--surface-muted)"
        },
        foreground: {
          DEFAULT: "var(--foreground-strong)",
          muted: "var(--foreground-muted)"
        },
        border: "var(--surface-border)",
        accent: {
          primary: "var(--accent-primary)",
          secondary: "var(--accent-secondary)",
          danger: "var(--accent-danger)"
        }
      },
      fontFamily: {
        sans: ["var(--font-sans)", ...defaultTheme.fontFamily.sans],
        emoji: ["var(--font-emoji)", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", ...defaultTheme.fontFamily.sans]
      },
      borderRadius: {
        xl: "var(--radius-base)",
        "2xl": `calc(var(--radius-base) + 8px)`
      },
      boxShadow: {
        shell: "0 40px 120px -60px rgba(15, 23, 42, 0.55)",
        card: "0 18px 40px -20px rgba(15, 23, 42, 0.35)",
        badge: "0 2px 10px rgba(15, 23, 42, 0.18)"
      }
    }
  },
  plugins: []
};

export default config;
