import type { Metadata } from "next";
import { Inter, Noto_Color_Emoji } from "next/font/google";
import "./globals.css";
import dynamic from "next/dynamic";
import { ThemeProvider } from "@/components/theme/ThemeProvider";

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
      <body
        className={`${inter.variable} ${emoji.variable} font-sans antialiased min-h-screen bg-[hsl(var(--bg))] text-[hsl(var(--text))]`}
      >
        <ThemeProvider>
          <DashboardProviderWrapper>
            <div className="relative min-h-screen">
              <div
                className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(1200px_600px_at_80%_-20%,rgba(56,189,248,0.15),transparent)]"
                aria-hidden
              />
              <TabBar />
              <main className="pb-14 pt-8 md:pb-16 md:pt-12 lg:pb-20 lg:pt-16">{children}</main>
            </div>
          </DashboardProviderWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}
