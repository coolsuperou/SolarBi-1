<template>
  <div class="table-container tech-card">
    <div class="table-header d-flex justify-content-between align-items-center mb-3">
      <h5 class="table-title text-glow-primary mb-0">
        <i class="bi bi-table me-2"></i>
        {{ title }}
      </h5>
      <div class="table-actions" v-if="showRefresh">
        <button 
          class="btn btn-sm btn-glow"
          @click="refresh"
          :disabled="loading"
        >
          <i class="bi bi-arrow-clockwise me-1" :class="{ 'spinning': loading }"></i>
          刷新
        </button>
      </div>
    </div>

    <div class="table-responsive">
      <table class="table table-tech table-hover">
        <thead>
          <tr>
            <th v-for="column in columns" :key="column.key" :style="{ width: column.width }">
              {{ column.title }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in data" :key="item.id || index">
            <td v-for="column in columns" :key="column.key">
              <slot 
                :name="column.key" 
                :item="item" 
                :value="getNestedValue(item, column.key)"
                :index="index"
              >
                {{ formatValue(getNestedValue(item, column.key), column) }}
              </slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="table-loading text-center py-4">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">加载中...</span>
      </div>
      <p class="mt-2 text-secondary">正在加载数据...</p>
    </div>

    <!-- 空数据状态 -->
    <div v-else-if="!data || data.length === 0" class="table-empty text-center py-5">
      <i class="bi bi-inbox display-1 text-secondary mb-3"></i>
      <p class="text-secondary">暂无数据</p>
    </div>

    <!-- 分页 -->
    <div v-if="pagination && !loading && data.length > 0" class="table-pagination">
      <nav aria-label="表格分页">
        <ul class="pagination justify-content-center mb-0">
          <li class="page-item" :class="{ disabled: pagination.current <= 1 }">
            <button 
              class="page-link"
              @click="changePage(pagination.current - 1)"
              :disabled="pagination.current <= 1"
            >
              <i class="bi bi-chevron-left"></i>
            </button>
          </li>
          
          <li 
            v-for="page in visiblePages" 
            :key="page"
            class="page-item"
            :class="{ active: page === pagination.current }"
          >
            <button class="page-link" @click="changePage(page)">
              {{ page }}
            </button>
          </li>
          
          <li class="page-item" :class="{ disabled: pagination.current >= totalPages }">
            <button 
              class="page-link"
              @click="changePage(pagination.current + 1)"
              :disabled="pagination.current >= totalPages"
            >
              <i class="bi bi-chevron-right"></i>
            </button>
          </li>
        </ul>
      </nav>
      
      <div class="pagination-info text-center mt-2">
        <small class="text-secondary">
          第 {{ pagination.current }} 页，共 {{ totalPages }} 页，总计 {{ pagination.total }} 条记录
        </small>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import moment from 'moment'

interface Column {
  key: string
  title: string
  width?: string
  format?: 'text' | 'number' | 'date' | 'datetime'
  precision?: number
}

interface Pagination {
  current: number
  pageSize: number
  total: number
}

interface Props {
  title?: string
  columns: Column[]
  data: any[]
  loading?: boolean
  pagination?: Pagination
  showRefresh?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: '数据表格',
  loading: false,
  showRefresh: true
})

const emit = defineEmits<{
  refresh: []
  pageChange: [page: number]
}>()

// 计算总页数
const totalPages = computed(() => {
  if (!props.pagination) return 1
  return Math.ceil(props.pagination.total / props.pagination.pageSize)
})

// 计算可见页码
const visiblePages = computed(() => {
  if (!props.pagination) return []
  
  const current = props.pagination.current
  const total = totalPages.value
  const pages: number[] = []
  
  // 显示逻辑：当前页前后各显示2页
  const start = Math.max(1, current - 2)
  const end = Math.min(total, current + 2)
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  
  return pages
})

// 获取嵌套对象的值
const getNestedValue = (obj: any, key: string) => {
  return key.split('.').reduce((o, k) => o?.[k], obj)
}

// 格式化值
const formatValue = (value: any, column: Column) => {
  if (value === null || value === undefined) return '-'
  
  switch (column.format) {
    case 'number':
      return typeof value === 'number' ? value.toFixed(column.precision || 2) : value
    case 'date':
      return moment(value).format('YYYY-MM-DD')
    case 'datetime':
      return moment(value).format('YYYY-MM-DD HH:mm:ss')
    default:
      return value
  }
}

// 刷新数据
const refresh = () => {
  emit('refresh')
}

// 切换页码
const changePage = (page: number) => {
  if (page < 1 || page > totalPages.value) return
  emit('pageChange', page)
}
</script>

<style lang="scss" scoped>
.table-container {
  padding: $spacing-lg;
}

.table-header {
  .table-title {
    font-size: $font-size-lg;
    font-weight: 700;
  }
}

.table-responsive {
  border-radius: $border-radius-md;
  overflow: hidden;
}

.table-loading,
.table-empty {
  min-height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.table-pagination {
  margin-top: $spacing-lg;
  padding-top: $spacing-md;
  border-top: 1px solid $border-primary;
  
  .pagination .page-link {
    background: linear-gradient(135deg, $bg-card, $bg-table);
    border: 2px solid $border-primary;
    color: $text-glow;
    font-weight: 600;
    margin: 0 2px;
    border-radius: $border-radius-md;
    transition: all 0.3s ease;
    
    &:hover {
      background: linear-gradient(135deg, rgba(0, 212, 255, 0.3), rgba(0, 212, 255, 0.2));
      border-color: $border-secondary;
      color: $text-glow;
      transform: translateY(-1px);
    }
    
    &:focus {
      box-shadow: $glow-primary;
    }
  }
  
  .page-item.active .page-link {
    background: linear-gradient(135deg, $primary-color, $primary-dark);
    border-color: $primary-color;
    color: $text-primary;
    font-weight: 700;
    box-shadow: $glow-primary;
  }
  
  .page-item.disabled .page-link {
    background: rgba(10, 25, 41, 0.6);
    border-color: rgba(0, 212, 255, 0.3);
    color: rgba(255, 255, 255, 0.5);
    cursor: not-allowed;
    transform: none;
  }
}

.pagination-info {
  color: $text-secondary;
  font-size: $font-size-sm;
}

// 加载动画
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.spinning {
  animation: spin 1s linear infinite;
}

// 响应式调整
@media (max-width: $breakpoint-md) {
  .table-container {
    padding: $spacing-md;
  }
  
  .table-header {
    flex-direction: column;
    align-items: stretch;
    gap: $spacing-md;
    
    .table-actions {
      align-self: flex-end;
    }
  }
}

@media (max-width: $breakpoint-sm) {
  .table-responsive {
    font-size: $font-size-sm;
  }
  
  .pagination {
    justify-content: center !important;
    flex-wrap: wrap;
    
    .page-link {
      font-size: $font-size-xs;
      padding: 0.25rem 0.5rem;
    }
  }
}
</style>
