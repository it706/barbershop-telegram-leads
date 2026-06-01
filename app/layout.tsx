import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NordCut | Барбершоп в Москве",
  description: "Лендинг барбершопа с онлайн-заявкой и Telegram-уведомлениями.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
