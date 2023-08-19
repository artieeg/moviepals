import { Text, View, ViewProps } from "react-native";
import { IconoirProvider } from "iconoir-react-native";

import { Button, ButtonProps } from "./Button";

export function Prompt({
  title,
  subtitle,
  buttons,
  icon,
  shouldFillIcon = false,
  ...rest
}: {
  title: string;
  icon: React.ReactNode;
  shouldFillIcon?: boolean;
  subtitle: string;
  buttons: ((ButtonProps & { title: string }) | undefined)[];
} & ViewProps) {
  return (
    <View className="flex-1" {...rest}>
      <View className="flex-1 items-center justify-center space-y-4">
        <View className="bg-brand-1-10 h-20 w-20 items-center justify-center rounded-2xl">
          <IconoirProvider
            iconProps={{
              color: "#6867AA",
              fill: shouldFillIcon ? "#6867AA" : "transparent",
              width: 32,
              height: 32,
            }}
          >
            {icon}
          </IconoirProvider>
        </View>

        <View className="items-center justify-center space-y-2">
          <Text className="font-primary-bold text-xl text-neutral-1">{title}</Text>
          <Text className="font-primary-regular text-neutral-2 text-center text-base">
            {subtitle}
          </Text>
        </View>
      </View>

      <View className="space-y-3">
        {buttons.filter(Boolean).map((button, i) => (
          <Button key={i} {...button}>
            {button.title}
          </Button>
        ))}
      </View>
    </View>
  );
}
