import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Atlas | Business Platform",
  description: "AI-native business management platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body>{children}</body>
    </html>
  );
}
