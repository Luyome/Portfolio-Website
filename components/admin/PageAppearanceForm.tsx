import ColorPicker from "./ColorPicker";
import SaveButton from "./SaveButton";
import type { PageAppearanceRow, PageKey } from "@/lib/page-appearance";
import type { PageColorKey } from "@/db/schema";

const ROLES: { key: PageColorKey; label: string }[] = [
  { key: "bg", label: "Background" },
  { key: "bg2", label: "Card Background" },
  { key: "bg3", label: "Surface Background" },
  { key: "text", label: "Text" },
  { key: "text2", label: "Secondary Text" },
  { key: "accent", label: "Accent" },
];

export default function PageAppearanceForm({
  page,
  label,
  current,
  action,
}: {
  page: PageKey;
  label: string;
  current: PageAppearanceRow | null;
  action: (formData: FormData) => void;
}) {
  return (
    <div className="pa-card" data-page={page}>
      <div className="pa-card-title">{label}</div>
      <form action={action} className="pa-grid">
        {ROLES.map((role) => (
          <div className="pa-field" key={role.key}>
            <span>{role.label}</span>
            <div className="fsc-color-pair">
              <ColorPicker
                name={`${role.key}_dark`}
                defaultValue={current?.colors[role.key]?.dark}
                themeHint="dark"
              />
              <ColorPicker
                name={`${role.key}_light`}
                defaultValue={current?.colors[role.key]?.light}
                themeHint="light"
              />
            </div>
          </div>
        ))}
        <SaveButton className="adm-btn pa-save" />
      </form>
    </div>
  );
}
