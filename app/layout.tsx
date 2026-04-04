import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Vòng Quay May Mắn - iPhone Lock",
  description: "Tham gia khảo sát và quay thưởng để nhận ngay voucher giảm giá lên đến 500K cho iPhone Lock.",
  openGraph: {
    title: "Vòng Quay May Mắn - iPhone Lock",
    description: "Khảo sát nhanh - Nhận quà ngay. Voucher 200k-500k đang chờ bạn!",
    type: "website",
    locale: "vi_VN",
  },
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Script
          src="https://sp.zalo.me/plugins/sdk.js"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}
