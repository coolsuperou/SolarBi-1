<template>
  <div class="workshop-page workshop-page--mobile">
    <!-- Query toolbar -->
    <div class="search-card">
      <div class="search-header">
        <div class="search-title"><i class="bi bi-funnel-fill"></i> {{ MWS.DATA_QUERY }}</div>
        <div class="mode-switch">
          <button type="button" class="mode-btn" :class="{ active: queryMode === 'hour' }" @click="queryMode = 'hour'">
            <i class="bi bi-clock-fill"></i> {{ MWS.MODE_HOUR }}
          </button>
          <button type="button" class="mode-btn" :class="{ active: queryMode === 'day' }" @click="queryMode = 'day'">
            <i class="bi bi-calendar3-fill"></i> {{ MWS.MODE_DAY }}
          </button>
        </div>
      </div>
      <div class="search-form-row">
        <template v-if="queryMode === 'hour'">
          <span class="form-label-sm">{{ MWS.START_TIME }}</span>
          <div class="time-combo">
            <input type="date" v-model="hourStartDate">
            <span class="combo-sep"></span>
            <select v-model="hourStartHour">
              <option v-for="h in 24" :key="h-1" :value="h-1">{{ String(h-1).padStart(2,'0') }}:00</option>
            </select>
          </div>
          <span class="form-label-sm">{{ MWS.END_TIME }}</span>
          <div class="time-combo">
            <input type="date" v-model="hourEndDate">
            <span class="combo-sep"></span>
            <select v-model="hourEndHour">
              <option v-for="h in 24" :key="h-1" :value="h-1">{{ String(h-1).padStart(2,'0') }}:00</option>
            </select>
          </div>
        </template>
        <template v-else>
          <span class="form-label-sm">{{ MWS.START_DATE }}</span>
          <div class="time-combo">
            <input type="date" v-model="dayStartDate">
          </div>
          <span class="form-label-sm">{{ MWS.END_DATE }}</span>
          <div class="time-combo">
            <input type="date" v-model="dayEndDate">
          </div>
        </template>
        <button type="button" class="btn-search" :class="{ loading: isLoading }" :disabled="isLoading" @click="handleQuery">
          <i class="bi" :class="isLoading ? 'bi-arrow-repeat spin' : 'bi-search'"></i>
          {{ isLoading ? MWS.QUERYING : MWS.QUERY }}
        </button>
      </div>
    </div>

    <!-- Chart -->
    <div class="chart-card">
      <div class="chart-card-header" @click="chartCollapsed = !chartCollapsed">
        <div class="chart-card-title">
          <i class="bi bi-graph-up-arrow"></i> {{ MWS.CHART_TITLE }}
          <span class="chart-badge" v-if="chartData.length > 0">
            <i class="bi bi-dot"></i>{{ chartData.length }} {{ MWS.DATA_POINTS_SUFFIX }}
          </span>
        </div>
        <i class="bi collapse-icon" :class="chartCollapsed ? 'bi-chevron-down' : 'bi-chevron-up'" aria-hidden="true"></i>
      </div>
      <div class="chart-area" v-show="!chartCollapsed">
        <div v-if="chartData.length === 0 && !isLoading" class="chart-empty">
          <i class="bi bi-graph-up"></i>
          <p>{{ MWS.CHART_EMPTY }}</p>
        </div>
        <div
          v-show="chartData.length > 0"
          ref="chartRef"
          class="workshop-preview-chart"
          role="img"
          :aria-label="MWS.CHART_ARIA"
        />
      </div>
    </div>

    <!-- Data table -->
    <div class="table-card">
      <div class="workshop-table-header">
        <span class="workshop-table-title"><i class="bi bi-table"></i> {{ MWS.TABLE_TITLE }}</span>
        <span class="table-count" v-if="pagination.total > 0">
          <i class="bi bi-database"></i>{{ MWS.RECORDS_PREFIX }}{{ pagination.total }}{{ MWS.RECORDS_SUFFIX }}
        </span>
      </div>
      <table class="data-table">
        <thead>
          <tr>
            <th style="width:50px">{{ MWS.COL_INDEX }}</th>
            <th>{{ MWS.COL_DEVICE_ID }}</th>
           
            <th>{{ MWS.COL_NAME }}</th>
            <th>{{ MWS.COL_ENERGY }}</th>
            <th>{{ MWS.COL_TIME }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="tableData.length === 0">
            <td colspan="6" class="empty-cell">
              <div class="empty-state-mini">
                <i class="bi bi-inbox"></i>
                <p>{{ MWS.NO_TABLE_DATA }}</p>
              </div>
            </td>
          </tr>
          <tr v-for="(row, idx) in tableData" :key="idx" :class="{ 'row-even': idx % 2 === 1 }">
            <td class="td-index">{{ (pagination.current - 1) * pageSize + idx + 1 }}</td>
            <td class="td-device">{{ row.deviceId }}</td>
          
            <td class="td-name"><i class="bi bi-cpu"></i>{{ row.name }}</td>
            <td class="td-energy">{{ formatNumber(row.electricEnergy) }}</td>
            <td class="td-time">{{ formatDateTime(row.updateTime) }}</td>
          </tr>
        </tbody>
      </table>
      <div class="table-pagination" v-if="pagination.total > 0">
        <span class="page-info">{{ MWS.PAGE_PREFIX }}{{ pagination.current }}{{ MWS.PAGE_MIDDLE }}{{ pagination.pages }}{{ MWS.PAGE_SUFFIX }}</span>
        <div class="page-btns">
          <button type="button" class="page-btn" :disabled="pagination.current <= 1" @click="goPage(1)" :title="MWS.TITLE_FIRST_PAGE">
            <i class="bi bi-chevron-double-left"></i>
          </button>
          <button type="button" class="page-btn" :disabled="pagination.current <= 1" @click="goPage(pagination.current - 1)">
            <i class="bi bi-chevron-left"></i>
          </button>
          <button
            v-for="p in visiblePages"
            :key="p"
            type="button"
            class="page-btn"
            :class="{ active: p === pagination.current }"
            @click="goPage(p)"
          >{{ p }}</button>
          <button type="button" class="page-btn" :disabled="pagination.current >= pagination.pages" @click="goPage(pagination.current + 1)">
            <i class="bi bi-chevron-right"></i>
          </button>
          <button type="button" class="page-btn" :disabled="pagination.current >= pagination.pages" @click="goPage(pagination.pages)" :title="MWS.TITLE_LAST_PAGE">
            <i class="bi bi-chevron-double-right"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
/**
 * Total pages for pagination (exported for tests).
 */
export function calcTotalPages(total, pageSize) {
  if (total <= 0) return 0
  return Math.ceil(total / pageSize)
}
</script>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import * as echarts from 'echarts'
import { getWorkshopApi } from '@/api/workshopMap'
import { MWS } from '@/views/mobile/workshopMobileStrings'
import '@/styles/desktop/workshop.css'
import '@/styles/mobile/workshop-mobile.css'

const route = useRoute()

const workshopName = computed(() => route.meta?.workshop || '')
const api = computed(() => getWorkshopApi(route.meta?.apiBase))

const queryMode = ref('hour')

const now = new Date()
const todayStr = formatDateStr(now)
const weekAgoStr = formatDateStr(new Date(now.getTime() - 7 * 24 * 3600 * 1000))

const yesterdayStr = formatDateStr(new Date(now.getTime() - 1 * 24 * 3600 * 1000))

const nextHour = (now.getHours() + 1) % 24
const nextHourDate = now.getHours() + 1 >= 24
  ? formatDateStr(new Date(now.getTime() + 24 * 3600 * 1000))
  : todayStr
const prevNextHourDate = now.getHours() + 1 >= 24
  ? todayStr
  : yesterdayStr

const hourStartDate = ref(prevNextHourDate)
const hourStartHour = ref(nextHour)
const hourEndDate = ref(nextHourDate)
const hourEndHour = ref(nextHour)

const dayStartDate = ref(weekAgoStr)
const dayEndDate = ref(todayStr)

const chartCollapsed = ref(false)
const chartRef = ref(null)
let chartInstance = null
const chartData = ref([])

const tableData = ref([])
const pagination = ref({ current: 1, total: 0, pages: 0 })
const pageSize = 20
const isLoading = ref(false)

function formatNumber(val) {
  if (val == null) return '0.00'
  return Number(val).toFixed(2)
}

function formatDateTime(isoStr) {
  if (!isoStr) return ''
  const d = new Date(isoStr)
  if (isNaN(d.getTime())) return String(isoStr)
  const y = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const mi = String(d.getMinutes()).padStart(2, '0')
  const ss = String(d.getSeconds()).padStart(2, '0')
  return `${y}-${mm}-${dd} ${hh}:${mi}:${ss}`
}

function formatDateStr(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function buildTimeRange() {
  if (queryMode.value === 'hour') {
    const startTime = `${hourStartDate.value} ${String(hourStartHour.value).padStart(2, '0')}:00:00`
    const endTime = `${hourEndDate.value} ${String(hourEndHour.value).padStart(2, '0')}:00:00`
    return { startTime, endTime }
  } else {
    const startTime = `${dayStartDate.value} 00:00:00`
    const endTime = `${dayEndDate.value} 23:59:59`
    return { startTime, endTime }
  }
}

async function loadChartData() {
  if (!api.value) return
  const { startTime, endTime } = buildTimeRange()
  try {
    let data
    if (queryMode.value === 'hour') {
      data = await api.value.getHourlyEnergyConsumptionQuery({ workshop: workshopName.value, startTime, endTime })
    } else {
      data = await api.value.getDailyEnergyConsumptionQuery({ workshop: workshopName.value, startTime, endTime })
    }
    chartData.value = data || []
    await nextTick()
    renderChart()
  } catch (err) {
    console.error(MWS.ERR_CHART, err)
    chartData.value = []
  }
}

async function loadTableData(page = 1) {
  if (!api.value) return
  const { startTime, endTime } = buildTimeRange()
  try {
    const data = await api.value.queryByCondition({
      current: page,
      pageSize,
      workshop: workshopName.value,
      startTime,
      endTime
    })
    tableData.value = data?.records || []
    pagination.value = {
      current: data?.current || 1,
      total: data?.total || 0,
      pages: calcTotalPages(data?.total || 0, pageSize)
    }
  } catch (err) {
    console.error(MWS.ERR_TABLE, err)
    tableData.value = []
    pagination.value = { current: 1, total: 0, pages: 0 }
  }
}

function goPage(page) {
  if (page < 1 || page > pagination.value.pages) return
  loadTableData(page)
}

const visiblePages = computed(() => {
  const total = pagination.value.pages
  const current = pagination.value.current
  if (total <= 5) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }
  let start = Math.max(1, current - 2)
  let end = Math.min(total, start + 4)
  if (end - start < 4) start = Math.max(1, end - 4)
  const pages = []
  for (let i = start; i <= end; i++) pages.push(i)
  return pages
})

function formatTimeLabel(isoStr, isHour) {
  if (!isoStr) return ''
  const d = new Date(isoStr)
  if (isNaN(d.getTime())) return String(isoStr)
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  if (isHour) {
    const hh = String(d.getHours()).padStart(2, '0')
    return `${mm}-${dd} ${hh}:00`
  }
  return `${mm}-${dd}`
}

/**
 * ? `workshop-mobile-design.html` ? ECharts setOption ?????? seriesName / labels / data ??????
 */
function buildWorkshopMobileTrendOption(seriesName, labels, values) {
  return {
    color: ['#3b82f6'],
    grid: { left: 44, right: 10, top: 40, bottom: 16 },
    tooltip: {
      trigger: 'axis',
      triggerOn: 'mousemove|click',
      showDelay: 0,
      hideDelay: 400,
      confine: true
    },
    axisPointer: {
      type: 'line',
      snap: true,
      lineStyle: { color: 'rgba(59, 130, 246, 0.35)', width: 1, type: 'dashed' }
    },
    legend: { data: [seriesName], top: 2, right: 6, textStyle: { fontSize: 11, color: '#64748b' } },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: labels,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { show: false }
    },
    yAxis: {
      type: 'value',
      name: 'kWh',
      nameTextStyle: { color: '#94a3b8', fontSize: 11 },
      axisLabel: { color: '#94a3b8', fontSize: 10 },
      splitLine: { lineStyle: { color: '#f1f5f9' } }
    },
    series: [{
      name: seriesName,
      type: 'line',
      smooth: 0.35,
      symbol: 'circle',
      symbolSize: 7,
      data: values,
      lineStyle: { width: 2.5, color: '#3b82f6' },
      itemStyle: { color: '#3b82f6', borderColor: '#fff', borderWidth: 2 },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(59, 130, 246, 0.22)' },
          { offset: 1, color: 'rgba(59, 130, 246, 0.02)' }
        ])
      }
    }]
  }
}

