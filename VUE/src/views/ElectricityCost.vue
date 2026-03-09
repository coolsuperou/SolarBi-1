<template>
  <div class="electricity-cost-page">
    <!-- 查询区域 -->
    <div class="query-section">
      <div class="query-row">
        <div class="query-group">
          <label class="query-label">年份</label>
          <select class="query-select" v-model="selectedYear">
            <option v-for="y in yearOptions" :key="y" :value="y">{{ y }}</option>
          </select>
        </div>
        <div class="query-group">
          <label class="query-label">月份</label>
          <select class="query-select" v-model="selectedMonth">
            <option v-for="m in 12" :key="m" :value="m">{{ String(m).padStart(2, '0') }}</option>
          </select>
        </div>
      </div>
      <div class="query-row">
        <div class="query-group full-width">
          <label class="query-label">计算模式</label>
          <select class="query-select" v-model="selectedMode">
            <option value="mode1">模式一：仅1-24日数据（24日金额 ÷ 24日前电量）</option>
            <option value="mode2">模式二：仅25-月末数据（25-月末金额 ÷ 25-月末电量）</option>
            <option value="mode3">模式三：两期数据都有（总金额 ÷ 全月总电量）</option>
          </select>
        </div>
      </div>

      <!-- 1-24日信息卡片 -->
      <div class="info-cards">
        <div class="info-card">
          <div class="info-card-title">1-24日供电局抄表数</div>
          <div class="info-card-value">
            {{ formatNum(powerSupply?.reading1To24) }}
            <span class="info-card-unit">kWh</span>
          </div>
        </div>
        <div class="info-card">
          <div class="info-card-title">实际总金额</div>
          <div class="info-card-value">
            {{ formatMoney(powerSupply?.amount1To24) }}
            <span class="info-card-unit">元</span>
          </div>
        </div>
        <div class="info-card">
          <div class="info-card-title">供电局平均单价</div>
          <div class="info-card-value">
            {{ calcUnitPrice(powerSupply?.amount1To24, powerSupply?.reading1To24) }}
            <span class="info-card-unit">元/kWh</span>
          </div>
        </div>
        <div class="info-card">
          <div class="info-card-title">天石源电量</div>
          <div class="info-card-value">
            {{ get1To24Energy() }}
            <span class="info-card-unit">kWh</span>
          </div>
        </div>
        <div class="info-card">
          <div class="info-card-title">内部平均单价</div>
          <div class="info-card-value">
            {{ get1To24AvgPrice() }}
            <span class="info-card-unit">元/kWh</span>
          </div>
        </div>
      </div>

      <!-- 25-月末信息卡片 -->
      <div class="info-cards">
        <div class="info-card">
          <div class="info-card-title">25-月末抄表数</div>
          <div class="info-card-value">
            {{ formatNum(powerSupply?.reading25ToEnd) }}
            <span class="info-card-unit">kWh</span>
          </div>
        </div>
        <div class="info-card">
          <div class="info-card-title">实际总金额</div>
          <div class="info-card-value">
            {{ formatMoney(powerSupply?.amount25ToEnd) }}
            <span class="info-card-unit">元</span>
          </div>
        </div>
        <div class="info-card">
          <div class="info-card-title">供电局平均单价</div>
          <div class="info-card-value">
            {{ calcUnitPrice(powerSupply?.amount25ToEnd, powerSupply?.reading25ToEnd) }}
            <span class="info-card-unit">元/kWh</span>
          </div>
        </div>
        <div class="info-card">
          <div class="info-card-title">天石源电量</div>
          <div class="info-card-value">
            {{ get25ToEndEnergy() }}
            <span class="info-card-unit">kWh</span>
          </div>
        </div>
        <div class="info-card">
          <div class="info-card-title">内部平均单价</div>
          <div class="info-card-value">
            {{ get25ToEndAvgPrice() }}
            <span class="info-card-unit">元/kWh</span>
          </div>
        </div>
      </div>

      <!-- 模式三合计行 -->
      <div class="info-cards summary-cards" v-if="selectedMode === 'mode3'">
        <div class="info-card">
          <div class="info-card-title">供电局抄表合计</div>
          <div class="info-card-value">
            {{ formatNum((powerSupply?.reading1To24 || 0) + (powerSupply?.reading25ToEnd || 0)) }}
            <span class="info-card-unit">kWh</span>
          </div>
        </div>
        <div class="info-card">
          <div class="info-card-title">供电局金额合计</div>
          <div class="info-card-value">
            {{ formatMoney((powerSupply?.amount1To24 || 0) + (powerSupply?.amount25ToEnd || 0)) }}
            <span class="info-card-unit">元</span>
          </div>
        </div>
        <div class="info-card">
          <div class="info-card-title">供电局平均单价</div>
          <div class="info-card-value">
            {{ calcMonthlyAvgPrice() }}
            <span class="info-card-unit">元/kWh</span>
          </div>
        </div>
        <div class="info-card">
          <div class="info-card-title">天石源电量合计</div>
          <div class="info-card-value">
            {{ formatNum(costData?.totalEnergy) }}
            <span class="info-card-unit">kWh</span>
          </div>
        </div>
        <div class="info-card">
          <div class="info-card-title">月平均单价</div>
          <div class="info-card-value">
            {{ formatPrice(costData?.monthlyAvgUnitPrice) }}
            <span class="info-card-unit">元/kWh</span>
          </div>
        </div>
      </div>

      <!-- 按钮组 -->
      <div class="query-row center-row">
        <div class="button-group">
          <button class="btn-calculate" @click="calculate" :disabled="loading">
            {{ loading ? '计算中...' : '计算电费' }}
          </button>
          <button class="btn-edit-supply" @click="openEditModal" :disabled="loading">
            编辑供电局数据
          </button>
          <button class="btn-export" @click="exportExcel" :disabled="!costData || loading">
            导出Excel
          </button>
        </div>
      </div>
    </div>

    <!-- 图表展示区域 -->
    <div class="chart-container-wrapper">
      <div class="chart-container-header" @click="chartCollapsed = !chartCollapsed">
        <span :class="['chart-container-icon', { collapsed: chartCollapsed }]">▼</span>
        <span class="chart-container-title">电费分布图表</span>
      </div>
      <div :class="['charts-section', { collapsed: chartCollapsed }]">
        <div class="chart-item" v-show="hasChartData">
          <div class="chart-title">一级部门电费分布</div>
          <div class="chart-wrapper"><div ref="dept1ChartRef" style="width:100%;height:100%"></div></div>
        </div>
        <div class="chart-item" v-show="hasChartData">
          <div class="chart-title">二级部门电费分布</div>
          <div class="chart-wrapper"><div ref="dept2ChartRef" style="width:100%;height:100%"></div></div>
        </div>
        <div v-show="!hasChartData" class="chart-empty-state">
          <div class="chart-empty-text">请点击"计算电费"按钮获取数据</div>
        </div>
      </div>
    </div>

    <!-- 数据表格 -->
    <div class="table-container" v-if="costData && costData.departmentCostList && costData.departmentCostList.length > 0">
      <div class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th class="dept1-header">一级部门</th>
              <th class="dept2-header">二级部门</th>
              <th>月电能值(kWh)</th>
              <th>分配金额(元)</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="(item, index) in costData.departmentCostList" :key="index">
              <tr>
                <td v-if="rowspans[index]" class="dept1-cell" :rowspan="rowspans[index]">{{ item.dept1 }}</td>
                <td class="dept2-cell">{{ item.dept2 }}</td>
                <td class="data-cell">{{ item.energy?.toLocaleString() || '0' }}</td>
                <td class="data-cell cost-column">{{ item.cost?.toLocaleString() || '0' }}</td>
              </tr>
            </template>
          </tbody>
          <tfoot v-if="Object.keys(summary).length > 0">
            <tr v-for="(data, dept1, idx) in summary" :key="'total-' + dept1" class="total-row">
              <td v-if="idx === 0" class="dept1-cell" :rowspan="Object.keys(summary).length">合计</td>
              <td class="dept2-cell">{{ dept1 }}</td>
              <td class="data-cell">{{ data.energy.toLocaleString() }}</td>
              <td class="data-cell cost-column">{{ data.cost.toLocaleString() }}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>

    <!-- 暂无数据 -->
    <div v-if="!costData && !loading" class="empty-state">
      暂无数据，请选择年月后点击"计算电费"
    </div>

    <!-- 编辑供电局数据弹窗 -->
    <div class="modal fade cost-modal" id="editModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">编辑供电局数据 - {{ selectedYear }}年{{ selectedMonth }}月</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div class="edit-section">
              <h6>1-24日数据</h6>
              <div class="form-group">
                <label class="form-label">供电局抄表数 (kWh)</label>
                <input type="number" class="form-control" v-model.number="editForm.reading1To24" min="0" step="0.01">
              </div>
              <div class="form-group">
                <label class="form-label">供电局金额 (元)</label>
                <input type="number" class="form-control" v-model.number="editForm.amount1To24" min="0" step="0.01">
              </div>
              <div class="auto-price">
                单价自动计算: {{ editForm.reading1To24 > 0 ? (editForm.amount1To24 / editForm.reading1To24).toFixed(4) : '0.0000' }} 元/kWh
              </div>
            </div>
            <div class="edit-section">
              <h6>25-月末数据</h6>
              <div class="form-group">
                <label class="form-label">供电局抄表数 (kWh)</label>
                <input type="number" class="form-control" v-model.number="editForm.reading25ToEnd" min="0" step="0.01">
              </div>
              <div class="form-group">
                <label class="form-label">供电局金额 (元)</label>
                <input type="number" class="form-control" v-model.number="editForm.amount25ToEnd" min="0" step="0.01">
              </div>
              <div class="auto-price">
                单价自动计算: {{ editForm.reading25ToEnd > 0 ? (editForm.amount25ToEnd / editForm.reading25ToEnd).toFixed(4) : '0.0000' }} 元/kWh
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">取消</button>
            <button type="button" class="btn-calculate" @click="saveEdit">保存</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { calculateMode1, calculateMode2, calculateMode3, getPowerSupplyData, savePowerSupplyData } from '@/api/electricityCost'

