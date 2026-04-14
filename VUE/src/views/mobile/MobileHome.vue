<template>
  <div style="padding-bottom: 8px">
    <div class="alipay-hero">
      <div class="alipay-hero__row">
        <div>
          <p class="alipay-hero__greet">{{ greet }}{{ sep }}{{ displayName }}</p>
          <p class="alipay-hero__sub">{{ t.heroSub }}</p>
        </div>
        <i class="bi bi-bell alipay-hero__icon" aria-hidden="true"></i>
      </div>
    </div>
    <div class="m-home-block m-home-block--stats">
      <div class="alipay-stats">
        <div class="alipay-stat">
          <div class="alipay-stat__v">{{ todayText }}</div>
          <div class="alipay-stat__l">{{ t.statToday }}</div>
        </div>
        <div class="alipay-stat">
          <div class="alipay-stat__v">{{ monthTotalText }}</div>
          <div class="alipay-stat__l">{{ t.statMonth }}</div>
        </div>
        <div class="alipay-stat">
          <div class="alipay-stat__v">{{ workshopCount }}</div>
          <div class="alipay-stat__l">{{ t.statWs }}</div>
        </div>
      </div>
      <div v-show="statsLoading" class="m-home-loading-overlay m-home-loading-overlay--stats" role="status" :aria-label="loadingAria">
        <div class="m-home-loading-spinner" aria-hidden="true"></div>
        <span class="m-home-loading-text">{{ loadingText }}</span>
      </div>
    </div>
    <div class="alipay-notice"><i class="bi bi-info-circle"></i> {{ t.notice }}</div>
    <div class="alipay-section-title"><i class="bi bi-grid-3x3-gap"></i> {{ t.sectionSvc }}</div>
    <div class="service-grid">
      <RouterLink :to="M.MONTHLY_ENERGY" class="service-item" :class="{ 'service-item--muted': !canMonthly }">
        <i class="bi bi-calendar3"></i>{{ t.svcMonthly }}
      </RouterLink>
      <RouterLink :to="M.HOURLY_ENERGY" class="service-item" :class="{ 'service-item--muted': !canHourly }">
        <i class="bi bi-clock"></i>{{ t.svcHourly }}
      </RouterLink>
      <RouterLink :to="M.ELECTRICITY_COST" class="service-item" :class="{ 'service-item--muted': !canCost }">
        <i class="bi bi-calculator"></i>{{ t.svcCost }}
      </RouterLink>
      <RouterLink :to="M.WORKSHOP" class="service-item">
        <i class="bi bi-building"></i>{{ t.svcWs }}
      </RouterLink>
      <button type="button" class="service-item" disabled :title="t.soon">
        <i class="bi bi-download"></i>{{ t.svcExport }}
      </button>
      <button type="button" class="service-item" disabled :title="t.soon">
        <i class="bi bi-envelope"></i>{{ t.svcMsg }}
      </button>
      <button type="button" class="service-item" disabled :title="t.soon">
        <i class="bi bi-three-dots"></i>{{ t.svcMore }}
      </button>
      <button type="button" class="service-item" disabled :title="t.soon">
        <i class="bi bi-plus-lg"></i>{{ t.svcHold }}
      </button>
    </div>
    <div class="m-home-block m-home-block--charts">
      <div class="echarts-home-box">
        <h4>{{ t.chartLine }}</h4>
        <div ref="lineRef" class="echarts-slot"></div>
      </div>
      <div class="echarts-home-box">
        <h4>{{ t.chartPie }}</h4>
        <div ref="pieRef" class="echarts-slot"></div>
      </div>
      <div v-show="statsLoading" class="m-home-loading-overlay m-home-loading-overlay--charts" role="status" :aria-label="loadingAria">
        <div class="m-home-loading-spinner" aria-hidden="true"></div>
        <span class="m-home-loading-text">{{ loadingText }}</span>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import * as echarts from 'echarts'
import { authState, hasPagePermission } from '@/auth'
import { getMonthlyStatistics } from '@/api/monthlyEnergy'
import { workshopRouteEntries } from '@/router/workshopRoutesConfig'
import { M } from '@/router/mobileUtils'

