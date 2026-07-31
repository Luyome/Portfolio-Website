import type { Metadata } from "next";
import ThemeToggle from "@/components/ThemeToggle";
import "./globals.css";

export const metadata: Metadata = {
  title: "TETSUNARU — Ege Demir Ünal",
  description: "Game Designer & worldbuilder. Personal archive of games, 3D art, sketches and worldbuilding.",
};

const THEME_INIT_SCRIPT = `
(function(){
  try {
    var t = localStorage.getItem('theme');
    if (t !== 'light' && t !== 'dark') t = 'dark';
    document.documentElement.setAttribute('data-theme', t);
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,900;1,400;1,700&family=Lora:ital,wght@0,400;0,500;1,400&family=Space+Mono:ital,wght@0,400;0,700;1,400&family=Noto+Serif+JP:wght@200;300&display=swap"
          rel="stylesheet"
        />
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body>
        <ThemeToggle />
        {children}
      </body>
    </html>
  );
}
