<template>
  <MobileSubShell :title="mShellTitles.hourly" content-class="">
    <div class="he-page">
      <!-- 查询区域 -->
      <div class="he-query-card">
        <div class="he-query-row">
          <select v-model="selectedYear" class="he-query-select">
            <option v-for="y in yearOptions" :key="y" :value="y">{{ y }}年</option>
          </select>
          <select v-model="selectedMonth" class="he-query-select" @change="onMonthChange">
            <option v-for="m in 12" :key="m" :value="m">{{ String(m).padStart(2, '0') }}月</option>
          </select>
          <select v-model="selectedDay" class="he-query-select">
            <option v-for="d in daysInSelectedMonth" :key="d" :value="d">{{ String(d).padStart(2, '0') }}日</option>
          </select>
        </div>
        <div class="he-query-row">
          <button
            class="he-query-btn he-query-btn--search"
            :class="{ 'is-loading': loading }"
            :disabled="loading"
            @click="fetchData"
          >
            <i class="bi" :class="loading ? 'bi-arrow-repeat he-spin' : 'bi-search'"></i>
            {{ loading ? '查询中...' : '查询' }}
          </button>
          <button
            class="he-query-btn he-query-btn--export"
            :disabled="!statisticsData"
            @click="exportExcel"
          >
            <i class="bi bi-file-earmark-excel"></i> 导出
          </button>
        </div>
      </div>

      <!-- 汇总统计 -->
      <div v-if="statisticsData" class="he-summary">
        <div class="he-summary-item">
          <div class="he-summary-item__value">{{ workshopCount }}</div>
          <div class="he-summary-item__label">监控车间</div>
        </div>
        <div class="he-summary-item">
          <div class="he-summary-item__value he-summary-item__value--orange">
            {{ formatTotal(grandTotal) }}<span class="he-summary-item__unit"> kWh</span>
          </div>
          <div class="he-summary-item__label">当日总能耗</div>
        </div>
        <div class="he-summary-item">
          <div class="he-summary-item__value he-summary-item__value--green">
            {{ formatTotal(hourlyAvg) }}<span class="he-summary-item__unit"> kWh</span>
          </div>
          <div class="he-summary-item__label">每时均值</div>
        </div>
      </div>

      <!-- 视图切换 -->
      <div v-if="statisticsData" class="he-view-switch">
        <button
          class="he-view-switch__btn"
          :class="{ 'is-active': viewMode === 'table' }"
          @click="viewMode = 'table'"
        >
          <i class="bi bi-table"></i> 表格视图
        </button>
        <button
          class="he-view-switch__btn"
          :class="{ 'is-active': viewMode === 'card' }"
          @click="viewMode = 'card'"
        >
          <i class="bi bi-grid-3x2-gap"></i> 卡片视图
        </button>
      </div>

      <!-- 图例 -->
      <div v-if="statisticsData" class="he-legend">
        <div class="he-legend-item"><span class="he-legend-dot he-legend-dot--normal"></span> 正常</div>
        <div class="he-legend-item"><span class="he-legend-dot he-legend-dot--high"></span> &gt;200 kWh</div>
        <div class="he-legend-item"><span class="he-legend-dot he-legend-dot--very-high"></span> &gt;500 kWh</div>
      </div>

      <!-- ========== 表格视图 ========== -->
      <div v-if="statisticsData && viewMode === 'table'" class="he-table-section">
        <div class="he-table-hint">
          <i class="bi bi-hand-index"></i> 左右滑动查看24小时数据
        </div>
        <div class="he-table-scroll">
          <table class="he-table">
            <thead>
              <tr>
                <th>车间</th>
                <th v-for="(label, idx) in hourLabels" :key="idx">
                  {{ label }}<span v-if="idx >= nextDayIndexStart" class="he-next-day">次日</span>
                </th>
                <th class="he-col-total">合计</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="workshop in statisticsData.workshopList" :key="workshop">
                <td>{{ workshop }}</td>
                <td
                  v-for="(label, idx) in hourLabels"
                  :key="idx"
                  :class="getEnergyCellClass(statisticsData.workshopHourlyData[workshop]?.[idx] ?? 0)"
                >
                  {{ formatNumber(statisticsData.workshopHourlyData[workshop]?.[idx]) }}
                </td>
                <td class="he-col-total">
                  {{ formatNumber(calcDailyTotal(statisticsData.workshopHourlyData[workshop])) }}
                </td>
              </tr>
              <!-- 合计行 -->
              <tr class="he-row-total">
                <td>合计</td>
                <td v-for="(label, idx) in hourLabels" :key="idx">
                  {{ formatNumber(statisticsData.hourlyTotal[idx]) }}
                </td>
                <td class="he-col-total">
                  {{ formatNumber(calcDailyTotal(statisticsData.hourlyTotal)) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ========== 卡片视图 ========== -->
      <div v-if="statisticsData && viewMode === 'card'" class="he-card-list">
        <div
          v-for="workshop in statisticsData.workshopList"
          :key="workshop"
          class="he-workshop-card"
        >
          <div class="he-workshop-card__head">
            <div class="he-workshop-card__name">
              <i class="bi bi-lightning-charge-fill"></i> {{ workshop }}
            </div>
            <div class="he-workshop-card__total">
              <div class="he-workshop-card__total-value">
                {{ formatTotal(calcDailyTotal(statisticsData.workshopHourlyData[workshop])) }}
                <span class="he-workshop-card__total-unit">kWh</span>
              </div>
              <div class="he-workshop-card__total-label">日合计</div>
            </div>
          </div>
          <div class="he-workshop-card__body">
            <!-- 当日时段 07:00~23:00 (索引0~16) -->
            <div class="he-period-label"><i class="bi bi-sun"></i> 当日 07:00 - 23:00</div>
            <div class="he-hour-grid">
              <div
                v-for="idx in 17"
                :key="'d' + idx"
                class="he-hour-cell"
                :class="getHourCellClass(statisticsData.workshopHourlyData[workshop]?.[idx - 1] ?? 0)"
              >
                <div class="he-hour-cell__time">{{ hourLabels[idx - 1] }}</div>
                <div class="he-hour-cell__val">
                  {{ formatHourVal(statisticsData.workshopHourlyData[workshop]?.[idx - 1]) }}
                </div>
              </div>
            </div>
            <!-- 次日时段 23:00~07:00 (索引17~23) -->
            <div class="he-period-label"><i class="bi bi-moon"></i> 次日 23:00 - 07:00</div>
            <div class="he-hour-grid">
              <div
                v-for="idx in 7"
                :key="'n' + idx"
                class="he-hour-cell"
                :class="getHourCellClass(statisticsData.workshopHourlyData[workshop]?.[16 + idx] ?? 0)"
              >
                <div class="he-hour-cell__time">{{ hourLabels[16 + idx] }}</div>
                <div class="he-hour-cell__val">
                  {{ formatHourVal(statisticsData.workshopHourlyData[workshop]?.[16 + idx]) }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="!statisticsData && !loading" class="he-empty">
        <i class="bi bi-inbox"></i>
        <span>暂无数据</span>
        <p>请选择日期后点击查询</p>
      </div>
    </div>
  </MobileSubShell>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import MobileSubShell from '@/components/MobileSubShell.vue'
import { mShellTitles } from '@/views/mobile/mobileUiStrings'
import { getHourlyStatistics } from '@/api/hourlyEnergy'
import '@/styles/mobile/mobile-hourly-energy.css'

const hourLabels = [
  '7:00-8:00', '8:00-9:00', '9:00-10:00', '10:00-11:00',
  '11:00-12:00', '12:00-13:00', '13:00-14:00', '14:00-15:00',
  '15:00-16:00', '16:00-17:00', '17:00-18:00', '18:00-19:00',
  '19:00-20:00', '20:00-21:00', '21:00-22:00', '22:00-23:00',
  '23:00-0:00',
  '0:00-1:00', '1:00-2:00', '2:00-3:00', '3:00-4:00',
  '4:00-5:00', '5:00-6:00', '6:00-7:00'
]

const nextDayIndexStart = 17

const now = new Date()
const currentYear = now.getFullYear()
const selectedYear = ref(currentYear)
const selectedMonth = ref(now.getMonth() + 1)
const selectedDay = ref(now.getDate())
const statisticsData = ref(null)
const loading = ref(false)
const viewMode = ref('table')

const yearOptions = []
for (let y = currentYear - 2; y <= currentYear + 1; y++) {
  yearOptions.push(y)
}

const daysInSelectedMonth = computed(() => {
  return new Date(selectedYear.value, selectedMonth.value, 0).getDate()
})

const workshopCount = computed(() => {
  return statisticsData.value?.workshopList?.length ?? 0
})

const grandTotal = computed(() => {
  if (!statisticsData.value?.hourlyTotal) return 0
  return statisticsData.value.hourlyTotal.reduce((s, v) => s + (Number(v) || 0), 0)
})

const hourlyAvg = computed(() => {
  return grandTotal.value / 24
})

function onMonthChange() {
  const maxDay = daysInSelectedMonth.value
  if (selectedDay.value > maxDay) {
    selectedDay.value = maxDay
  }
}

function formatNumber(val) {
  if (val == null || Number(val) === 0) return '-'
  return Number(val).toFixed(2)
}

function formatTotal(val) {
  if (val == null || isNaN(val)) return '0'
  return Number(val).toLocaleString('zh-CN', { maximumFractionDigits: 0 })
}

function formatHourVal(val) {
  if (val == null || val === 0) return '-'
  return Math.round(val)
}

function getEnergyCellClass(value) {
  if (value > 500) return 'he-very-high'
  if (value > 200) return 'he-high'
  return ''
}

function getHourCellClass(value) {
  if (value > 500) return 'he-hour-cell--very-high'
  if (value > 200) return 'he-hour-cell--high'
  if (!value || value === 0) return 'he-hour-cell--zero'
  return ''
}

function calcDailyTotal(hourlyArr) {
  if (!hourlyArr || !Array.isArray(hourlyArr)) return 0
  return hourlyArr.reduce((sum, v) => sum + (Number(v) || 0), 0)
}

async function fetchData() {
  loading.value = true
  try {
    statisticsData.value = await getHourlyStatistics(
      selectedYear.value,
      selectedMonth.value,
      selectedDay.value
    )
  } catch (err) {
    console.error('获取日能耗数据失败:', err)
    statisticsData.value = null
  } finally {
    loading.value = false
  }
}

function exportExcel() {
  if (!statisticsData.value) return
  const data = statisticsData.value

  const HOURS = [
    '07:00-08:00', '08:00-09:00', '09:00-10:00', '10:00-11:00',
    '11:00-12:00', '12:00-13:00', '13:00-14:00', '14:00-15:00',
    '15:00-16:00', '16:00-17:00', '17:00-18:00', '18:00-19:00',
    '19:00-20:00', '20:00-21:00', '21:00-22:00', '22:00-23:00',
    '23:00-00:00'
  ]
  const NEXT_DAY_HOURS = [
    '00:00-01:00', '01:00-02:00', '02:00-03:00', '03:00-04:00',
    '04:00-05:00', '05:00-06:00', '06:00-07:00'
  ]
  const allHours = [...HOURS, ...NEXT_DAY_HOURS]

  function esc(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;')
  }

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
  xml += '<?mso-application progid="Excel.Sheet"?>\n'
  xml += '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"\n'
  xml += '  xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">\n'
  xml += '<Styles>\n'
  xml += '<Style ss:ID="Default" ss:Name="Normal"><Alignment ss:Vertical="Center"/></Style>\n'
  xml += '<Style ss:ID="Title"><Font ss:Bold="1" ss:Size="16" ss:Color="#FFFFFF"/><Interior ss:Color="#4472C4" ss:Pattern="Solid"/><Alignment ss:Horizontal="Center" ss:Vertical="Center"/></Style>\n'
  xml += '<Style ss:ID="Header"><Font ss:Bold="1" ss:Size="11" ss:Color="#FFFFFF"/><Interior ss:Color="#5B9BD5" ss:Pattern="Solid"/><Alignment ss:Horizontal="Center" ss:Vertical="Center"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1"/><Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1"/><Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1"/><Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1"/></Borders></Style>\n'
  xml += '<Style ss:ID="Workshop"><Font ss:Bold="1" ss:Size="10"/><Interior ss:Color="#E2EFDA" ss:Pattern="Solid"/><Alignment ss:Horizontal="Left" ss:Vertical="Center"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D9D9D9"/><Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D9D9D9"/><Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D9D9D9"/><Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D9D9D9"/></Borders></Style>\n'
  xml += '<Style ss:ID="Data"><Font ss:Size="10"/><Alignment ss:Horizontal="Center" ss:Vertical="Center"/><NumberFormat ss:Format="#,##0.00"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D9D9D9"/><Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D9D9D9"/><Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D9D9D9"/><Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D9D9D9"/></Borders></Style>\n'
  xml += '<Style ss:ID="Total"><Font ss:Bold="1" ss:Size="11" ss:Color="#FFFFFF"/><Interior ss:Color="#ED7D31" ss:Pattern="Solid"/><Alignment ss:Horizontal="Center" ss:Vertical="Center"/><NumberFormat ss:Format="#,##0.00"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1"/><Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1"/><Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1"/><Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1"/></Borders></Style>\n'
  xml += '</Styles>\n'

  xml += '<Worksheet ss:Name="日能耗统计">\n<Table>\n'
  xml += '<Column ss:Width="90"/>\n'
  for (let i = 0; i < allHours.length; i++) xml += '<Column ss:Width="75"/>\n'
  xml += '<Column ss:Width="100"/>\n'

  xml += `<Row ss:Height="30"><Cell ss:StyleID="Title" ss:MergeAcross="${allHours.length + 1}"><Data ss:Type="String">${selectedYear.value}年${selectedMonth.value}月${selectedDay.value}日 日能耗统计表</Data></Cell></Row>\n`
  xml += '<Row ss:Height="15"></Row>\n'

  xml += '<Row ss:Height="25">\n'
  xml += '<Cell ss:StyleID="Header"><Data ss:Type="String">车间</Data></Cell>\n'
  for (const h of HOURS) xml += `<Cell ss:StyleID="Header"><Data ss:Type="String">${h}</Data></Cell>\n`
  for (const h of NEXT_DAY_HOURS) xml += `<Cell ss:StyleID="Header"><Data ss:Type="String">${h}(次日)</Data></Cell>\n`
  xml += '<Cell ss:StyleID="Header"><Data ss:Type="String">日合计(kWh)</Data></Cell>\n'
  xml += '</Row>\n'

  for (const workshop of data.workshopList) {
    const hourlyData = data.workshopHourlyData[workshop] || []
    const dailyTotal = hourlyData.reduce((sum, val) => sum + (Number(val) || 0), 0)
    xml += '<Row ss:Height="22">\n'
    xml += `<Cell ss:StyleID="Workshop"><Data ss:Type="String">${esc(workshop)}</Data></Cell>\n`
    for (const value of hourlyData) {
      if (value === 0) {
        xml += '<Cell ss:StyleID="Data"><Data ss:Type="String">-</Data></Cell>\n'
      } else {
        xml += `<Cell ss:StyleID="Data"><Data ss:Type="Number">${Number(value).toFixed(2)}</Data></Cell>\n`
      }
    }
    xml += `<Cell ss:StyleID="Data"><Data ss:Type="Number">${dailyTotal.toFixed(2)}</Data></Cell>\n`
    xml += '</Row>\n'
  }

  const hourlyTotal = data.hourlyTotal || []
  const totalSum = hourlyTotal.reduce((sum, val) => sum + (Number(val) || 0), 0)
  xml += '<Row ss:Height="25">\n'
  xml += '<Cell ss:StyleID="Total"><Data ss:Type="String">合计</Data></Cell>\n'
  for (const value of hourlyTotal) {
    if (value === 0) {
      xml += '<Cell ss:StyleID="Total"><Data ss:Type="String">-</Data></Cell>\n'
    } else {
      xml += `<Cell ss:StyleID="Total"><Data ss:Type="Number">${Number(value).toFixed(2)}</Data></Cell>\n`
    }
  }
  xml += `<Cell ss:StyleID="Total"><Data ss:Type="Number">${totalSum.toFixed(2)}</Data></Cell>\n`
  xml += '</Row>\n'

  xml += '</Table>\n</Worksheet>\n</Workbook>'

  const blob = new Blob([xml], { type: 'application/vnd.ms-excel' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `日能耗统计_${selectedYear.value}年${selectedMonth.value}月${selectedDay.value}日.xls`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

onMounted(() => {
  fetchData()
})
</script>
