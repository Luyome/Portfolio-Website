import { getSiteSettings } from "@/lib/site-settings";
import { updateSiteSettings } from "@/lib/actions/settings";
import SaveButton from "@/components/admin/SaveButton";
import Field from "@/components/admin/Field";

export default async function AdminSettingsPage() {
  const settings = await getSiteSettings();

  return (
    <div>
      <div className="adm-title">Site Settings</div>
      <p className="adm-sub">Nav bar brand, footer, and social links.</p>
      <form action={updateSiteSettings} className="adm-form">
        <Field id="name" label="Name" required>
          <input name="name" defaultValue={settings.name} required />
        </Field>
        <Field id="handle" label="Handle" required>
          <input name="handle" defaultValue={settings.handle} required placeholder="/ TETSUNARU" />
        </Field>
        <Field id="jpLabel" label="Japanese Label" required={false}>
          <input name="jpLabel" defaultValue={settings.jpLabel} />
        </Field>
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
        <Field id="twitterUrl" label="Twitter / X URL" required={false}>
          <input name="twitterUrl" defaultValue={settings.twitterUrl} />
        </Field>
        <Field id="artstationUrl" label="ArtStation URL" required={false}>
          <input name="artstationUrl" defaultValue={settings.artstationUrl} />
        </Field>
        <Field id="linkedinUrl" label="LinkedIn URL" required={false}>
          <input name="linkedinUrl" defaultValue={settings.linkedinUrl} />
        </Field>
        <Field id="instagramUrl" label="Instagram URL" required={false}>
          <input name="instagramUrl" defaultValue={settings.instagramUrl} />
        </Field>
        <Field id="githubUrl" label="GitHub URL" required={false}>
          <input name="githubUrl" defaultValue={settings.githubUrl} />
        </Field>
        <SaveButton />
      </form>
    </div>
  );
}
