import type { Metadata } from "next";
import { Inter_Tight, Noto_Color_Emoji } from "next/font/google";
import { cn } from "@/styles/utils";
import "./globals.css";
import { TabBar } from "@/components/layout/TabBar";

const inter = Inter_Tight({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
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
          emoji.variable,
          "font-sans antialiased min-h-screen bg-transparent text-foreground"
        )}
      >
        <div className="relative min-h-screen">
          <div className="pointer-events-none absolute inset-0 -z-10 bg-radial-hero opacity-95" aria-hidden />
          <TabBar />
          <main className="pt-6 md:pt-10 lg:pt-12 pb-12 lg:pb-16">{children}</main>
        </div>
      </body>
    </html>
  );
}
