<template>
  <div class="workshop-page">
    <!-- 统计卡片 -->
    <div class="overview-cards">
      <div class="overview-card">
        <div class="overview-icon purple"><i class="bi bi-building"></i></div>
        <div>
          <div class="overview-value">{{ workshopTitle }}</div>
          <div class="overview-label">车间名称</div>
        </div>
      </div>
      <div class="overview-card">
        <div class="overview-icon green"><i class="bi bi-lightning-charge-fill"></i></div>
        <div>
          <div class="overview-value">
            {{ formatNumber(energyConsumption) }}
            <span class="overview-unit">kWh</span>
          </div>
          <div class="overview-label">电能消耗</div>
        </div>
      </div>
      <div class="overview-card">
        <div class="overview-icon orange"><i class="bi bi-bar-chart-line-fill"></i></div>
        <div>
          <div class="overview-value">
            {{ formatNumber(statistics.totalElectricEnergy) }}
            <span class="overview-unit">kWh</span>
          </div>
          <div class="overview-label">总电能消耗</div>
        </div>
      </div>
    </div>

    <!-- 查询操作栏 -->
    <div class="search-card">
      <div class="search-header">
        <div class="search-title"><i class="bi bi-funnel-fill"></i> 数据查询</div>
        <div class="mode-switch">
          <button class="mode-btn" :class="{ active: queryMode === 'hour' }" @click="queryMode = 'hour'">
            <i class="bi bi-clock-fill"></i> 小时模式
          </button>
          <button class="mode-btn" :class="{ active: queryMode === 'day' }" @click="queryMode = 'day'">
            <i class="bi bi-calendar3-fill"></i> 日模式
          </button>
        </div>
      </div>
      <div class="search-form-row">
        <template v-if="queryMode === 'hour'">
          <span class="form-label-sm">开始时间</span>
          <div class="time-combo">
            <input type="date" v-model="hourStartDate">
            <span class="combo-sep"></span>
            <select v-model="hourStartHour">
              <option v-for="h in 24" :key="h-1" :value="h-1">{{ String(h-1).padStart(2,'0') }}:00</option>
            </select>
          </div>
          <span class="form-label-sm">结束时间</span>
          <div class="time-combo">
            <input type="date" v-model="hourEndDate">
            <span class="combo-sep"></span>
            <select v-model="hourEndHour">
              <option v-for="h in 24" :key="h-1" :value="h-1">{{ String(h-1).padStart(2,'0') }}:00</option>
            </select>
          </div>
        </template>
        <template v-else>
          <span class="form-label-sm">开始日期</span>
          <div class="time-combo">
            <input type="date" v-model="dayStartDate">
          </div>
          <span class="form-label-sm">结束日期</span>
          <div class="time-combo">
            <input type="date" v-model="dayEndDate">
          </div>
        </template>
        <button class="btn-search" :class="{ loading: isLoading }" :disabled="isLoading" @click="handleQuery">
          <i class="bi" :class="isLoading ? 'bi-arrow-repeat spin' : 'bi-search'"></i>
          {{ isLoading ? '查询中...' : '查询' }}
        </button>
      </div>
    </div>

    <!-- Chart.js 折线图 -->
    <div class="chart-card">
      <div class="chart-card-header" @click="chartCollapsed = !chartCollapsed" style="cursor:pointer;">
        <div class="chart-card-title">
          <i class="bi bi-graph-up-arrow"></i> 电能趋势
          <span class="chart-badge" v-if="chartData.length > 0">
            <i class="bi bi-dot"></i>{{ chartData.length }} 个数据点
          </span>
        </div>
        <i class="bi collapse-icon" :class="chartCollapsed ? 'bi-chevron-down' : 'bi-chevron-up'"></i>
      </div>
      <div class="chart-area" v-show="!chartCollapsed">
        <div v-if="chartData.length === 0 && !isLoading" class="chart-empty">
          <i class="bi bi-graph-up"></i>
          <p>暂无图表数据，请选择时间范围后查询</p>
        </div>
        <canvas ref="chartRef" v-show="chartData.length > 0"></canvas>
      </div>
    </div>

    <!-- 数据列表表格 -->
    <div class="table-card">
      <div class="workshop-table-header">
        <span class="workshop-table-title"><i class="bi bi-table"></i> 数据列表</span>
        <span class="table-count" v-if="pagination.total > 0">
          <i class="bi bi-database"></i> 共 {{ pagination.total }} 条记录
        </span>
      </div>
      <table class="data-table">
        <thead>
          <tr>
            <th style="width:50px">序号</th>
            <th>设备ID</th>
            <th>部门车间</th>
            <th>名称</th>
            <th>电能度数</th>
            <th>时间</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="tableData.length === 0">
            <td colspan="6" class="empty-cell">
              <div class="empty-state-mini">
                <i class="bi bi-inbox"></i>
                <p>暂无数据</p>
              </div>
            </td>
          </tr>
          <tr v-for="(row, idx) in tableData" :key="idx" :class="{ 'row-even': idx % 2 === 1 }">
            <td class="td-index">{{ (pagination.current - 1) * pageSize + idx + 1 }}</td>
            <td class="td-device">{{ row.deviceId }}</td>
            <td><span class="td-workshop">{{ row.workshop }}</span></td>
            <td class="td-name"><i class="bi bi-cpu"></i>{{ row.name }}</td>
            <td class="td-energy">{{ formatNumber(row.electricEnergy) }}</td>
            <td class="td-time">{{ formatDateTime(row.updateTime) }}</td>
          </tr>
        </tbody>
      </table>
      <div class="table-pagination" v-if="pagination.total > 0">
        <span class="page-info">第 {{ pagination.current }} / {{ pagination.pages }} 页</span>
        <div class="page-btns">
          <button class="page-btn" :disabled="pagination.current <= 1" @click="goPage(1)" title="首页">
            <i class="bi bi-chevron-double-left"></i>
          </button>
          <button class="page-btn" :disabled="pagination.current <= 1" @click="goPage(pagination.current - 1)">
            <i class="bi bi-chevron-left"></i>
          </button>
          <button
            v-for="p in visiblePages"
            :key="p"
            class="page-btn"
            :class="{ active: p === pagination.current }"
            @click="goPage(p)"
          >{{ p }}</button>
          <button class="page-btn" :disabled="pagination.current >= pagination.pages" @click="goPage(pagination.current + 1)">
            <i class="bi bi-chevron-right"></i>
          </button>
          <button class="page-btn" :disabled="pagination.current >= pagination.pages" @click="goPage(pagination.pages)" title="末页">
            <i class="bi bi-chevron-double-right"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
