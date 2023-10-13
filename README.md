# MoviePals 🍿🤩
Swipe on movies together and find a bunch of stuff to watch! 

## Download
[App Store](https://apps.apple.com/us/app/moviepals-watch-together/id6461212763)

[Google Play](https://play.google.com/store/apps/details?id=io.moviepals)

## Structure

| directory | description |
| --- | --- |
| [apps/fe-mobile](https://github.com/artieeg/moviepals/tree/main/apps/fe-mobile) | React Native App |
| [apps/fe-web](https://github.com/artieeg/moviepals/tree/main/apps/fe-web) | Landing & Invites NextJS App |
| [apps/fe-be](https://github.com/artieeg/moviepals/tree/main/apps/be) | NodeJS BE powered by Fastify |
| [packages/api](https://github.com/artieeg/moviepals/tree/main/packages/api) | BE implementation |
| [packages/app-db](https://github.com/artieeg/moviepals/tree/main/packages/app-db) | PosgreSQL DB using Kysely + Prisma |
| [packages/movie-swipe-db](https://github.com/artieeg/moviepals/tree/main/packages/movie-swipe-db) | MongoDB that stores swipes and stores some TMDB Api |
| [packages/movie-filters](https://github.com/artieeg/moviepals/tree/main/packages/movie-filters) | Define movie filters, used by both BE and FE |

https://github.com/artieeg/moviepals/assets/60566430/72d9dd25-6d35-49c6-bd07-b6690636f8e9

## Running the project

1. Setup .env file based on .env.example
You'll at least need to provide your [themoviedb.org](https://themoviedb.org/) api token

2. Install dependencies
```
yarn install
```

3. Install Pods
```
cd apps/fe-mobile && npx pod-install
```

4. Spin-up PostgreSQL, Redis and MongoDB instances using Docker Compose:
```
docker compose up -d
```

5. Run the project
```
yarn dev
```
or `yarn fe:dev`, `yarn be:dev`, `yarn db:dev`
