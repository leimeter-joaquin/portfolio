// https://nuxt.com/docs/api/configuration/nuxt-config

export default defineNuxtConfig({
  ssr: false,
  modules: [
    ["@storyblok/nuxt", { accessToken: process.env.STORYBLOK_TOKEN }],
    "@nuxtjs/tailwindcss",
  ],
  vite: {
    optimizeDeps: { exclude: ["fsevents"] },
  },
});
