import Sidebar from "@/components/Sidebar";
import { getSiteSettings } from "@/lib/site-settings";

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSiteSettings();

  return (
    <>
      <Sidebar settings={settings} />
      <div className="main">{children}</div>
    </>
  );
}
