import React from "react";
import {
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
} from "react-native";

import { Selectable } from "./Selectable";

export const ListItem = React.memo(_ListItem, (prev, next) => {
  if (prev.right === "checkbox" && next.right === "checkbox") {
    return prev.checked === next.checked;
  } else {
    return false;
  }
});

function _ListItem(
  props: TouchableOpacityProps & {
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
    ),
) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
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
          <View className="bg-neutral-2-10 h-16 w-16 items-center justify-center overflow-hidden rounded-full">
            {typeof props.icon === "string" ? (
              <Text className="text-3.5xl">{props.icon}</Text>
            ) : (
              props.icon
            )}
          </View>
        )}
        <View className="space-y-0.5 flex-1">
          <Text
            numberOfLines={props.subtitle ? 1 : undefined}
            ellipsizeMode="tail"
            className="font-primary-bold text-neutral-1 dark:text-white text-xl"
          >
            {props.title}
          </Text>

          {props.subtitle && (
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              className="font-primary-regular text-neutral-2 dark:text-neutral-5 flex-1 text-base"
            >
              {props.subtitle}
            </Text>
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
    </TouchableOpacity>
  );
}
