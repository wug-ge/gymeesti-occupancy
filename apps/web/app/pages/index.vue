<template>
  <JobAlert />
  <main>
    <section class="sr-only" aria-hidden="true">
      <h1>GymEesti Occupancy Tracker: Archive</h1>
      <p>An archive of gym occupancy levels across Estonia, including Tallinn, recorded while the GymEesti API was
        available. No longer updating: GymEesti retired the API this tracker was built on.</p>
      <h2>Gyms in the archive</h2>
      <ul>
        <li v-for="club in clubs">GymEesti {{ club.name }}</li>
      </ul>
    </section>
    <UContainer>
      <div class="absolute right-8 top-12 flex items-center">
        <UColorModeSwitch />
      </div>
      <ArchiveNotice :last-recorded-at="archive?.lastRecordedAt" />
      <ClientOnly>
        <div class="mt-8">
          <span class="opacity-70">{{ archiveRange }}</span>
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
// Windows count back from the last recorded point, not from today, so they keep
// framing the end of the archive rather than an empty stretch of the present.
const dateRangeOptions = [
  { label: 'Final day', value: 'last_day' },
  { label: 'Final week', value: 'last_week' },
  { label: 'Final 2 weeks', value: 'last_two_weeks' },
  { label: 'All time', value: 'all_time' },
]

const chosenDateRange = ref('last_week');

const { data: clubs } = await useFetch(`/api/occupancy`, {
  query: {
    range: chosenDateRange,
  }
});

const { data: archive } = await useFetch(`/api/occupancy/archive`);

const archiveRange = computed(() => {
  if (!archive.value?.firstRecordedAt || !archive.value?.lastRecordedAt) return '';
  return `Recorded ${formatArchiveDate(archive.value.firstRecordedAt)} – ${formatArchiveDate(archive.value.lastRecordedAt)}`;
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
</script>
