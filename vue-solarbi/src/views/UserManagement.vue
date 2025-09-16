<template>
  <div class="user-management">
    <!-- 页面标题 -->
    <div class="page-header mb-4">
      <h2 class="page-title text-glow-primary">
        <i class="bi bi-people-fill me-2"></i>
        用户管理
      </h2>
      <p class="page-description text-secondary">
        管理系统用户账号、权限和基本信息
      </p>
    </div>

    <!-- 操作工具栏 -->
    <div class="toolbar-section mb-4">
      <div class="tech-card p-3">
        <div class="row g-3 align-items-end">
          <div class="col-md-3">
            <label class="form-label text-glow-primary fw-semibold">
              <i class="bi bi-search me-1"></i>搜索用户
            </label>
            <input
              type="text"
              v-model="searchForm.keyword"
              class="form-control form-control-glow"
              placeholder="输入用户名或账号"
              @input="debounceSearch"
            />
          </div>
          <div class="col-md-2">
            <label class="form-label text-glow-primary fw-semibold">
              <i class="bi bi-funnel me-1"></i>用户角色
            </label>
            <select v-model="searchForm.userRole" class="form-select form-control-glow" @change="handleSearch">
              <option value="">全部角色</option>
              <option value="admin">管理员</option>
              <option value="user">普通用户</option>
            </select>
          </div>
          <div class="col-md-2">
            <label class="form-label text-glow-primary fw-semibold">
              <i class="bi bi-toggle-on me-1"></i>用户状态
            </label>
            <select v-model="searchForm.userStatus" class="form-select form-control-glow" @change="handleSearch">
              <option value="">全部状态</option>
              <option value="0">正常</option>
              <option value="1">禁用</option>
            </select>
          </div>
          <div class="col-md-5">
            <div class="d-flex gap-2">
              <button type="button" class="btn btn-glow" @click="openCreateModal">
                <i class="bi bi-plus-circle me-1"></i>
                新增用户
              </button>
              <button type="button" class="btn btn-outline-secondary" @click="resetSearch">
                <i class="bi bi-arrow-clockwise me-1"></i>
                重置筛选
              </button>
              <button type="button" class="btn btn-outline-info" @click="exportUsers" :disabled="loading">
                <i class="bi bi-download me-1"></i>
                导出数据
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 用户列表 -->
    <div class="table-section">
      <DataTable
        title="用户列表"
        :columns="tableColumns"
        :data="tableData"
        :loading="loading"
        :pagination="pagination"
        @refresh="loadUsers"
        @page-change="handlePageChange"
      >
        <!-- 自定义列内容 -->
        <template #userAvatar="{ value, item }">
          <div class="user-avatar-wrapper">
            <img 
              v-if="value" 
              :src="value" 
              :alt="item.userName"
              class="user-avatar"
            />
            <div v-else class="user-avatar-placeholder">
              <i class="bi bi-person-fill"></i>
            </div>
          </div>
        </template>
        
        <template #userName="{ value }">
          <div class="fw-bold text-glow-primary">{{ value }}</div>
        </template>

        <template #userAccount="{ value }">
          <div class="text-secondary">{{ value }}</div>
        </template>
        
        <template #userRole="{ value }">
          <span 
            class="badge"
            :class="value === 'admin' ? 'bg-danger' : 'bg-primary'"
          >
            {{ value === 'admin' ? '管理员' : '普通用户' }}
          </span>
        </template>
        
        <template #userStatus="{ value }">
          <span 
            class="badge"
            :class="value === 0 ? 'bg-success' : 'bg-secondary'"
          >
            {{ value === 0 ? '正常' : '禁用' }}
          </span>
        </template>
        
        <template #gender="{ value }">
          <span v-if="value === 1" class="text-info">
            <i class="bi bi-gender-male me-1"></i>男
          </span>
          <span v-else-if="value === 0" class="text-danger">
            <i class="bi bi-gender-female me-1"></i>女
          </span>
          <span v-else class="text-secondary">未设置</span>
        </template>
        
        <template #createTime="{ value }">
          <span class="text-glow-secondary">{{ formatDateTime(value) }}</span>
        </template>
        
        <template #actions="{ item }">
          <div class="btn-group btn-group-sm">
            <button 
              class="btn btn-outline-primary"
              @click="openEditModal(item)"
              title="编辑"
            >
              <i class="bi bi-pencil"></i>
            </button>
            <button 
              class="btn btn-outline-danger"
              @click="deleteUser(item)"
              title="删除"
              :disabled="item.userRole === 'admin'"
            >
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </template>
      </DataTable>
    </div>

    <!-- 用户编辑模态框 -->
    <div class="modal fade" id="userModal" tabindex="-1" ref="userModalRef">
      <div class="modal-dialog modal-lg">
        <div class="modal-content tech-card border-0">
          <div class="modal-header border-bottom border-primary">
            <h5 class="modal-title text-glow-primary">
              <i class="bi bi-person-gear me-2"></i>
              {{ modalMode === 'create' ? '新增用户' : '编辑用户' }}
            </h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveUser" class="row g-3">
              <div class="col-md-6">
                <label class="form-label text-glow-primary fw-semibold">用户账号 *</label>
                <input
                  type="text"
                  v-model="userForm.userAccount"
                  class="form-control form-control-glow"
                  :disabled="modalMode === 'edit'"
                  required
                />
              </div>
              <div class="col-md-6" v-if="modalMode === 'create'">
                <label class="form-label text-glow-primary fw-semibold">登录密码 *</label>
                <input
                  type="password"
                  v-model="userForm.userPassword"
                  class="form-control form-control-glow"
                  required
                />
              </div>
              <div class="col-md-6">
                <label class="form-label text-glow-primary fw-semibold">用户姓名</label>
                <input
                  type="text"
                  v-model="userForm.userName"
                  class="form-control form-control-glow"
                />
              </div>
              <div class="col-md-6">
                <label class="form-label text-glow-primary fw-semibold">用户角色 *</label>
                <select v-model="userForm.userRole" class="form-select form-control-glow" required>
                  <option value="user">普通用户</option>
                  <option value="admin">管理员</option>
                </select>
              </div>
            </form>
          </div>
          <div class="modal-footer border-top border-primary">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">取消</button>
            <button type="button" class="btn btn-glow" @click="saveUser" :disabled="saveLoading">
              <span v-if="saveLoading">
                <i class="bi bi-arrow-clockwise me-1 spinning"></i>保存中...
              </span>
              <span v-else>
                <i class="bi bi-check me-1"></i>保存
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { Modal } from 'bootstrap'
import moment from 'moment'
import { debounce } from 'lodash-es'
import DataTable from '@/components/DataTable.vue'
import type { User } from '@/types/user'
import { userApi } from '@/api/user'

