import type React from "react";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kefford Consulting",
  description: "Kefford Consulting",
  generator: "Kefford Consulting",
  keywords: ["Kefford Consulting", "Software Development", "Consulting"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
