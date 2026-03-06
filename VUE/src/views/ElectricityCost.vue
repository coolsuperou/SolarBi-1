<template>
  <div class="electricity-cost-page">
    <!-- 查询操作栏 -->
    <div class="cost-toolbar">
      <select v-model="selectedYear">
        <option v-for="y in yearOptions" :key="y" :value="y">{{ y }}年</option>
      </select>
      <select v-model="selectedMonth">
        <option v-for="m in 12" :key="m" :value="m">{{ String(m).padStart(2, '0') }}月</option>
      </select>
      <select v-model="selectedMode">
        <option value="mode1">模式一（1-24日）</option>
        <option value="mode2">模式二（25-月末）</option>
        <option value="mode3">模式三（合并）</option>
      </select>
      <button class="btn btn-query" @click="calculate">
        <i class="bi bi-calculator"></i> 计算电费
      </button>
      <button class="btn btn-edit" @click="openEditModal">
        <i class="bi bi-pencil-square"></i> 编辑
      </button>
      <button class="btn btn-export" @click="exportExcel" :disabled="!costData">
        <i class="bi bi-download"></i> 导出
      </button>
    </div>

    <!-- 供电局数据卡片 -->
    <div class="power-supply-cards" v-if="costData">
      <!-- 1-24日数据 -->
      <div class="power-supply-card">
        <div class="card-title"><i class="bi bi-calendar-range"></i> 1-24日数据</div>
        <div class="data-row">
          <span class="data-label">供电局抄表数</span>
          <span class="data-value">{{ formatNumber(costData.powerSupplyData?.reading1To24) }}</span>
        </div>
        <div class="data-row">
          <span class="data-label">实际总金额</span>
          <span class="data-value highlight">¥{{ formatNumber(costData.powerSupplyData?.amount1To24) }}</span>
        </div>
        <div class="data-row">
          <span class="data-label">供电局平均单价</span>
          <span class="data-value">{{ formatPrice(costData.powerSupplyData?.unitPrice1To24) }}</span>
        </div>
        <div class="data-row">
          <span class="data-label">天石源电量</span>
          <span class="data-value">{{ formatNumber(selectedMode === 'mode3' ? costData.energy1To24 : costData.totalEnergy) }}</span>
        </div>
        <div class="data-row">
          <span class="data-label">内部平均单价</span>
          <span class="data-value">{{ formatPrice(selectedMode === 'mode3' ? costData.avgUnitPrice1To24 : costData.avgUnitPrice) }}</span>
        </div>
      </div>

      <!-- 25-月末数据 -->
      <div class="power-supply-card">
        <div class="card-title"><i class="bi bi-calendar-check"></i> 25-月末数据</div>
        <div class="data-row">
          <span class="data-label">供电局抄表数</span>
          <span class="data-value">{{ formatNumber(costData.powerSupplyData?.reading25ToEnd) }}</span>
        </div>
        <div class="data-row">
          <span class="data-label">实际总金额</span>
          <span class="data-value highlight">¥{{ formatNumber(costData.powerSupplyData?.amount25ToEnd) }}</span>
        </div>
        <div class="data-row">
          <span class="data-label">供电局平均单价</span>
          <span class="data-value">{{ formatPrice(costData.powerSupplyData?.unitPrice25ToEnd) }}</span>
        </div>
        <div class="data-row">
          <span class="data-label">天石源电量</span>
          <span class="data-value">{{ formatNumber(selectedMode === 'mode3' ? costData.energy25ToEnd : '-') }}</span>
        </div>
        <div class="data-row">
          <span class="data-label">内部平均单价</span>
          <span class="data-value">{{ formatPrice(selectedMode === 'mode3' ? costData.avgUnitPrice25ToEnd : '-') }}</span>
        </div>
      </div>

      <!-- 月度合计 -->
      <div class="power-supply-card card-summary">
        <div class="card-title"><i class="bi bi-bar-chart-line"></i> 月度合计</div>
        <div class="data-row">
          <span class="data-label">供电局抄表数</span>
          <span class="data-value">{{ formatNumber((costData.powerSupplyData?.reading1To24 ?? 0) + (costData.powerSupplyData?.reading25ToEnd ?? 0)) }}</span>
        </div>
        <div class="data-row">
          <span class="data-label">实际总金额</span>
          <span class="data-value highlight">¥{{ formatNumber((costData.powerSupplyData?.amount1To24 ?? 0) + (costData.powerSupplyData?.amount25ToEnd ?? 0)) }}</span>
        </div>
        <div class="data-row">
          <span class="data-label">供电局平均单价</span>
          <span class="data-value">{{ calcMonthlyAvgPrice() }}</span>
        </div>
        <div class="data-row">
          <span class="data-label">天石源电量</span>
          <span class="data-value">{{ formatNumber(calcTotalEnergy()) }}</span>
        </div>
        <div class="data-row">
          <span class="data-label">内部平均单价</span>
          <span class="data-value">{{ formatPrice(selectedMode === 'mode3' ? costData.monthlyAvgUnitPrice : costData.avgUnitPrice) }}</span>
        </div>
      </div>
    </div>

    <!-- 部门电费明细表格 -->
    <div class="wide-table-wrapper" v-if="costData && costData.departmentCostList && costData.departmentCostList.length > 0">
      <table class="cost-detail-table">
        <thead>
          <tr>
            <th>一级部门</th>
            <th>二级部门</th>
            <th>月电能值(kWh)</th>
            <th>分配金额(元)</th>
          </tr>
        </thead>
        <tbody>
          <template v-for="(item, index) in costData.departmentCostList" :key="index">
            <tr>
              <td
                v-if="rowspans[index]"
                class="dept1-cell"
                :rowspan="rowspans[index]"
              >
                {{ item.dept1 }}
              </td>
              <td>{{ item.dept2 }}</td>
              <td>{{ formatNumber(item.energy) }}</td>
              <td>{{ formatNumber(item.cost) }}</td>
            </tr>
          </template>
          <!-- 一级部门汇总行 -->
          <template v-for="(summary, deptName) in dept1SummaryComputed" :key="'summary-' + deptName">
            <tr class="dept1-summary">
              <td colspan="2">{{ deptName }} 小计</td>
              <td>{{ formatNumber(summary.totalEnergy) }}</td>
              <td>{{ formatNumber(summary.totalCost) }}</td>
            </tr>
          </template>
          <!-- 总计行 -->
          <tr class="row-total">
            <td colspan="2">总计</td>
            <td>{{ formatNumber(calcTotalEnergy()) }}</td>
            <td>{{ formatNumber(costData.totalCost) }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 可折叠图表区域 -->
    <div class="chart-section" v-if="costData && costData.departmentCostList && costData.departmentCostList.length > 0">
      <div class="chart-section-header" @click="chartCollapsed = !chartCollapsed">
        <span class="chart-section-title">
          <i class="bi bi-pie-chart"></i> 部门电费分布图表
        </span>
        <i :class="chartCollapsed ? 'bi bi-chevron-down' : 'bi bi-chevron-up'"></i>
      </div>
      <div class="chart-section-body" v-show="!chartCollapsed">
        <div class="chart-grid">
          <div class="chart-container">
            <canvas ref="dept1ChartRef"></canvas>
          </div>
          <div class="chart-container">
            <canvas ref="dept2ChartRef"></canvas>
          </div>
        </div>
      </div>
    </div>

    <!-- 编辑模态框 -->
    <div class="modal fade cost-modal" id="editModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">编辑供电局数据</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label class="form-label">1-24日抄表数</label>
              <input type="number" class="form-control" v-model.number="editForm.reading1To24">
            </div>
            <div class="form-group">
              <label class="form-label">1-24日金额</label>
              <input type="number" class="form-control" v-model.number="editForm.amount1To24" step="0.01">
            </div>
            <div class="form-group">
              <label class="form-label">25-月末抄表数</label>
              <input type="number" class="form-control" v-model.number="editForm.reading25ToEnd">
            </div>
            <div class="form-group">
              <label class="form-label">25-月末金额</label>
              <input type="number" class="form-control" v-model.number="editForm.amount25ToEnd" step="0.01">
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">取消</button>
            <button type="button" class="btn btn-query" @click="saveEdit">保存</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 暂无数据 -->
    <div v-if="!costData && !loading" class="wide-table-wrapper">
      <div class="monthly-empty">暂无数据，请选择年月后点击"计算电费"</div>
    </div>
  </div>
</template>

<script>
import { calculateMode1, calculateMode2, calculateMode3, savePowerSupplyData } from '@/api/electricityCost'

/**
 * 电费计算模式到 API 函数映射
 * @param {string} mode - 模式标识 (mode1/mode2/mode3)
 * @returns {Function|null} 对应的 API 计算函数
 */
export function getModeCalculator(mode) {
  const map = { 'mode1': calculateMode1, 'mode2': calculateMode2, 'mode3': calculateMode3 }
  return map[mode] || null
}

/**
 * 一级部门 rowspan 计算
 * @param {Array} departmentCostList - 部门电费明细列表
 * @returns {Object} 索引 → rowspan 值的映射
 */
export function calcRowspans(departmentCostList) {
  const spans = {}
  let i = 0
  while (i < departmentCostList.length) {
    const dept1 = departmentCostList[i].dept1
    let count = 0
    let j = i
    while (j < departmentCostList.length && departmentCostList[j].dept1 === dept1) {
      count++
      j++
    }
    spans[i] = count
    i = j
  }
  return spans
}

/**
 * 一级部门汇总计算
 * @param {Array} departmentCostList - 部门电费明细列表
 * @returns {Object} 部门名 → { deptName, totalEnergy, totalCost } 的映射
 */
export function calcDept1Summary(departmentCostList) {
  const summary = {}
  for (const item of departmentCostList) {
    if (!summary[item.dept1]) {
      summary[item.dept1] = { deptName: item.dept1, totalEnergy: 0, totalCost: 0 }
    }
    summary[item.dept1].totalEnergy += item.energy
    summary[item.dept1].totalCost += item.cost
  }
  return summary
}
</script>

<script setup>
import { ref, computed, watch, nextTick, onBeforeUnmount } from 'vue'
import Chart from 'chart.js/auto'
import { Modal } from 'bootstrap'
import '@/styles/electricity-cost.css'

const now = new Date()
const currentYear = now.getFullYear()
const selectedYear = ref(currentYear)
const selectedMonth = ref(now.getMonth() + 1)
const selectedMode = ref('mode1')
const costData = ref(null)
const loading = ref(false)
const chartCollapsed = ref(false)

// 年份选项
const yearOptions = []
for (let y = currentYear - 2; y <= currentYear + 1; y++) {
  yearOptions.push(y)
}

// 编辑表单
const editForm = ref({
  reading1To24: 0,
  amount1To24: 0,
  reading25ToEnd: 0,
  amount25ToEnd: 0
})

// Chart refs
const dept1ChartRef = ref(null)
const dept2ChartRef = ref(null)
let dept1ChartInstance = null
let dept2ChartInstance = null

// 计算 rowspan
const rowspans = computed(() => {
  if (!costData.value?.departmentCostList) return {}
  return calcRowspans(costData.value.departmentCostList)
})

// 计算一级部门汇总
const dept1SummaryComputed = computed(() => {
  if (!costData.value?.departmentCostList) return {}
  return costData.value.dept1Summary || calcDept1Summary(costData.value.departmentCostList)
})

function formatNumber(val) {
  if (val == null || val === '-') return '-'
  return Number(val).toFixed(2)
}

function formatPrice(val) {
  if (val == null || val === '-') return '-'
  return Number(val).toFixed(3)
}

function calcMonthlyAvgPrice() {
  if (!costData.value?.powerSupplyData) return '-'
  const ps = costData.value.powerSupplyData
  const totalAmount = (ps.amount1To24 ?? 0) + (ps.amount25ToEnd ?? 0)
  const totalReading = (ps.reading1To24 ?? 0) + (ps.reading25ToEnd ?? 0)
  if (totalReading === 0) return '-'
  return (totalAmount / totalReading).toFixed(3)
}

function calcTotalEnergy() {
  if (!costData.value) return 0
  if (selectedMode.value === 'mode3') {
    return (costData.value.energy1To24 ?? 0) + (costData.value.energy25ToEnd ?? 0)
  }
  return costData.value.totalEnergy ?? 0
}

// 计算电费
async function calculate() {
  const calculator = getModeCalculator(selectedMode.value)
  if (!calculator) return
  loading.value = true
  try {
    costData.value = await calculator(selectedYear.value, selectedMonth.value)
    await nextTick()
    renderCharts()
  } catch (err) {
    console.error('计算电费失败:', err)
    alert(err.message || '计算电费失败')
    costData.value = null
  } finally {
    loading.value = false
  }
}

// 编辑模态框
let editModalInstance = null

function openEditModal() {
  if (costData.value?.powerSupplyData) {
    const ps = costData.value.powerSupplyData
    editForm.value = {
      reading1To24: ps.reading1To24 ?? 0,
      amount1To24: ps.amount1To24 ?? 0,
      reading25ToEnd: ps.reading25ToEnd ?? 0,
      amount25ToEnd: ps.amount25ToEnd ?? 0
    }
  }
  const el = document.getElementById('editModal')
  if (el) {
    editModalInstance = Modal.getOrCreateInstance(el)
    editModalInstance.show()
  }
}

async function saveEdit() {
  try {
    await savePowerSupplyData({
      year: selectedYear.value,
      month: selectedMonth.value,
      ...editForm.value
    })
    if (editModalInstance) editModalInstance.hide()
    alert('保存成功')
    // 重新计算
    await calculate()
  } catch (err) {
    console.error('保存供电局数据失败:', err)
    alert(err.message || '保存失败')
  }
}

// 饼图颜色
const chartColors = [
  '#4f8cff', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6',
  '#06b6d4', '#ec4899', '#14b8a6', '#f97316', '#6366f1',
  '#84cc16', '#e11d48', '#0ea5e9', '#a855f7', '#10b981'
]

function destroyCharts() {
  if (dept1ChartInstance) { dept1ChartInstance.destroy(); dept1ChartInstance = null }
  if (dept2ChartInstance) { dept2ChartInstance.destroy(); dept2ChartInstance = null }
}

function renderCharts() {
  destroyCharts()
  if (!costData.value?.departmentCostList || costData.value.departmentCostList.length === 0) return

  const summary = dept1SummaryComputed.value
  const deptList = costData.value.departmentCostList

  // 一级部门饼图
  if (dept1ChartRef.value) {
    const labels = Object.keys(summary)
    const data = labels.map(k => summary[k].totalCost)
    dept1ChartInstance = new Chart(dept1ChartRef.value, {
      type: 'pie',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: chartColors.slice(0, labels.length)
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: { display: true, text: '一级部门电费分布' },
          legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } }
        }
      }
    })
  }

  // 二级部门饼图
  if (dept2ChartRef.value) {
    const labels = deptList.map(d => d.dept2)
    const data = deptList.map(d => d.cost)
    dept2ChartInstance = new Chart(dept2ChartRef.value, {
      type: 'pie',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: chartColors.concat(chartColors).slice(0, labels.length)
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: { display: true, text: '二级部门电费分布' },
          legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } }
        }
      }
    })
  }
}

