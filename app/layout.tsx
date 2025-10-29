import { Inter, Fraunces } from "next/font/google";
import "./globals.css";
import type { Metadata } from "next";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-serif", weight: ["400", "500", "600", "700"] });

export const metadata: Metadata = {
  title: "NeuralDesk",
  description: "Convierte propósito en progreso con un copiloto que entiende tus proyectos"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${fraunces.variable} bg-radial-hero bg-surface-base text-foreground antialiased font-sans min-h-screen`}
      >
        {children}
      </body>
    </html>
  );
}
