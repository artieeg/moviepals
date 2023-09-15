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
        image: "https://moviepals.io/images/collections/best-of-all-time.jpeg",
        description: "Enjoy the classics!",
        free: true,

        filters: createFilters({
          order_by: "vote_average.desc",
          min_vote_count: 300,
        }),
      },
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
        id: "fresh-flicks",
        title: "Fresh Flicks",
        image: "https://moviepals.io/images/collections/new-flicks.jpeg",
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
    description:
      "There are a lot, and we’re not even close to having everyone on it! 😅 ",
    collections: [
      {
        id: "tarantino",
        image: "https://moviepals.io/images/collections/tarantino.jpeg",
        title: "Tarantino's Thrills",
        description: "Tune in to the mind-bending world of Tarantino",

        filters: createFilters({
          directors: [138],
        }),
      },

      {
        id: "scorsese",
        image: "https://moviepals.io/images/collections/scorsese.jpeg",
        title: "Scorsese's Saga",
        description: "Martin's remarkable stories.",

        filters: createFilters({
          directors: [1032],
        }),
      },

      {
        id: "wes-anderson",
        image: "https://moviepals.io/images/collections/wes-anderson.jpeg",
        title: "Wes Anderson",
        description: "Wes's quirky tales.",

        filters: createFilters({
          directors: [5655],
        }),
      },

      {
        id: "lynch",
        image: "https://moviepals.io/images/collections/lynch.jpeg",
        title: "David Lynch",
        description: "David's surreal mysteries.",

        filters: createFilters({
          directors: [5602],
        }),
      },

      {
        id: "spielberg",
        image: "https://moviepals.io/images/collections/steven-spielberg.jpeg",
        title: "Steven Spielberg",
        description: "Steven's grand adventures.",

        filters: createFilters({
          directors: [488],
        }),
      },

      {
        id: "terrence-malick",
        image: "https://moviepals.io/images/collections/terrence-malick.jpeg",
        title: "Terrence Malick",
        description: "Terrence's visual verse.",

        filters: createFilters({
          directors: [30715],
        }),
      },
    ],
  },

  {
    id: "best-of-genre",
    title: "Genre's Best",
    description: "The best of the best in each genre.",
    collections: [
      {
        id: "adventure",
        image: "https://moviepals.io/images/collections/adventure.jpeg",
        title: "Adventure",
        description: "Thrilling expeditions and daring quests!",

        filters: createFilters({
          genres: [12],
        }),
      },
      {
        id: "crime",
        image: "https://moviepals.io/images/collections/crime.jpeg",
        title: "Crime",
        description: "Intriguing mysteries and thrilling heists",
        filters: createFilters({
          genres: [80],
        }),
      },
      {
        id: "documentary",
        image: "https://moviepals.io/images/collections/documentary.jpeg",
        title: "Documentary",
        description: "Fascinating stories from the real world",
        filters: createFilters({
          genres: [99],
        }),
      },

      {
        id: "fantasy",
        image: "https://moviepals.io/images/collections/fantasy.jpeg",
        title: "Fantasy",
        description: "Imaginative worlds and magical adventures",
        filters: createFilters({
          genres: [14],
        }),
      },

      {
        id: "horror",
        image: "https://moviepals.io/images/collections/horror.jpeg",
        title: "Horror",
        description: "Heart-pounding terror from the dark side",
        filters: createFilters({
          genres: [27],
        }),
      },

      {
        id: "romance",
        image: "https://moviepals.io/images/collections/romance.jpeg",
        title: "Romance",
        description: "Passionate affairs and tender romances",
        filters: createFilters({
          genres: [10749],
        }),
      },

      {
        id: "sci-fi",
        image: "https://moviepals.io/images/collections/science-fiction.jpeg",
        title: "Science Fiction",
        description: "Visions of tomorrow and beyond",
        filters: createFilters({
          genres: [878],
        }),
      },
    ],
  },
];

function createFilters(params: Partial<MovieBaseFilter>): MovieBaseFilter {
  return {
    genres: [],
    custom_filters: false,
    order_by: "vote_average.desc",
    min_vote_count: 300,
    collection_id: "best-of-all-time",
    directors: [],
    cast: [],
    ...params,
  };
}
