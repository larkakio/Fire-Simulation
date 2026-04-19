import type { Metadata, Viewport } from "next";
import { Orbitron, DM_Sans } from "next/font/google";
import "./globals.css";
import { Web3Providers } from "@/components/Web3Providers";
import { WalletBar } from "@/components/WalletBar";

const orbitron = Orbitron({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const dmSans = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const baseAppId = process.env.NEXT_PUBLIC_BASE_APP_ID ?? "fire-simulation-app";

export const metadata: Metadata = {
  title: "Fire Simulation",
  description:
    "Neon tactical fire simulation — swipe coolant, save the core, check in on Base.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${orbitron.variable} ${dmSans.variable} h-full antialiased`}
    >
      <head>
        <meta name="base:app_id" content={baseAppId} />
      </head>
      <body className="font-sans min-h-full bg-[#030008] text-zinc-100">
        <Web3Providers>
          <div className="cyber-bg pointer-events-none fixed inset-0 z-0" />
          <div className="scanlines pointer-events-none fixed inset-0 z-[1] opacity-[0.045]" />
          <div className="relative z-10 flex min-h-full flex-col">
            <WalletBar />
            <main className="flex flex-1 flex-col">{children}</main>
          </div>
        </Web3Providers>
      </body>
    </html>
  );
}
