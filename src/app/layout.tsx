import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AgentDesk — Insurance Agent Platform",
  description: "Sell term, health, vehicle, travel and home insurance end to end.",
};

/**
 * Runs before first paint so the stored theme is on <html> already and there is
 * no flash of the wrong canvas. Kept in sync with THEME_KEY in
 * src/components/theme-toggle.tsx — that component is the only writer.
 */
const themeScript = `(function(){try{var s=localStorage.getItem("agentdesk-theme");var d=s?s==="dark":window.matchMedia("(prefers-color-scheme: dark)").matches;document.documentElement.classList.toggle("dark",d);}catch(e){}})();`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full font-sans">
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
