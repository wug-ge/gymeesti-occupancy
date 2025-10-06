<template>
  <UContainer>
    <div class="absolute right-8 top-8 flex items-center">
      <UColorModeSwitch />
    </div>
    <ClientOnly>
      <div class="grid grid-cols-6 gap-4 mt-16">
        <div class="col-span-6">
          <USelect class="min-w-32 float-right" v-model="chosenDateRange" :items="dateRangeOptions" />          
        </div>

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

const dateRangeOptions = [
  { label: 'Last Day', value: 'last_day' },
  { label: 'Last Week', value: 'last_week' },
  { label: 'All time', value: 'all_time' },
]

const chosenDateRange = ref('last_week');

const { data: clubs } = await useFetch(`/api/occupancy`, {
  query: {
    range: chosenDateRange,
}});
</script>