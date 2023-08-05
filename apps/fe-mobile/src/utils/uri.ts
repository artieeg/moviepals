import { env } from "./env";

export function getTMDBStaticUrl(item: string) {
  return env.TMDB_IMAGE_BASE + item;
}
