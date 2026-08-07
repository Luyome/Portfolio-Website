import type { Metadata } from "next";
import ThemeToggle from "@/components/ThemeToggle";
import { getSiteSettings } from "@/lib/site-settings";
import { SITE_NAME, SITE_TITLE, SITE_DESCRIPTION, siteUrl, baseOpenGraph } from "@/lib/site-metadata";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: SITE_TITLE,
    template: `%s — ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  authors: [{ name: "Ege Demir Ünal" }],
  creator: "Ege Demir Ünal",
  openGraph: {
    ...baseOpenGraph,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: "/",
  },
  twitter: {
    card: "summary",
    creator: "@TetsuUnaru",
  },
};

const THEME_INIT_SCRIPT_NORMAL = `
(function(){
  try {
    var t = localStorage.getItem('theme');
    if (t !== 'light' && t !== 'dark') t = 'dark';
    document.documentElement.setAttribute('data-theme', t);
  } catch (e) {}
})();
`;

const THEME_INIT_SCRIPT_FORCED = `
(function(){
  try {
    document.documentElement.setAttribute('data-theme', 'dark');
  } catch (e) {}
})();
`;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getSiteSettings();
  const forceDarkMode = settings.forceDarkMode;

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700;800;900&family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,900;1,400;1,700&family=Lora:ital,wght@0,400;0,500;1,400&family=Space+Mono:ital,wght@0,400;0,700;1,400&family=Noto+Serif+JP:wght@200;300&family=Noto+Sans+JP:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
        <script dangerouslySetInnerHTML={{ __html: forceDarkMode ? THEME_INIT_SCRIPT_FORCED : THEME_INIT_SCRIPT_NORMAL }} />
      </head>
      <body>
        {!forceDarkMode && <ThemeToggle />}
        {children}
      </body>
    </html>
  );
}
