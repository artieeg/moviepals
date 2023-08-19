import { useEffect } from "react";
import { getTimeZone } from "react-native-localize";
import { useQuery } from "@tanstack/react-query";

import { api } from "~/utils/api";

export function useTimezone() {
  const setTimezone = api.user.setTimezoneOffset.useMutation();

  const timezone = useQuery(["timezone"], async () => {
    return getTimeZone();
  });

  useEffect(() => {
    if (timezone.isSuccess) {
      setTimezone.mutate({ timezone: timezone.data });
    }
  }, [timezone.isSuccess, timezone.data]);
}
