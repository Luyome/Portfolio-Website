"use client";

export default function DeleteButton({ confirmText = "Delete this item?" }: { confirmText?: string }) {
  return (
    <button
      type="submit"
      className="danger"
      onClick={(e) => {
        if (!window.confirm(confirmText)) e.preventDefault();
      }}
    >
      Delete
    </button>
  );
}
