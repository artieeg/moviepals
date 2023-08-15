import { Text } from "react-native";

import { TouchableScale } from "./TouchableScale";

export function UserAvatar({
  emoji,
}: {
  onChange?: () => void;
  emoji: string;
}) {
  return (
    <TouchableScale className="bg-neutral-2-10 h-16 w-16 items-center justify-center rounded-full">
      <Text className="text-3xl">{emoji}</Text>
    </TouchableScale>
  );
}
