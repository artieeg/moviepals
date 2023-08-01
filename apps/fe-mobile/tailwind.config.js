/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        "primary-regular": "Nunito-Regular",
        "primary-bold": "Nunito-Bold",
      },
      colors: {
        "neutral-1": "#0E0C10",
        "neutral-2": "#71707B",
        "neutral-3": "#D4D4D4",
        "red-1": "#FC7B71",
        "brand-1": "#6356E4",
      },
    },
  },
  plugins: [],
};
