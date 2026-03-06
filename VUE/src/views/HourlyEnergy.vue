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
      <button class="btn btn-query" @click="fetchData">
        <i class="bi bi-search"></i> 查询
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
              <th v-for="label in hourLabels" :key="label">{{ label }}</th>
              <th class="col-total">日合计</th>
            </tr>
          </thead>
          <tbody>
            <!-- 车间数据行 -->
            <tr v-for="workshop in statisticsData.workshopList" :key="workshop">
              <td>{{ workshop }}</td>
              <td v-for="(label, idx) in hourLabels" :key="label">
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
import '@/styles/hourly-energy.css'

// 24小时标签：07时~次日06时
const hourLabels = [
  '07时', '08时', '09时', '10时', '11时', '12时',
  '13时', '14时', '15时', '16时', '17时', '18时',
  '19时', '20时', '21时', '22时', '23时',
  '00时', '01时', '02时', '03时', '04时', '05时', '06时'
]

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
  const rows = []

  // 表头行
  const header = ['车间名称', ...hourLabels, '日合计']
  rows.push(header)

  // 车间数据行
  for (const workshop of data.workshopList) {
    const hourlyArr = data.workshopHourlyData[workshop] || []
    const row = [workshop]
    for (let i = 0; i < 24; i++) {
      row.push(hourlyArr[i] ?? '')
    }
    row.push(calcDailyTotal(hourlyArr))
    rows.push(row)
  }

  // 合计行
  const totalRow = ['合计']
  const hourlyTotal = data.hourlyTotal || []
  for (let i = 0; i < 24; i++) {
    totalRow.push(hourlyTotal[i] ?? '')
  }
  totalRow.push(calcDailyTotal(hourlyTotal))
  rows.push(totalRow)

  // 生成 CSV
  const csvContent = rows.map(row =>
    row.map(cell => {
      const str = String(cell)
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return '"' + str.replace(/"/g, '""') + '"'
      }
      return str
    }).join(',')
  ).join('\n')

  // BOM + CSV（支持中文）
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  const yStr = selectedYear.value
  const mStr = String(selectedMonth.value).padStart(2, '0')
  const dStr = String(selectedDay.value).padStart(2, '0')
  link.download = `日能耗统计_${yStr}年${mStr}月${dStr}日.csv`
  link.click()
  URL.revokeObjectURL(url)
}

onMounted(() => {
  fetchData()
})
</script>
