import React, {
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { useWindowDimensions } from "react-native";
import WebView from "react-native-webview";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
} from "@gorhom/bottom-sheet";

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
      bottomSheetRef.current?.collapse();
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
      snapPoints={[height * 0.8]}
      onClose={onClose}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
    >
      {url && <WebView className="flex-1" source={{ uri: url }} />}
    </BottomSheet>
  );
});
