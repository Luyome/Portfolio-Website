import Header from "@/components/Header";
import SiteFooter from "@/components/SiteFooter";
import { getSiteSettings } from "@/lib/site-settings";

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSiteSettings();

  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <Header settings={settings} />
      <main id="main-content" className="main" tabIndex={-1}>
        {children}
      </main>
      <SiteFooter settings={settings} />
    </>
  );
}
