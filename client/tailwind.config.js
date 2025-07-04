/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{html,js,svelte,ts}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Nunito", "sans-serif"],
        silkscreen: ["Silkscreen", "monospace"],
      },
    },
  },
  plugins: [],
};
