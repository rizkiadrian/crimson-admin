import type { Metadata } from "next";
import { SetupClient } from "@app/components/core/SetupClient";
import { GlobalNotification } from "@app/components/ui/GlobalNotification";
import { ConfirmDialog } from "@app/components/ui/ConfirmDialog";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Inter font
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter", // Ini nama variabel CSS yang akan dilempar ke globals.css
  display: "swap",
});

export const metadata: Metadata = {
  title: "Crimson Admin Panel",
  description:
    "Crimson Admin Panel is a modern admin dashboard built for efficient data management, analytics tracking, and business workflow automation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} h-full antialiased`}
    >
      <SetupClient />
      <body className="min-h-full flex flex-col">
        <GlobalNotification />
        <ConfirmDialog />
        {children}
      </body>
    </html>
  );
}