/**
 * 分页总页数计算（导出供属性测试使用）
 * @param {number} total - 总条数
 * @param {number} pageSize - 每页条数
 * @returns {number} 总页数
 */
export function calcTotalPages(total, pageSize) {
  if (total <= 0) return 0
  return Math.ceil(total / pageSize)
}
</script>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import Chart from 'chart.js/auto'
import { getWorkshopApi } from '@/api/workshopMap'
import '@/styles/desktop/workshop.css'

const route = useRoute()

// 车间配置（从路由 meta 读取）
const workshopTitle = computed(() => route.meta?.title || '')
const workshopName = computed(() => route.meta?.workshop || '')
const api = computed(() => getWorkshopApi(route.meta?.apiBase))

// 统计卡片数据
const statistics = ref({ totalDevices: 0, totalElectricEnergy: 0 })
const energyConsumption = ref(0)

// 查询模式
const queryMode = ref('hour')

// 小时模式时间
const now = new Date()
const todayStr = formatDateStr(now)
const weekAgoStr = formatDateStr(new Date(now.getTime() - 7 * 24 * 3600 * 1000))
const monthAgoStr = formatDateStr(new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()))

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

// 日模式时间
const dayStartDate = ref(weekAgoStr)
const dayEndDate = ref(todayStr)

// 图表
const chartCollapsed = ref(false)
const chartRef = ref(null)
let chartInstance = null
const chartData = ref([])

// 表格数据
const tableData = ref([])
const pagination = ref({ current: 1, total: 0, pages: 0 })
const pageSize = 20
const isLoading = ref(false)

