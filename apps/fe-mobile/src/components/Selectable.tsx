import React from "react";
import { TouchableOpacity } from "react-native";
import { Check } from "iconoir-react-native";
import { twMerge } from "tailwind-merge";

export function Selectable({
  checked,
  onToggle,
  mode
}: {
  mode: "checkbox" | "radio",
  checked: boolean;
  onToggle: (enabled: boolean) => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => onToggle(!checked)}
      className={twMerge(
        "border-neutral-4 h-6 w-6 items-center justify-center border bg-white",
        mode === "checkbox" ? "rounded-lg" : "rounded-full",
        checked ? "bg-brand-1 border-brand-1" : "border-neutral-4 bg-white",
      )}
    >
      {checked && (
        <Check strokeWidth={4} width="16" height="16" color="white" />
      )}
    </TouchableOpacity>
  );
}
