import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { DatabaseProvider } from "@/components/DatabaseProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Decision Memory",
  description: "A local-first decision journal to learn from your past thinking",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50 transition-colors`}
      >
        <ThemeProvider>
          <DatabaseProvider>
            {children}
          </DatabaseProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
