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
         <div class="search-header d-flex justify-content-between align-items-center mb-3">
           <h6 class="search-title text-glow-primary mb-0">
             <i class="bi bi-eye me-2"></i>实时监控数据
           </h6>
           <button 
             type="button" 
             class="btn btn-collapse"
             @click="chartCollapsed = !chartCollapsed"
           >
             <i class="bi" :class="chartCollapsed ? 'bi-chevron-down' : 'bi-chevron-up'"></i>
             {{ chartCollapsed ? '展开' : '折叠' }}
           </button>
         </div>
         
         <div class="search-form">
           <form @submit.prevent="handleSearch" class="row g-3 align-items-end">
             <div class="col-md-4">
               <label class="form-label text-glow-primary fw-semibold">
                 <i class="bi bi-calendar me-1"></i>开始{{ currentMode === 'hour' ? '时间' : '日期' }}
               </label>
               <div v-if="currentMode === 'hour'" class="row g-2">
                 <div class="col-7">
                   <input
                     type="date"
                     v-model="startDate"
                     class="form-control form-control-glow"
                     placeholder="选择日期"
                   />
                 </div>
                 <div class="col-5">
                   <select
                     v-model="startHour"
                     class="form-select form-control-glow"
                   >
                     <option value="" disabled>选择小时</option>
                     <option v-for="hour in 24" :key="hour-1" :value="String(hour-1).padStart(2, '0') + ':00'">
                       {{ hour-1 }}时
                     </option>
                   </select>
                 </div>
               </div>
               <input
                 v-else
                 type="date"
                 v-model="searchForm.startTime"
                 class="form-control form-control-glow"
               />
             </div>
             <div class="col-md-4">
               <label class="form-label text-glow-primary fw-semibold">
                 <i class="bi bi-calendar me-1"></i>结束{{ currentMode === 'hour' ? '时间' : '日期' }}
               </label>
               <div v-if="currentMode === 'hour'" class="row g-2">
                 <div class="col-7">
                   <input
                     type="date"
                     v-model="endDate"
                     class="form-control form-control-glow"
                     placeholder="选择日期"
                   />
                 </div>
                 <div class="col-5">
                   <select
                     v-model="endHour"
                     class="form-select form-control-glow"
                   >
                     <option value="" disabled>选择小时</option>
                     <option v-for="hour in 24" :key="hour-1" :value="String(hour-1).padStart(2, '0') + ':00'">
                       {{ hour-1 }}时
                     </option>
                   </select>
                 </div>
               </div>
               <input
                 v-else
                 type="date"
                 v-model="searchForm.endTime"
                 class="form-control form-control-glow"
               />
             </div>
             <div class="col-md-4">
               <div class="d-flex gap-2">
                 <button type="submit" class="btn btn-search flex-fill" :disabled="searchLoading">
                   <i class="bi bi-search me-1" :class="{ 'spinning': searchLoading }"></i>
                   查询
                 </button>
                 <button type="button" class="btn btn-reset" @click="resetSearch">
                   <i class="bi bi-arrow-clockwise me-1"></i>
                   重置
                 </button>
               </div>
             </div>
           </form>
         </div>
       </div>
     </div>

    <!-- 图表区域 -->
    <div class="chart-section mb-4" v-if="showChart && !chartCollapsed">
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
import { ref, reactive, onMounted, computed, watch, nextTick } from 'vue'
import moment from 'moment'
import StatisticsCard from '@/components/StatisticsCard.vue'
import PowerChart from '@/components/PowerChart.vue'
import DataTable from '@/components/DataTable.vue'
import type { EChartsOption } from 'echarts'
import { 
  powerApi, 
  type TempMonitor,
  type HourlyEnergyConsumption, 
  type DailyEnergyConsumption,
  type TempMonitorQueryRequest
} from '@/api/power'

// 响应式数据
const statistics = reactive({
  workshop: '114_空调水机主机',
  electricConsumption: 0,
  totalElectricConsumption: 0
})

const searchForm = reactive({
  startTime: '',
  endTime: ''
})

// 分离的日期和时间字段（用于小时模式）
const startDate = ref('')
const startHour = ref('')
const endDate = ref('')
const endHour = ref('')

const currentMode = ref('hour')
const showChart = ref(true)
const chartCollapsed = ref(false)
const searchLoading = ref(false)
const chartLoading = ref(false)
const tableLoading = ref(false)

const chartOptions = ref<EChartsOption>({})
const tableData = ref<TempMonitor[]>([])

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

// 固定车间名（与后端一致）
const FIXED_WORKSHOP = '114_空调水机主机'

