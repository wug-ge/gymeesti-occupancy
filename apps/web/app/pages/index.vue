<template>
  <JobAlert />
  <UContainer>
    <div class="absolute right-8 top-12 flex items-center">
      <UColorModeSwitch />
    </div>
    <ClientOnly>
      <div class="grid grid-cols-6 gap-4 mt-16">
        <div class="col-span-6">
          <span class="opacity-70">Last refresh: {{ refreshDate.toLocaleTimeString() }}</span>
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
  <FooterBar />
</template>

<script lang="ts" setup>
const dateRangeOptions = [
  { label: 'Last Day', value: 'last_day' },
  { label: 'Last Week', value: 'last_week' },
  { label: 'Last 2 Weeks', value: 'last_two_weeks' },
  { label: 'All time', value: 'all_time' },
]

const chosenDateRange = ref('last_week');

const { data: clubs, refresh } = await useFetch(`/api/occupancy`, {
  query: {
    range: chosenDateRange,
}});

const refreshDate = ref(new Date());
setInterval(async () => {
  await refresh();
  refreshDate.value = new Date();
}, 60000); // refresh every minute
</script>