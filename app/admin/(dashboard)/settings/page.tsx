import { getSiteSettings } from "@/lib/site-settings";
import { updateSiteSettings } from "@/lib/actions/settings";
import SaveButton from "@/components/admin/SaveButton";

export default async function AdminSettingsPage() {
  const settings = await getSiteSettings();

  return (
    <div>
      <div className="adm-title">Site Settings</div>
      <p className="adm-sub">Sidebar brand, footer, and social links.</p>
      <form action={updateSiteSettings} className="adm-form">
        <div className="adm-field">
          <label htmlFor="name">Name</label>
          <input id="name" name="name" defaultValue={settings.name} required />
        </div>
        <div className="adm-field">
          <label htmlFor="handle">Handle</label>
          <input id="handle" name="handle" defaultValue={settings.handle} required placeholder="/ TETSUNARU" />
        </div>
        <div className="adm-field">
          <label htmlFor="jpLabel">Japanese Label</label>
          <input id="jpLabel" name="jpLabel" defaultValue={settings.jpLabel} />
        </div>
        <div className="adm-field">
          <label htmlFor="footerLine">Footer Line</label>
          <textarea id="footerLine" name="footerLine" defaultValue={settings.footerLine} />
          <div className="adm-hint">One line per row, e.g. Game Designer / Unreal Engine 5 / Istanbul, TR — 2026</div>
        </div>
        <div className="adm-field">
          <label htmlFor="contactEmail">Contact Email</label>
          <input id="contactEmail" name="contactEmail" type="email" defaultValue={settings.contactEmail} />
        </div>
        <div className="adm-field">
          <label htmlFor="twitterUrl">Twitter / X URL</label>
          <input id="twitterUrl" name="twitterUrl" defaultValue={settings.twitterUrl} />
        </div>
        <div className="adm-field">
          <label htmlFor="artstationUrl">ArtStation URL</label>
          <input id="artstationUrl" name="artstationUrl" defaultValue={settings.artstationUrl} />
        </div>
        <div className="adm-field">
          <label htmlFor="linkedinUrl">LinkedIn URL</label>
          <input id="linkedinUrl" name="linkedinUrl" defaultValue={settings.linkedinUrl} />
        </div>
        <div className="adm-field">
          <label htmlFor="instagramUrl">Instagram URL</label>
          <input id="instagramUrl" name="instagramUrl" defaultValue={settings.instagramUrl} />
        </div>
        <SaveButton />
      </form>
    </div>
  );
}
