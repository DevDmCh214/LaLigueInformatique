import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navbar: "#a8bcc8",
        primary: {
          50: "#f5f7f9",
          100: "#e8edf1",
          200: "#d1dbe3",
          300: "#a8bcc8",
          400: "#8ba5b5",
          500: "#6b8a9e",
          600: "#567286",
          700: "#475d6d",
          800: "#3d4f5c",
          900: "#36444f",
        },
      },
      fontFamily: {
        logo: ["Impact", "'Arial Black'", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
