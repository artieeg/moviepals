import AsyncStorage from "@react-native-async-storage/async-storage";
import { produce } from "immer";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { Person, StreamingService } from "@moviepals/api";
import { MovieBaseFilter } from "@moviepals/filters";

export type FilterStore = {
  country: string;

  timeframeId?: string;

  quickMatchMode: boolean;

  /** Contains a list of selected streaming services */
  streamingServices: StreamingService[];

  director?: Person;

  toggleDirector: (person: Person) => void;
  toggleStreamingService: (service: StreamingService) => void;
  toggleGenre: (id: number) => void;
  toggleCast: (person: Person) => void;

  reset(): void;
} & MovieBaseFilter;

export const useFilterStore = create<FilterStore>()(
  persist(
    (set) => ({
      country: "US",
      quickMatchMode: true,
      streamingServices: [],
      genres: [],
      directors: [],
      cast: [],
      reset() {
        set(
          produce<FilterStore>((state) => {
            state.streamingServices = [];
            state.genres = [];
            state.cast = [];
            state.directors = [];
          }),
        );
      },
      toggleDirector(person) {
        set(
          produce<FilterStore>((state) => {
            if (state.directors.includes(person.id)) {
              state.directors = [];
              state.director = undefined;
            } else {
              state.directors = [person.id];
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
            if (state.cast.includes(person.id)) {
              state.cast = state.cast.filter((id) => id !== person.id);
            } else {
              state.cast.push(person.id);
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
