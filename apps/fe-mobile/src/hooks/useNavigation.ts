import { useNavigation as useNavigationInternal } from "@react-navigation/native";

export function useNavigation() {
  return useNavigationInternal() as {
    navigate: (screen: string, params?: any) => void;
    goBack: () => void;
    replace: (screen: string, params?: any) => void;
  };
}
