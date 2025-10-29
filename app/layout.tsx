import type { Metadata } from "next";
import { Inter, Noto_Color_Emoji } from "next/font/google";
import { cn } from "@/styles/utils";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
// Noto Color Emoji only has weight 400
const emoji = Noto_Color_Emoji({ 
  subsets: ["emoji"],
  variable: "--font-emoji",
  weight: "400"  // Required even though it's the only option
});

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
          emoji.variable,
          "bg-surface-base text-foreground antialiased font-sans min-h-screen"
        )}
      >
        <div className="min-h-screen bg-radial-hero">
          {children}
        </div>
      </body>
    </html>
  );
}
