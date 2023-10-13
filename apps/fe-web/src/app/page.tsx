"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

import { PlatformButtons } from "./PlatformButtons";

export default function Home() {
  const [android, setAndroid] = React.useState(false);

  const width = typeof window !== "undefined" ? window.innerWidth * 0.4 : 300;
  const height = width * 2.16;

  return (
    <div className="flex flex-col">
      <div className="h-[80%] flex items-center justify-center flex-col">
        <h1 className="font-primary text-neutral-1 dark:text-white mt-8 text-3xl">
          MoviePals
        </h1>
        <p className="font-secondary text-center text-neutral-2 dark:text-neutral-5 text-base mt-1">
          swipe and find a movie
          <br />
          to watch together
        </p>

        <div className="mt-4">
          <PlatformButtons />
        </div>

        {android && (
          <div className="space-y-3 px-8 mt-12">
            <p className="font-secondary text-center text-neutral-2 dark:text-neutral-5 text-base mt-1">
              Are you an Android user?
            </p>

            <p className="font-secondary text-center text-neutral-2 dark:text-neutral-5 text-base mt-1">
              We're still waiting for Google to approve open beta build for our
              app.
            </p>
            <p className="font-secondary text-center text-neutral-2 dark:text-neutral-5 text-base mt-1">
              Currently, you can either download an APK file or ask us to invite
              you to the closed beta.
            </p>

            <div className="flex flex-col mt-8 space-y-3">
              <Link
                className="font-secondary text-center text-brand-1 underline dark:text-neutral-5 text-base mt-1"
                href="mailto:hey@moviepals.io"
              >
                Email us to join closed beta
              </Link>

              <Link
                className="font-secondary text-center text-brand-1 underline dark:text-neutral-5 text-base mt-1"
                href="/moviepals.apk"
              >
                Download APK and install manually
              </Link>

              <Link
                className="font-secondary text-center text-brand-1 underline dark:text-neutral-5 text-base mt-1"
                href="https://testflight.apple.com/join/riAOMve5"
              >
                I'm on IOS, give me TestFlight link
              </Link>
            </div>
          </div>
        )}
      </div>

      <motion.div
        className="mt-16 pl-8 w-full flex space-x-3 overflow-x-scroll no-scrollbar"
        animate={{ opacity: 1 }}
        initial={{ opacity: 0 }}
        transition={{ delay: 0.5, duration: 0.4 }}
        style={{ height }}
      >
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
      </motion.div>

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
