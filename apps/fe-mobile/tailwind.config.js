const nativewind = require("nativewind/tailwind/css")

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        //"primary-regular": "Montserrat-Regular",
        "primary-bold": "Montserrat-Bold",
        "primary-regular": "Poppins-Medium",
        //"primary-bold": "Nunito-Bold",
      },
      borderRadius: {
        "4xl": "32px",
      },
      fontSize: {
        "3.5xl": "32px",
      },
      colors: {
        "neutral-1": "#0E0C10",
        "neutral-2": "#71707B",
        "neutral-2-10": "rgba(113, 112, 123, 0.10)", //"#71707B1A",
        "neutral-2-50": "rgba(113, 112, 123, 0.50)", //"#71707B1A",
        "neutral-3": "#D4D4D4",
        "neutral-4": "#C7C5DA",
        "red-1": "#FC7B71",
        "brand-1": "#6867AA",
        "brand-1-10": "rgba(104, 103, 170, 0.10)", //"#71707B1A",
        //"brand-1": "#6356E4",
      },
    },
  },
  plugins: [nativewind],
};
