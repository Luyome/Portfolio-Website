import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TETSUNARU — Ege Demir Ünal",
  description: "Game Designer & worldbuilder. Personal archive of games, 3D art, sketches and worldbuilding.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,900;1,400;1,700&family=Lora:ital,wght@0,400;0,500;1,400&family=Space+Mono:ital,wght@0,400;0,700;1,400&family=Noto+Serif+JP:wght@200;300&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
