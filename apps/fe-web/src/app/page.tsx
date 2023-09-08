import React from "react";

import { PlatformButtons } from "./PlatformButtons";

export default async function Home({ params }: { params: any }) {
  const invite_id = params.invite_id;

  return (
    <div className="flex flex-col">
      <div className="flex flex-col px-8">
        <h1 className="font-primary text-neutral-1 dark:text-white text-2xl">
          Join MoviePals 🍿
        </h1>

        <p className="font-secondary mt-2 text-neutral-2 dark:text-neutral-5 text-base">
          App for you and friends to discover a ton of movies to watch together!
        </p>

        <div className="mt-8">
          <PlatformButtons />
        </div>

        <div className="mt-8 space-y-2">
          <h3 className="font-secondary text-neutral-2 dark:text-white text-lg">
            Okay, but how does it work? 🤔
          </h3>

          <p className="font-secondary text-neutral-2 dark:text-neutral-5 text-base">
            Swipe on movies, view the matches later, that’s so simple
          </p>
        </div>

        <div className="mt-8 space-y-2">
          <h3 className="font-secondary text-neutral-2 dark:text-white text-lg">
            Yo, this is so cool,
            <br />
            anything else?
          </h3>

          <p className="font-secondary text-neutral-2 dark:text-neutral-5 text-base">
            Yes! Filter by cast, directors, genres, and streaming services, view
            matches for groups up to 6 people & more!
          </p>
        </div>

        <div className="mt-8 space-y-2">
          <h3 className="font-secondary text-neutral-2 dark:text-white text-lg">
            Yeah, count me in! 🤩
          </h3>

          <div className="space-y-1">
            <p className="font-secondary text-neutral-2 dark:text-neutral-5 text-base">
              Sweet! Just press the button and we'll do the rest! 🚀
            </p>
          </div>
        </div>
        <div className="mt-8">
          <PlatformButtons />
        </div>
      </div>

      <div className="flex flex-col space-y-3 my-16 items-center">
        <a
          href="mailto:hey@moviepals.io"
          className="text-neutral-2 underline dark:text-neutral-5"
        >
          Say Hi
        </a>

        <a
          href="/privacy"
          className="text-neutral-2 underline dark:text-neutral-5"
        >
          Privacy Policy
        </a>

        <a
          href="/terms"
          className="text-neutral-2 underline dark:text-neutral-5"
        >
          Terms of Service
        </a>
      </div>
    </div>
  );
}
