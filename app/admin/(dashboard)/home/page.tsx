import Link from "next/link";
import { asc } from "drizzle-orm";
import { db } from "@/db";
import { heroButtons, services } from "@/db/schema";
import { getSiteSettings } from "@/lib/site-settings";
import { updateHomeSettings, createHeroButton, updateHeroButton, deleteHeroButton } from "@/lib/actions/home";
import DeleteButton from "@/components/admin/DeleteButton";
import HeroLinkPicker from "@/components/admin/HeroLinkPicker";
import OptionPicker from "@/components/admin/OptionPicker";
import NumberPicker from "@/components/admin/NumberPicker";
import ResizableTh from "@/components/admin/ResizableTh";
import HomeHeroForm from "@/components/admin/HomeHeroForm";
import SaveButton from "@/components/admin/SaveButton";
import { getPageAppearance, pageAppearanceVars } from "@/lib/page-appearance";

const STYLE_OPTIONS = [
  { label: "Primary", value: "primary" },
  { label: "Ghost", value: "ghost" },
];

export default async function AdminHomePage() {
  const [settings, buttons, serviceRows, appearance] = await Promise.all([
    getSiteSettings(),
    db.select().from(heroButtons).orderBy(asc(heroButtons.sortOrder)),
    db.select().from(services),
    getPageAppearance("home"),
  ]);

  return (
    <div>
      <div className="adm-title">Home</div>
      <p className="adm-sub">Manage the main website&apos;s Home page — background, hero text, and shortcut buttons.</p>

      <p className="adm-sub" style={{ marginTop: 0 }}>Hero Content</p>
      <HomeHeroForm action={updateHomeSettings} settings={settings} pageVars={pageAppearanceVars(appearance)} />

      <p className="adm-sub" style={{ marginTop: 48 }}>Hero Buttons</p>
      <table className="adm-table">
        <thead>
          <tr>
            <ResizableTh>Label / Link</ResizableTh>
            <ResizableTh>Style</ResizableTh>
            <ResizableTh>Order</ResizableTh>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {buttons.map((b) => {
            const updateWithId = updateHeroButton.bind(null, b.id);
            const formId = `hero-form-${b.id}`;
            return (
              <tr key={b.id}>
                <td>
                  <form id={formId} action={updateWithId}>
                    <HeroLinkPicker labelName="label" hrefName="href" defaultLabel={b.label} defaultHref={b.href} />
                  </form>
                </td>
                <td>
                  <OptionPicker name="style" options={STYLE_OPTIONS} defaultValue={b.style} formId={formId} />
                </td>
                <td>
                  <NumberPicker name="sortOrder" defaultValue={b.sortOrder} formId={formId} />
                </td>
                <td>
                  <div className="adm-actions">
                    <SaveButton formId={formId} style={{ padding: "8px 14px" }} />
                    <form action={deleteHeroButton}>
                      <input type="hidden" name="id" value={b.id} />
                      <DeleteButton confirmText={`Delete "${b.label}"?`} />
                    </form>
                  </div>
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
