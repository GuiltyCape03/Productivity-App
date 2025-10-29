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
        serif: ["var(--font-serif)", ...defaultTheme.fontFamily.serif]
      },
      borderRadius: {
        xl: "var(--radius-base)",
        "2xl": `calc(var(--radius-base) + 6px)`,
        full: "999px"
      },
      boxShadow: {
        soft: "0 12px 40px -22px rgba(15, 23, 42, 0.6)",
        hard: "0 25px 55px -30px rgba(15, 23, 42, 0.65)"
      }
    }
  },
  plugins: []
};

export default config;
