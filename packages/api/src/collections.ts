import { MovieBaseFilter } from "@moviepals/filters";

type MovieCollection = {
  id: string;

  title: string;
  description: string;
  filters: MovieBaseFilter;

  free?: boolean;
  recommended?: boolean;
};

type Group = {
  id: string;
  title: string;
  description: string;
  collections: MovieCollection[];
};

export const collections: Group[] = [
  {
    id: "new-releases",
    title: "New Releases",
    description: "Movies that came out this year",

    collections: [
      {
        id: "fresh-flicks",
        title: "Fresh Flicks",
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
