"use client";

import { useState } from "react";
import type { CSSProperties } from "react";
import PreviewToggle from "./PreviewToggle";
import ServicePreviewCard from "./ServicePreviewCard";
import Field from "./Field";
import FormActions from "./FormActions";
import AdminSection from "./AdminSection";
import type { services } from "@/db/schema";

type ServiceRow = typeof services.$inferSelect;

export default function ServiceForm({
  action,
  item,
  pageVars = {},
}: {
  action: (formData: FormData) => void;
  item?: ServiceRow;
  pageVars?: CSSProperties;
}) {
  const [state, setState] = useState({
    icon: item?.icon ?? "",
    title: item?.title ?? "",
    desc: item?.desc ?? "",
  });

  function handleFormChange(e: React.ChangeEvent<HTMLFormElement>) {
    const target = e.target as unknown as HTMLInputElement | HTMLTextAreaElement;
    const { name, value } = target;
    if (name === "icon" || name === "title" || name === "desc") {
      setState((s) => ({ ...s, [name]: value }));
    }
  }

  return (
    <PreviewToggle renderPreview={() => <ServicePreviewCard state={state} pageVars={pageVars} />}>
      <form action={action} className="adm-form" onChange={handleFormChange}>
        <AdminSection title="Basic Information">
          <div className="adm-form-row">
            <Field id="icon" label="Icon" required hint="A single character/symbol, e.g. ◆ ◈ ◬ ▶ △ ■">
              <input name="icon" defaultValue={item?.icon} required placeholder="◆" />
            </Field>
            <Field id="title" label="Title" required>
              <input name="title" defaultValue={item?.title} required />
            </Field>
          </div>
          <Field id="desc" label="Description" required>
            <textarea name="desc" defaultValue={item?.desc} required />
          </Field>
          <Field id="sortOrder" label="Sort Order" required={false}>
            <input name="sortOrder" type="number" defaultValue={item?.sortOrder ?? 0} />
          </Field>
        </AdminSection>

        <FormActions cancelHref="/admin/services" />
      </form>
    </PreviewToggle>
  );
}