// 格式化数字
function formatNumber(val) {
  if (val == null) return '0.00'
  return Number(val).toFixed(2)
}

// 格式化ISO时间戳为可读格式
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

// 格式化日期为 yyyy-MM-dd
function formatDateStr(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

// 构造时间参数 yyyy-MM-dd HH:mm:ss
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

// 加载统计卡片（totalElectricEnergy）
async function loadStatistics() {
  if (!api.value) return
  const { startTime, endTime } = buildTimeRange()
  try {
    const data = await api.value.getStatistics({ workshop: workshopName.value, startTime, endTime })
    statistics.value = {
      totalDevices: data?.totalDevices || 0,
      totalElectricEnergy: data?.totalElectricEnergy || 0
    }
  } catch (err) {
    console.error('获取统计数据失败:', err)
    statistics.value = { totalDevices: 0, totalElectricEnergy: 0 }
  }
}

// 加载电能消耗（独立接口，与老前端一致）
async function loadEnergyConsumption() {
  if (!api.value) return
  const { startTime, endTime } = buildTimeRange()
  try {
    const val = await api.value.getEnergyConsumption({ startTime, endTime, mode: queryMode.value })
    energyConsumption.value = (val != null && !isNaN(Number(val))) ? Number(val) : 0
  } catch (err) {
    console.error('获取电能消耗失败:', err)
    energyConsumption.value = 0
  }
}

// 加载图表数据
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
    console.error('获取图表数据失败:', err)
    chartData.value = []
  }
}

// 加载表格数据
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
    console.error('获取表格数据失败:', err)
    tableData.value = []
    pagination.value = { current: 1, total: 0, pages: 0 }
  }
}

// 分页跳转
function goPage(page) {
  if (page < 1 || page > pagination.value.pages) return
  loadTableData(page)
}

// 可见页码
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

// 格式化ISO时间戳为简短标签
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

// 渲染折线图
function destroyChart() {
  if (chartInstance) { chartInstance.destroy(); chartInstance = null }
}

