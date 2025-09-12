<template>
  <div class="power-monitor">
    <!-- 页面标题 -->
    <div class="page-header mb-4">
       <h2 class="page-title text-glow-primary">
         电能数据监控
       </h2>
      <p class="page-description text-secondary">
        实时监控工具制造车间电能消耗数据，支持小时和日统计分析
      </p>
    </div>

    <!-- 统计卡片 -->
    <div class="statistics-section mb-4">
      <div class="row g-3">
        <div class="col-12 col-md-4">
          <StatisticsCard
            icon="building"
            :value="statistics.workshop"
            label="车间"
            unit=""
            :precision="0"
            value-class="text-glow-secondary"
          />
        </div>
        <div class="col-6 col-md-4">
          <StatisticsCard
            icon="lightning-charge"
            :value="statistics.electricConsumption"
            label="电能消耗"
            unit=" kWh"
            :precision="2"
            value-class="text-glow-primary"
          />
        </div>
        <div class="col-6 col-md-4">
          <StatisticsCard
            icon="lightning-charge-fill"
            :value="statistics.totalElectricConsumption"
            label="总电能消耗"
            unit=" kWh"
            :precision="2"
            value-class="text-danger"
          />
        </div>
      </div>
    </div>

     <!-- 搜索表单 -->
     <div class="search-section mb-4">
       <div class="tech-card p-3">
         <form @submit.prevent="handleSearch" class="row g-3 align-items-end">
           <div class="col-md-4">
             <label class="form-label text-glow-primary fw-semibold">
               <i class="bi bi-calendar me-1"></i>开始{{ currentMode === 'hour' ? '时间' : '日期' }}
             </label>
             <input
               :type="currentMode === 'hour' ? 'datetime-local' : 'date'"
               :step="currentMode === 'hour' ? '3600' : undefined"
               v-model="searchForm.startTime"
               class="form-control form-control-glow"
             />
           </div>
           <div class="col-md-4">
             <label class="form-label text-glow-primary fw-semibold">
               <i class="bi bi-calendar me-1"></i>结束{{ currentMode === 'hour' ? '时间' : '日期' }}
             </label>
             <input
               :type="currentMode === 'hour' ? 'datetime-local' : 'date'"
               :step="currentMode === 'hour' ? '3600' : undefined"
               v-model="searchForm.endTime"
               class="form-control form-control-glow"
             />
           </div>
           <div class="col-md-4">
             <div class="d-flex gap-2">
               <button type="submit" class="btn btn-glow flex-fill" :disabled="searchLoading">
                 <i class="bi bi-search me-1" :class="{ 'spinning': searchLoading }"></i>
                 搜索
               </button>
               <button type="button" class="btn btn-outline-secondary" @click="resetSearch">
                 <i class="bi bi-arrow-clockwise me-1"></i>
                 重置
               </button>
             </div>
           </div>
         </form>
       </div>
     </div>

    <!-- 图表区域 -->
    <div class="chart-section mb-4" v-if="showChart">
      <PowerChart
        :title="currentMode === 'hour' ? '每小时电能消耗趋势' : '每日电能消耗趋势'"
        :chart-options="chartOptions"
        :loading="chartLoading"
        :current-mode="currentMode"
        @mode-change="handleModeChange"
      />
    </div>

    <!-- 数据表格 -->
    <div class="table-section">
      <DataTable
        title="电能监控数据"
        :columns="tableColumns"
        :data="tableData"
        :loading="tableLoading"
        :pagination="pagination"
        :show-refresh="false"
        @page-change="handlePageChange"
      >
        <!-- 自定义列内容 -->
        <template #deviceId="{ value }">
          <span class="text-glow-primary fw-bold">{{ value }}</span>
        </template>
        
        <template #workshop="{ value }">
          <span class="badge bg-primary">{{ value }}</span>
        </template>
        
        <template #name="{ value }">
          <span class="text-info fw-semibold">{{ value || '-' }}</span>
        </template>
        
        <template #electricEnergy="{ value }">
          <span class="text-glow-warning fw-bold">{{ Number(value).toFixed(2) }} kWh</span>
        </template>
        
        <template #updateTime="{ value }">
          <span class="text-glow-secondary">{{ formatDateTime(value) }}</span>
        </template>
      </DataTable>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import moment from 'moment'
import StatisticsCard from '@/components/StatisticsCard.vue'
import PowerChart from '@/components/PowerChart.vue'
import DataTable from '@/components/DataTable.vue'
import type { EChartsOption } from 'echarts'

// 响应式数据
const statistics = reactive({
  workshop: '114_空调水机主机',
  electricConsumption: 6230.50,
  totalElectricConsumption: 0.00
})

const searchForm = reactive({
  startTime: '',
  endTime: ''
})

const currentMode = ref('hour')
const showChart = ref(true)
const searchLoading = ref(false)
const chartLoading = ref(false)
const tableLoading = ref(false)

