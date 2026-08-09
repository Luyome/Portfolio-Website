"use client";

import { useActionState } from "react";
import FormError from "./FormError";
import SaveButton from "./SaveButton";
import type { HomeAdminActionState } from "@/lib/actions/home";

type Action = (state: HomeAdminActionState, formData: FormData) => Promise<HomeAdminActionState>;

// Deliberately not HomeCurationPanel: this setting has no "select N of M
// items" shape — Home always shows every pin on the chosen map's hierarchy
// automatically (see resolveHomeMapPreview, lib/home-data.ts), so the only
// real choices are which map and whether it's visible at all.
export default function HomeMapPreviewPanel({
  maps,
  defaultMapId,
  defaultVisible,
  action,
}: {
  maps: { id: number; title: string }[];
  defaultMapId: number | null;
  defaultVisible: boolean;
  action: Action;
}) {
  const [state, formAction] = useActionState(action, undefined);

  return (
    <section className="adm-home-panel" aria-labelledby="home-map-preview">
      <div className="adm-home-panel-head">
        <div>
          <h2 id="home-map-preview">KRUPNI Map Preview</h2>
          <p>Choose which map Home shows and whether it&apos;s visible. Every pin on that map appears automatically — nothing to curate here.</p>
        </div>
      </div>
      <form action={formAction} className="adm-home-form">
        <FormError message={state?.error} />
        {state?.success && <p className="adm-success" role="status">{state.success}</p>}
        <div className="adm-home-map-config">
          <label htmlFor="home-map">Preview map</label>
          <select id="home-map" name="mapId" defaultValue={defaultMapId ?? ""}>
            <option value="">No map selected</option>
            {maps.map((m) => (
              <option key={m.id} value={m.id}>{m.title}</option>
            ))}
          </select>
          <label className="adm-home-check">
            <input type="checkbox" name="isVisible" defaultChecked={defaultVisible} /> Visible on Home
          </label>
        </div>
        <SaveButton />
      </form>
    </section>
  );
}
