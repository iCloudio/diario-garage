import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DiarioGarage",
  description: "Gestione veicoli e scadenze essenziali.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it" className={`dark ${inter.variable}`}>
      <body
        className="min-h-screen bg-background text-foreground antialiased"
      >
        {children}
        <Toaster richColors />
      </body>
    </html>
  );
}
