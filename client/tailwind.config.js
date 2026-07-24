/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sora:  ["Sora", "sans-serif"],
        inter: ["Inter", "sans-serif"],
      },
      colors: {
        bg:       "#080C18",
        surface:  "#0F1628",
        surface2: "#141B2D",
        border:   "#1E2A45",
        accent:   "#5B6EF5",
        accent2:  "#8B5CF6",
        muted:    "#6B7A99",
      },
    },
  },
  plugins: [],
};