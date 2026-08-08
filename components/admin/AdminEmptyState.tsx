import Link from "next/link";

type AdminEmptyStateProps = {
  label: string;
  createHref?: string;
  createLabel?: string;
};

/**
 * Shared empty-state message for Admin list pages when a content type has
 * zero records — previously every Admin list rendered a table with only a
 * header row and no explanation (Task 2.5 finding, addressed in Task 2.8).
 * Reuses the public `.empty-state`/`.empty-state-desc` classes from
 * `components/EmptyState.tsx` so it matches the existing Admin/public design
 * system instead of introducing new styling.
 */
export default function AdminEmptyState({ label, createHref, createLabel }: AdminEmptyStateProps) {
  return (
    <div className="empty-state adm-empty-state" role="status">
      <span className="adm-empty-state-mark" aria-hidden="true">+</span>
      <p className="empty-state-title">{label}</p>
      {createHref && (
        <p className="empty-state-desc">
          <Link href={createHref} className="adm-btn">{createLabel ?? "+ Create the first one"}</Link>
        </p>
      )}
    </div>
  );
}
