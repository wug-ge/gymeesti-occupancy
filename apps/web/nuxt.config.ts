// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: [
    '@nuxt/eslint',
    '@nuxt/image',
    '@nuxt/scripts',
    '@nuxt/test-utils',
    '@nuxt/ui'
  ],

  css: ['~/assets/css/main.css'],

  build: {
    transpile: [
      /echarts/,
      "vue-echarts",
      "resize-detector", // needed for echarts, see https://github.com/nuxt/nuxt/issues/14553#issuecomment-1934042981
    ],
  },

  routeRules: {
    "/api/**": {
      proxy:
        process.env.NODE_ENV === "development"
          ? `http://localhost:3000/**`
          : `https://gymeesti-occupancy.wug.ge/api/**`,
    },
  }
})