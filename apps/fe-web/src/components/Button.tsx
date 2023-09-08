"use client";

import { motion } from "framer-motion";
import { twJoin, twMerge } from "tailwind-merge";

export function Button({
  onPress,
  outline,
  className,
  children,
}: {
  onPress: () => void;
  outline?: boolean;
  children: React.ReactNode[] | React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      onClick={onPress}
      whileTap={{ scale: 0.95 }}
      className={twMerge(
        "rounded-full bg-brand-1 px-10 py-2 text-center select-none text-base font-primary text-white cursor-pointer",
        outline ? "border border-brand-1 bg-transparent text-brand-1" : "",
        className,
      )}
    >
      {children}
    </motion.div>
  );
}
