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
      <Header settings={settings} />
      <div className="main">{children}</div>
      <SiteFooter settings={settings} />
    </>
  );
}
