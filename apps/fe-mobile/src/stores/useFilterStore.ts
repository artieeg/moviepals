import AsyncStorage from "@react-native-async-storage/async-storage";
import { produce } from "immer";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { StreamingService } from "@moviepals/api";

export interface FilterStore {
  country: string;

  quickMatchMode: boolean;

  /** Contains a list of selected streaming services */
  streamingServices: StreamingService[];

  /** Contains a list of selected genres */
  genres: number[];

  /** Contains a list of selected cast members */
  cast: number[];

  toggleStreamingService: (service: StreamingService) => void;
  toggleGenre: (id: number) => void;
  toggleCast: (id: number) => void;
}

export const useFilterStore = create<FilterStore>()(
  persist(
    (set) => ({
      country: "US",
      quickMatchMode: true,
      streamingServices: [],
      genres: [],
      cast: [],
      toggleStreamingService: (service: StreamingService) => {
        set(
          produce<FilterStore>((state) => {
            const index = state.streamingServices.findIndex(
              (s) => s.provider_id === service.provider_id,
            );
            if (index === -1) {
              state.streamingServices.push(service);
            } else {
              state.streamingServices.splice(index, 1);
            }
          }),
        );
      },
      toggleGenre: (id: number) => {
        set(
          produce((state) => {
            const index = state.genres.indexOf(id);
            if (index === -1) {
              state.genres.push(id);
            } else {
              state.genres.splice(index, 1);
            }
          }),
        );
      },
      toggleCast: (id: number) => {
        set(
          produce((state) => {
            const index = state.cast.indexOf(id);
            if (index === -1) {
              state.cast.push(id);
            } else {
              state.cast.splice(index, 1);
            }
          }),
        );
      },
    }),
    {
      name: "filter-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
