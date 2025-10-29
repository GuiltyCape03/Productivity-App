import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";

const fontSans = Manrope({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "NeuralDesk",
  description: "Convierte propósito en progreso con un asistente inteligente de proyectos"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={`${fontSans.variable} font-sans min-h-screen bg-surface-base`}>{children}</body>
    </html>
  );
}
