<template>
  <JobAlert />
  <main>
    <section class="sr-only" aria-hidden="true">
      <h1>GymEesti Occupancy Tracker</h1>
      <p>Live gym occupancy levels across Estonia, including Tallinn. Check how busy your gym is right now and find
        quieter times to train.</p>
      <h2>Supported gyms</h2>
      <ul>
        <li v-for="club in clubs">GymEesti {{ club.name }}</li>
      </ul>
    </section>
    <UContainer>
      <div class="absolute right-8 top-12 flex items-center">
        <UColorModeSwitch />
      </div>
      <ClientOnly>
        <div class="mt-16">
          <span class="opacity-70">Last refresh: {{ refreshDate.toLocaleTimeString() }}</span>
          <USelect class="min-w-32 float-right" v-model="chosenDateRange" :items="dateRangeOptions" />


          <div class="w-full my-2" v-for="(cityClubs, city) in clubsByCity">
            <div class="text-xl font-bold">{{ city }}</div>
            <div class="grid grid-cols-6 gap-4 ">
              <OccupancyLine v-for="cityClub in cityClubs" :club="cityClub"
                class="col-span-6 md:col-span-3 lg:col-span-2 size-full min-h-[300px]" />
            </div>
          </div>

        </div>
      </ClientOnly>
    </UContainer>
  </main>
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
  }
});

const clubsByCity = computed(() => {
  const grouped: Record<string, any[]> = {};
  (clubs.value || [])
    .filter((club) => {
      return (club.occupancies.find(clubOccupancy => clubOccupancy.count))
    })
    .forEach(club => {
      const city = club?.address?.city || 'Unknown';
      if (!grouped[city]) {
        grouped[city] = [];
      }
      grouped[city].push(club);
  });

  const ordered: Record<string, any[]> = {};
  Object.entries(grouped)
    .sort((a, b) => b[1].length - a[1].length) // sort by number of entries desc
    .forEach(([city, list]) => {
      ordered[city] = list;
    });

  return ordered;
});

const refreshDate = ref(new Date());
setInterval(async () => {
  await refresh();
  refreshDate.value = new Date();
}, 60000); // refresh every minute
</script>