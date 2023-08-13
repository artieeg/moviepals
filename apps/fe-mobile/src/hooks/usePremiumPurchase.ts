import Purchases from "react-native-purchases";
import { useQuery } from "@tanstack/react-query";

import { api } from "~/utils/api";

export function usePremiumPurchase() {
  const user = api.user.getUserData.useQuery();

  return useQuery(["premium-purchase"], async () => {
    Purchases.configure({
      appUserID: user.data?.id,
      apiKey: "",
    });
  });
}
