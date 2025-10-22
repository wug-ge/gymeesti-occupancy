<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const items: NavigationMenuItem[] = [
  
  {
    label: 'Privacy Policy',
    to: 'https://wug.ge/privacy-policy',
    target: '_blank'
  },
]
</script>

<template>
  <UFooter>
    <template #left>
      <p class="text-muted text-sm">
        Made with ❤️ by <a  class="underline" href="https://wug.ge">Wugge</a>
      </p>
    </template>

    <UNavigationMenu :items="items" variant="link" />

    <template #right>
      <UButton
        icon="i-simple-icons-linkedin"
        color="neutral"
        variant="ghost"
        to="https://www.linkedin.com/in/daniel-wuggenig-9a1097123/"
        target="_blank"
        aria-label="LinkedIn"
      />
      <UButton
        icon="i-simple-icons-github"
        color="neutral"
        variant="ghost"
        to="https://github.com/wug-ge/gymeesti-occupancy"
        target="_blank"
        aria-label="GitHub"
      />
    </template>
  </UFooter>
</template>
