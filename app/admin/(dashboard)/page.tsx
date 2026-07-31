import Link from "next/link";
import { ADMIN_LINKS } from "@/lib/admin-nav";

const SECTIONS = ADMIN_LINKS.filter((l) => l.href !== "/admin");

export default function AdminDashboardPage() {
  return (
    <div>
      <div className="adm-title">Dashboard</div>
      <p className="adm-sub">Manage every section of the site from here. Changes go live immediately.</p>
      <div className="adm-dash-grid">
        {SECTIONS.map((s) => (
          <Link key={s.href} href={s.href} className="adm-dash-card">
            <div className="adm-dash-card-label">{s.label}</div>
            <div className="adm-dash-card-arrow">→</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
