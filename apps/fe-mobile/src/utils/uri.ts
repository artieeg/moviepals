import { env } from "./env";

export function getTMDBStaticUrl(item: string, size: "original" | "w45" = "original") {
  return env.TMDB_IMAGE_BASE + size + "/" + item;
}
