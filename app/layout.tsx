import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

export const metadata: Metadata = {
  title: "Signal Guard AI — Trading Discipline Coach",
  description:
    "Your personal AI trading discipline system. AI-generated signals, risk calculations, and morning briefings — every trade requires your manual approval.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" className="dark">
        <body className="min-h-screen bg-[#0a0f1e] text-slate-200 antialiased">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
