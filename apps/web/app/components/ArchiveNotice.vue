<script setup lang="ts">
const props = defineProps<{
  lastRecordedAt?: string | null
}>()

const endedOn = computed(() => props.lastRecordedAt ? formatArchiveDate(props.lastRecordedAt) : null)
</script>

<template>
  <UAlert
    class="mt-12"
    color="warning"
    variant="subtle"
    icon="i-lucide-archive"
    title="This project is no longer updating"
  >
    <template #description>
      <div class="space-y-2">
        <p>
          GymEesti launched a new app and retired the API this tracker read from, so no new
          occupancy data is coming in. I asked them about keeping access alive so the tracker
          could survive the switch, but didn't hear back.
        </p>
        <p>
          Everything below is the archive I collected<template v-if="endedOn">, ending {{ endedOn }}</template>.
          It won't grow, but it still shows when these gyms were actually busy.
        </p>
        <p>
          I'd switch this back on the day I get access. That call is GymEesti's to make, so if
          you want the tracker back, ask them for it. A request from their own members carries
          a lot more weight than mine did.
        </p>
      </div>
    </template>
  </UAlert>
</template>
