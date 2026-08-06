"use client";

import { useState } from "react";
import FileUploadField from "./FileUploadField";
import OrderPicker from "./OrderPicker";
import SaveButton from "./SaveButton";

export default function AddLinkForm({
  action,
  defaultSortOrder,
}: {
  action: (formData: FormData) => void | Promise<void>;
  defaultSortOrder: number;
}) {
  const [kind, setKind] = useState<"link" | "download">("link");

  return (
    <form action={action} className="adm-form">
      <div className="adm-field">
        <label>Type</label>
        <div className="adm-kind-toggle">
          <button type="button" className={kind === "link" ? "on" : ""} onClick={() => setKind("link")}>Link</button>
          <button type="button" className={kind === "download" ? "on" : ""} onClick={() => setKind("download")}>Download</button>
        </div>
        <input type="hidden" name="kind" value={kind} />
      </div>
      <div className="adm-field">
        <label htmlFor="link-label">Label</label>
        <input id="link-label" name="label" placeholder="Steam / Trailer / Download" required />
      </div>
      {kind === "link" ? (
        <div className="adm-field">
          <label htmlFor="link-href">URL</label>
          <input id="link-href" name="href" type="text" placeholder="https://..." required />
        </div>
      ) : (
        <FileUploadField name="href" label="File" hideUrlInput category="gameBuild" />
      )}
      <div className="adm-field">
        <label>Order</label>
        <OrderPicker name="sortOrder" defaultValue={Math.min(defaultSortOrder + 1, 10)} />
      </div>
      <SaveButton>Add Link</SaveButton>
    </form>
  );
}