function renderChart() {
  if (!chartRef.value || chartData.value.length === 0) {
    destroyChart()
    return
  }

  const isHour = queryMode.value === 'hour'
  const labels = chartData.value.map(d => formatTimeLabel(isHour ? d.hour : d.day, isHour))
  const values = chartData.value.map(d => d.energyConsumption)

  // 如果图表已存在，用 update 实现平滑过渡动画
  if (chartInstance) {
    chartInstance.data.labels = labels
    chartInstance.data.datasets[0].data = values
    chartInstance.update('default')
    return
  }

  // 创建渐变填充
  const ctx = chartRef.value.getContext('2d')
  const gradient = ctx.createLinearGradient(0, 0, 0, 340)
  gradient.addColorStop(0, 'rgba(59, 130, 246, 0.22)')
  gradient.addColorStop(0.6, 'rgba(59, 130, 246, 0.06)')
  gradient.addColorStop(1, 'rgba(59, 130, 246, 0)')

  // 十字准线插件
  const crosshairPlugin = {
    id: 'crosshair',
    afterDraw(chart) {
      const { ctx: c, tooltip, chartArea } = chart
      if (!tooltip || !tooltip.opacity) return
      const x = tooltip.caretX
      c.save()
      c.beginPath()
      c.setLineDash([4, 4])
      c.lineWidth = 1
      c.strokeStyle = 'rgba(59, 130, 246, 0.3)'
      c.moveTo(x, chartArea.top)
      c.lineTo(x, chartArea.bottom)
      c.stroke()
      c.restore()
    }
  }

  chartInstance = new Chart(chartRef.value, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: '电能消耗 (kWh)',
        data: values,
        borderColor: '#3b82f6',
        backgroundColor: gradient,
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointBackgroundColor: '#fff',
        pointBorderColor: '#3b82f6',
        pointBorderWidth: 2,
        pointHoverRadius: 7,
        pointHoverBackgroundColor: '#3b82f6',
        pointHoverBorderColor: '#fff',
        pointHoverBorderWidth: 3,
        borderWidth: 2.5,
        pointHitRadius: 24
      }]
    },
    plugins: [crosshairPlugin],
    options: {
      events: ['mousemove', 'mouseout', 'click', 'touchstart', 'touchmove'],
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 1200,
        easing: 'easeInOutQuart'
      },
      transitions: {
        default: {
          animation: {
            duration: 800,
            easing: 'easeInOutCubic'
          }
        }
      },
      interaction: {
        mode: 'index',
        intersect: false,
        axis: 'x'
      },
      hover: {
        mode: 'index',
        intersect: false,
        axis: 'x'
      },
      plugins: {
        legend: {
          display: true,
          position: 'top',
          align: 'end',
          labels: {
            boxWidth: 10,
            boxHeight: 10,
            borderRadius: 3,
            useBorderRadius: true,
            font: { size: 12, weight: '500' },
            color: '#64748b',
            padding: 16,
            usePointStyle: true,
            pointStyle: 'rectRounded'
          }
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          backgroundColor: '#fff',
          titleColor: '#1e293b',
          bodyColor: '#475569',
          titleFont: { size: 13, weight: '600' },
          bodyFont: { size: 13 },
          padding: { top: 10, bottom: 10, left: 14, right: 14 },
          cornerRadius: 10,
          borderColor: '#e2e8f0',
          borderWidth: 1,
          displayColors: true,
          boxWidth: 8,
          boxHeight: 8,
          boxPadding: 6,
          usePointStyle: true,
          titleAlign: 'center',
          bodyAlign: 'center',
          callbacks: {
            title: (items) => {
              if (!items.length) return []
              const idx = items[0].dataIndex
              const d = chartData.value[idx]
              if (!d) return []
              if (queryMode.value === 'hour' && d.hour) {
                const dt = new Date(d.hour)
                const y = dt.getFullYear()
                const mm = String(dt.getMonth() + 1).padStart(2, '0')
                const dd = String(dt.getDate()).padStart(2, '0')
                const hh = String(dt.getHours()).padStart(2, '0')
                const nextHh = String((dt.getHours() + 1) % 24).padStart(2, '0')
                return [`${y}-${mm}-${dd}`, `${hh}:00-${nextHh}:00 用电量`]
              }
              if (d.day) {
                const dt = new Date(d.day)
                const y = dt.getFullYear()
                const mm = String(dt.getMonth() + 1).padStart(2, '0')
                const dd = String(dt.getDate()).padStart(2, '0')
                return [`${y}-${mm}-${dd}`, '日用电量']
              }
              return [items[0].label]
            },
            label: (ctx) => {
              return ` ${workshopTitle.value}：${ctx.parsed.y.toFixed(2)} kWh`
            }
          }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: {
            font: { size: 10 },
            color: '#94a3b8',
            maxRotation: 45,
            autoSkip: true,
            maxTicksLimit: 20
          },
          border: { display: false }
        },
        y: {
          beginAtZero: true,
          grid: { color: '#f1f5f9', drawBorder: false },
          border: { display: false },
          ticks: {
            font: { size: 11 },
            color: '#94a3b8',
            padding: 8,
            callback: (val) => val.toLocaleString()
          },
          title: {
            display: true,
            text: 'kWh',
            color: '#94a3b8',
            font: { size: 11, weight: '500' },
            padding: { bottom: 4 }
          }
        }
      }
    }
  })
}

// 查询按钮
async function handleQuery() {
  isLoading.value = true
  try {
    await Promise.all([loadStatistics(), loadEnergyConsumption(), loadChartData(), loadTableData(1)])
  } finally {
    isLoading.value = false
  }
}

// 切换模式时自动查询
watch(queryMode, () => {
  handleQuery()
})

// 图表折叠/展开时重新渲染
watch(chartCollapsed, (collapsed) => {
  if (!collapsed) {
    nextTick(() => renderChart())
  }
})

// 监听路由变化（切换车间）
watch(() => route.meta, () => {
  handleQuery()
}, { deep: true })

// 初始加载
onMounted(() => {
  handleQuery()
})

onBeforeUnmount(() => {
  destroyChart()
})
</script>
