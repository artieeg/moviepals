"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Carousel } from "react-responsive-carousel";

import "react-responsive-carousel/lib/styles/carousel.min.css";

export default function Home() {
  function onGetApp() {}

  const width = typeof window !== undefined ? window.innerWidth * 0.4 : 300;
  const height = width * 2.16;

  return (
    <div className="flex flex-col">
      <div className="h-[80%] flex items-center justify-center flex-col">
        <div className="bg-brand-1-20 px-3 py-2 rounded-full">
          <p className="font-secondary text-center text-brand-1 text-base mt-1">
            Open beta
          </p>
        </div>
        <h1 className="font-primary text-neutral-1 dark:text-white mt-8 text-3xl">
          MoviePals
        </h1>
        <p className="font-secondary text-center text-neutral-2 dark:text-neutral-5 text-base mt-1">
          swipe and find a movie
          <br />
          to watch together
        </p>

        <motion.div
          onClick={onGetApp}
          whileTap={{ scale: 0.95 }}
          className="rounded-full bg-brand-1 px-10 py-2 mt-8 text-center select-none text-base font-primary text-white cursor-pointer"
        >
          Get the app
        </motion.div>
      </div>

      <div className="mt-16 pl-8 w-full flex space-x-3 overflow-x-scroll">
        {[1, 2, 3, 4, 5].map((i) => (
          <Image
            key={i}
            alt={`${i}`}
            src={`/${i}.png`}
            width={width}
            height={height}
            objectFit="contain"
            className="rounded-2xl"
          />
        ))}
      </div>

      <div className="flex flex-col space-y-3 mt-16 items-center">
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