const sep = '\uff0c'
const t = {
  heroSub: '\u4eca\u65e5\u6570\u636e\u6982\u89c8',
  statToday: '\u4eca\u65e5\u7528\u7535',
  statMonth: '\u672c\u6708\u7d2f\u8ba1',
  statWs: '\u76d1\u63a7\u8f66\u95f4',
  notice: '\u516c\u544a\uff1a\u4f4e\u8c37\u7535\u4ef7\u65f6\u6bb5\u8bf7\u5173\u6ce8\u8f66\u95f4\u8d1f\u8377\u3002',
  sectionSvc: '\u5e38\u7528\u529f\u80fd',
  svcMonthly: '\u6708\u5ea6\u80fd\u8017',
  svcHourly: '\u65e5\u80fd\u8017',
  svcCost: '\u7535\u8d39\u5206\u644a',
  svcWs: '\u8f66\u95f4\u76d1\u63a7',
  soon: '\u656c\u8bf7\u671f\u5f85',
  svcExport: '\u5bfc\u51fa\u62a5\u8868',
  svcMsg: '\u6d88\u606f\u4e2d\u5fc3',
  svcMore: '\u66f4\u591a',
  svcHold: '\u5360\u4f4d',
  chartLine: '\u8fd17\u65e5\u5168\u5382\u7528\u7535',
  chartPie: '\u8f66\u95f4\u7528\u7535\u5360\u6bd4'
}

const loadingText = '\u52a0\u8f7d\u4e2d...'
const loadingAria = '\u6570\u636e\u52a0\u8f7d\u4e2d'

const lineRef = ref(null)
const pieRef = ref(null)
let chartLine = null
let chartPie = null

const displayName = computed(() => authState.user?.userName || '\u7528\u6237')

const greet = computed(() => {
  const h = new Date().getHours()
  if (h < 12) return '\u4e0a\u5348\u597d'
  if (h < 18) return '\u4e0b\u5348\u597d'
  return '\u665a\u4e0a\u597d'
})

const canMonthly = computed(() => authState.isAdmin || hasPagePermission('monthly-energy'))
const canHourly = computed(() => authState.isAdmin || hasPagePermission('hourly-energy'))
const canCost = computed(() => authState.isAdmin || hasPagePermission('electricity-cost-allocation'))

const workshopCount = computed(() => {
  if (authState.isAdmin) return workshopRouteEntries.length
  return workshopRouteEntries.filter((r) => hasPagePermission(r.meta.permKey)).length
})

const DASH = '\u2014'
const todayText = ref(DASH)
const monthTotalText = ref(DASH)

const statsPayload = ref(null)
/** Last 7 calendar days ending today: labels + values for line chart */
const lineSeries = ref({ labels: [], values: [] })
const statsLoading = ref(true)

function calendarDatesLast7Days(endDate) {
  const list = []
  for (let o = -6; o <= 0; o++) {
    const d = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate())
    d.setDate(d.getDate() + o)
    list.push(d)
  }
  return list
}

function monthKey(y, m) {
  return `${y}-${m}`
}

function formatLineAxisDay(d) {
  return `${d.getMonth() + 1}/${d.getDate()}`
}

function buildLast7FromPayloads(dates, byMonth) {
  const labels = []
  const values = []
  for (const d of dates) {
    const y = d.getFullYear()
    const m = d.getMonth() + 1
    const day = d.getDate()
    const payload = byMonth.get(monthKey(y, m))
    const daily = payload?.dailyTotal ?? []
    const idx = day - 1
    labels.push(formatLineAxisDay(d))
    if (idx >= 0 && idx < daily.length && daily[idx] != null) {
      values.push(Number(daily[idx]) || 0)
    } else {
      values.push(0)
    }
  }
  return { labels, values }
}

async function loadStats() {
  statsLoading.value = true
  const now = new Date()
  try {
    const dates = calendarDatesLast7Days(now)
    const keys = [...new Set(dates.map((d) => monthKey(d.getFullYear(), d.getMonth() + 1)))]
    const entries = await Promise.all(
      keys.map(async (key) => {
        const [y, m] = key.split('-').map(Number)
        const data = await getMonthlyStatistics(y, m)
        return [key, data]
      })
    )
    const byMonth = new Map(entries)

    const cy = now.getFullYear()
    const cm = now.getMonth() + 1
    const data = byMonth.get(monthKey(cy, cm)) ?? null
    statsPayload.value = data

    lineSeries.value = buildLast7FromPayloads(dates, byMonth)

    if (data) {
      const dayIdx = now.getDate() - 1
      const todayVal = data.dailyTotal?.[dayIdx]
      todayText.value = todayVal != null ? formatNum(todayVal) : DASH
      monthTotalText.value = data.monthlyTotal != null ? formatNum(data.monthlyTotal) : DASH
    } else {
      todayText.value = DASH
      monthTotalText.value = DASH
    }
  } catch {
    statsPayload.value = null
    lineSeries.value = { labels: [], values: [] }
    todayText.value = DASH
    monthTotalText.value = DASH
  } finally {
    statsLoading.value = false
  }
}

