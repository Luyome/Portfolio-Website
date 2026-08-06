// Shared form-level error banner. Replaces the `{actionState?.error && <div
// className="adm-error">...}` line every `useActionState`-backed Admin form
// repeated identically, and adds the `role="alert"` none of them had so
// screen readers announce a failed save the same way everywhere.
export default function FormError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <div className="adm-error" role="alert">
      {message}
    </div>
  );
}
