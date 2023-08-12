import React from "react";
import RNRestart from "react-native-restart";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import superjson from "superjson";

import { type AppRouter } from "@moviepals/api";

import { env } from "./env";

/**
 * A set of typesafe hooks for consuming your API.
 */
export const api = createTRPCReact<AppRouter>();
export { type RouterInputs, type RouterOutputs } from "@moviepals/api";

/**
 * Extend this function when going to production by
 * setting the baseUrl to your production API URL.
 */
const getBaseUrl = () => {
  return env.API_BASE;
};

let authToken: string | undefined = undefined;
export const AS_ACCESS_TOKEN_KEY = "@moviepals/access-token";

export async function setAuthToken(token: string) {
  await AsyncStorage.setItem(AS_ACCESS_TOKEN_KEY, token);

  authToken = token;
}

export async function loadAuthToken() {
  const token = await AsyncStorage.getItem(AS_ACCESS_TOKEN_KEY);

  if (!token) {
    return false;
  } else {
    authToken = token;

    return true;
  }
}

export async function signOut() {
  await AsyncStorage.removeItem(AS_ACCESS_TOKEN_KEY);
  authToken = undefined;

  RNRestart.restart();
}

/**
 * A wrapper for your app that provides the TRPC context.
 * Use only in _app.tsx
 */

export function TRPCProvider(props: { children: React.ReactNode }) {
  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: false,
          },
        },
      }),
  );
  const [trpcClient] = React.useState(() =>
    api.createClient({
      transformer: superjson,
      links: [
        httpBatchLink({
          url: `${getBaseUrl()}/trpc`,
          headers() {
            return authToken
              ? {
                  Authorization: `Bearer ${authToken}`,
                }
              : {};
          },
        }),
      ],
    }),
  );

  return (
    <api.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {props.children}
      </QueryClientProvider>
    </api.Provider>
  );
}
