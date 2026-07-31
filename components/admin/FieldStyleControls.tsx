"use client";

import ColorPicker from "./ColorPicker";
import FontSizePicker from "./FontSizePicker";
import type { FieldStyle } from "@/db/schema";

export default function FieldStyleControls({
  fieldKey,
  current,
  formId,
  onStyleChange,
}: {
  fieldKey: string;
  current?: FieldStyle;
  formId?: string;
  onStyleChange?: (style: Partial<{ colorDark: string; colorLight: string; fontSize: string }>) => void;
}) {
  return (
    <div className="fsc">
      <div className="fsc-color-pair">
        <ColorPicker
          name={`sc_${fieldKey}_dark`}
          defaultValue={current?.color?.dark}
          formId={formId}
          themeHint="dark"
          onValueChange={(v) => onStyleChange?.({ colorDark: v })}
        />
        <ColorPicker
          name={`sc_${fieldKey}_light`}
          defaultValue={current?.color?.light}
          formId={formId}
          themeHint="light"
          onValueChange={(v) => onStyleChange?.({ colorLight: v })}
        />
      </div>
      <FontSizePicker
        name={`sf_${fieldKey}`}
        defaultValue={current?.fontSize}
        formId={formId}
        onValueChange={(v) => onStyleChange?.({ fontSize: v })}
      />
    </div>
  );
}
