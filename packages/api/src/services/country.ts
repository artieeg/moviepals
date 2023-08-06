import countries from "world-countries";

export function isValidCountry(country: string) {
  return countries.some((c) => c.cca2 === country);
}
