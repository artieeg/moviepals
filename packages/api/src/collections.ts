import { MovieBaseFilter } from "@moviepals/filters";

export type MovieCollection = {
  id: string;

  title: string;
  description: string;
  filters: MovieBaseFilter;

  image: string;

  free?: boolean;
  recommended?: boolean;
};

export type MovieCollectionGroup = {
  id: string;
  title: string;
  description: string;
  collections: MovieCollection[];
};

export const collections: MovieCollectionGroup[] = [
  {
    id: "new-releases",
    title: "New Releases",
    description: "Movies that came out this year",

    collections: [
      {
        id: "fresh-flicks",
        title: "Fresh Flicks",
        image: "blob:https://clipdrop.co/3439052f-fca9-4a71-af7f-4aa1e05214b3",
        description: "Movies that came out this year",

        filters: createFilters({
          start_year: 2023,
        }),
      },
    ],
  },
  {
    id: "best-of-genre",
    title: "Best of Genre",
    description: "Movies that came out this year",
    collections: [
      {
        id: "old-school-scary",
        image: "blob:https://clipdrop.co/3439052f-fca9-4a71-af7f-4aa1e05214b3",
        title: "Old School Scary",
        description: "Horror classics from the 60s, 70s, and 80s",

        filters: createFilters({
          genres: [27],
          start_year: 1960,
          end_year: 1989,
        }),
      },
      {
        id: "offbeat-80ies",
        image: "blob:https://clipdrop.co/3439052f-fca9-4a71-af7f-4aa1e05214b3",
        title: "Offbeat 80ies",
        description: "Movies to have a good laugh to",

        filters: createFilters({
          genres: [35],
          start_year: 1980,
          end_year: 1989,
        }),
      },
    ],
  },

  //World's best directors
  {
    id: "worlds-best-directors",
    title: "World's Best Directors",
    description: "Movies that came out this year",
    collections: [
      {
        id: "tarantino",
        image: "https://moviepals.io/images/collections/20th-century-horror.png",
        title: "Offbeat 80ies",
        description: "Movies to have a good laugh to",

        filters: createFilters({
          genres: [35],
          start_year: 1980,
          end_year: 1989,
        }),
      },
    ],
  },
];

function createFilters(params: Partial<MovieBaseFilter>): MovieBaseFilter {
  return {
    genres: [],
    directors: [],
    cast: [],
    ...params,
  };
}
