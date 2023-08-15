import {useRoute} from "@react-navigation/native";

export function useRouteParams<T = Record<string, unknown>>() {
  const route = useRoute()
  
  return route.params as T;
}
