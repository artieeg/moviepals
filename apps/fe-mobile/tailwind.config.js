/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        "primary-regular": "Nunito-Regular",
        "primary-bold": "Nunito-Bold",
      },
      fontSize: {
        "3.5xl": "32px",
      },
      colors: {
        "neutral-1": "#0E0C10",
        "neutral-2": "#71707B",
        "neutral-2-10": "rgba(113, 112, 123, 0.10)", //"#71707B1A",
        "neutral-3": "#D4D4D4",
        "neutral-4": "#C7C5DA",
        "red-1": "#FC7B71",
        "brand-1": "#6356E4",
      },
    },
  },
  plugins: [],
};