// 统一转换为后端需要的时间格式 (yyyy-MM-dd HH:mm:ss)
const getRequestTimes = () => {
  // 如果表单时间为空，使用默认时间范围
  if (!searchForm.startTime || !searchForm.endTime) {
    const now = moment()
    const defaultStart = now.clone().subtract(24, 'hours')
    const defaultEnd = now.clone()
    
    if (currentMode.value === 'hour') {
      return {
        start: defaultStart.format('YYYY-MM-DD HH:mm:ss'),
        end: defaultEnd.format('YYYY-MM-DD HH:mm:ss')
      }
    }
    return {
      start: defaultStart.startOf('day').format('YYYY-MM-DD HH:mm:ss'),
      end: defaultEnd.endOf('day').format('YYYY-MM-DD HH:mm:ss')
    }
  }
  
  // 正常逻辑
  if (currentMode.value === 'hour') {
    return {
      start: moment(searchForm.startTime).format('YYYY-MM-DD HH:mm:ss'),
      end: moment(searchForm.endTime).format('YYYY-MM-DD HH:mm:ss')
    }
  }
  return {
    start: moment(searchForm.startTime).startOf('day').format('YYYY-MM-DD HH:mm:ss'),
    end: moment(searchForm.endTime).endOf('day').format('YYYY-MM-DD HH:mm:ss')
  }
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
    const { start, end } = getRequestTimes()
    if (currentMode.value === 'hour') {
      const resp = await powerApi.getHourlyEnergyConsumption({
        workshop: FIXED_WORKSHOP,
        startTime: start,
        endTime: end
      })
      const list = resp.data || []
      const total = list.reduce((sum, item) => sum + Number(item.energyConsumption || 0), 0)
      const first = list[0]
      const last = list[list.length - 1]
      const totalByRange = first && last ? Number(last.endEnergy || 0) - Number(first.startEnergy || 0) : 0

      statistics.workshop = FIXED_WORKSHOP
      statistics.electricConsumption = Number(total.toFixed(2))
      statistics.totalElectricConsumption = Number((totalByRange >= 0 ? totalByRange : 0).toFixed(2))
      return
    }

    const resp = await powerApi.getDailyEnergyConsumptionQuery({
      workshop: FIXED_WORKSHOP,
      startTime: start,
      endTime: end
    })
    const list = resp.data || []
    const total = list.reduce((sum, item) => sum + Number(item.energyConsumption || 0), 0)
    const first = list[0]
    const last = list[list.length - 1]
    const totalByRange = first && last ? Number(last.endEnergy || 0) - Number(first.startEnergy || 0) : 0

    statistics.workshop = FIXED_WORKSHOP
    statistics.electricConsumption = Number(total.toFixed(2))
    statistics.totalElectricConsumption = Number((totalByRange >= 0 ? totalByRange : 0).toFixed(2))
  } catch (error) {
    console.error('加载统计数据失败:', error)
  }
}

// 加载图表数据
const loadChartData = async () => {
  chartLoading.value = true
  try {
    const { start, end } = getRequestTimes()
    let seriesData: [number, number][] = []

    if (currentMode.value === 'hour') {
      const resp = await powerApi.getHourlyEnergyConsumption({
        workshop: FIXED_WORKSHOP,
        startTime: start,
        endTime: end
      })
      const list = resp.data || []
      seriesData = list.map(item => [moment(item.hour).valueOf(), Number(item.energyConsumption || 0)])
    } else {
      const resp = await powerApi.getDailyEnergyConsumptionQuery({
        workshop: FIXED_WORKSHOP,
        startTime: start,
        endTime: end
      })
      const list = resp.data || []
      seriesData = list.map(item => [moment(item.day).valueOf(), Number(item.energyConsumption || 0)])
    }

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
        data: seriesData,
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

// 加载表格数据（使用后端分页结构）
const loadTableData = async () => {
  tableLoading.value = true
  try {
    // 像 @front/ 一样使用简单的车间查询，避免复杂的分页查询
    const resp = await powerApi.getDataByWorkshop(FIXED_WORKSHOP)
    const allData = resp.data || []
    
    // 前端实现分页
    const startIndex = (pagination.current - 1) * pagination.pageSize
    const endIndex = startIndex + pagination.pageSize
    tableData.value = allData.slice(startIndex, endIndex)
    pagination.total = allData.length
  } catch (error) {
    console.error('加载表格数据失败:', error)
  } finally {
    tableLoading.value = false
  }
}

// 设置默认时间范围
const setDefaultTimeRange = () => {
  const now = moment()
  
  if (currentMode.value === 'hour') {
    // 小时模式：设置分离的日期和时间字段
    const startMoment = now.clone().subtract(24, 'hours')
    const endMoment = now.clone()
    
    startDate.value = startMoment.format('YYYY-MM-DD')
    startHour.value = startMoment.format('HH:00')
    endDate.value = endMoment.format('YYYY-MM-DD')
    endHour.value = endMoment.format('HH:00')
    
    // 同时更新searchForm
    searchForm.startTime = startMoment.format('YYYY-MM-DDTHH:00')
    searchForm.endTime = endMoment.format('YYYY-MM-DDTHH:00')
  } else {
    // 日模式：只选择日期
    searchForm.endTime = now.format('YYYY-MM-DD')
    searchForm.startTime = now.clone().subtract(7, 'days').format('YYYY-MM-DD')
  }
}

// 监听分离的日期和时间字段变化，同步到searchForm
watch([startDate, startHour], () => {
  if (currentMode.value === 'hour' && startDate.value && startHour.value) {
    searchForm.startTime = `${startDate.value}T${startHour.value}`
  }
})

watch([endDate, endHour], () => {
  if (currentMode.value === 'hour' && endDate.value && endHour.value) {
    searchForm.endTime = `${endDate.value}T${endHour.value}`
  }
})

// 组件挂载时初始化
onMounted(async () => {
  // 设置默认时间范围
  setDefaultTimeRange()
  
  // 等待下一个tick，确保响应式数据更新完成
  await nextTick()
  
  // 加载初始数据
  handleSearch()
})
</script>

<style lang="scss" scoped>
</style>