// 图表折叠/展开时重新渲染
watch(chartCollapsed, (collapsed) => {
  if (!collapsed) {
    nextTick(() => renderCharts())
  }
})

// 导出 Excel
function exportExcel() {
  if (!costData.value) {
    alert('请先计算电费')
    return
  }

  const data = costData.value
  const rows = []

  // 供电局数据
  rows.push(['供电局数据'])
  rows.push(['项目', '1-24日', '25-月末', '月度合计'])
  const ps = data.powerSupplyData || {}
  rows.push(['抄表数', ps.reading1To24 ?? '', ps.reading25ToEnd ?? '', (ps.reading1To24 ?? 0) + (ps.reading25ToEnd ?? 0)])
  rows.push(['金额', ps.amount1To24 ?? '', ps.amount25ToEnd ?? '', (ps.amount1To24 ?? 0) + (ps.amount25ToEnd ?? 0)])
  rows.push(['单价', ps.unitPrice1To24 ?? '', ps.unitPrice25ToEnd ?? '', ''])
  rows.push([])

  // 部门电费明细
  rows.push(['部门电费明细'])
  rows.push(['一级部门', '二级部门', '月电能值(kWh)', '分配金额(元)'])
  if (data.departmentCostList) {
    for (const item of data.departmentCostList) {
      rows.push([item.dept1, item.dept2, item.energy, item.cost])
    }
  }
  rows.push([])

  // 一级部门汇总
  rows.push(['一级部门汇总'])
  rows.push(['部门', '总电能(kWh)', '总金额(元)'])
  const summary = dept1SummaryComputed.value
  for (const key of Object.keys(summary)) {
    rows.push([key, summary[key].totalEnergy, summary[key].totalCost])
  }
  rows.push(['总计', calcTotalEnergy(), data.totalCost])

  // 生成 CSV
  const csvContent = rows.map(row =>
    row.map(cell => {
      const str = String(cell ?? '')
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return '"' + str.replace(/"/g, '""') + '"'
      }
      return str
    }).join(',')
  ).join('\n')

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `电费分摊_${selectedYear.value}年${String(selectedMonth.value).padStart(2, '0')}月.csv`
  link.click()
  URL.revokeObjectURL(url)
}

onBeforeUnmount(() => {
  destroyCharts()
})
</script>
