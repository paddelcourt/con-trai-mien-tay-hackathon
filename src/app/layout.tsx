import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Guess The Prompt',
  description: 'Can you reverse-engineer the question from the AI response?',
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
