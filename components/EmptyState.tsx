type EmptyStateProps = {
  title: string;
  description?: string;
};

/**
 * Shared `.empty-state` message: replaces the ad hoc empty-result divs
 * previously duplicated (with drifting padding/typography) across Archive
 * and Worldbuilding, and fills the same gap in Portfolio, Sketches, and 3D,
 * which filtered content down to zero with no message at all. `role="status"`
 * announces the change to assistive tech when a filter/search empties an
 * already-visible list, without pulling focus away from the control that
 * caused it.
 */
export default function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="empty-state" role="status">
      <p className="empty-state-title">{title}</p>
      {description && <p className="empty-state-desc">{description}</p>}
    </div>
  );
}
