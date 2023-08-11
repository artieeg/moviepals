import React from "react";
import {
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { Cancel, IconoirProvider } from "iconoir-react-native";

export function Input({
  style,
  icon,
  showClearButton,
  ...rest
}: TextInputProps & { icon?: React.ReactNode; showClearButton?: boolean }) {
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
        className="font-primary-bold h-full flex-1 text-base text-neutral-1"
        placeholderTextColor="#71707B"
        {...rest}
      />
      {showClearButton && rest.value && (
        <Animated.View entering={FadeIn} exiting={FadeOut}>
          <TouchableOpacity
            onPress={() => rest.onChangeText?.("")}
            className="h-full items-center justify-center"
          >
            <Cancel width="24" height="24" color="#0E0C10" strokeWidth={2} />
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
}
