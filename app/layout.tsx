import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Script from "next/script";

import { Inter } from 'next/font/google';
import './globals.css';

// Khởi tạo font Inter với subset hỗ trợ tiếng Việt
const inter = Inter({ 
  subsets: ['latin', 'vietnamese'],
  variable: '--font-inter', // Khai báo biến CSS để dùng với Tailwind
  display: 'swap',
});

export const metadata = {
  title: 'Dev Pồ Mobile',
  description: 'Khảo sát nhận quà',
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
      </body>
    </html>
  );
}