function destroyChart() {
  if (chartInstance) {
    chartInstance.dispose()
    chartInstance = null
  }
}

function onChartResize() {
  chartInstance?.resize()
}

function renderChart() {
  if (!chartRef.value || chartData.value.length === 0) {
    destroyChart()
    return
  }

  const isHour = queryMode.value === 'hour'
  const labels = chartData.value.map(d => formatTimeLabel(isHour ? d.hour : d.day, isHour))
  const values = chartData.value.map(d => d.energyConsumption)
  const option = buildWorkshopMobileTrendOption(MWS.CHART_LEGEND, labels, values)

  if (!chartInstance) {
    chartInstance = echarts.init(chartRef.value)
  }
  chartInstance.setOption(option, { notMerge: true })
  requestAnimationFrame(() => {
    chartInstance?.resize()
  })
}

async function handleQuery() {
  isLoading.value = true
  try {
    await Promise.all([loadChartData(), loadTableData(1)])
  } finally {
    isLoading.value = false
  }
}

watch(queryMode, () => {
  handleQuery()
})

watch(chartCollapsed, (collapsed) => {
  if (!collapsed) {
    nextTick(() => renderChart())
  }
})

watch(() => route.meta, () => {
  handleQuery()
}, { deep: true })

onMounted(() => {
  window.addEventListener('resize', onChartResize)
  handleQuery()
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', onChartResize)
  destroyChart()
})
</script>
