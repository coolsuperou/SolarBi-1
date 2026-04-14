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
      <button class="btn btn-query" :class="{ loading: loading }" :disabled="loading" @click="fetchData">
        <i class="bi" :class="loading ? 'bi-arrow-repeat spin' : 'bi-search'"></i>
        {{ loading ? '查询中...' : '查询' }}
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
import '@/styles/desktop/monthly-energy.css'

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

  xml += '<Worksheet ss:Name="月度能耗统计">\n<Table>\n'
  xml += '<Column ss:Width="90"/>\n'
  for (let i = 0; i < data.daysInMonth; i++) xml += '<Column ss:Width="45"/>\n'
  xml += '<Column ss:Width="100"/>\n'

  // 标题
  xml += `<Row ss:Height="30"><Cell ss:StyleID="Title" ss:MergeAcross="${data.daysInMonth + 1}"><Data ss:Type="String">${selectedYear.value}年${selectedMonth.value}月 月度能耗统计表</Data></Cell></Row>\n`
  xml += '<Row ss:Height="15"></Row>\n'

  // 表头
  xml += '<Row ss:Height="25">\n'
  xml += '<Cell ss:StyleID="Header"><Data ss:Type="String">车间</Data></Cell>\n'
  for (let i = 1; i <= data.daysInMonth; i++) {
    xml += `<Cell ss:StyleID="Header"><Data ss:Type="String">${i}日</Data></Cell>\n`
  }
  xml += '<Cell ss:StyleID="Header"><Data ss:Type="String">月度合计(kWh)</Data></Cell>\n'
  xml += '</Row>\n'

  // 数据行
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

  // 合计行
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
