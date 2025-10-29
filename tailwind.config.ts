import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./modules/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          base: "var(--surface-base)",
          elevated: "var(--surface-elevated)",
          muted: "var(--surface-muted)"
        },
        accent: {
          primary: "var(--accent-primary)",
          secondary: "var(--accent-secondary)",
          danger: "var(--accent-danger)"
        }
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular"]
      },
      borderRadius: {
        glass: "calc(var(--radius-base) + 6px)"
      },
      boxShadow: {
        floating: "0 20px 45px -25px rgba(0,0,0,0.55)"
      }
    }
  },
  plugins: []
};

export default config;
