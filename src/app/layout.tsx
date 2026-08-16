import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "Lyrics Bilingual",
  description: "영어 노래 가사와 한국어 번역을 나란히 보여주는 개인용 뷰어",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-neutral-50 dark:bg-neutral-950">
        {children}
        <footer className="py-6 text-center text-xs text-neutral-400 dark:text-neutral-600">
          Contact : beyourselv05@gmail.com
        </footer>
      </body>
    </html>
  );
}
