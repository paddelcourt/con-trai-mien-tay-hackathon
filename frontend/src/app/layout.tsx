import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Guess The Prompt",
  description: "Can you reverse-engineer the human mind? See an AI response, guess what question created it.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
        {children}
      </body>
    </html>
  );
}