// 响应式数据
const loading = ref(false)
const saveLoading = ref(false)
const modalMode = ref<'create' | 'edit'>('create')
const userModalRef = ref<HTMLElement>()
let userModal: Modal | null = null

const searchForm = reactive({
  keyword: '',
  userRole: '',
  userStatus: ''
})

const userForm = reactive({
  id: 0,
  userAccount: '',
  userName: '',
  userPassword: '',
  userRole: 'user' as 'user' | 'admin'
})

const tableData = ref<User[]>([])
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0
})

// 表格列配置（移除：状态、性别、电话、邮箱）
const tableColumns = computed(() => [
  { key: 'userAvatar', title: '头像', width: '80px' },
  { key: 'userName', title: '用户信息', width: '200px' },
  { key: 'userAccount', title: '账号', width: '160px' },
  { key: 'userRole', title: '角色', width: '120px' },
  { key: 'createTime', title: '创建时间', width: '180px', format: 'datetime' },
  { key: 'actions', title: '操作', width: '160px' }
])

// 防抖搜索
const debounceSearch = debounce(() => {
  handleSearch()
}, 500)

// 格式化日期时间
const formatDateTime = (value: string) => {
  return moment(value).format('YYYY-MM-DD HH:mm:ss')
}

// 搜索处理
const handleSearch = () => {
  pagination.current = 1
  loadUsers()
}

// 重置搜索
const resetSearch = () => {
  searchForm.keyword = ''
  searchForm.userRole = ''
  searchForm.userStatus = ''
  handleSearch()
}

// 页码切换
const handlePageChange = (page: number) => {
  pagination.current = page
  loadUsers()
}

