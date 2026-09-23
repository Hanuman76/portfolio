import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Devraj | 3D Interactive Portfolio & MCA Developer",
  description: "Modern Full-Stack 3D Interactive Developer Portfolio built with Next.js, Three.js, Framer Motion, and Tailwind CSS.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
