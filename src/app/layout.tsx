import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import CursorAura from "@/components/CursorAura";
import AxiomBot from "@/components/AxiomBot";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Axiom | The AI Data Monopoly Platform",
  description: "High-value, domain-expert training datasets with perpetual royalties for contributors and flexible enterprise licensing.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <CursorAura />
        <AxiomBot />
        {children}
      </body>
    </html>
  );
}
