"use client";

import OptionPicker from "./OptionPicker";

const FONT_SIZE_OPTIONS = [
  { label: "Default", value: "" },
  { label: "Small", value: "0.85rem" },
  { label: "Normal", value: "1rem" },
  { label: "Medium", value: "1.15rem" },
  { label: "Large", value: "1.4rem" },
  { label: "XL", value: "1.8rem" },
];

export default function FontSizePicker({
  name,
  defaultValue,
  formId,
  onValueChange,
}: {
  name: string;
  defaultValue?: string;
  formId?: string;
  onValueChange?: (value: string) => void;
}) {
  return (
    <OptionPicker
      name={name}
      options={FONT_SIZE_OPTIONS}
      defaultValue={defaultValue ?? ""}
      formId={formId}
      onValueChange={onValueChange}
    />
  );
}
