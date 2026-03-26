import type { Metadata, Viewport } from "next";
import { Rubik } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const rubik = Rubik({
  variable: "--font-rubik",
  subsets: ["latin", "hebrew"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "DiraTrak - מעקב דירות",
  description: "מעקב אחרי דירות להשכרה",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "DiraTrak",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#2563eb",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl" className={`${rubik.variable} h-full antialiased`}>
      <head>
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.svg" />
      </head>
      <body className="min-h-full flex flex-col font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
