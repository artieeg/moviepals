import React from "react";
import {
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
} from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

import { Selectable } from "./Selectable";
import {TouchableScale} from "./TouchableScale";

export const ListItem = React.memo(_ListItem, (prev, next) => {
  if (prev.right === "checkbox" && next.right === "checkbox") {
    return prev.checked === next.checked;
  } else {
    return false;
  }
});

export type ListItemProps = TouchableOpacityProps & {
  itemId: any;
  title: string;
  subtitle?: string;
  icon?: string | React.ReactNode;
} & (
    | { right: undefined }
    | { right: "component"; rightComponent: React.ReactNode }
    | {
        right: "radio";
        checked: boolean;
        onToggle: (id: any, enabled: boolean) => void;
      }
    | {
        right: "checkbox";
        checked: boolean;
        onToggle: (id: any, enabled: boolean) => void;
      }
  );

function _ListItem(props: ListItemProps) {
  return (
    <TouchableScale
      //activeOpacity={0.8}
      onPress={() => {
        if (props.right === "checkbox" || props.right === "radio") {
          props.onToggle(props.itemId, !props.checked);
        }
      }}
      className="h-16 flex-row items-center justify-between"
      {...props}
    >
      <View className="flex-1 flex-row items-center space-x-3">
        {props.icon && (
          <Animated.View
            key={props.title}
            exiting={FadeOut.duration(400)}
            entering={FadeIn.duration(400)}
            className="bg-neutral-2-10 h-16 w-16 items-center justify-center overflow-hidden rounded-full">
            {typeof props.icon === "string" ? (
              <Text className="text-3.5xl">{props.icon}</Text>
            ) : (
              props.icon
            )}
          </Animated.View>
        )}
        <View className="space-y-0.5 flex-1">
          <Animated.Text
            key={props.title}
            numberOfLines={props.subtitle ? 1 : undefined}
            exiting={FadeOut.duration(400)}
            entering={FadeIn.duration(400)}
            ellipsizeMode="tail"
            className="font-primary-bold text-neutral-1 dark:text-white text-xl"
          >
            {props.title}
          </Animated.Text>

          {props.subtitle && (
            <Animated.Text
              key={props.subtitle}
              exiting={FadeOut.duration(400)}
              entering={FadeIn.duration(400)}
              numberOfLines={1}
              ellipsizeMode="tail"
              className="font-primary-regular text-neutral-2 dark:text-neutral-5 flex-1 text-base"
            >
              {props.subtitle}
            </Animated.Text>
          )}
        </View>
      </View>
      {props.right === "component" && (
        <View className="ml-2">{props.rightComponent}</View>
      )}
      {(props.right === "checkbox" || props.right === "radio") && (
        <View className="ml-2">
          <Selectable
            mode={props.right}
            checked={props.checked}
            onToggle={() => props.onToggle(props.itemId, !props.checked)}
          />
        </View>
      )}
    </TouchableScale>
  );
}
