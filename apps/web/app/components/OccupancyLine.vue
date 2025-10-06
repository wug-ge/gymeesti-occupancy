<template>
  <VChart :option="option" autoresize theme="dark" class="rounded-2xl !bg-[var(--ui-bg-accent-1)] pb-4 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 dark:shadow-none dark:hover:shadow-[0_0_16px_rgba(16,185,129,0.15)]" />
</template>

<script setup lang="ts">
import { graphic } from "echarts";
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
  capacity?: number // optional, if omitted we use observed max
  smooth?: boolean
}>(), {
  smooth: true,
})

const data = computed(() => timeseries(props.club))
const maxY = computed(() => Math.max(props.capacity ?? observedMax(props.club), ...data.value.map(d => d[1])))

const primaryColor = ref<string>('');
const backgroundAccent1 = ref<string>('');
const textColor = ref<string>('');
const chartGridColor = ref<string>('');
const badgeTextColor = ref<string>('')
const badgeBackgroundColorGood = ref<string>('')
const badgeBackgroundColorWarning = ref<string>('')
const badgeBackgroundColorError = ref<string>('')


const getColorsFromCssVariables = () => {
  const style = getComputedStyle(document.documentElement)
  primaryColor.value = style.getPropertyValue('--ui-primary').trim()
  backgroundAccent1.value = style.getPropertyValue('--ui-bg-accent-1').trim()
  textColor.value = style.getPropertyValue('--ui-neutral').trim()
  chartGridColor.value = style.getPropertyValue('--chart-grid').trim()
  badgeTextColor.value = style.getPropertyValue('--badge-text').trim()
  badgeBackgroundColorGood.value = style.getPropertyValue('--badge-bg-good').trim()
  badgeBackgroundColorWarning.value = style.getPropertyValue('--badge-bg-warning').trim()
  badgeBackgroundColorError.value = style.getPropertyValue('--badge-bg-error').trim()

}
const colorMode = useColorMode();
watch(() => colorMode.preference, getColorsFromCssVariables);

onMounted(() => {
 getColorsFromCssVariables()  
})

const clubState = computed(() => {
  const maxOccupancyCount = Math.max(...props.club.occupancies.map(o => o.count));
  const currentOccupancyCount = props.club.occupancies[props.club.occupancies.length - 1]?.count

  if (!maxOccupancyCount || !currentOccupancyCount) {
    return 'error'
  }

  if (currentOccupancyCount / maxOccupancyCount <= 0.35) {
    return 'good'
  }

  if (currentOccupancyCount / maxOccupancyCount <= 0.6) {
    return 'warning'
  }

  return 'error'
})

const badgeBackgroundColor = computed(() => {
  switch(clubState.value) {
    case 'good': 
      return badgeBackgroundColorGood.value
    case 'warning':
      return badgeBackgroundColorWarning.value
    case 'error':
      return badgeBackgroundColorError.value
  }
})

const option = computed<EChartsOption>(() => ({
  title: { 
    left: 'center',
    top: 6,
    text: `{t|${props.club.name}}  {b|Now ${props.club.occupancies[props.club.occupancies.length - 1]?.count}}`, // ← two rich fragments
    textStyle: {
      color: textColor.value,
      rich: {
        t: { fontWeight: 600, fontSize: 14, color: textColor.value },
        b: {
          padding: [2, 6],
          borderRadius: 999,
          borderWidth: 1,
          // borderColor: '#10B981',
          backgroundColor: badgeBackgroundColor.value,
          color: badgeTextColor.value,
          fontSize: 12,
          verticalAlign: 'middle',
          align: 'center',
        }
      }
    }
  },
  tooltip: { trigger: 'axis' },
  grid: { left: 10, right: 12, top: 40, bottom: 40, containLabel: true },
  xAxis: {
    type: 'time',
    axisLabel: { 
      formatter: (v: number) =>   new Date(v).toLocaleDateString([], {
        day: '2-digit',
        month: 'short',
      }),
      color: textColor.value,
    },
  },
  yAxis: {
    type: 'value',
    min: 0, max: maxY.value,
    axisLabel: { color: textColor.value },
    splitLine: {
      lineStyle: {
        color: chartGridColor.value,
      }
    },
  },
  dataZoom: [{ type: 'inside' }, { type: 'slider', height: 14, bottom: 8 }],
  series: [{
    name: 'People',
    type: 'line',
    smooth: props.smooth,
    showSymbol: false,
    lineStyle: { width: 3 },
    areaStyle: {
      color: new graphic.LinearGradient(0, 0, 0, 1, [
    { offset: 0, color: 'rgba(16,185,129,0.78)' }, // top
    { offset: 1, color: 'rgba(16,185,129,0.0)' }  // bottom
  ])
    },
    data: data.value, // [Date, number]
    animationDuration: 600,
    itemStyle: { color: primaryColor.value },
  }],
    visualMap: {
      show: false,
      pieces: [
        { gt: 0, lte: maxY.value * 0.35, color: badgeBackgroundColorGood.value },
        { gt: maxY.value * 0.35, lte: maxY.value * 0.6, color: badgeBackgroundColorWarning.value },
        { gt: maxY.value * 0.6, color: badgeBackgroundColorError.value }
      ],
      dimension: 1, // y-axis value
      outOfRange: { color: '#94A3B8' } // fallback gray
    },
  backgroundColor: backgroundAccent1.value,
}))

</script>