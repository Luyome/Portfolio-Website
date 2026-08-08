import type { ReactNode } from "react";

// Shared Admin form panel: a restrained bordered section (heading +
// optional description + body) used to group logically related fields
// inside a create/edit form — "Basic Information", "Media", "Display", etc.
// Deliberately plain (subtle background, thin border, no nesting/shadows)
// per the Admin panel language rules.
export default function AdminSection({
  title,
  description,
  className,
  children,
}: {
  title: string;
  description?: ReactNode;
  /** Editor forms use this to place real field groups in their settings rail. */
  className?: string;
  children: ReactNode;
}) {
  return (
    <section className={`adm-section ${className ?? ""}`}>
      <div className="adm-section-head">
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>
      <div className="adm-section-body">{children}</div>
    </section>
  );
}
