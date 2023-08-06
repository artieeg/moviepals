import React from "react";
import {
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
} from "react-native";

import { Checkbox } from "./Checkbox";

export const ListItem = React.memo(_ListItem, (prev, next) => {
  if (prev.checkbox && next.checkbox) {
    return prev.checked === next.checked;
  } else {
    return false;
  }
});

function _ListItem(
  props: TouchableOpacityProps & {
    itemId: any;
    title: string;
    icon: string | React.ReactNode;
  } & (
      | { checkbox: false }
      | {
          checkbox: true;
          checked: boolean;
          onToggle: (id: any, enabled: boolean) => void;
        }
    ),
) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => {
        if (props.checkbox === true) {
          props.onToggle(props.itemId, !props.checked);
        }
      }}
      className="flex-row items-center justify-between"
      {...props}
    >
      <View className="flex-1 flex-row items-center space-x-3">
        <View className="bg-neutral-2-10 h-16 w-16 items-center justify-center overflow-hidden rounded-full">
          {typeof props.icon === "string" ? (
            <Text className="text-3.5xl">{props.icon}</Text>
          ) : (
            props.icon
          )}
        </View>
        <Text
          numberOfLines={2}
          ellipsizeMode="tail"
          className="font-primary-bold text-neutral-1 flex-1 text-xl"
        >
          {props.title}
        </Text>
      </View>
      {props.checkbox && (
        <View className="ml-2">
          <Checkbox
            checked={props.checked}
            onToggle={() => props.onToggle(props.itemId, !props.checked)}
          />
        </View>
      )}
    </TouchableOpacity>
  );
}
