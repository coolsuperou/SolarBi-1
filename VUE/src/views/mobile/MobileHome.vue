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
        <h4>{{ t.chartBar }}</h4>
        <div ref="pieRef" class="echarts-slot" :style="{ height: barChartHeight }"></div>
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

const sep = '，'
const t = {
  heroSub: '今日数据概览',
  statToday: '今日用电',
  statMonth: '本月累计',
  statWs: '监控车间',
  notice: '公告：低谷电价时段请关注车间负荷。',
  sectionSvc: '常用功能',
  svcMonthly: '月度能耗',
  svcHourly: '日能耗',
  svcCost: '电费分摊',
  svcWs: '车间监控',
  soon: '敬请期待',
  svcExport: '导出报表',
  svcMsg: '消息中心',
  svcMore: '更多',
  svcHold: '占位',
  chartLine: '近7日全厂用电',
  chartBar: '当月车间用电排行'
}

const loadingText = '加载中...'
const loadingAria = '数据加载中'

const lineRef = ref(null)
const pieRef = ref(null)
let chartLine = null
let chartPie = null

const displayName = computed(() => authState.user?.userName || '用户')

const greet = computed(() => {
  const h = new Date().getHours()
  if (h < 12) return '上午好'
  if (h < 18) return '下午好'
  return '晚上好'
})

const canMonthly = computed(() => authState.isAdmin || hasPagePermission('monthly-energy'))
const canHourly = computed(() => authState.isAdmin || hasPagePermission('hourly-energy'))
const canCost = computed(() => authState.isAdmin || hasPagePermission('electricity-cost-allocation'))

const workshopCount = computed(() => {
  if (authState.isAdmin) return workshopRouteEntries.length
  return workshopRouteEntries.filter((r) => hasPagePermission(r.meta.permKey)).length
})

const DASH = '—'
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
  return `${p.axisValue}<br/>${t.chartLine}：${num}${lineTooltipUnit}`
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

const barChartHeight = computed(() => {
  const list = statsPayload.value?.workshopMonthlyTotal
  if (!list || typeof list !== 'object') return '160px'
  const count = Object.values(list).filter((v) => Number(v) > 0).length
  return Math.max(160, count * 28 + 60) + 'px'
})

function buildPieOption(data) {
  const list = data?.workshopMonthlyTotal
  if (!list || typeof list !== 'object') {
    return {
      grid: { left: '30%', right: '10%', top: 10, bottom: 10 },
      xAxis: { type: 'value', show: false },
      yAxis: { type: 'category', data: ['暂无'] },
      series: [{ type: 'bar', data: [0] }]
    }
  }
  const items = Object.entries(list)
    .map(([name, value]) => ({ name, value: Number(value) || 0 }))
    .filter((d) => d.value > 0)
    .sort((a, b) => a.value - b.value)
  if (items.length === 0) {
    return {
      grid: { left: '30%', right: '10%', top: 10, bottom: 10 },
      xAxis: { type: 'value', show: false },
      yAxis: { type: 'category', data: ['暂无'] },
      series: [{ type: 'bar', data: [0] }]
    }
  }
  const names = items.map((d) => d.name)
  const values = items.map((d) => d.value)
  const total = items.length
  const coloredValues = values.map((v, i) => {
    const ratio = total > 1 ? i / (total - 1) : 0
    const h = 220 - ratio * 220
    const s = 65 + ratio * 30
    const l = 55 - ratio * 15
    return {
      value: v,
      itemStyle: { color: `hsl(${h}, ${s}%, ${l}%)` }
    }
  })
  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      confine: true,
      formatter(params) {
        const p = Array.isArray(params) ? params[0] : params
        if (!p) return ''
        const v = Number(p.value).toLocaleString('zh-CN', { maximumFractionDigits: 2 })
        return `${p.name}<br/>用电量：${v} kWh`
      }
    },
    grid: { left: '30%', right: '8%', top: 10, bottom: 10 },
    xAxis: {
      type: 'value',
      axisLabel: { show: false },
      splitLine: { lineStyle: { type: 'dashed', color: '#f1f5f9' } }
    },
    yAxis: {
      type: 'category',
      data: names,
      axisLabel: { fontSize: 10, color: '#475569', width: 80, overflow: 'truncate' },
      axisTick: { show: false },
      axisLine: { show: false }
    },
    series: [
      {
        type: 'bar',
        data: coloredValues,
        barMaxWidth: 16,
        itemStyle: {
          borderRadius: [0, 4, 4, 0]
        },
        label: {
          show: true,
          position: 'right',
          fontSize: 9,
          color: '#94a3b8',
          formatter(p) {
            return Number(p.value).toLocaleString('zh-CN', { maximumFractionDigits: 0 })
          }
        }
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
