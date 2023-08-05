import React from "react";
import { TouchableOpacity } from "react-native";
import { Check } from "iconoir-react-native";
import { twMerge } from "tailwind-merge";

export function Checkbox({
  checked,
  onToggle,
}: {
  checked: boolean;
  onToggle: (enabled: boolean) => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => onToggle(!checked)}
      className={twMerge(
        "border-neutral-4 h-6 w-6 items-center justify-center rounded-lg border bg-white",
        checked ? "bg-brand-1 border-brand-1" : "border-neutral-4 bg-white",
      )}
    >
      {checked && (
        <Check strokeWidth={4} width="16" height="16" color="white" />
      )}
    </TouchableOpacity>
  );
}
