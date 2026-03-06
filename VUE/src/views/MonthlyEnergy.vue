<template>
  <div class="monthly-energy-page">
    <!-- 查询操作栏 -->
    <div class="monthly-toolbar">
      <select v-model="selectedYear">
        <option v-for="y in yearOptions" :key="y" :value="y">{{ y }}年</option>
      </select>
      <select v-model="selectedMonth">
        <option v-for="m in 12" :key="m" :value="m">{{ String(m).padStart(2, '0') }}月</option>
      </select>
      <button class="btn btn-query" @click="fetchData">
        <i class="bi bi-search"></i> 查询
      </button>
      <button class="btn btn-export" @click="exportExcel" :disabled="!statisticsData">
        <i class="bi bi-download"></i> 导出Excel
      </button>
    </div>

    <!-- 宽表格 -->
    <div class="wide-table-wrapper" v-if="statisticsData">
      <div class="wide-table-scroll">
        <table class="monthly-table">
          <thead>
            <tr>
              <th>车间名称</th>
              <th v-for="d in statisticsData.daysInMonth" :key="d">
                {{ String(d).padStart(2, '0') }}日
              </th>
              <th class="col-total">月度合计</th>
            </tr>
          </thead>
          <tbody>
            <!-- 车间数据行 -->
            <tr v-for="workshop in statisticsData.workshopList" :key="workshop">
              <td>{{ workshop }}</td>
              <td
                v-for="d in statisticsData.daysInMonth"
                :key="d"
                :class="getEnergyClass(statisticsData.workshopDailyData[workshop]?.[d - 1] ?? 0)"
              >
                {{ formatNumber(statisticsData.workshopDailyData[workshop]?.[d - 1]) }}
              </td>
              <td class="col-total">
                {{ formatNumber(statisticsData.workshopMonthlyTotal[workshop]) }}
              </td>
            </tr>
            <!-- 底部合计行 -->
            <tr class="row-total">
              <td>合计</td>
              <td v-for="d in statisticsData.daysInMonth" :key="d">
                {{ formatNumber(statisticsData.dailyTotal[d - 1]) }}
              </td>
              <td class="col-total">
                {{ formatNumber(statisticsData.monthlyTotal) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 暂无数据 -->
    <div v-else-if="!loading" class="wide-table-wrapper">
      <div class="monthly-empty">暂无数据</div>
    </div>
  </div>
</template>

<script>
/**
 * 用电量颜色标记函数
 * @param {number} value - 用电量数值
 * @returns {string} CSS 类名
 */
export function getEnergyClass(value) {
  if (value > 4000) return 'very-high'
  if (value > 2000) return 'high'
  return ''
}
</script>

<script setup>
import { ref, onMounted } from 'vue'
import { getMonthlyStatistics } from '@/api/monthlyEnergy'
import '@/styles/monthly-energy.css'

const now = new Date()
const currentYear = now.getFullYear()
const selectedYear = ref(currentYear)
const selectedMonth = ref(now.getMonth() + 1)
const statisticsData = ref(null)
const loading = ref(false)

// 年份选项：前2年 ~ 后1年
const yearOptions = []
for (let y = currentYear - 2; y <= currentYear + 1; y++) {
  yearOptions.push(y)
}

function formatNumber(val) {
  if (val == null) return '-'
  return Number(val).toFixed(2)
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
  const rows = []

  // 表头行
  const header = ['车间名称']
  for (let d = 1; d <= data.daysInMonth; d++) {
    header.push(String(d).padStart(2, '0') + '日')
  }
  header.push('月度合计')
  rows.push(header)

  // 车间数据行
  for (const workshop of data.workshopList) {
    const row = [workshop]
    for (let d = 0; d < data.daysInMonth; d++) {
      row.push(data.workshopDailyData[workshop]?.[d] ?? '')
    }
    row.push(data.workshopMonthlyTotal[workshop] ?? '')
    rows.push(row)
  }

  // 合计行
  const totalRow = ['合计']
  for (let d = 0; d < data.daysInMonth; d++) {
    totalRow.push(data.dailyTotal[d] ?? '')
  }
  totalRow.push(data.monthlyTotal ?? '')
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
  link.download = `月度能耗统计_${selectedYear.value}年${String(selectedMonth.value).padStart(2, '0')}月.csv`
  link.click()
  URL.revokeObjectURL(url)
}

onMounted(() => {
  fetchData()
})
</script>
