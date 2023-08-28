"use client";
import {motion} from "framer-motion";

export default function Home() {
  return (
    <div className="flex flex-col">
      <div className="absolute inset-0 flex items-center justify-center flex-col">
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
          whileTap={{ scale: 0.95 }}
          className="rounded-full bg-brand-1 px-10 py-2 mt-8 text-center text-base font-primary text-white cursor-pointer"
        >
          Get the app
        </motion.div>
      </div>
    </div>
  );
}
