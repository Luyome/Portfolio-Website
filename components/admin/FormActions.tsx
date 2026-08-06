import Link from "next/link";
import type { ReactNode } from "react";
import SaveButton from "./SaveButton";

// Shared Save + Cancel action row for Admin create/edit forms. `SaveButton`
// itself is unchanged (still owns pending/double-submit behaviour); this
// only adds the missing, consistent "back to list" control next to it.
export default function FormActions({
  children,
  cancelHref,
  cancelLabel = "Cancel",
}: {
  /** Defaults to a plain <SaveButton /> — pass one with custom label text where needed. */
  children?: ReactNode;
  cancelHref?: string;
  cancelLabel?: string;
}) {
  return (
    <div className="adm-form-actions">
      {children ?? <SaveButton />}
      {cancelHref && (
        <Link href={cancelHref} className="adm-form-cancel">
          {cancelLabel}
        </Link>
      )}
    </div>
  );
}
