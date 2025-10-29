import type { Metadata } from "next";
import { Inter, Noto_Color_Emoji } from "next/font/google";
import "./globals.css";
import dynamic from 'next/dynamic';

const DashboardProviderWrapper = dynamic(
  () => import('@/components/layout/DashboardProviderWrapper').then(mod => mod.DashboardProviderWrapper),
  { ssr: false }
);

const TabBar = dynamic(
  () => import('@/components/layout/TabBar').then(mod => mod.TabBar),
  { ssr: false }
);

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans"
});

const emoji = Noto_Color_Emoji({
  weight: "400",
  variable: "--font-emoji",
  preload: false // disable preload to avoid requiring subsets for the emoji font
});

export const metadata: Metadata = {
  title: "NeuralDesk",
  description: "Convierte propósito en progreso con un copiloto que entiende tus proyectos"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${inter.variable} ${emoji.variable} font-sans antialiased min-h-screen bg-transparent text-foreground`}>
        <DashboardProviderWrapper>
          <div className="relative min-h-screen">
            <div className="pointer-events-none absolute inset-0 -z-10 bg-radial-hero opacity-95" aria-hidden />
            <TabBar />
            <main className="pt-6 md:pt-10 lg:pt-12 pb-12 lg:pb-16">{children}</main>
          </div>
        </DashboardProviderWrapper>
      </body>
    </html>
  );
}
