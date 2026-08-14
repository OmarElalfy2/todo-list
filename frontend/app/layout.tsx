import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TodoList",
  description:
    "A full-stack todo management application",
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