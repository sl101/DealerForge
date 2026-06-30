import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DealerForge",
  description: "Train Like a Pro Dealer",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-[#1a1a2e] text-[#e0f2fe]`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}