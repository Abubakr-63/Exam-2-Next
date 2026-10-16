import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ReduxProvider } from "@/store/provider";
import { Navbar } from "@/components/navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Plane — Управление проектами и задачами",
  description:
    "Современная система управления проектами и задачами (Plane / Jira UI) на Next.js и RTK Query.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="ru"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#111113] text-zinc-100 selection:bg-blue-600 selection:text-white">
        <ReduxProvider>
          <Navbar />
          <main className="flex-1 w-full">{children}</main>
        </ReduxProvider>
      </body>
    </html>
  );
}
