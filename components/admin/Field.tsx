import { cloneElement, isValidElement } from "react";
import type { ReactElement, ReactNode } from "react";

// Shared label/help/error wrapper for a single plain form control (text
// input, textarea, select). Consolidates what every Admin create/edit form
// was already repeating: a `.adm-field` block with a `<label htmlFor>`, an
// optional `FieldStyleControls` slot next to it, an `.adm-hint`, and (new)
// a textual Required/Optional indicator plus correctly wired `id`/
// `aria-describedby`/`aria-invalid` on the control itself. No client-only
// APIs are used here, so this renders fine from both Server and Client
// Component forms (the Site Settings and Archive pages fetch data and
// render their forms server-side; the content-type forms are Client
// Components for their own live-preview state).
//
// Picker-style controls (YearPicker, DatePicker, OrderPicker, ColorPicker,
// NumberPicker) always carry a valid default and can't be left empty, so
// they intentionally keep their existing bare `.adm-field` markup instead
// of using this wrapper.
type ControlProps = {
  id?: string;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean;
};

export default function Field({
  id,
  label,
  required,
  hint,
  error,
  labelExtra,
  children,
}: {
  id: string;
  label: ReactNode;
  /** Whether the field must be filled in — shown as text, never a bare asterisk. */
  required: boolean;
  hint?: ReactNode;
  error?: string;
  /** e.g. FieldStyleControls, rendered next to the label. */
  labelExtra?: ReactNode;
  /** The single input/textarea/select this field labels. */
  children: ReactElement<ControlProps>;
}) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  const control = isValidElement<ControlProps>(children)
    ? cloneElement(children, {
        id,
        "aria-describedby": describedBy,
        "aria-invalid": error ? true : undefined,
      })
    : children;

  return (
    <div className="adm-field">
      <div className="adm-field-label-row">
        <label htmlFor={id}>
          {label}
          <span className={`adm-field-req${required ? "" : " optional"}`}>
            {required ? "Required" : "Optional"}
          </span>
        </label>
        {labelExtra}
      </div>
      {control}
      {hint && (
        <div className="adm-hint" id={hintId}>
          {hint}
        </div>
      )}
      {error && (
        <div className="adm-error" id={errorId} role="alert">
          {error}
        </div>
      )}
    </div>
  );
}
