import { z } from "zod";

const baseFilter = {
  start_year: z.number().min(1960).max(2023).optional(),
  end_year: z.number().min(1960).max(2023).optional(),
  genres: z.array(z.number()),
  cast: z.array(z.number()),
  directors: z.array(z.number()),
  region: z.string().optional(),
};

export const movieFeedFilter = z
  .object({
    watchProviderIds: z.array(z.number()),
    cursor: z.number().default(0),
    quick_match_mode: z.boolean().default(true),
  })
  .extend(baseFilter);

const baseFilterSchema = z.object(baseFilter);

export type MovieBaseFilter = z.infer<typeof baseFilterSchema>;

export type MovieFeedFilter = z.infer<typeof movieFeedFilter>;
