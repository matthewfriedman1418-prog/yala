import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Yala — Desert Luxury Social Casino",
  description: "The premier desert luxury sweepstakes social casino. Play Gold Coins and Sweep Coins games. No purchase necessary. 18+ only. Void where prohibited.",
  keywords: ["social casino", "sweepstakes", "gold coins", "sweep coins", "desert luxury"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-full flex flex-col antialiased" style={{ backgroundColor: '#050505', color: '#F5E8C8' }}>
        {children}
      </body>
    </html>
  );
}
