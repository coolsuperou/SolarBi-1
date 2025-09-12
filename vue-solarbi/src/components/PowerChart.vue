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
watch(() => props.loading, (loading) => {
  if (chartInstance) {
    if (loading) {
      chartInstance.showLoading({
        text: '加载中...',
        color: '#00d4ff',
        textColor: '#ffffff',
        maskColor: 'rgba(10, 25, 41, 0.8)'
      })
    } else {
      chartInstance.hideLoading()
    }
  }
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
.chart-container {
  padding: $spacing-lg;
  position: relative;
}

.chart-header {
  .chart-title {
    font-size: $font-size-lg;
    font-weight: 700;
  }
  
  .chart-controls {
    .btn-outline-primary {
      color: $text-glow;
      border-color: $border-primary;
      
      &:hover {
        background: rgba(0, 212, 255, 0.1);
        border-color: $border-secondary;
        color: $text-glow;
      }
    }
  }
}

.chart-content {
  width: 100%;
  min-height: 300px;
}

.chart-loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  z-index: 10;
}

// 响应式调整
@media (max-width: $breakpoint-md) {
  .chart-container {
    padding: $spacing-md;
  }
  
  .chart-header {
    flex-direction: column;
    align-items: stretch;
    gap: $spacing-md;
    
    .chart-controls {
      align-self: center;
    }
  }
  
  .chart-content {
    height: 300px !important;
  }
}

@media (max-width: $breakpoint-sm) {
  .chart-content {
    height: 250px !important;
  }
  
  .chart-header {
    .chart-title {
      font-size: $font-size-base;
    }
    
    .btn-group .btn {
      font-size: $font-size-xs;
      padding: 0.25rem 0.5rem;
    }
  }
}
</style>
