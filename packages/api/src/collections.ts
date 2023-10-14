import { MovieBaseFilter } from "@moviepals/filters";

export type MovieCollection = {
  id: string;

  title: string;
  description: string;
  filters: MovieBaseFilter;

  image: string;

  newlyAdded?: boolean;
  free?: boolean;
};

export type MovieCollectionGroup = {
  id: string;
  title: string;
  description: string;
  collections: MovieCollection[];
  expandByDefault?: boolean;
};

export const collections: MovieCollectionGroup[] = [
  {
    id: "recommended",
    title: "Recommended",
    expandByDefault: true,
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
        newlyAdded: true,

        filters: createFilters({
          genres: [27],
          start_year: 1960,
          end_year: 1989,
        }),
      },
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
      "There are a lot, and we’re not even close to having everyone on this list! 😅 ",
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

        newlyAdded: true,

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

  {
    id: "actors",
    title: "Actors",
    description:
      "Actor collections are a great way to explore the work of your favorite actors.",
    collections: [
      {
      id: "christian_bale",
      image: "https://moviepals.io/images/collections/christian_bale.jpeg",
      title: "Christian Bale",
      description: "Explore the versatile performances of Christian Bale",
      filters: createFilters({
        cast: [3894]
      })
    },
    {
      id: "ryan_gosling",
      image: "https://moviepals.io/images/collections/ryan_goslin.jpeg",
      title: "Ryan Gosling",
      description: "Get charmed by Ryan Gosling's top roles",
      filters: createFilters({
        cast: [30614]
      })
    },
    {
      id: "johnny_depp",
      image: "https://moviepals.io/images/collections/johnny_depp.jpeg",
      title: "Johnny Depp",
      description: "Step into Johnny Depp's iconic characters",
      filters: createFilters({
        cast: [85]
      })
    },
    {
      id: "brad_pitt",
      image: "https://moviepals.io/images/collections/brad_pitt.jpeg",
      title: "Brad Pitt",
      description: "Experience the world of Brad Pitt's blockbusters",
      filters: createFilters({
        cast: [287]
      })
    },
    {
      id: "dicaprio",
      image: "https://moviepals.io/images/collections/dicaprio.jpeg",
      title: "Leonardo DiCaprio",
      description: "Join Leonardo DiCaprio on his cinematic journey",
      filters: createFilters({
        cast: [6193]
      })
    },
    {
      id: "clint_eastwood",
      image: "https://moviepals.io/images/collections/clint_eastwood.jpeg",
      title: "Clint Eastwood",
      description: "Explore the timeless legacy of Clint Eastwood",
      filters: createFilters({
        cast: [190]
      })
    },
    {
      id: "robin_williams",
      image: "https://moviepals.io/images/collections/robin_williams.jpeg",
      title: "Robin Williams",
      description: "Experience the magic of Robin Williams",
      filters: createFilters({
        cast: [2157]
      })
    },
    {
      id: "al_pacino",
      image: "https://moviepals.io/images/collections/al_pacino.jpeg",
      title: "Al Pacino",
      description: "Experience the classics with Al Pacino",
      filters: createFilters({
        cast: [1158]
      })
    },
    {
      id: "keanu_reeves",
      image: "https://moviepals.io/images/collections/keanu_reeves.jpeg",
      title: "Keanu Reeves",
      description: "Dive into the action-packed world of Keanu Reeves",
      filters: createFilters({
        cast: [6384]
      })
    },
    {
      id: "ryan_reynolds",
      image: "https://moviepals.io/images/collections/ryan_reynolds.jpeg",
      title: "Ryan Reynolds",
      description: "Enjoy the wit and humor of Ryan Reynolds",
      filters: createFilters({
        cast: [10859]
      })
    },
    {
      id: "anthony_hopkins",
      image: "https://moviepals.io/images/collections/anthony_hopkins.jpeg",
      title: "Anthony Hopkins",
      description: "Experience the excellence of Anthony Hopkins",
      filters: createFilters({
        cast: [4173]
      })
    },
    {
      id: "harrison_ford",
      image: "https://moviepals.io/images/collections/harrison_ford.jpeg",
      title: "Harrison Ford",
      description: "Embark on adventures with Harrison Ford",
      filters: createFilters({
        cast: [3]
      })
    },
    {
      id: "samual_l_jackson",
      image: "https://moviepals.io/images/collections/samual_l_jackson.jpeg",
      title: "Samuel L. Jackson",
      description: "Witness the impact of Samuel L. Jackson on screen",
      filters: createFilters({
        cast: [2231]
      })
    },
    {
      id: "tom_hanks",
      image: "https://moviepals.io/images/collections/tom_hanks.jpeg",
      title: "Tom Hanks",
      description: "Feel the warmth of Tom Hanks' heartfelt performances",
      filters: createFilters({
        cast: [31]
      })
    },
    {
      id: "morgan_freeman",
      image: "https://moviepals.io/images/collections/morgan_freeman.jpeg",
      title: "Morgan Freeman",
      description: "Listen to the captivating narration of Morgan Freeman",
      filters: createFilters({
        cast: [192]
      })
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
