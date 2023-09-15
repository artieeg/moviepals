import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },

      colors: {
        "neutral-1": "#0E0C10",
        "neutral-2": "#71707B",
        "neutral-2-10": "rgba(113, 112, 123, 0.10)",
        "neutral-2-20": "rgba(113, 112, 123, 0.20)",
        "neutral-2-50": "rgba(113, 112, 123, 0.50)", 
        "neutral-3": "#D4D4D4",
        "neutral-4": "#C7C5DA",
        "neutral-5": "#9CA3AF",
        "red-1": "#FC7B71",
        "brand-1": "#6867AA",
        "brand-1-10": "rgba(104, 103, 170, 0.10)",
        "brand-1-20": "rgba(104, 103, 170, 0.20)", 
      },

      fontFamily: {
        primary: "var(--font-primary-bold)",
        secondary: "var(--font-secondary-medium)",
      },
    },
  },
  plugins: [],
};
export default config;
