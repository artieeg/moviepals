import Purchases from "react-native-purchases";
import { useQuery } from "@tanstack/react-query";

import { REVCAT_API_KEY } from "~/utils/consts";
import {api} from "~/utils/api";

export function usePremiumProduct() {
  const user = api.user.getMyData.useQuery();

  return useQuery(["premium-cost", user.data?.id], async () => {
    Purchases.configure({
      apiKey: REVCAT_API_KEY,
      appUserID: user.data?.id,
    });

    const offerings = await Purchases.getOfferings()
    const premium = offerings.all.go_pro_offering.lifetime?.product;

    return {
      product: premium!,
      formattedPrice: `${getCurrencySymbol(
        premium!.currencyCode
      )}${premium!.price}`,
    };
  });
}

export function getCurrencySymbol(currency: string) {
  if (currency === "USD") {
    return "$";
  } else if (currency === "EUR") {
    return "€";
  } else if (currency === "GBP") {
    return "£";
  } else {
    return currency;
  }
}
