import pino from "pino";

import { env } from "./utils/env";

export const logger = pino({
  transport:
    env.NODE_ENV === "production"
      ? {
          target: "@axiomhq/pino",
          options: {
            dataset: env.AXIOM_DATASET,
            token: env.AXIOM_TOKEN,
          },
        }
      : {
          target: "pino-pretty",
        },
});
