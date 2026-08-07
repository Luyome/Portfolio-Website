import type { ReactNode } from "react";

// Shared Admin page header: title + optional description on the left,
// optional primary action(s) on the right, wrapping cleanly on narrow
// widths. Replaces the repeated bare `.adm-title`/`.adm-sub` pairing (plus,
// on list pages, a standalone action link/button below it) with one
// consistent, semantic (`<h1>`) header used across every major Admin page.
export default function AdminPageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <header className="adm-page-header">
      <div className="adm-page-header-text">
        <h1 className="adm-title">{title}</h1>
        {description && <p className="adm-sub">{description}</p>}
      </div>
      {action && <div className="adm-page-header-actions">{action}</div>}
    </header>
  );
}
