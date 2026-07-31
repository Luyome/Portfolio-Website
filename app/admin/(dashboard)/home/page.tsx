import Link from "next/link";
import { asc } from "drizzle-orm";
import { db } from "@/db";
import { heroButtons, services } from "@/db/schema";
import { getSiteSettings } from "@/lib/site-settings";
import { updateHomeSettings, createHeroButton, updateHeroButton, deleteHeroButton } from "@/lib/actions/home";
import ImageUploadField from "@/components/admin/ImageUploadField";
import DeleteButton from "@/components/admin/DeleteButton";
import HeroLinkPicker from "@/components/admin/HeroLinkPicker";
import OptionPicker from "@/components/admin/OptionPicker";
import NumberPicker from "@/components/admin/NumberPicker";

const STYLE_OPTIONS = [
  { label: "Primary", value: "primary" },
  { label: "Ghost", value: "ghost" },
];

export default async function AdminHomePage() {
  const [settings, buttons, serviceRows] = await Promise.all([
    getSiteSettings(),
    db.select().from(heroButtons).orderBy(asc(heroButtons.sortOrder)),
    db.select().from(services),
  ]);

  return (
    <div>
      <div className="adm-title">Home</div>
      <p className="adm-sub">Manage the main website&apos;s Home page — background, hero text, and shortcut buttons.</p>

      <p className="adm-sub" style={{ marginTop: 0 }}>Hero Content</p>
      <form action={updateHomeSettings} className="adm-form">
        <div className="adm-field">
          <label htmlFor="heroEyebrow">Eyebrow</label>
          <input id="heroEyebrow" name="heroEyebrow" defaultValue={settings.heroEyebrow} placeholder="Istanbul, Turkey — 2026" />
        </div>
        <div className="adm-field">
          <label htmlFor="heroJpLine">Japanese Subtitle</label>
          <input id="heroJpLine" name="heroJpLine" defaultValue={settings.heroJpLine} />
        </div>
        <div className="adm-field">
          <label htmlFor="heroBio">Bio</label>
          <textarea id="heroBio" name="heroBio" defaultValue={settings.heroBio} style={{ minHeight: 110 }} />
          <div className="adm-hint">Wrap words in **double asterisks** to bold them, e.g. **The Abyss**.</div>
        </div>
        <ImageUploadField name="homeBgImage" initialUrl={settings.homeBgImage} label="Background Image" />
        <div className="adm-field">
          <label htmlFor="homeBgOpacity">Background Opacity ({settings.homeBgOpacity}%)</label>
          <input id="homeBgOpacity" name="homeBgOpacity" type="range" min={0} max={100} defaultValue={settings.homeBgOpacity} />
        </div>
        <button type="submit" className="adm-btn">Save</button>
      </form>

      <p className="adm-sub" style={{ marginTop: 48 }}>Hero Buttons</p>
      <table className="adm-table">
        <thead>
          <tr>
            <th>Label / Link</th>
            <th>Style</th>
            <th>Order</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {buttons.map((b) => {
            const updateWithId = updateHeroButton.bind(null, b.id);
            return (
              <tr key={b.id}>
                <td colSpan={4}>
                  <form action={updateWithId} style={{ display: "flex", gap: 10, alignItems: "flex-start", flexWrap: "wrap" }}>
                    <HeroLinkPicker labelName="label" hrefName="href" defaultLabel={b.label} defaultHref={b.href} />
                    <div style={{ width: 130 }}>
                      <OptionPicker name="style" options={STYLE_OPTIONS} defaultValue={b.style} />
                    </div>
                    <div style={{ width: 90 }}>
                      <NumberPicker name="sortOrder" defaultValue={b.sortOrder} />
                    </div>
                    <button type="submit" className="adm-btn" style={{ padding: "10px 16px" }}>Save</button>
                  </form>
                  <form action={deleteHeroButton} className="adm-actions" style={{ marginTop: 6 }}>
                    <input type="hidden" name="id" value={b.id} />
                    <DeleteButton confirmText={`Delete "${b.label}"?`} />
                  </form>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <p className="adm-sub" style={{ marginTop: 32 }}>Add Hero Button</p>
      <form action={createHeroButton} className="adm-form">
        <div className="adm-field">
          <label>Page</label>
          <HeroLinkPicker labelName="label" hrefName="href" />
        </div>
        <div className="adm-field">
          <label>Style</label>
          <OptionPicker name="style" options={STYLE_OPTIONS} defaultValue="primary" />
        </div>
        <div className="adm-field">
          <label>Sort Order</label>
          <NumberPicker name="sortOrder" defaultValue={buttons.length} />
        </div>
        <button type="submit" className="adm-btn">Add Button</button>
      </form>

      <p className="adm-sub" style={{ marginTop: 48 }}>Other Home Sections</p>
      <div className="adm-dash-cols" style={{ gridTemplateColumns: "1fr" }}>
        <Link href="/admin/services" className="adm-section-row" style={{ background: "var(--bg2)", border: "1px solid var(--border)", padding: "20px 22px" }}>
          <span>Services Cards</span>
          <span className="adm-section-count">{serviceRows.length}</span>
        </Link>
      </div>
    </div>
  );
}
