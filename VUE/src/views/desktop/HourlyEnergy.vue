<template>
  <div class="hourly-energy-page">
    <!-- 查询操作栏 -->
    <div class="hourly-toolbar">
      <select v-model="selectedYear">
        <option v-for="y in yearOptions" :key="y" :value="y">{{ y }}年</option>
      </select>
      <select v-model="selectedMonth" @change="onMonthChange">
        <option v-for="m in 12" :key="m" :value="m">{{ String(m).padStart(2, '0') }}月</option>
      </select>
      <select v-model="selectedDay">
        <option v-for="d in daysInSelectedMonth" :key="d" :value="d">{{ String(d).padStart(2, '0') }}日</option>
      </select>
      <button class="btn btn-query" :class="{ loading: loading }" :disabled="loading" @click="fetchData">
        <i class="bi" :class="loading ? 'bi-arrow-repeat spin' : 'bi-search'"></i>
        {{ loading ? '查询中...' : '查询' }}
      </button>
      <button class="btn btn-export" @click="exportExcel" :disabled="!statisticsData">
        <i class="bi bi-download"></i> 导出Excel
      </button>
    </div>

    <!-- 宽表格 -->
    <div class="hourly-table-wrapper" v-if="statisticsData">
      <div class="hourly-table-scroll">
        <table class="hourly-table">
          <thead>
            <tr>
              <th>车间名称</th>
              <th v-for="(label, idx) in hourLabels" :key="label">
                {{ label }}<br v-if="idx >= nextDayIndexStart"><span v-if="idx >= nextDayIndexStart" class="next-day-tag">次日</span>
              </th>
              <th class="col-total">日合计</th>
            </tr>
          </thead>
          <tbody>
            <!-- 车间数据行 -->
            <tr v-for="workshop in statisticsData.workshopList" :key="workshop">
              <td>{{ workshop }}</td>
              <td
                v-for="(label, idx) in hourLabels"
                :key="label"
                :class="getHourlyEnergyClass(statisticsData.workshopHourlyData[workshop]?.[idx] ?? 0)"
              >
                {{ formatNumber(statisticsData.workshopHourlyData[workshop]?.[idx]) }}
              </td>
              <td class="col-total">
                {{ formatNumber(calcDailyTotal(statisticsData.workshopHourlyData[workshop])) }}
              </td>
            </tr>
            <!-- 底部合计行 -->
            <tr class="row-total">
              <td>合计</td>
              <td v-for="(label, idx) in hourLabels" :key="label">
                {{ formatNumber(statisticsData.hourlyTotal[idx]) }}
              </td>
              <td class="col-total">
                {{ formatNumber(calcDailyTotal(statisticsData.hourlyTotal)) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 暂无数据 -->
    <div v-else-if="!loading" class="hourly-table-wrapper">
      <div class="hourly-empty">暂无数据</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getHourlyStatistics } from '@/api/hourlyEnergy'
import '@/styles/desktop/hourly-energy.css'

// 24小时标签：07:00~次日07:00 时间段格式
const hourLabels = [
  '07:00-08:00', '08:00-09:00', '09:00-10:00', '10:00-11:00',
  '11:00-12:00', '12:00-13:00', '13:00-14:00', '14:00-15:00',
  '15:00-16:00', '16:00-17:00', '17:00-18:00', '18:00-19:00',
  '19:00-20:00', '20:00-21:00', '21:00-22:00', '22:00-23:00',
  '23:00-00:00',
  '00:00-01:00', '01:00-02:00', '02:00-03:00', '03:00-04:00',
  '04:00-05:00', '05:00-06:00', '06:00-07:00'
]
// 次日标记的索引（23:00之后的7个时间段）
const nextDayIndexStart = 17

const now = new Date()
const currentYear = now.getFullYear()
const selectedYear = ref(currentYear)
const selectedMonth = ref(now.getMonth() + 1)
const selectedDay = ref(now.getDate())
const statisticsData = ref(null)
const loading = ref(false)

// 年份选项：前2年 ~ 后1年
const yearOptions = []
for (let y = currentYear - 2; y <= currentYear + 1; y++) {
  yearOptions.push(y)
}

// 当前选中年月的天数
const daysInSelectedMonth = computed(() => {
  return new Date(selectedYear.value, selectedMonth.value, 0).getDate()
})

// 月份变化时，修正日期不超过该月最大天数
function onMonthChange() {
  const maxDay = daysInSelectedMonth.value
  if (selectedDay.value > maxDay) {
    selectedDay.value = maxDay
  }
}

function formatNumber(val) {
  if (val == null) return '-'
  return Number(val).toFixed(2)
}

/**
 * 小时用电量颜色标记
 * @param {number} value - 用电量数值
 * @returns {string} CSS 类名
 */
function getHourlyEnergyClass(value) {
  if (value > 500) return 'very-high'
  if (value > 200) return 'high'
  return ''
}

/**
 * 计算日合计：24小时数据之和
 * @param {Array<number>} hourlyArr - 24个元素的数组
 * @returns {number}
 */
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

  // 与原版React一致的小时标签
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

  // 样式
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

  // 标题
  xml += `<Row ss:Height="30"><Cell ss:StyleID="Title" ss:MergeAcross="${allHours.length + 1}"><Data ss:Type="String">${selectedYear.value}年${selectedMonth.value}月${selectedDay.value}日 日能耗统计表</Data></Cell></Row>\n`
  xml += '<Row ss:Height="15"></Row>\n'

  // 表头
  xml += '<Row ss:Height="25">\n'
  xml += '<Cell ss:StyleID="Header"><Data ss:Type="String">车间</Data></Cell>\n'
  for (const h of HOURS) xml += `<Cell ss:StyleID="Header"><Data ss:Type="String">${h}</Data></Cell>\n`
  for (const h of NEXT_DAY_HOURS) xml += `<Cell ss:StyleID="Header"><Data ss:Type="String">${h}(次日)</Data></Cell>\n`
  xml += '<Cell ss:StyleID="Header"><Data ss:Type="String">日合计(kWh)</Data></Cell>\n'
  xml += '</Row>\n'

  // 数据行
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

  // 合计行
  const hourlyTotal = data.hourlyTotal || []
  const grandTotal = hourlyTotal.reduce((sum, val) => sum + (Number(val) || 0), 0)
  xml += '<Row ss:Height="25">\n'
  xml += '<Cell ss:StyleID="Total"><Data ss:Type="String">合计</Data></Cell>\n'
  for (const value of hourlyTotal) {
    if (value === 0) {
      xml += '<Cell ss:StyleID="Total"><Data ss:Type="String">-</Data></Cell>\n'
    } else {
      xml += `<Cell ss:StyleID="Total"><Data ss:Type="Number">${Number(value).toFixed(2)}</Data></Cell>\n`
    }
  }
  xml += `<Cell ss:StyleID="Total"><Data ss:Type="Number">${grandTotal.toFixed(2)}</Data></Cell>\n`
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
