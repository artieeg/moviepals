"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

function iOS() {
  if (typeof navigator === "undefined") {
    return false;
  }

  return (
    [
      "iPad Simulator",
      "iPhone Simulator",
      "iPod Simulator",
      "iPad",
      "iPhone",
      "iPod",
    ].includes(navigator.platform) ||
    // iPad on iOS 13 detection
    (navigator.userAgent.includes("Mac") && "ontouchend" in document)
  );
}

export default function Support() {
  const [android, setAndroid] = React.useState(false);

  function onTextSupport() {
    if (iOS()) {
      window.location.href = "https://testflight.apple.com/join/riAOMve5";
    } else {
      setAndroid(true);
    }
  }

  const width = typeof window !== "undefined" ? window.innerWidth * 0.4 : 300;
  const height = width * 2.16;

  return (
    <div className="flex flex-col">
      <div className="h-[80%] flex items-center justify-center flex-col">
        <h1 className="font-primary text-neutral-1 dark:text-white mt-8 text-3xl">
          MoviePals
        </h1>
        <p className="font-secondary text-center text-neutral-2 dark:text-neutral-5 text-base mt-1">
          Do you need help?
          <br />
          Please send us an email at{" "}
          <Link
            className="font-secondary text-center text-brand-1 underline dark:text-neutral-5 text-base mt-1"
            href="mailto:hey@moviepals.io"
          >
            hey@moviepals.io
          </Link>
        </p>

        <motion.div
          onClick={onTextSupport}
          whileTap={{ scale: 0.95 }}
          className="rounded-full bg-brand-1 px-10 py-2 mt-8 text-center select-none text-base font-primary text-white cursor-pointer"
        >
          Contact Support
        </motion.div>
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
