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
        background: "hsl(var(--bg))",
        foreground: {
          DEFAULT: "hsl(var(--text))",
          muted: "hsl(var(--muted))",
          subtle: "hsl(var(--muted))"
        },
        primary: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--bg))",
          subtle: "hsl(var(--accent-2))"
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--text))"
        },
        card: {
          DEFAULT: "hsl(var(--panel))",
          foreground: "hsl(var(--text))"
        },
        border: "hsl(var(--border))",
        success: "hsl(var(--success))",
        warning: "hsl(var(--warning))",
        danger: "hsl(var(--danger))",
        surface: {
          base: "hsl(var(--bg))",
          elevated: "hsl(var(--panel))",
          muted: "hsl(var(--muted))"
        },
        accent: {
          primary: "hsl(var(--accent))",
          secondary: "hsl(var(--accent-2))",
          danger: "hsl(var(--danger))"
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