const chartOptions = ref<EChartsOption>({})
const tableData = ref<any[]>([])

const pagination = reactive({
  current: 1,
  pageSize: 20,
  total: 0
})

// 表格列配置
const tableColumns = computed(() => [
  { key: 'deviceId', title: '设备ID', width: '150px' },
  { key: 'workshop', title: '部门车间', width: '200px' },
  { key: 'name', title: '名称', width: '150px' },
  { key: 'electricEnergy', title: '电能度数', width: '150px', format: 'number' },
  { key: 'updateTime', title: '时间', width: '180px', format: 'datetime' }
])

// 格式化日期时间
const formatDateTime = (value: string) => {
  return moment(value).format('YYYY-MM-DD HH:mm:ss')
}

// 搜索处理
const handleSearch = async () => {
  searchLoading.value = true
  try {
    await Promise.all([
      loadStatistics(),
      loadChartData(),
      loadTableData()
    ])
  } finally {
    searchLoading.value = false
  }
}

// 重置搜索
const resetSearch = () => {
  setDefaultTimeRange()
  handleSearch()
}

// 模式切换
const handleModeChange = (mode: string) => {
  currentMode.value = mode
  // 根据模式设置合适的默认时间格式
  setDefaultTimeRange()
  loadChartData()
}

// 页码切换
const handlePageChange = (page: number) => {
  pagination.current = page
  loadTableData()
}

// 加载统计数据
const loadStatistics = async () => {
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // 根据搜索的时间范围和模式计算统计数据
    let baseConsumption = 6230.50
    
    if (searchForm.startTime && searchForm.endTime) {
      const startTime = moment(searchForm.startTime)
      const endTime = moment(searchForm.endTime)
      
      if (currentMode.value === 'hour') {
        // 小时模式：根据小时数计算
        const hours = endTime.diff(startTime, 'hours')
        baseConsumption = hours * (Math.random() * 50 + 200) // 每小时200-250kWh
      } else {
        // 日模式：根据天数计算
        const days = endTime.diff(startTime, 'days')
        baseConsumption = days * (Math.random() * 1000 + 5000) // 每天5000-6000kWh
      }
    }
    
    statistics.workshop = '114_空调水机主机'
    statistics.electricConsumption = Number(baseConsumption.toFixed(2))
    statistics.totalElectricConsumption = 0.00
  } catch (error) {
    console.error('加载统计数据失败:', error)
  }
}

// 加载图表数据
const loadChartData = async () => {
  chartLoading.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 800))
    
    // 生成模拟数据
    const data = generateChartData()
    
    chartOptions.value = {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(10, 25, 41, 0.95)',
        borderColor: '#00d4ff',
        borderWidth: 2,
        textStyle: {
          color: '#ffffff',
          fontSize: 13,
          fontWeight: 'bold'
        }
      },
      legend: {
        data: ['114_空调水机主机'],
        textStyle: {
          color: '#00d4ff',
          fontSize: 12,
          fontWeight: 'bold'
        }
      },
      grid: {
        left: 60,
        right: 20,
        top: 50,
        bottom: 60,
        borderColor: 'rgba(0, 212, 255, 0.2)',
        show: true,
        backgroundColor: 'rgba(0, 212, 255, 0.03)'
      },
      xAxis: {
        type: 'time',
        axisLabel: {
          color: '#00d4ff',
          fontSize: 11,
          fontWeight: 'bold',
          formatter: (value: number) => {
            return currentMode.value === 'hour' 
              ? moment(value).format('HH:mm')
              : moment(value).format('MM-DD')
          }
        },
        axisLine: {
          lineStyle: {
            color: '#00d4ff',
            width: 2
          }
        },
        splitLine: {
          lineStyle: {
            color: 'rgba(0, 212, 255, 0.15)',
            type: 'dashed'
          }
        }
      },
      yAxis: {
        type: 'value',
        name: currentMode.value === 'hour' ? '每小时用电量 (kWh)' : '每日用电量 (kWh)',
        nameTextStyle: {
          color: '#00d4ff',
          fontSize: 12,
          fontWeight: 'bold'
        },
        axisLabel: {
          color: '#00d4ff',
          fontSize: 11,
          fontWeight: 'bold'
        },
        axisLine: {
          lineStyle: {
            color: '#00d4ff',
            width: 2
          }
        },
        splitLine: {
          lineStyle: {
            color: 'rgba(0, 212, 255, 0.15)',
            type: 'dashed'
          }
        }
      },
      series: [{
        name: '114_空调水机主机',
        type: 'line',
        smooth: true,
        data: data,
        lineStyle: {
          width: 3,
          color: '#00d4ff'
        },
        itemStyle: {
          color: '#00d4ff',
          borderColor: '#ffffff',
          borderWidth: 2
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(0, 212, 255, 0.4)' },
              { offset: 1, color: 'rgba(0, 212, 255, 0.1)' }
            ]
          }
        }
      }]
    }
  } catch (error) {
    console.error('加载图表数据失败:', error)
  } finally {
    chartLoading.value = false
  }
}

