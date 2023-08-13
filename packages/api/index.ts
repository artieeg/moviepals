import "@total-typescript/ts-reset";

import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";

import type { AppRouter } from "./src/router/root";

export { appRouter, type AppRouter } from "./src/router/root";
export { createTRPCContext } from "./src/trpc";

export * from "./src/services";

export * from "@moviepals/db";
export * from "@moviepals/dbmovieswipe";

/**
 * Inference helpers for input types
 * @example type HelloInput = RouterInputs['example']['hello']
 **/
export type RouterInputs = inferRouterInputs<AppRouter>;

/**
 * Inference helpers for output types
 * @example type HelloOutput = RouterOutputs['example']['hello']
 **/
export type RouterOutputs = inferRouterOutputs<AppRouter>;
