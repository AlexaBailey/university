/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        yellow: { primary: "#F7D308" },
        black: { primary: "#111827" },
        white: { primary: "#FFFFFF" },
        gray: { light: "#F3F4F6", dark: "#4B5563" },
      },
    },
  },
  plugins: [],
};
