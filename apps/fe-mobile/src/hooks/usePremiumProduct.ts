import Purchases from "react-native-purchases";
import { useQuery } from "@tanstack/react-query";

import { REVCAT_API_KEY } from "~/utils/consts";
import { env } from "~/utils/env";
import {api} from "~/utils/api";

export function usePremiumProduct() {
  const user = api.user.getMyData.useQuery();

  return useQuery(["premium-cost", user.data?.id], async () => {
    Purchases.configure({
      apiKey: REVCAT_API_KEY,
      appUserID: user.data?.id,
    });

    const products = await Purchases.getProducts([
      env.REVCAT_GO_PRO_PRODUCT_ID,
    ]);

    return {
      product: products[0]!,
      formattedPrice: `${getCurrencySymbol(
        products[0]!.currencyCode
      )}${products[0]!.price}`,
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
