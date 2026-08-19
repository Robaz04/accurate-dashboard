import "./globals.css";

import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";

// Konfigurasi Font Sans
const fontSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700"],
});

// Konfigurasi Font Mono (Opsional)
const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900">{children}</body>
    </html>
  );
}
