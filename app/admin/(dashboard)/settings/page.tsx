import { getSiteSettings } from "@/lib/site-settings";
import { updateSiteSettings } from "@/lib/actions/settings";
import SaveButton from "@/components/admin/SaveButton";
import Field from "@/components/admin/Field";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminSection from "@/components/admin/AdminSection";

export default async function AdminSettingsPage() {
  const settings = await getSiteSettings();

  return (
    <div>
      <AdminPageHeader title="Site Settings" description="Nav bar brand, footer, and social links." />
      <form action={updateSiteSettings} className="adm-form">
        <AdminSection title="Identity" description="Shown in the nav bar and page metadata.">
          <div className="adm-form-row">
            <Field id="name" label="Name" required>
              <input name="name" defaultValue={settings.name} required />
            </Field>
            <Field id="handle" label="Handle" required>
              <input name="handle" defaultValue={settings.handle} required placeholder="/ TETSUNARU" />
            </Field>
          </div>
          <Field id="jpLabel" label="Japanese Label" required={false}>
            <input name="jpLabel" defaultValue={settings.jpLabel} />
          </Field>
        </AdminSection>

        <AdminSection title="Footer & Contact">
          <Field
            id="footerLine"
            label="Footer Line"
            required={false}
            hint="One line per row, e.g. Game Designer / Unreal Engine 5 / Istanbul, TR — 2026"
          >
            <textarea name="footerLine" defaultValue={settings.footerLine} />
          </Field>
          <Field id="contactEmail" label="Contact Email" required={false}>
            <input name="contactEmail" type="email" defaultValue={settings.contactEmail} />
          </Field>
        </AdminSection>

        <AdminSection title="Social Links">
          <div className="adm-form-row">
            <Field id="twitterUrl" label="Twitter / X URL" required={false}>
              <input name="twitterUrl" defaultValue={settings.twitterUrl} />
            </Field>
            <Field id="artstationUrl" label="ArtStation URL" required={false}>
              <input name="artstationUrl" defaultValue={settings.artstationUrl} />
            </Field>
          </div>
          <div className="adm-form-row">
            <Field id="linkedinUrl" label="LinkedIn URL" required={false}>
              <input name="linkedinUrl" defaultValue={settings.linkedinUrl} />
            </Field>
            <Field id="instagramUrl" label="Instagram URL" required={false}>
              <input name="instagramUrl" defaultValue={settings.instagramUrl} />
            </Field>
          </div>
          <Field id="githubUrl" label="GitHub URL" required={false}>
            <input name="githubUrl" defaultValue={settings.githubUrl} />
          </Field>
        </AdminSection>

        <SaveButton />
      </form>
    </div>
  );
}
