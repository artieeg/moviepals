import AsyncStorage from "@react-native-async-storage/async-storage";
import { produce } from "immer";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { Person, StreamingService } from "@moviepals/api";

export interface FilterStore {
  country: string;

  timeframeId?: string;
  startYear?: number;
  endYear?: number;

  quickMatchMode: boolean;

  /** Contains a list of selected streaming services */
  streamingServices: StreamingService[];

  /** Contains a list of selected genres */
  genres: number[];

  /** Contains a list of selected cast members */
  cast: Person[];

  /** Contains a list of selected directors */
  director?: Person;

  toggleDirector: (person: Person) => void;
  toggleStreamingService: (service: StreamingService) => void;
  toggleGenre: (id: number) => void;
  toggleCast: (person: Person) => void;

  reset(): void;
}

export const useFilterStore = create<FilterStore>()(
  persist(
    (set) => ({
      country: "US",
      quickMatchMode: true,
      streamingServices: [],
      genres: [],
      cast: [],
      reset() {
        set(
          produce<FilterStore>((state) => {
            state.streamingServices = [];
            state.genres = [];
            state.cast = [];
            state.director = undefined;
          }),
        );
      },
      toggleDirector(person) {
        set(
          produce<FilterStore>((state) => {
            if (state.director?.id === person.id) {
              state.director = undefined;
            } else {
              state.director = person;
            }
          }),
        );
      },
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
          produce<FilterStore>((state) => {
            const index = state.genres.indexOf(id);
            if (index === -1) {
              state.genres.push(id);
            } else {
              state.genres.splice(index, 1);
            }
          }),
        );
      },
      toggleCast: (person: Person) => {
        set(
          produce<FilterStore>((state) => {
            const index = state.cast.findIndex((c) => c.id === person.id);
            if (index === -1) {
              state.cast.push(person);
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
