import { create } from "zustand";

import { RouterInputs } from "@moviepals/api";

type OnboardingStore = {
  name: string | null;
  method: RouterInputs["user"]["createNewAccount"]["method"] | null;
};

export const useOnboardingStore = create<OnboardingStore>()(() => ({
  name: null,
  method: null,
}));