// 加载表格数据
const loadTableData = async () => {
  tableLoading.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 600))
    
    // 生成模拟数据
    const data = generateTableData()
    tableData.value = data
    pagination.total = 150 // 模拟总数
  } catch (error) {
    console.error('加载表格数据失败:', error)
  } finally {
    tableLoading.value = false
  }
}

// 生成图表模拟数据
const generateChartData = () => {
  const data: [number, number][] = []
  
  // 如果有搜索时间范围，使用搜索时间范围
  if (searchForm.startTime && searchForm.endTime) {
    const startTime = moment(searchForm.startTime)
    const endTime = moment(searchForm.endTime)
    
    if (currentMode.value === 'hour') {
      // 小时模式：按小时生成数据
      const current = startTime.clone()
      while (current.isSameOrBefore(endTime)) {
        const value = Math.random() * 50 + 20 // 20-70 之间的随机值
        data.push([current.valueOf(), Number(value.toFixed(2))])
        current.add(1, 'hour')
      }
    } else {
      // 日模式：按天生成数据
      const current = startTime.clone()
      while (current.isSameOrBefore(endTime)) {
        const value = Math.random() * 200 + 100 // 100-300 之间的随机值（日用电量更大）
        data.push([current.valueOf(), Number(value.toFixed(2))])
        current.add(1, 'day')
      }
    }
  } else {
    // 默认时间范围
    const now = moment()
    const count = currentMode.value === 'hour' ? 24 : 7
    
    for (let i = count; i >= 0; i--) {
      const time = currentMode.value === 'hour' 
        ? now.clone().subtract(i, 'hours')
        : now.clone().subtract(i, 'days')
      
      const value = currentMode.value === 'hour' 
        ? Math.random() * 50 + 20 // 小时模式：20-70
        : Math.random() * 200 + 100 // 日模式：100-300
      data.push([time.valueOf(), Number(value.toFixed(2))])
    }
  }
  
  return data
}

// 生成表格模拟数据
const generateTableData = () => {
  const data = []
  const now = moment()
  const deviceNames = [
    '空调主机A', '空调主机B', '冷却水泵', '冷冻水泵', 
    '风机盘管', '新风机组', '循环水泵', '制冷压缩机',
    '热交换器', '电控柜', '变频器', '传感器组'
  ]
  
  for (let i = 0; i < pagination.pageSize; i++) {
    const time = now.clone().subtract(i * 5, 'minutes')
    data.push({
      id: `${pagination.current}_${i}`,
      deviceId: `DEV_${String(i + 1).padStart(3, '0')}`,
      workshop: '114_空调水机主机',
      name: deviceNames[i % deviceNames.length],
      electricEnergy: (Math.random() * 1000 + 500).toFixed(2),
      updateTime: time.format('YYYY-MM-DD HH:mm:ss')
    })
  }
  
  return data
}

// 设置默认时间范围
const setDefaultTimeRange = () => {
  const now = moment()
  
  if (currentMode.value === 'hour') {
    // 小时模式：精确到小时
    searchForm.endTime = now.format('YYYY-MM-DDTHH:00')
    searchForm.startTime = now.clone().subtract(24, 'hours').format('YYYY-MM-DDTHH:00')
  } else {
    // 日模式：只选择日期
    searchForm.endTime = now.format('YYYY-MM-DD')
    searchForm.startTime = now.clone().subtract(7, 'days').format('YYYY-MM-DD')
  }
}

// 组件挂载时初始化
onMounted(() => {
  // 设置默认时间范围
  setDefaultTimeRange()
  
  // 加载初始数据
  handleSearch()
})
</script>

<style lang="scss" scoped>
.power-monitor {
  .page-header {
    .page-title {
      font-size: $font-size-title;
      font-weight: 700;
      margin-bottom: $spacing-sm;
    }
    
    .page-description {
      font-size: $font-size-base;
      margin-bottom: 0;
    }
  }
  
  .statistics-section {
    .row {
      --bs-gutter-x: 1rem;
      --bs-gutter-y: 1rem;
    }
  }
  
  .search-section {
    .form-label {
      font-size: $font-size-sm;
      margin-bottom: $spacing-xs;
    }
  }
}

// 响应式调整
@media (max-width: $breakpoint-md) {
  .power-monitor {
    .page-header {
      .page-title {
        font-size: 1.5rem;
      }
    }
    
    .search-section {
      .row {
        --bs-gutter-x: 0.5rem;
      }
    }
  }
}

@media (max-width: $breakpoint-sm) {
  .power-monitor {
    .statistics-section {
      .row {
        --bs-gutter-x: 0.5rem;
        --bs-gutter-y: 0.5rem;
      }
    }
    
    .search-section {
      .d-flex {
        flex-direction: column;
        gap: 0.5rem !important;
      }
    }
  }
}
</style>
