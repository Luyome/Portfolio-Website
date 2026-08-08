export type AdminNavItem = { href: string; label: string };
export type AdminNavSection = { section: string | null; items: AdminNavItem[] };

export const ADMIN_NAV: AdminNavSection[] = [
  { section: null, items: [{ href: "/admin", label: "Dashboard" }] },
  {
    section: "Content",
    items: [
      { href: "/admin/home", label: "Home" },
      { href: "/admin/portfolio", label: "Portfolio" },
      { href: "/admin/sketches", label: "Sketches" },
      { href: "/admin/3d", label: "3D" },
      { href: "/admin/worldbuilding", label: "Worldbuilding" },
      { href: "/admin/games", label: "Games" },
      { href: "/admin/services", label: "Services" },
    ],
  },
  {
    section: "Archive",
    items: [
      { href: "/admin/archive", label: "Archive" },
      { href: "/admin/metadata", label: "Metadata" },
      { href: "/admin/link-labels", label: "Link Labels" },
    ],
  },
  {
    section: "Appearance",
    items: [{ href: "/admin/appearance", label: "Appearance" }],
  },
  {
    section: "Site",
    items: [
      { href: "/admin/about", label: "About" },
      { href: "/admin/cv", label: "CV" },
    ],
  },
  {
    section: "Settings",
    items: [{ href: "/admin/settings", label: "Settings" }],
  },
];