export function getModeCalculator(mode) {
  const map = { 'mode1': calculateMode1, 'mode2': calculateMode2, 'mode3': calculateMode3 }
  return map[mode] || null
}

export function calcRowspans(list) {
  const spans = {}
  let i = 0
  while (i < list.length) {
    const dept1 = list[i].dept1
    let count = 0, j = i
    while (j < list.length && list[j].dept1 === dept1) { count++; j++ }
    spans[i] = count
    i = j
  }
  return spans
}

export function calcDept1Summary(list) {
  const s = {}
  for (const item of list) {
    if (!s[item.dept1]) s[item.dept1] = { deptName: item.dept1, totalEnergy: 0, totalCost: 0 }
    s[item.dept1].totalEnergy += item.energy
    s[item.dept1].totalCost += item.cost
  }
  return s
}
</script>

<script setup>
import { ref, computed, watch, nextTick, onBeforeUnmount, onMounted } from 'vue'
import * as echarts from 'echarts'
import { Modal } from 'bootstrap'
import '@/styles/electricity-cost.css'

const now = new Date()
const currentYear = now.getFullYear()
const selectedYear = ref(currentYear)
const selectedMonth = ref(now.getMonth() + 1)
const selectedMode = ref('mode3')
const costData = ref(null)
const loading = ref(false)
const chartCollapsed = ref(false)

