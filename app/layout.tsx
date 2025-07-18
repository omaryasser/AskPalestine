import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Footer from "../components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AskPalestine - Truth through Knowledge",
  description: "An index of Palestine-related questions and answers by prominent pro-Palestinian figures. Get clarity and confidence to speak up for Palestinian rights.",
  keywords: "Palestine, Israel, Gaza, West Bank, Palestinian rights, Middle East, pro-Palestinian",
  openGraph: {
    title: "AskPalestine - Truth through Knowledge",
    description: "An index of Palestine-related questions and answers by prominent pro-Palestinian figures.",
    url: "https://askpalestine.com",
    siteName: "AskPalestine",
    images: [
      {
        url: "/favicon.png",
        width: 256,
        height: 256,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AskPalestine - Truth through Knowledge",
    description: "An index of Palestine-related questions and answers by prominent pro-Palestinian figures.",
    images: ["/favicon.png"],
    creator: "@askpalestine_qa",
  },
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
        style={{ backgroundColor: '#dfd5ca' }}
      >
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
