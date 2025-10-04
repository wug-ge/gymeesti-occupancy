<template>
  <VChart :option="option" autoresize theme="dark" class="rounded-2xl" />
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
  area: true,
  smooth: true,
})

const data = computed(() => timeseries(props.club))
const maxY = computed(() => Math.max(props.capacity ?? observedMax(props.club), ...data.value.map(d => d[1])))

const primaryColor = ref<string>('');
const backgroundAccent1 = ref<string>('');
const textColor = ref<string>('');

const getColorsFromCssVariables = () => {
  const style = getComputedStyle(document.documentElement)
  primaryColor.value = style.getPropertyValue('--ui-primary').trim()
  backgroundAccent1.value = style.getPropertyValue('--ui-bg-accent-1').trim()
  textColor.value = style.getPropertyValue('--ui-neutral').trim()
}
const colorMode = useColorMode();
watch(() => colorMode.preference, getColorsFromCssVariables);

onMounted(() => {
 getColorsFromCssVariables()  
})



const option = computed<EChartsOption>(() => ({
  title: { 
    left: 'center',
    top: 6,
    text: `{t|${props.club.name}}  {b|Now ${props.club.occupancies[props.club.occupancies.length - 1]?.count}}`, // ← two rich fragments
    textStyle: {
      color: textColor.value,
      rich: {
        // t: { fontWeight: 600, fontSize: 14 },
        b: {
          padding: [2, 6],
          borderRadius: 999,
          borderWidth: 1,
          borderColor: '#10B981',
          backgroundColor: '#10B981',
          color: '#F8FAFC',
          fontSize: 12,
          align: 'middle'
        }
      }
    }
  },
  tooltip: { trigger: 'axis' },
  grid: { left: 10, right: 12, top: 40, bottom: 40, containLabel: true },
  xAxis: {
    type: 'time',
    axisLabel: { 
      formatter: (v: number) => new Date(v).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' },),
      color: textColor.value,
    },
  },
  yAxis: {
    type: 'value',
    min: 0, max: maxY.value,
    axisLabel: { color: textColor.value },
    splitLine: {
      lineStyle: {
        color: textColor.value,
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
    areaStyle: props.area ? { opacity: 0.6 } : undefined,
    data: data.value, // [Date, number]
    animationDuration: 600,
    itemStyle: { color: primaryColor.value }
  }],
  backgroundColor: backgroundAccent1.value,
}))

</script>