const yearOptions = []
for (let y = currentYear - 5; y <= currentYear + 1; y++) yearOptions.push(y)

// 供电局数据（独立加载，不依赖计算结果）
const powerSupply = ref(null)

const editForm = ref({ reading1To24: 0, amount1To24: 0, reading25ToEnd: 0, amount25ToEnd: 0 })

const dept1ChartRef = ref(null)
const dept2ChartRef = ref(null)
let dept1ChartInstance = null
let dept2ChartInstance = null

const hasChartData = computed(() => {
  return costData.value?.departmentCostList?.length > 0
})

// 一级部门颜色映射（与原版 React config.ts 一致）
const DEPT1_COLORS = {
  '工具制造中心': '#4f8cff',
  '管理部': '#22c55e',
  '工具研发中心': '#f59e0b'
}

// 二级部门颜色（多彩配色）
const DEPT2_COLORS = [
  '#4f8cff', '#ef4444', '#14b8a6', '#f59e0b', '#8b5cf6',
  '#ec4899', '#06b6d4', '#f97316', '#22c55e', '#eab308',
  '#e11d48', '#10b981', '#6366f1', '#84cc16', '#a855f7',
  '#0ea5e9', '#f43f5e', '#0d9488'
]

const rowspans = computed(() => {
  if (!costData.value?.departmentCostList) return {}
  return calcRowspans(costData.value.departmentCostList)
})

const summary = computed(() => {
  if (!costData.value?.departmentCostList) return {}
  const s = {}
  for (const item of costData.value.departmentCostList) {
    if (!s[item.dept1]) s[item.dept1] = { energy: 0, cost: 0 }
    s[item.dept1].energy += item.energy
    s[item.dept1].cost += item.cost
  }
  return s
})

