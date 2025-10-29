// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Productivity App" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="
        text-zinc-100
        bg-[radial-gradient(circle_at_top,rgba(52,211,153,0.08),transparent_55%),
        radial-gradient(circle_at_bottom,rgba(96,165,250,0.08),transparent_55%)]
      ">
        {children}
      </body>
    </html>
  );
}
