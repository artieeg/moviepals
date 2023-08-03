import axios from "axios";
import { z } from "zod";

const countryis = axios.create({
  baseURL: "https://country.is/",
});

const schema = z.object({
  country: z.string(),
  ip: z.string(),
});

export async function getCountryFromIP(ip: string) {
  const response = schema.parse(await countryis.get(ip));

  return response.country;
}
