import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#8B4513",
          light: "#C19A6B",
          dark: "#5C2E0A",
        },
        secondary: {
          DEFAULT: "#2F4F4F",
          light: "#527F7F",
          dark: "#1C3030",
        },
        accent: {
          orange: "#FF6F00",
          blue: "#0288D1",
          green: "#388E3C",
        },
        background: {
          DEFAULT: "#FFF8DC",
          paper: "#FFFAF0",
        },
        text: {
          primary: "#2C1810",
          secondary: "#5C4033",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Roboto",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
} satisfies Config;
