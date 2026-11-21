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
  title: "Учебный центр «Академия Будущего» | Курсы математики, английского языка и IT",
  description:
    "Лицензированный учебный центр подготовки школьников и студентов. Курсы математики, английского и программирования в группах до 12 человек. Бесплатный пробный урок и диагностика знаний.",
  keywords: [
    "учебный центр",
    "курсы математики",
    "курсы английского",
    "курсы информатики",
    "подготовка к ЕГЭ",
    "подготовка к ОГЭ",
    "IELTS",
    "программирование для детей",
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ru"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased scroll-smooth`}
    >
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 selection:bg-blue-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}
