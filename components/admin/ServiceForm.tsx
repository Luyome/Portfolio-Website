"use client";

import { useState } from "react";
import type { CSSProperties } from "react";
import PreviewToggle from "./PreviewToggle";
import ServicePreviewCard from "./ServicePreviewCard";
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
        <div className="adm-field">
          <label htmlFor="icon">Icon</label>
          <input id="icon" name="icon" defaultValue={item?.icon} required placeholder="◆" />
          <div className="adm-hint">A single character/symbol, e.g. ◆ ◈ ◬ ▶ △ ■</div>
        </div>
        <div className="adm-field">
          <label htmlFor="title">Title</label>
          <input id="title" name="title" defaultValue={item?.title} required />
        </div>
        <div className="adm-field">
          <label htmlFor="desc">Description</label>
          <textarea id="desc" name="desc" defaultValue={item?.desc} required />
        </div>
        <div className="adm-field">
          <label htmlFor="sortOrder">Sort Order</label>
          <input id="sortOrder" name="sortOrder" type="number" defaultValue={item?.sortOrder ?? 0} />
        </div>
        <button type="submit" className="adm-btn">Save</button>
      </form>
    </PreviewToggle>
  );
}
