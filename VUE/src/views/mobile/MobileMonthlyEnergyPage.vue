<template>
  <MobileSubShell :title="mShellTitles.monthly" content-class="">
    <div class="me-page">
      <!-- 查询区域 -->
      <div class="me-query-card">
        <div class="me-query-row">
          <select v-model="selectedYear" class="me-query-select">
            <option v-for="y in yearOptions" :key="y" :value="y">{{ y }}年</option>
          </select>
          <select v-model="selectedMonth" class="me-query-select">
            <option v-for="m in 12" :key="m" :value="m">{{ String(m).padStart(2, '0') }}月</option>
          </select>
        </div>
        <div class="me-query-row">
          <button
            class="me-query-btn me-query-btn--search"
            :class="{ 'is-loading': loading }"
            :disabled="loading"
            @click="fetchData"
          >
            <i class="bi" :class="loading ? 'bi-arrow-repeat me-spin' : 'bi-search'"></i>
            {{ loading ? '查询中...' : '查询' }}
          </button>
          <button
            class="me-query-btn me-query-btn--export"
            :disabled="!statisticsData"
            @click="exportExcel"
          >
            <i class="bi bi-file-earmark-excel"></i> 导出
          </button>
        </div>
      </div>

      <!-- 汇总卡片 -->
      <div v-if="statisticsData" class="me-summary">
        <div class="me-summary-item">
          <div class="me-summary-item__value">{{ workshopCount }}</div>
          <div class="me-summary-item__label">监控车间</div>
        </div>
        <div class="me-summary-item">
          <div class="me-summary-item__value me-summary-item__value--orange">
            {{ formatTotal(statisticsData.monthlyTotal) }}<span class="me-summary-item__unit"> kWh</span>
          </div>
          <div class="me-summary-item__label">全月总能耗</div>
        </div>
        <div class="me-summary-item">
          <div class="me-summary-item__value me-summary-item__value--green">
            {{ formatTotal(dailyAvg) }}<span class="me-summary-item__unit"> kWh</span>
          </div>
          <div class="me-summary-item__label">日均能耗</div>
        </div>
      </div>

      <!-- 视图切换 -->
      <div v-if="statisticsData" class="me-view-switch">
        <button
          class="me-view-switch__btn"
          :class="{ 'is-active': viewMode === 'table' }"
          @click="viewMode = 'table'"
        >
          <i class="bi bi-table"></i> 表格视图
        </button>
        <button
          class="me-view-switch__btn"
          :class="{ 'is-active': viewMode === 'card' }"
          @click="viewMode = 'card'"
        >
          <i class="bi bi-grid-3x2-gap"></i> 卡片视图
        </button>
      </div>

      <!-- 图例 -->
      <div v-if="statisticsData" class="me-legend">
        <div class="me-legend-item"><span class="me-legend-dot me-legend-dot--normal"></span> 正常</div>
        <div class="me-legend-item"><span class="me-legend-dot me-legend-dot--high"></span> &gt;2000 kWh</div>
        <div class="me-legend-item"><span class="me-legend-dot me-legend-dot--very-high"></span> &gt;4000 kWh</div>
      </div>

      <!-- ========== 表格视图 ========== -->
      <div v-if="statisticsData && viewMode === 'table'" class="me-table-section">
        <div class="me-table-hint">
          <i class="bi bi-hand-index"></i> 左右滑动查看完整数据
        </div>
        <div class="me-table-scroll">
          <table class="me-table">
            <thead>
              <tr>
                <th>车间</th>
                <th v-for="d in statisticsData.daysInMonth" :key="d">
                  {{ String(d).padStart(2, '0') }}
                </th>
                <th class="me-col-total">合计</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="workshop in statisticsData.workshopList" :key="workshop">
                <td>{{ workshop }}</td>
                <td
                  v-for="d in statisticsData.daysInMonth"
                  :key="d"
                  :class="getEnergyCellClass(statisticsData.workshopDailyData[workshop]?.[d - 1] ?? 0)"
                >
                  {{ formatNumber(statisticsData.workshopDailyData[workshop]?.[d - 1]) }}
                </td>
                <td class="me-col-total">
                  {{ formatNumber(statisticsData.workshopMonthlyTotal[workshop]) }}
                </td>
              </tr>
              <!-- 合计行 -->
              <tr class="me-row-total">
                <td>合计</td>
                <td v-for="d in statisticsData.daysInMonth" :key="d">
                  {{ formatNumber(statisticsData.dailyTotal[d - 1]) }}
                </td>
                <td class="me-col-total">
                  {{ formatNumber(statisticsData.monthlyTotal) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ========== 卡片视图 ========== -->
      <div v-if="statisticsData && viewMode === 'card'" class="me-card-list">
        <div
          v-for="workshop in statisticsData.workshopList"
          :key="workshop"
          class="me-workshop-card"
        >
          <div class="me-workshop-card__head">
            <div class="me-workshop-card__name">
              <i class="bi bi-lightning-charge-fill"></i> {{ workshop }}
            </div>
            <div class="me-workshop-card__total">
              <div class="me-workshop-card__total-value">
                {{ formatTotal(statisticsData.workshopMonthlyTotal[workshop]) }}
                <span class="me-workshop-card__total-unit">kWh</span>
              </div>
              <div class="me-workshop-card__total-label">月度合计</div>
            </div>
          </div>
          <div class="me-workshop-card__body">
            <div class="me-day-grid">
              <div
                v-for="d in statisticsData.daysInMonth"
                :key="d"
                class="me-day-cell"
                :class="getDayCellClass(statisticsData.workshopDailyData[workshop]?.[d - 1] ?? 0)"
              >
                <div class="me-day-cell__day">{{ String(d).padStart(2, '0') }}</div>
                <div class="me-day-cell__val">
                  {{ formatDayVal(statisticsData.workshopDailyData[workshop]?.[d - 1]) }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="!statisticsData && !loading" class="me-empty">
        <i class="bi bi-inbox"></i>
        <span>暂无数据</span>
        <p>请选择年月后点击查询</p>
      </div>
    </div>
  </MobileSubShell>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import MobileSubShell from '@/components/MobileSubShell.vue'
import { mShellTitles } from '@/views/mobile/mobileUiStrings'
import { getMonthlyStatistics } from '@/api/monthlyEnergy'
import '@/styles/mobile/mobile-monthly-energy.css'

const now = new Date()
const currentYear = now.getFullYear()
const selectedYear = ref(currentYear)
const selectedMonth = ref(now.getMonth() + 1)
const statisticsData = ref(null)
const loading = ref(false)
const viewMode = ref('table')

const yearOptions = []
for (let y = currentYear - 2; y <= currentYear + 1; y++) {
  yearOptions.push(y)
}

const workshopCount = computed(() => {
  return statisticsData.value?.workshopList?.length ?? 0
})

const dailyAvg = computed(() => {
  if (!statisticsData.value) return 0
  const total = statisticsData.value.monthlyTotal ?? 0
  const days = statisticsData.value.daysInMonth ?? 1
  return total / days
})

function formatNumber(val) {
  if (val == null || Number(val) === 0) return '-'
  return Number(val).toFixed(2)
}

function formatTotal(val) {
  if (val == null || isNaN(val)) return '0'
  return Number(val).toLocaleString('zh-CN', { maximumFractionDigits: 0 })
}

function formatDayVal(val) {
  if (val == null || val === 0) return '-'
  return Math.round(val)
}

function getEnergyCellClass(value) {
  if (value > 4000) return 'me-very-high'
  if (value > 2000) return 'me-high'
  return ''
}

function getDayCellClass(value) {
  if (value > 4000) return 'me-day-cell--very-high'
  if (value > 2000) return 'me-day-cell--high'
  if (!value || value === 0) return 'me-day-cell--zero'
  return ''
}

async function fetchData() {
  loading.value = true
  try {
    statisticsData.value = await getMonthlyStatistics(selectedYear.value, selectedMonth.value)
  } catch (err) {
    console.error('获取月度能耗数据失败:', err)
    statisticsData.value = null
  } finally {
    loading.value = false
  }
}

function exportExcel() {
  if (!statisticsData.value) return
  const data = statisticsData.value

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

  xml += '<Worksheet ss:Name="月度能耗统计">\n<Table>\n'
  xml += '<Column ss:Width="90"/>\n'
  for (let i = 0; i < data.daysInMonth; i++) xml += '<Column ss:Width="45"/>\n'
  xml += '<Column ss:Width="100"/>\n'

  xml += `<Row ss:Height="30"><Cell ss:StyleID="Title" ss:MergeAcross="${data.daysInMonth + 1}"><Data ss:Type="String">${selectedYear.value}年${selectedMonth.value}月 月度能耗统计表</Data></Cell></Row>\n`
  xml += '<Row ss:Height="15"></Row>\n'

  xml += '<Row ss:Height="25">\n'
  xml += '<Cell ss:StyleID="Header"><Data ss:Type="String">车间</Data></Cell>\n'
  for (let i = 1; i <= data.daysInMonth; i++) {
    xml += `<Cell ss:StyleID="Header"><Data ss:Type="String">${i}日</Data></Cell>\n`
  }
  xml += '<Cell ss:StyleID="Header"><Data ss:Type="String">月度合计(kWh)</Data></Cell>\n'
  xml += '</Row>\n'

  for (const workshop of data.workshopList) {
    const dailyData = data.workshopDailyData[workshop] || []
    const monthlyTotal = data.workshopMonthlyTotal[workshop] || 0
    xml += '<Row ss:Height="22">\n'
    xml += `<Cell ss:StyleID="Workshop"><Data ss:Type="String">${esc(workshop)}</Data></Cell>\n`
    for (const value of dailyData) {
      if (value === 0) {
        xml += '<Cell ss:StyleID="Data"><Data ss:Type="String">-</Data></Cell>\n'
      } else {
        xml += `<Cell ss:StyleID="Data"><Data ss:Type="Number">${value.toFixed(2)}</Data></Cell>\n`
      }
    }
    xml += `<Cell ss:StyleID="Data"><Data ss:Type="Number">${monthlyTotal.toFixed(2)}</Data></Cell>\n`
    xml += '</Row>\n'
  }

  xml += '<Row ss:Height="25">\n'
  xml += '<Cell ss:StyleID="Total"><Data ss:Type="String">合计</Data></Cell>\n'
  for (const value of data.dailyTotal) {
    if (value === 0) {
      xml += '<Cell ss:StyleID="Total"><Data ss:Type="String">-</Data></Cell>\n'
    } else {
      xml += `<Cell ss:StyleID="Total"><Data ss:Type="Number">${value.toFixed(2)}</Data></Cell>\n`
    }
  }
  xml += `<Cell ss:StyleID="Total"><Data ss:Type="Number">${data.monthlyTotal.toFixed(2)}</Data></Cell>\n`
  xml += '</Row>\n'

  xml += '</Table>\n</Worksheet>\n</Workbook>'

  const blob = new Blob([xml], { type: 'application/vnd.ms-excel' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `月度能耗统计_${selectedYear.value}年${selectedMonth.value}月.xls`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

onMounted(() => {
  fetchData()
})
</script>
