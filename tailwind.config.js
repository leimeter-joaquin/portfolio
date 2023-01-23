/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./nuxt.config.{js,ts}",
    "./app.vue",
  ],
  theme: {
    extend: {
      fontFamily: {
        sofia: ["sofia", "ui-sans", "system-ui"],
        sans: ["ui-sans-serif", "system-ui"],
      },
    },
  },
  plugins: [],
};