function formatNum(v) {
  if (v == null) return DASH
  return Number(v).toLocaleString('zh-CN', { maximumFractionDigits: 0 })
}

const lineTooltipUnit = ' kWh'

function lineTooltipFormatter(params) {
  const p = Array.isArray(params) ? params[0] : params
  if (!p) return ''
  const raw = p.value
  const num =
    raw == null || Number.isNaN(Number(raw))
      ? DASH
      : Number(raw).toLocaleString('zh-CN', { maximumFractionDigits: 0 })
  return `${p.axisValue}<br/>${t.chartLine}\uff1a${num}${lineTooltipUnit}`
}

const lineChartTooltip = {
  trigger: 'axis',
  triggerOn: 'mousemove|click',
  confine: true,
  backgroundColor: 'rgba(255,255,255,0.96)',
  borderColor: '#e2e8f0',
  borderWidth: 1,
  padding: [8, 12],
  textStyle: { color: '#1e293b', fontSize: 12 },
  formatter: lineTooltipFormatter
}

const lineChartAxisPointer = {
  type: 'line',
  snap: true,
  lineStyle: { color: 'rgba(22,119,255,0.35)', width: 1, type: 'dashed' }
}

function buildLineOption(series) {
  const labels = series?.labels ?? []
  const vals = series?.values ?? []
  if (!labels.length) {
    return {
      color: ['#1677ff'],
      tooltip: lineChartTooltip,
      axisPointer: lineChartAxisPointer,
      grid: { left: '10%', right: '6%', top: '14%', bottom: '18%' },
      xAxis: { type: 'category', boundaryGap: false, data: [] },
      yAxis: { type: 'value', name: 'kWh', splitLine: { lineStyle: { type: 'dashed' } } },
      series: [{ name: t.chartLine, type: 'line', smooth: true, data: [] }]
    }
  }
  return {
    color: ['#1677ff'],
    tooltip: lineChartTooltip,
    axisPointer: lineChartAxisPointer,
    grid: { left: '10%', right: '6%', top: '14%', bottom: '18%' },
    xAxis: { type: 'category', boundaryGap: false, data: labels },
    yAxis: { type: 'value', name: 'kWh', splitLine: { lineStyle: { type: 'dashed' } } },
    series: [
      {
        name: t.chartLine,
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        areaStyle: { color: 'rgba(22,119,255,0.12)' },
        lineStyle: { width: 2 },
        data: vals
      }
    ]
  }
}

function buildPieOption(data) {
  const list = data?.workshopMonthlyTotal
  if (!list || typeof list !== 'object') {
    return {
      series: [{ type: 'pie', radius: ['40%', '68%'], data: [{ name: '\u6682\u65e0', value: 1 }] }]
    }
  }
  const pieData = Object.entries(list)
    .map(([name, value]) => ({ name, value: Number(value) || 0 }))
    .filter((d) => d.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 8)
  if (pieData.length === 0) {
    return {
      series: [{ type: 'pie', radius: ['40%', '68%'], data: [{ name: '\u6682\u65e0', value: 1 }] }]
    }
  }
  return {
    tooltip: { trigger: 'item' },
    series: [
      {
        type: 'pie',
        radius: ['40%', '68%'],
        avoidLabelOverlap: true,
        itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
        label: { fontSize: 10 },
        data: pieData
      }
    ]
  }
}

function resizeCharts() {
  chartLine?.resize()
  chartPie?.resize()
}

onMounted(async () => {
  await loadStats()
  if (lineRef.value) {
    chartLine = echarts.init(lineRef.value)
    chartLine.setOption(buildLineOption(lineSeries.value))
  }
  if (pieRef.value) {
    chartPie = echarts.init(pieRef.value)
    chartPie.setOption(buildPieOption(statsPayload.value))
  }
  window.addEventListener('resize', resizeCharts)
})

watch([statsPayload, lineSeries], ([data, line]) => {
  if (chartLine) {
    chartLine.setOption(buildLineOption(line))
  }
  if (chartPie && data) {
    chartPie.setOption(buildPieOption(data))
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', resizeCharts)
  chartLine?.dispose()
  chartPie?.dispose()
  chartLine = null
  chartPie = null
})
</script>
