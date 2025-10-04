<template>
  <VChart :option="option" autoresize class="rounded-2xl" theme="dark" />
</template>

<script setup lang="ts">
import { LineChart } from "echarts/charts";
import { DataZoomComponent, GridComponent, TitleComponent, TooltipComponent } from "echarts/components";
import { use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import VChart from "vue-echarts";

type EChartsOption = echarts.EChartsOption;

use([
  CanvasRenderer,
  GridComponent,
  LineChart,
  TitleComponent,
  DataZoomComponent,
  TooltipComponent,
])

type Club = Parameters<typeof timeseries>[0]

const props = withDefaults(defineProps<{
  club: Club
  title?: string
  area?: boolean
  capacity?: number // optional, if omitted we use observed max
  smooth?: boolean
}>(), {
  title: 'Occupancy over time',
  area: true,
  smooth: true,
})

const data = computed(() => timeseries(props.club))
const maxY = computed(() => Math.max(props.capacity ?? observedMax(props.club), ...data.value.map(d => d[1])))

const option = computed<EChartsOption>(() => ({
  title: { text: props.title, left: 'center', top: 6 },
  tooltip: { trigger: 'axis' },
  grid: { left: 10, right: 12, top: 40, bottom: 40, containLabel: true },
  xAxis: {
    type: 'time',
    axisLabel: { formatter: (v: number) => new Date(v).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
  },
  yAxis: { type: 'value', min: 0, max: maxY.value },
  dataZoom: [{ type: 'inside' }, { type: 'slider', height: 14, bottom: 8 }],
  series: [{
    name: 'People',
    type: 'line',
    smooth: props.smooth,
    showSymbol: false,
    lineStyle: { width: 3 },
    areaStyle: props.area ? { opacity: 0.6 } : undefined,
    data: data.value, // [Date, number]
    animationDuration: 600,
  }],
}))

</script>