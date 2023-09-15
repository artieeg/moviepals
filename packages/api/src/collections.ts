import { MovieBaseFilter } from "@moviepals/filters";

export type MovieCollection = {
  id: string;

  title: string;
  description: string;
  filters: MovieBaseFilter;

  image: string;

  free?: boolean;
};

export type MovieCollectionGroup = {
  id: string;
  title: string;
  description: string;
  collections: MovieCollection[];
};

export const collections: MovieCollectionGroup[] = [
  {
    id: "recommended",
    title: "Recommended",
    description: "These should bring a lot of fun to your movie night 🍿",
    collections: [
      {
        id: "best-of-all-time",
        title: "Best of All Time",
        image:
          "https://moviepals.io/images/collections/20th-century-horror.png",
        description: "Enjoy the classics!",
        free: true,

        filters: createFilters({
          order_by: "vote_average.desc",
          min_vote_count: 300,
        }),
      },
      {
        id: "fresh-flicks",
        title: "Fresh Flicks",
        image:
          "https://moviepals.io/images/collections/20th-century-horror.png",
        description: "Movies that came out this year",

        filters: createFilters({
          start_year: 2023,
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
        image:
          "https://moviepals.io/images/collections/tarantino.jpeg",
        title: "Quentin Tarantino",
        description: "Tune in to the mind-bending world of Tarantino",

        filters: createFilters({
          directors: [138],
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
        image:
          "https://moviepals.io/images/collections/20th-century-horror.png",
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
        image:
          "https://moviepals.io/images/collections/20th-century-horror.png",
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
