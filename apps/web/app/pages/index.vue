<template>
  <UContainer>
    <ClientOnly>
      <div class="grid grid-cols-6 gap-4 mt-16">
        <OccupancyLine
          v-for="club in clubs"
          :club="club" :title="club.name"
          class="col-span-6 md:col-span-3 lg:col-span-2 size-full min-h-[300px]"

        />
      </div>
    </ClientOnly>
  </UContainer>
</template>

<script lang="ts" setup>
const clubs = (await ((await fetch(`/api/occupancy`)).json() as any ));

</script>