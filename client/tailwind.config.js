// /** @type {import('tailwindcss').Config} */
// export default {
//   content: [],
//   theme: {
//     extend: {},
//   },
//   plugins: [],
// }

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sora:  ["Sora", "sans-serif"],
        inter: ["Inter", "sans-serif"],
        mono:  ["JetBrains Mono", "monospace"],
      },
      colors: {
        bg:       "#09090F",
        surface:  "#111118",
        surface2: "#16161F",
        border:   "#1E1E2E",
        border2:  "#2A2A3E",
        accent:   "#7C3AED",
        accent2:  "#EC4899",
        muted:    "#6B7280",
      },
    },
  },
  plugins: [],
};