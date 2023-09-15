const nativewind = require("nativewind/tailwind/css");

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
        white: "#FFFFFF",

        //"neutral-1-6": "#10110E",
        //"neutral-1": "#20210E",
        //"neutral-1-3": "#16130c",
        //"white": "#F8F9F7",

        //"neutral-1": "#1E1E1C",
        //"white": "#fbfcfb",

        "neutral-2": "#717070",
        orange: "#F5F2EC",
        "neutral-2-10": "rgba(113, 100, 80, 0.10)", //"#71707B1A",
        "neutral-2-20": "rgba(113, 100, 80, 0.20)",
        "neutral-2-50": "rgba(113, 100, 80, 0.50)", //"#71707B1A",
        "neutral-3": "#D4D4D4",
        "neutral-4": "#C7C5AA",
        "neutral-5": "#9CA3AF",
        "red-1": "#FC7B71",
        "brand-1": "#EA7436",
        "brand-1-10": "rgba(234, 116, 54, 0.10)", //"#71707B1A",
        //"brand-1": "#6356E4",
      },
    },
  },
  plugins: [nativewind],
};
