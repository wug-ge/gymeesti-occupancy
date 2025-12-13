import posthog from 'posthog-js'

export default defineNuxtPlugin((nuxtApp) => {
  // 1) Init PostHog in a safe mode first (no cookies until consent)
  posthog.init(useRuntimeConfig().public.posthogPublicKey, {
    api_host: useRuntimeConfig().public.posthogHost,
    // recommended: keep pageview manual so you can gate it
    capture_pageview: false,
    // If you use PostHog cookieless mode, you can set it here (see PostHog docs/tutorial)
    // cookieless: 'on_reject',
  }) // :contentReference[oaicite:2]{index=2}

  const enable = () => {
    posthog.opt_in_capturing()
    posthog.capture('$pageview')
  }

  const disable = () => {
    posthog.opt_out_capturing()
  }

  const applyFromCookieScript = () => {
    // Wait for CookieScriptLoaded before using instance functions
    // currentState() gives { action: 'accept'|'reject', categories: [...] }
    // :contentReference[oaicite:3]{index=3}
    // @ts-expect-error CookieScript is global
    const state = window.CookieScript?.instance?.currentState?.()
    if (!state) return

    // Pick the category you map analytics to (commonly "performance")
    const analyticsAllowed =
      state.action === 'accept' && Array.isArray(state.categories) && state.categories.includes('performance')

    if (analyticsAllowed) enable()
    else disable()
  }

  // 2) Update PostHog when CookieScript is ready + whenever consent changes
  window.addEventListener('CookieScriptLoaded', applyFromCookieScript) // :contentReference[oaicite:4]{index=4}
  window.addEventListener('CookieScriptAcceptAll', enable) // :contentReference[oaicite:5]{index=5}
  window.addEventListener('CookieScriptReject', disable) // :contentReference[oaicite:6]{index=6}
  window.addEventListener('CookieScriptAccept', applyFromCookieScript) // e.detail.categories exists :contentReference[oaicite:7]{index=7}

  // Optional: if you only care about analytics category, this fires once per page when allowed:
  window.addEventListener('CookieScriptCategory-performance', enable) // :contentReference[oaicite:8]{index=8}

  // 3) Gate SPA pageviews
  nuxtApp.$router.afterEach(() => {
    if (posthog.has_opted_in_capturing?.()) posthog.capture('$pageview')
  }) // :contentReference[oaicite:9]{index=9}
})
