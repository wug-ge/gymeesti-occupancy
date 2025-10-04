<template>
  <UContainer>
    <UColorModeSwitch  class="absolute right-8 top-8" />
    <ClientOnly>
      <div class="grid grid-cols-6 gap-4 mt-16">
        <OccupancyLine
          v-for="club in clubs"
          :club="club"
          class="col-span-6 md:col-span-3 lg:col-span-2 size-full min-h-[300px]"
        />
      </div>
    </ClientOnly>
  </UContainer>
</template>

<script lang="ts" setup>
import type { Club } from '@gymeesti-occupancy/types';

const res = await fetch(`/api/occupancy`)
const clubs = await res.json() as Club[];

</script>