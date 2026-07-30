import Link from "next/link";
import { logoutAction } from "@/lib/actions/auth";

const LINKS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/portfolio", label: "Portfolio" },
  { href: "/admin/sketches", label: "Sketches" },
  { href: "/admin/worldbuilding", label: "Worldbuilding" },
  { href: "/admin/games", label: "Games" },
  { href: "/admin/services", label: "Services" },
  { href: "/admin/about", label: "About" },
  { href: "/admin/settings", label: "Settings" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="adm-wrap">
      <nav className="adm-nav">
        {LINKS.map((l) => (
          <Link key={l.href} href={l.href}>{l.label}</Link>
        ))}
        <form action={logoutAction}>
          <button type="submit">Log Out</button>
        </form>
      </nav>
      {children}
    </div>
  );
}
