import React, {
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { TouchableOpacity, useWindowDimensions, View } from "react-native";
import WebView from "react-native-webview";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
} from "@gorhom/bottom-sheet";
import { Cancel } from "iconoir-react-native";

export type MovieDetailsBottomSheetRef = {
  open(url: string): void;
  close(): void;
};

export const MovieDetailsBottomSheet = React.forwardRef<
  MovieDetailsBottomSheetRef,
  {}
>((_, ref) => {
  const bottomSheetRef = useRef<BottomSheet>(null);

  const [url, setUrl] = useState<string | null>(null);

  useImperativeHandle(ref, () => ({
    open(url) {
      setUrl(url);
      bottomSheetRef.current?.expand();
    },
    close() {
      setUrl(null);
      bottomSheetRef.current?.close();
    },
  }));

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
      />
    ),
    [],
  );

  const { height } = useWindowDimensions();

  function onClose() {
    setUrl(null);
  }

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      enableContentPanningGesture={false}
      handleComponent={() => {
        return (
          <View className="h-12 rounded-t-lg p-4 flex-row items-center bg-white dark:bg-neutral-1 justify-end">
            <TouchableOpacity onPress={() => {
                bottomSheetRef.current?.close();
              }}>
              <Cancel />
            </TouchableOpacity>
          </View>
        );
      }}
      snapPoints={[height * 0.8]}
      onClose={onClose}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
    >
      {url && <WebView className="flex-1 bg-white dark:bg-neutral-1" source={{ uri: url }} />}
    </BottomSheet>
  );
});