// 加载供电局数据
async function loadPowerSupplyData() {
  try {
    const res = await getPowerSupplyData(selectedYear.value, selectedMonth.value)
    powerSupply.value = res || null
  } catch (e) {
    console.error('加载供电局数据失败:', e)
    powerSupply.value = null
  }
}

// 年月变化时重新加载供电局数据，清空计算结果
watch([selectedYear, selectedMonth], () => {
  loadPowerSupplyData()
  costData.value = null
}, { immediate: true })

// 模式变化时清空计算结果
watch(selectedMode, () => { costData.value = null })

// 格式化函数
function formatNum(val) {
  if (val == null) return '0'
  return Number(val).toLocaleString()
}

function formatMoney(val) {
  if (val == null) return '0.00'
  return Number(val).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function formatPrice(val) {
  if (val == null) return '0.000'
  return Number(val).toFixed(3)
}

function calcUnitPrice(amount, reading) {
  if (!amount || !reading) return '0.000'
  return (amount / reading).toFixed(3)
}

function calcMonthlyAvgPrice() {
  const ps = powerSupply.value
  if (!ps) return '0.000'
  const totalAmount = (ps.amount1To24 || 0) + (ps.amount25ToEnd || 0)
  const totalReading = (ps.reading1To24 || 0) + (ps.reading25ToEnd || 0)
  if (totalReading === 0) return '0.000'
  return (totalAmount / totalReading).toFixed(3)
}

// 1-24日天石源电量（根据模式不同显示不同值）
function get1To24Energy() {
  if (selectedMode.value === 'mode2') return '-'
  if (!costData.value) return '0'
  if (selectedMode.value === 'mode1') return formatNum(costData.value.totalEnergy)
  if (selectedMode.value === 'mode3') return formatNum(costData.value.energy1To24)
  return '0'
}

function get1To24AvgPrice() {
  if (selectedMode.value === 'mode2') return '-'
  if (!costData.value) return '0.000'
  if (selectedMode.value === 'mode1') return formatPrice(costData.value.avgUnitPrice)
  if (selectedMode.value === 'mode3') return formatPrice(costData.value.avgUnitPrice1To24)
  return '0.000'
}

function get25ToEndEnergy() {
  if (selectedMode.value === 'mode1') return '-'
  if (!costData.value) return '0'
  if (selectedMode.value === 'mode2') return formatNum(costData.value.totalEnergy)
  if (selectedMode.value === 'mode3') return formatNum(costData.value.energy25ToEnd)
  return '0'
}

function get25ToEndAvgPrice() {
  if (selectedMode.value === 'mode1') return '-'
  if (!costData.value) return '0.000'
  if (selectedMode.value === 'mode2') return formatPrice(costData.value.avgUnitPrice)
  if (selectedMode.value === 'mode3') return formatPrice(costData.value.avgUnitPrice25ToEnd)
  return '0.000'
}

function calcTotalEnergy() {
  if (!costData.value) return 0
  if (selectedMode.value === 'mode3') return (costData.value.energy1To24 ?? 0) + (costData.value.energy25ToEnd ?? 0)
  return costData.value.totalEnergy ?? 0
}

// 计算电费
async function calculate() {
  const calculator = getModeCalculator(selectedMode.value)
  if (!calculator) return
  loading.value = true
  try {
    const res = await calculator(selectedYear.value, selectedMonth.value)
    costData.value = res
    // 更新供电局数据
    if (res?.powerSupplyData) powerSupply.value = res.powerSupplyData
    // 等待两次 nextTick 确保 v-if 条件渲染的 canvas 已挂载
    await nextTick()
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
  const ps = powerSupply.value
  if (ps) {
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
    await loadPowerSupplyData()
  } catch (err) {
    console.error('保存供电局数据失败:', err)
    alert(err.message || '保存失败')
  }
}

// 饼图

function destroyCharts() {
  if (dept1ChartInstance) { dept1ChartInstance.dispose(); dept1ChartInstance = null }
  if (dept2ChartInstance) { dept2ChartInstance.dispose(); dept2ChartInstance = null }
}

function renderCharts() {
  destroyCharts()
  if (!costData.value?.departmentCostList?.length) return
  const deptList = costData.value.departmentCostList

  // 一级部门环形饼图
  if (dept1ChartRef.value) {
    dept1ChartInstance = echarts.init(dept1ChartRef.value)
    const s = summary.value
    const dept1Data = Object.entries(s).map(([name, val]) => ({
      value: val.cost,
      name,
      itemStyle: { color: DEPT1_COLORS[name] || '#4f8cff' }
    }))

    dept1ChartInstance.setOption({
      tooltip: {
        trigger: 'item',
        formatter: (params) => `${params.seriesName}<br/>${params.name}: ¥${params.value.toFixed(2)} (${params.percent}%)`,
        backgroundColor: '#fff',
        borderColor: '#e2e8f0',
        borderWidth: 1,
        textStyle: { color: '#334155', fontSize: 13 }
      },
      legend: {
        orient: 'horizontal',
        bottom: 0,
        textStyle: { color: '#475569', fontSize: 12 },
        itemWidth: 14,
        itemHeight: 14
      },
      series: [{
        name: '一级部门电费',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['50%', '45%'],
        avoidLabelOverlap: true,
        itemStyle: {
          borderRadius: 8,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: true,
          formatter: (params) => `${params.name}\n¥${params.value.toFixed(2)}\n${params.percent}%`,
          color: '#334155',
          fontSize: 12,
          fontWeight: 'bold'
        },
        emphasis: {
          label: { show: true, fontSize: 15, fontWeight: 'bold' },
          itemStyle: {
            shadowBlur: 12,
            shadowColor: 'rgba(0, 0, 0, 0.15)'
          }
        },
        labelLine: {
          show: true,
          lineStyle: { color: '#94a3b8', width: 1.5 }
        },
        data: dept1Data
      }]
    })
  }

  // 二级部门环形饼图
  if (dept2ChartRef.value) {
    dept2ChartInstance = echarts.init(dept2ChartRef.value)
    const dept2Data = deptList.map((item, index) => ({
      value: item.cost,
      name: item.dept2,
      itemStyle: { color: DEPT2_COLORS[index % DEPT2_COLORS.length] }
    }))

    dept2ChartInstance.setOption({
      tooltip: {
        trigger: 'item',
        formatter: (params) => `${params.seriesName}<br/>${params.name}: ¥${params.value.toFixed(2)} (${params.percent}%)`,
        backgroundColor: '#fff',
        borderColor: '#e2e8f0',
        borderWidth: 1,
        textStyle: { color: '#334155', fontSize: 13 }
      },
      legend: {
        orient: 'horizontal',
        bottom: 0,
        textStyle: { color: '#475569', fontSize: 11 },
        itemWidth: 12,
        itemHeight: 12,
        itemGap: 8
      },
      series: [{
        name: '二级部门电费',
        type: 'pie',
        radius: ['40%', '65%'],
        center: ['50%', '42%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 6,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: { show: false },
        emphasis: {
          label: {
            show: true,
            fontSize: 13,
            fontWeight: 'bold',
            formatter: (params) => `${params.name}\n¥${params.value.toFixed(2)}\n${params.percent}%`,
            color: '#334155'
          },
          itemStyle: {
            shadowBlur: 12,
            shadowColor: 'rgba(0, 0, 0, 0.15)'
          }
        },
        labelLine: { show: false },
        data: dept2Data
      }]
    })
  }

  // 监听窗口 resize
  window.addEventListener('resize', handleChartResize)
}

function handleChartResize() {
  dept1ChartInstance?.resize()
  dept2ChartInstance?.resize()
}

watch(chartCollapsed, async (v) => {
  if (!v) {
    await nextTick()
    await nextTick()
    renderCharts()
  }
})

// 导出 Excel（与原版 React 一致的 XML SpreadsheetML 格式）
function exportExcel() {
  if (!costData.value) { alert('请先计算电费'); return }
  const data = costData.value
  const ps = data.powerSupplyData || powerSupply.value || {}
  const deptList = data.departmentCostList || []
  if (deptList.length === 0) { alert('请先计算电费'); return }

  const mode = selectedMode.value
  const modeNames = { mode1: '模式一', mode2: '模式二', mode3: '模式三' }
  const modeDescs = {
    mode1: '模式一：仅1-24日数据（24日金额 ÷ 24日前电量）',
    mode2: '模式二：仅25-月末数据（25-月末金额 ÷ 25-月末电量）',
    mode3: '模式三：两期数据都有（总金额 ÷ 全月总电量）'
  }
  const modeName = modeNames[mode] || mode
  const modeDesc = modeDescs[mode] || ''

  // 天石源电量
  const energy1To24Value = mode === 'mode1' && data.totalEnergy ? data.totalEnergy
    : mode === 'mode3' && data.energy1To24 ? data.energy1To24 : null
  const energy25ToEndValue = mode === 'mode2' && data.totalEnergy ? data.totalEnergy
    : mode === 'mode3' && data.energy25ToEnd ? data.energy25ToEnd : null

  // XML 转义
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
  xml += '<Style ss:ID="SubTitle"><Font ss:Size="11"/><Alignment ss:Horizontal="Center" ss:Vertical="Center"/></Style>\n'
  xml += '<Style ss:ID="InfoLabel"><Font ss:Bold="1" ss:Size="10"/><Interior ss:Color="#FFF2CC" ss:Pattern="Solid"/><Alignment ss:Horizontal="Center" ss:Vertical="Center"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1"/><Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1"/><Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1"/><Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1"/></Borders></Style>\n'
  xml += '<Style ss:ID="InfoValue"><Font ss:Size="10"/><Alignment ss:Horizontal="Center" ss:Vertical="Center"/><NumberFormat ss:Format="#,##0.00"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1"/><Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1"/><Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1"/><Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1"/></Borders></Style>\n'
  xml += '<Style ss:ID="Header"><Font ss:Bold="1" ss:Size="11" ss:Color="#FFFFFF"/><Interior ss:Color="#5B9BD5" ss:Pattern="Solid"/><Alignment ss:Horizontal="Center" ss:Vertical="Center"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1"/><Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1"/><Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1"/><Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1"/></Borders></Style>\n'
  xml += '<Style ss:ID="Dept1"><Font ss:Bold="1" ss:Size="10"/><Interior ss:Color="#E2EFDA" ss:Pattern="Solid"/><Alignment ss:Horizontal="Center" ss:Vertical="Center"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D9D9D9"/><Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D9D9D9"/><Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D9D9D9"/><Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D9D9D9"/></Borders></Style>\n'
  xml += '<Style ss:ID="Dept2"><Font ss:Size="10"/><Alignment ss:Horizontal="Center" ss:Vertical="Center"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D9D9D9"/><Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D9D9D9"/><Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D9D9D9"/><Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D9D9D9"/></Borders></Style>\n'
  xml += '<Style ss:ID="Data"><Font ss:Size="10"/><Alignment ss:Horizontal="Center" ss:Vertical="Center"/><NumberFormat ss:Format="#,##0.00"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D9D9D9"/><Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D9D9D9"/><Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D9D9D9"/><Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D9D9D9"/></Borders></Style>\n'
  xml += '<Style ss:ID="Total"><Font ss:Bold="1" ss:Size="11" ss:Color="#FFFFFF"/><Interior ss:Color="#ED7D31" ss:Pattern="Solid"/><Alignment ss:Horizontal="Center" ss:Vertical="Center"/><NumberFormat ss:Format="#,##0.00"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1"/><Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1"/><Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1"/><Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1"/></Borders></Style>\n'
  xml += '</Styles>\n'

  // 工作表
  xml += '<Worksheet ss:Name="电费分摊">\n<Table>\n'
  for (let i = 0; i < 10; i++) xml += `<Column ss:Width="${i === 0 ? 120 : 100}"/>\n`

  // 标题
  xml += `<Row ss:Height="30"><Cell ss:StyleID="Title" ss:MergeAcross="9"><Data ss:Type="String">${selectedYear.value}年${selectedMonth.value}月 电费分摊表 - ${modeName}</Data></Cell></Row>\n`
  xml += `<Row ss:Height="20"><Cell ss:StyleID="SubTitle" ss:MergeAcross="9"><Data ss:Type="String">${modeDesc}</Data></Cell></Row>\n`
  xml += '<Row ss:Height="10"></Row>\n'

  // 1-24日数据行
  xml += '<Row ss:Height="22">\n'
  xml += '<Cell ss:StyleID="InfoLabel"><Data ss:Type="String">1-24日供电局抄表数</Data></Cell>\n'
  xml += `<Cell ss:StyleID="InfoValue"><Data ss:Type="Number">${ps.reading1To24 || 0}</Data></Cell>\n`
  xml += '<Cell ss:StyleID="InfoLabel"><Data ss:Type="String">实际总金额</Data></Cell>\n'
  xml += `<Cell ss:StyleID="InfoValue"><Data ss:Type="Number">${ps.amount1To24 || 0}</Data></Cell>\n`
  xml += '<Cell ss:StyleID="InfoLabel"><Data ss:Type="String">供电局平均单价</Data></Cell>\n'
  xml += `<Cell ss:StyleID="InfoValue"><Data ss:Type="Number">${ps.reading1To24 && ps.amount1To24 ? (ps.amount1To24 / ps.reading1To24).toFixed(4) : 0}</Data></Cell>\n`
  xml += '<Cell ss:StyleID="InfoLabel"><Data ss:Type="String">天石源电量</Data></Cell>\n'
  xml += `<Cell ss:StyleID="InfoValue"><Data ss:Type="${energy1To24Value ? 'Number' : 'String'}">${energy1To24Value || '-'}</Data></Cell>\n`
  xml += '<Cell ss:StyleID="InfoLabel"><Data ss:Type="String">内部平均单价</Data></Cell>\n'
  xml += `<Cell ss:StyleID="InfoValue"><Data ss:Type="${(mode === 'mode1' || mode === 'mode3') && (data.avgUnitPrice1To24 || data.avgUnitPrice) ? 'Number' : 'String'}">${mode === 'mode1' && data.avgUnitPrice ? data.avgUnitPrice.toFixed(4) : mode === 'mode3' && data.avgUnitPrice1To24 ? data.avgUnitPrice1To24.toFixed(4) : '-'}</Data></Cell>\n`
  xml += '</Row>\n'

  // 25-月末数据行
  xml += '<Row ss:Height="22">\n'
  xml += '<Cell ss:StyleID="InfoLabel"><Data ss:Type="String">25-月末抄表数</Data></Cell>\n'
  xml += `<Cell ss:StyleID="InfoValue"><Data ss:Type="Number">${ps.reading25ToEnd || 0}</Data></Cell>\n`
  xml += '<Cell ss:StyleID="InfoLabel"><Data ss:Type="String">实际总金额</Data></Cell>\n'
  xml += `<Cell ss:StyleID="InfoValue"><Data ss:Type="Number">${ps.amount25ToEnd || 0}</Data></Cell>\n`
  xml += '<Cell ss:StyleID="InfoLabel"><Data ss:Type="String">供电局平均单价</Data></Cell>\n'
  xml += `<Cell ss:StyleID="InfoValue"><Data ss:Type="Number">${ps.reading25ToEnd && ps.amount25ToEnd ? (ps.amount25ToEnd / ps.reading25ToEnd).toFixed(4) : 0}</Data></Cell>\n`
  xml += '<Cell ss:StyleID="InfoLabel"><Data ss:Type="String">天石源电量</Data></Cell>\n'
  xml += `<Cell ss:StyleID="InfoValue"><Data ss:Type="${energy25ToEndValue ? 'Number' : 'String'}">${energy25ToEndValue || '-'}</Data></Cell>\n`
  xml += '<Cell ss:StyleID="InfoLabel"><Data ss:Type="String">内部平均单价</Data></Cell>\n'
  xml += `<Cell ss:StyleID="InfoValue"><Data ss:Type="${(mode === 'mode2' || mode === 'mode3') && (data.avgUnitPrice25ToEnd || data.avgUnitPrice) ? 'Number' : 'String'}">${mode === 'mode2' && data.avgUnitPrice ? data.avgUnitPrice.toFixed(4) : mode === 'mode3' && data.avgUnitPrice25ToEnd ? data.avgUnitPrice25ToEnd.toFixed(4) : '-'}</Data></Cell>\n`
  xml += '</Row>\n'

  // 模式三合计行
  if (mode === 'mode3') {
    const totalReading = (ps.reading1To24 || 0) + (ps.reading25ToEnd || 0)
    const totalAmount = (ps.amount1To24 || 0) + (ps.amount25ToEnd || 0)
    const avgUp = totalReading > 0 ? (totalAmount / totalReading).toFixed(4) : '0.0000'
    const totalEnergy = data.totalEnergy || 0
    const monthlyAvg = data.monthlyAvgUnitPrice ? data.monthlyAvgUnitPrice.toFixed(4) : '0.0000'
    xml += '<Row ss:Height="22">\n'
    xml += '<Cell ss:StyleID="InfoLabel"><Data ss:Type="String">供电局抄表合计</Data></Cell>\n'
    xml += `<Cell ss:StyleID="InfoValue"><Data ss:Type="Number">${totalReading}</Data></Cell>\n`
    xml += '<Cell ss:StyleID="InfoLabel"><Data ss:Type="String">供电局金额合计</Data></Cell>\n'
    xml += `<Cell ss:StyleID="InfoValue"><Data ss:Type="Number">${totalAmount}</Data></Cell>\n`
    xml += '<Cell ss:StyleID="InfoLabel"><Data ss:Type="String">供电局平均单价</Data></Cell>\n'
    xml += `<Cell ss:StyleID="InfoValue"><Data ss:Type="Number">${avgUp}</Data></Cell>\n`
    xml += '<Cell ss:StyleID="InfoLabel"><Data ss:Type="String">天石源电量合计</Data></Cell>\n'
    xml += `<Cell ss:StyleID="InfoValue"><Data ss:Type="Number">${totalEnergy}</Data></Cell>\n`
    xml += '<Cell ss:StyleID="InfoLabel"><Data ss:Type="String">月平均单价</Data></Cell>\n'
    xml += `<Cell ss:StyleID="InfoValue"><Data ss:Type="Number">${monthlyAvg}</Data></Cell>\n`
    xml += '</Row>\n'
  }

  // 空行
  xml += '<Row ss:Height="15"></Row>\n'

  // 表头
  xml += '<Row ss:Height="25">\n'
  xml += '<Cell ss:StyleID="Header"><Data ss:Type="String">一级部门</Data></Cell>\n'
  xml += '<Cell ss:StyleID="Header"><Data ss:Type="String">二级部门</Data></Cell>\n'
  xml += '<Cell ss:StyleID="Header"><Data ss:Type="String">月电能值(kWh)</Data></Cell>\n'
  xml += '<Cell ss:StyleID="Header"><Data ss:Type="String">分配金额(元)</Data></Cell>\n'
  xml += '</Row>\n'

  // 数据行 - 按一级部门分组
  const dept1Groups = {}
  deptList.forEach(item => {
    if (!dept1Groups[item.dept1]) dept1Groups[item.dept1] = []
    dept1Groups[item.dept1].push(item)
  })

  Object.entries(dept1Groups).forEach(([dept1, items]) => {
    items.forEach((item, itemIndex) => {
      xml += '<Row ss:Height="22">\n'
      if (itemIndex === 0) {
        if (items.length > 1) {
          xml += `<Cell ss:StyleID="Dept1" ss:MergeDown="${items.length - 1}"><Data ss:Type="String">${esc(dept1)}</Data></Cell>\n`
        } else {
          xml += `<Cell ss:StyleID="Dept1"><Data ss:Type="String">${esc(dept1)}</Data></Cell>\n`
        }
      } else {
        xml += '<Cell ss:StyleID="Dept1"></Cell>\n'
      }
      xml += `<Cell ss:StyleID="Dept2"><Data ss:Type="String">${esc(item.dept2)}</Data></Cell>\n`
      xml += `<Cell ss:StyleID="Data"><Data ss:Type="Number">${item.energy}</Data></Cell>\n`
      xml += `<Cell ss:StyleID="Data"><Data ss:Type="Number">${item.cost}</Data></Cell>\n`
      xml += '</Row>\n'
    })
  })

  // 合计行
  const summaryData = summary.value
  const summaryEntries = Object.entries(summaryData)
  summaryEntries.forEach(([dept1, sData], index) => {
    xml += '<Row ss:Height="25">\n'
    if (index === 0) {
      if (summaryEntries.length > 1) {
        xml += `<Cell ss:StyleID="Total" ss:MergeDown="${summaryEntries.length - 1}"><Data ss:Type="String">合计</Data></Cell>\n`
      } else {
        xml += '<Cell ss:StyleID="Total"><Data ss:Type="String">合计</Data></Cell>\n'
      }
    } else {
      xml += '<Cell ss:StyleID="Total"></Cell>\n'
    }
    xml += `<Cell ss:StyleID="Total"><Data ss:Type="String">${esc(dept1)}</Data></Cell>\n`
    xml += `<Cell ss:StyleID="Total"><Data ss:Type="Number">${sData.energy}</Data></Cell>\n`
    xml += `<Cell ss:StyleID="Total"><Data ss:Type="Number">${sData.cost}</Data></Cell>\n`
    xml += '</Row>\n'
  })

  xml += '</Table>\n</Worksheet>\n</Workbook>'

  // 下载
  const blob = new Blob([xml], { type: 'application/vnd.ms-excel' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `电费分摊表_${selectedYear.value}年${selectedMonth.value}月_${modeName}.xls`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  alert('导出成功')
}

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleChartResize)
  destroyCharts()
})
</script>
