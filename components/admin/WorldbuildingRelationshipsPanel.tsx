"use client";

import { useActionState } from "react";
import OrderPicker from "./OrderPicker";
import DeleteButton from "./DeleteButton";
import FormError from "./FormError";
import SaveButton from "./SaveButton";
import AdminSection from "./AdminSection";
import { resolveEntityTypeLabel } from "@/types/worldbuilding";

type RelatedSummary = {
  relationshipId: number;
  relationshipType: string;
  sortOrder: number;
  direction: "outgoing" | "incoming";
  entity: { id: number; title: string; entityType: string | null; cat: string; excerpt: string; img: string | null };
};

type ActionState = { error?: string } | undefined;

export default function WorldbuildingRelationshipsPanel({
  entryId,
  relationships,
  otherEntries,
  createAction,
  deleteAction,
}: {
  entryId: number;
  relationships: RelatedSummary[];
  otherEntries: { id: number; title: string }[];
  createAction: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
  deleteAction: (formData: FormData) => void | Promise<void>;
}) {
  const [actionState, formAction] = useActionState(createAction, undefined);

  return (
    <AdminSection
      title="Relationships"
      description="Related Worldbuilding entries shown in the public detail view. A relationship can be created from either entry — both directions appear here."
    >
      {relationships.length > 0 ? (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Entry</th>
                <th className="adm-col-sm">Type</th>
                <th className="adm-col-md">Relation</th>
                <th className="adm-col-xs">Order</th>
                <th className="adm-col-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {relationships.map((r) => (
                <tr key={r.relationshipId}>
                  <td>{r.entity.title}</td>
                  <td>{resolveEntityTypeLabel(r.entity.entityType, r.entity.cat)}</td>
                  <td>{r.relationshipType} ({r.direction === "outgoing" ? "→" : "←"})</td>
                  <td>{r.sortOrder}</td>
                  <td>
                    <form action={deleteAction}>
                      <input type="hidden" name="id" value={r.relationshipId} />
                      <DeleteButton confirmText={`Remove the relationship to "${r.entity.title}"?`} />
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="adm-hint">No relationships yet. Add an entry below to create the first connection.</p>
      )}

      <h3 className="adm-subhead">Add Relationship</h3>
      <form action={formAction} className="adm-form">
        <FormError message={actionState?.error} />
        <input type="hidden" name="sourceEntryId" value={entryId} />
        <div className="adm-field">
          <label htmlFor="targetEntryId">Related Entry</label>
          <select id="targetEntryId" name="targetEntryId" required defaultValue="">
            <option value="" disabled>— choose an entry —</option>
            {otherEntries.map((e) => (
              <option key={e.id} value={e.id}>{e.title}</option>
            ))}
          </select>
          {otherEntries.length === 0 && (
            <div className="adm-hint">No other Worldbuilding entries exist yet to relate to.</div>
          )}
        </div>
        <div className="adm-field">
          <label htmlFor="relationshipType">Relationship Label</label>
          <input id="relationshipType" name="relationshipType" defaultValue="related" placeholder="ally, rival, located in, related…" maxLength={100} required />
        </div>
        <div className="adm-field">
          <label>Order</label>
          <OrderPicker name="sortOrder" defaultValue={relationships.length} />
        </div>
        <SaveButton>Add Relationship</SaveButton>
      </form>
    </AdminSection>
  );
}
