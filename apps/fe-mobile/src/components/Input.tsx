import React from "react";
import { TextInput, TextInputProps, View } from "react-native";
import { IconoirProvider } from "iconoir-react-native";

export function Input({
  style,
  icon,
  ...rest
}: TextInputProps & { icon?: React.ReactNode }) {
  return (
    <View
      style={style}
      className="bg-neutral-2-10 h-12 flex-row space-x-2 rounded-full px-4"
    >
      {icon && (
        <View className="items-center justify-center ">
          <IconoirProvider
            iconProps={{
              width: 24,
              strokeWidth: 2.4,
              height: 24,
              color: "#71707B",
            }}
          >
            {icon}
          </IconoirProvider>
        </View>
      )}
      <TextInput
        className="font-primary-bold h-full flex-1 text-base "
        placeholderTextColor="#71707B"
        {...rest}
      />
    </View>
  );
}
