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
 * fixed at h2 since every current consumer treats it as a section heading
 * under the page's own h1-less layout.
 */
export default function PageHeader({ watermark, eyebrow, title, subtitle }: PageHeaderProps) {
  return (
    <div className="ph">
      <div className="ph-wm">{watermark}</div>
      <div className="ph-eyebrow">{eyebrow}</div>
      <h2 className="ph-title">{title}</h2>
      <p className="ph-sub">{subtitle}</p>
    </div>
  );
}
