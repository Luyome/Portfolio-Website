type PageHeaderProps = {
  /** Large watermark glyph in the top-right corner (Japanese pillar name). */
  watermark: string;
  eyebrow: string;
  title: string;
  subtitle: string;
};

/**
 * Shared `.ph` page header: watermark + eyebrow + title + subtitle, used
 * identically at the top of every top-level public listing page (About,
 * Worldbuilding, Games, 3D, Portfolio, Sketches, Archive). Heading level is
 * fixed at h1 — every current consumer uses it as that page's single primary
 * heading (none of these pages render an h1 of their own elsewhere).
 */
export default function PageHeader({ watermark, eyebrow, title, subtitle }: PageHeaderProps) {
  return (
    <div className="ph">
      <div className="ph-wm">{watermark}</div>
      <div className="ph-eyebrow">{eyebrow}</div>
      <h1 className="ph-title">{title}</h1>
      <p className="ph-sub">{subtitle}</p>
    </div>
  );
}