// 加载用户列表（真实接口）
const loadUsers = async () => {
  loading.value = true
  try {
    const resp = await userApi.getUserList({
      current: pagination.current,
      pageSize: pagination.pageSize,
      keyword: searchForm.keyword || undefined,
      userRole: searchForm.userRole || undefined
    })
    const payload: any = resp.data || {}
    tableData.value = payload.records || []
    pagination.total = Number(payload.total || 0)
  } catch (error) {
    console.error('加载用户列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 打开创建用户模态框
const openCreateModal = () => {
  modalMode.value = 'create'
  resetUserForm()
  userModal?.show()
}

// 打开编辑用户模态框
const openEditModal = (user: User) => {
  modalMode.value = 'edit'
  Object.assign(userForm, {
    id: user.id,
    userAccount: user.userAccount,
    userName: user.userName || '',
    userPassword: '',
    userRole: user.userRole
  })
  userModal?.show()
}

// 重置用户表单
const resetUserForm = () => {
  Object.assign(userForm, {
    id: 0,
    userAccount: '',
    userName: '',
    userPassword: '',
    userRole: 'user'
  })
}

// 保存用户（真实接口）
const saveUser = async () => {
  saveLoading.value = true
  try {
    if (modalMode.value === 'create') {
      await userApi.createUser({
        userAccount: userForm.userAccount,
        userPassword: userForm.userPassword,
        userName: userForm.userName || undefined,
        userRole: userForm.userRole
      })
    } else {
      await userApi.updateUser({
        id: userForm.id,
        userName: userForm.userName || undefined,
        userRole: userForm.userRole
      })
    }
    userModal?.hide()
    await loadUsers()
  } catch (error) {
    console.error('保存用户失败:', error)
  } finally {
    saveLoading.value = false
  }
}

// 已移除状态切换按钮

// 删除用户（真实接口）
const deleteUser = async (user: User) => {
  if (!confirm(`确定要删除用户 "${user.userName || user.userAccount}" 吗？`)) {
    return
  }
  
  try {
    await userApi.deleteUser(Number(user.id))
    await loadUsers()
  } catch (error) {
    console.error('删除用户失败:', error)
  }
}

// 导出用户数据
const exportUsers = async () => {
  try {
    console.log('导出用户数据')
    // 实际项目中这里应该调用导出API
  } catch (error) {
    console.error('导出用户数据失败:', error)
  }
}

// （移除模拟数据生成）

// 组件挂载时初始化
onMounted(() => {
  // 初始化模态框
  if (userModalRef.value) {
    userModal = new Modal(userModalRef.value)
  }
  
  // 加载初始数据
  loadUsers()
})
</script>

<style lang="scss" scoped>
.user-management {
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
  
  .toolbar-section {
    .form-label {
      font-size: $font-size-sm;
      margin-bottom: $spacing-xs;
    }
  }
}

.user-avatar-wrapper {
  display: flex;
  justify-content: center;
  
  .user-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid $border-primary;
  }
  
  .user-avatar-placeholder {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: linear-gradient(135deg, $bg-card, $bg-table);
    border: 2px solid $border-primary;
    display: flex;
    align-items: center;
    justify-content: center;
    color: $text-glow;
    font-size: 1.2rem;
  }
}

.modal-content {
  background: linear-gradient(135deg, $bg-card, $bg-table);
  border: 2px solid $border-primary;
  
  .modal-header {
    background: linear-gradient(135deg, rgba(0, 212, 255, 0.1), rgba(0, 212, 255, 0.05));
  }
  
  .modal-footer {
    background: linear-gradient(135deg, rgba(0, 212, 255, 0.05), rgba(0, 212, 255, 0.02));
  }
}

.btn-group-sm .btn {
  padding: 0.25rem 0.5rem;
  font-size: $font-size-xs;
  
  &.btn-outline-primary:hover {
    background: rgba(0, 212, 255, 0.1);
    border-color: $primary-color;
    color: $primary-color;
  }
  
  &.btn-outline-warning:hover {
    background: rgba(255, 215, 0, 0.1);
    border-color: $warning-color;
    color: $warning-color;
  }
  
  &.btn-outline-danger:hover {
    background: rgba(255, 61, 113, 0.1);
    border-color: $danger-color;
    color: $danger-color;
  }
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
  .user-management {
    .toolbar-section {
      .row {
        --bs-gutter-x: 0.5rem;
      }
    }
  }
  
  .modal-dialog {
    margin: 1rem;
  }
}

@media (max-width: $breakpoint-sm) {
  .user-management {
    .toolbar-section {
      .d-flex {
        flex-direction: column;
        gap: 0.5rem !important;
      }
    }
  }
  
  .btn-group {
    flex-direction: column;
    
    .btn {
      border-radius: $border-radius-sm !important;
      margin-bottom: 2px;
    }
  }
}
</style>
