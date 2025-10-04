// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

    app: {
    head: {
      title: 'GymEesti Occupancy Tracker — Live Gym Busyness in Estonia',
      meta: [
        { name: 'description', content: 'Check live GymEesti gym occupancy levels across Estonia. Avoid crowded gyms and plan your workout with real-time busyness data.' },
        { name: 'keywords', content: 'GymEesti, gym occupancy, Estonia gyms, gym tracker, Tallinn gyms, fitness tracker, real-time gym data' },
        { name: 'author', content: 'Wugge' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'theme-color', content: '#10B981' },

        // Open Graph (for social sharing)
        { property: 'og:title', content: 'GymEesti Occupancy Tracker' },
        { property: 'og:description', content: 'See how busy GymEesti gyms are in real time and plan your workouts smartly.' },
        { property: 'og:type', content: 'website' },
        { property: 'og:url', content: 'https://gymeesti-occupancy.wug.ge/' },
        { property: 'og:image', content: 'https://gymeesti-occupancy.wug.ge/og-image.png' },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
      ],
    },
  },

  modules: [
    '@nuxt/eslint',
    '@nuxt/image',
    '@nuxt/scripts',
    '@nuxt/test-utils',
    '@nuxt/ui'
  ],

  colorMode: {
    classSuffix: '',
    preference: 'system',
    fallback: 'light',
    storageKey: 'nuxt-color-mode',
  },

  css: ['~/assets/css/main.css'],

  build: {
    transpile: [
      /echarts/,
      "vue-echarts",
      "resize-detector", // needed for echarts, see https://github.com/nuxt/nuxt/issues/14553#issuecomment-1934042981,
      "tslib", // https://github.com/nuxt/nuxt/discussions/21533
    ],
  },

  icon: {
    localApiEndpoint: "/_nuxt_icon",
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