<template>
  <div class="chart-container tech-card">
    <div class="chart-header d-flex justify-content-between align-items-center mb-3">
      <h5 class="chart-title text-glow-primary mb-0">
        <i class="bi bi-graph-up me-2"></i>
        {{ title }}
      </h5>
      <div class="chart-controls">
        <div class="btn-group" role="group">
          <button
            v-for="mode in modes"
            :key="mode.value"
            type="button"
            class="btn btn-sm"
            :class="currentMode === mode.value ? 'btn-glow' : 'btn-outline-primary'"
            @click="$emit('modeChange', mode.value)"
          >
            {{ mode.label }}
          </button>
        </div>
      </div>
    </div>
    
    <div 
      ref="chartRef" 
      class="chart-content"
      :style="{ height: chartHeight }"
    ></div>
    
    <div v-if="loading" class="chart-loading">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">加载中...</span>
      </div>
      <p class="mt-2 text-secondary">正在加载图表数据...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import * as echarts from 'echarts'
import type { ECharts, EChartsOption } from 'echarts'

interface Props {
  title?: string
  chartOptions?: EChartsOption
  loading?: boolean
  currentMode?: string
  chartHeight?: string
}

interface Mode {
  value: string
  label: string
}

const props = withDefaults(defineProps<Props>(), {
  title: '电能趋势图',
  loading: false,
  currentMode: 'hour',
  chartHeight: '400px'
})

const emit = defineEmits<{
  modeChange: [mode: string]
}>()

const chartRef = ref<HTMLElement>()
let chartInstance: ECharts | null = null

const modes: Mode[] = [
  { value: 'hour', label: '小时' },
  { value: 'day', label: '日' }
]

// 初始化图表
const initChart = () => {
  if (!chartRef.value) return

  chartInstance = echarts.init(chartRef.value)
  
  // 默认配置
  const defaultOptions: EChartsOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(10, 25, 41, 0.95)',
      borderColor: '#00d4ff',
      borderWidth: 2,
      textStyle: {
        color: '#ffffff',
        fontSize: 13,
        fontWeight: 'bold'
      }
    },
    legend: {
      textStyle: {
        color: '#00d4ff',
        fontSize: 12,
        fontWeight: 'bold'
      }
    },
    grid: {
      left: 60,
      right: 20,
      top: 50,
      bottom: 60,
      borderColor: 'rgba(0, 212, 255, 0.2)',
      show: true,
      backgroundColor: 'rgba(0, 212, 255, 0.03)'
    },
    xAxis: {
      type: 'time',
      axisLabel: {
        color: '#00d4ff',
        fontSize: 11,
        fontWeight: 'bold'
      },
      axisLine: {
        lineStyle: {
          color: '#00d4ff',
          width: 2
        }
      },
      splitLine: {
        lineStyle: {
          color: 'rgba(0, 212, 255, 0.15)',
          type: 'dashed'
        }
      }
    },
    yAxis: {
      type: 'value',
      name: '电能消耗 (kWh)',
      nameTextStyle: {
        color: '#00d4ff',
        fontSize: 12,
        fontWeight: 'bold'
      },
      axisLabel: {
        color: '#00d4ff',
        fontSize: 11,
        fontWeight: 'bold'
      },
      axisLine: {
        lineStyle: {
          color: '#00d4ff',
          width: 2
        }
      },
      splitLine: {
        lineStyle: {
          color: 'rgba(0, 212, 255, 0.15)',
          type: 'dashed'
        }
      }
    },
    series: []
  }
  
  chartInstance.setOption(defaultOptions)
}

// 更新图表
const updateChart = () => {
  if (!chartInstance || !props.chartOptions) return
  
  chartInstance.setOption(props.chartOptions, true)
}

// 响应式处理
const handleResize = () => {
  if (chartInstance) {
    chartInstance.resize()
  }
}

// 监听配置变化
watch(() => props.chartOptions, () => {
  updateChart()
}, { deep: true })

// 监听加载状态
// 使用自定义覆盖层显示加载状态，避免与 ECharts 内置 loading 重叠
watch(() => props.loading, () => {
  // intentionally no-op
})

onMounted(async () => {
  await nextTick()
  initChart()
  updateChart()
  
  // 添加窗口大小变化监听
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  if (chartInstance) {
    chartInstance.dispose()
    chartInstance = null
  }
  
  window.removeEventListener('resize', handleResize)
})
</script>

<style lang="scss" scoped>
</style>



