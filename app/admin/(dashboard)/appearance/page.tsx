import { db } from "@/db";
import { pageAppearance } from "@/db/schema";
import { updatePageAppearance } from "@/lib/actions/appearance";
import { PAGE_KEYS, PAGE_LABELS } from "@/lib/page-appearance";
import PageAppearanceForm from "@/components/admin/PageAppearanceForm";
import AdminPageHeader from "@/components/admin/AdminPageHeader";

export default async function AdminAppearancePage() {
  const rows = await db.select().from(pageAppearance);
  const byPage = new Map(rows.map((r) => [r.page, r]));

  return (
    <div>
      <AdminPageHeader
        title="Appearance"
        description={`Override background, text, and accent colors per public page. Leave a swatch on "Default" to keep following the site's normal light/dark theme.`}
      />
      <div className="pa-list">
        {PAGE_KEYS.map((key) => (
          <PageAppearanceForm
            key={key}
            page={key}
            label={PAGE_LABELS[key]}
            current={byPage.get(key) ?? null}
            action={updatePageAppearance.bind(null, key)}
          />
        ))}
      </div>
    </div>
  );
}
