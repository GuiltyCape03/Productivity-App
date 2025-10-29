import type { Metadata } from "next";
import { Inter, Manrope, Noto_Color_Emoji } from "next/font/google";

import { AppFrame } from "@/components/layout/AppFrame";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { cn } from "@/styles/utils";

import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const manrope = Manrope({ subsets: ["latin"], variable: "--font-display", display: "swap" });
const emoji = Noto_Color_Emoji({ subsets: ["emoji"], variable: "--font-emoji" });

export const metadata: Metadata = {
  title: "NeuralDesk",
  description: "Convierte propósito en progreso con un copiloto que entiende tus proyectos"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={cn(
          inter.variable,
          manrope.variable,
          emoji.variable,
          "font-sans antialiased min-h-screen bg-transparent text-foreground"
        )}
      >
        <ThemeProvider>
          <AppFrame>{children}</AppFrame>
        </ThemeProvider>
      </body>
    </html>
  );
}
