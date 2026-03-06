<template>
  <div class="user-management">
    <!-- 非管理员提示 -->
    <div v-if="!authState.isAdmin" class="no-permission">
      <i class="bi bi-shield-lock"></i>
      <p>您没有权限访问此页面</p>
    </div>

    <template v-else>
      <!-- 操作栏 -->
      <div class="user-toolbar">
        <h5 style="margin: 0; font-weight: 700; color: #1e293b;">用户管理</h5>
        <button class="btn-add" @click="openAddModal">
          <i class="bi bi-plus-lg"></i> 新增用户
        </button>
      </div>

      <!-- 用户列表表格 -->
      <div class="card" style="border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); border: none;">
        <div style="overflow-x: auto;">
          <table class="user-table">
            <thead>
              <tr>
                <th>账号</th>
                <th>用户名</th>
                <th>角色</th>
                <th>创建时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading">
                <td colspan="5" style="text-align: center; padding: 40px; color: #94a3b8;">加载中...</td>
              </tr>
              <tr v-else-if="userList.length === 0">
                <td colspan="5" style="text-align: center; padding: 40px; color: #94a3b8;">暂无数据</td>
              </tr>
              <tr v-for="user in userList" :key="user.id">
                <td>{{ user.userAccount }}</td>
                <td>{{ user.userName }}</td>
                <td>
                  <span class="role-badge" :class="user.userRole">
                    {{ user.userRole === 'admin' ? '管理员' : '普通用户' }}
                  </span>
                </td>
                <td>{{ user.createTime }}</td>
                <td>
                  <div class="action-btns">
                    <button class="btn-sm edit" @click="openEditModal(user)">
                      <i class="bi bi-pencil"></i> 编辑
                    </button>
                    <button class="btn-sm delete" @click="handleDelete(user)">
                      <i class="bi bi-trash"></i> 删除
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 分页 -->
        <div v-if="total > 0" class="pagination-bar" style="padding: 12px 20px; display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #f1f5f9;">
          <span style="font-size: 13px; color: #94a3b8;">共 {{ total }} 条记录</span>
          <div style="display: flex; gap: 6px;">
            <button class="page-btn" :disabled="currentPage <= 1" @click="changePage(currentPage - 1)">上一页</button>
            <span style="font-size: 13px; color: #64748b; line-height: 32px; padding: 0 8px;">{{ currentPage }} / {{ totalPages }}</span>
            <button class="page-btn" :disabled="currentPage >= totalPages" @click="changePage(currentPage + 1)">下一页</button>
          </div>
        </div>
      </div>

      <!-- 新增/编辑用户模态框 -->
      <div v-if="showModal" class="modal fade show" style="display: block;" tabindex="-1">
        <div class="modal-dialog modal-lg user-modal">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">{{ isEdit ? '编辑用户' : '新增用户' }}</h5>
              <button type="button" class="btn-close" @click="closeModal"></button>
            </div>
            <div class="modal-body">
              <div class="form-group">
                <label class="form-label">账号</label>
                <input v-model="form.userAccount" type="text" class="form-control" placeholder="请输入账号" :disabled="isEdit" />
              </div>
              <div v-if="!isEdit" class="form-group">
                <label class="form-label">密码</label>
                <input v-model="form.userPassword" type="password" class="form-control" placeholder="请输入密码" />
              </div>
              <div class="form-group">
                <label class="form-label">用户名</label>
                <input v-model="form.userName" type="text" class="form-control" placeholder="请输入用户名" />
              </div>
              <div class="form-group">
                <label class="form-label">角色</label>
                <select v-model="form.userRole" class="form-select">
                  <option value="user">普通用户</option>
                  <option value="admin">管理员</option>
                </select>
              </div>

              <!-- 页面权限配置 -->
              <div class="form-group">
                <label class="form-label">页面权限</label>
                <div class="perm-actions">
                  <button @click="selectAllPerms">全选</button>
                  <button @click="clearAllPerms">取消全选</button>
                </div>

                <!-- 核心页面 -->
                <div class="perm-section">
                  <div class="perm-section-title">📊 统计报表</div>
                  <div class="perm-grid">
                    <div v-for="item in corePermItems" :key="item.key" class="perm-item">
                      <input :id="'perm-' + item.key" v-model="form.permissions[item.key]" type="checkbox" />
                      <label :for="'perm-' + item.key">{{ item.label }}</label>
                    </div>
                  </div>
                </div>

                <!-- 车间页面 -->
                <div class="perm-section">
                  <div class="perm-section-title">🏭 车间监控</div>
                  <div class="perm-grid">
                    <div v-for="item in workshopPermItems" :key="item.key" class="perm-item">
                      <input :id="'perm-' + item.key" v-model="form.permissions[item.key]" type="checkbox" />
                      <label :for="'perm-' + item.key">{{ item.label }}</label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="closeModal">取消</button>
              <button type="button" class="btn btn-primary" :disabled="submitLoading || !canSubmit" @click="handleSubmit">
                {{ submitLoading ? '提交中...' : '确定' }}
              </button>
            </div>
          </div>
        </div>
      </div>
      <div v-if="showModal" class="modal-backdrop fade show"></div>
    </template>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { listUserByPage, addUser, updateUser, deleteUser } from '@/api/user'
import { authState } from '@/auth'
import { workshopRoutes } from '@/router/index'
import '@/styles/user-management.css'

const router = useRouter()

// 核心页面权限列表
const corePermItems = [
  { key: 'monthly-energy', label: '月度能耗统计' },
  { key: 'hourly-energy', label: '日能耗统计' },
  { key: 'electricity-cost-allocation', label: '电费分摊计算' }
]

// 从路由配置提取车间权限列表
const workshopPermItems = workshopRoutes.map(r => ({
  key: r.meta.permKey,
  label: r.meta.title
}))

// 所有权限 key 列表
const allPermKeys = [
  ...corePermItems.map(i => i.key),
  ...workshopPermItems.map(i => i.key)
]

// 用户列表数据
const userList = ref([])
const loading = ref(false)
const currentPage = ref(1)
const total = ref(0)
const pageSize = 10
const totalPages = computed(() => total.value === 0 ? 0 : Math.ceil(total.value / pageSize))

// 模态框状态
const showModal = ref(false)
const isEdit = ref(false)
const submitLoading = ref(false)
const editingUserId = ref(null)

const form = reactive({
  userAccount: '',
  userPassword: '',
  userName: '',
  userRole: 'user',
  permissions: {}
})

const canSubmit = computed(() => {
  if (isEdit.value) {
    return form.userName.trim() !== ''
  }
  return form.userAccount.trim() !== '' && form.userPassword.trim() !== '' && form.userName.trim() !== ''
})

// 非管理员重定向
onMounted(() => {
  if (!authState.isAdmin) {
    router.push('/monthly-energy')
    return
  }
  loadUsers()
})

async function loadUsers() {
  loading.value = true
  try {
    const res = await listUserByPage({ current: currentPage.value, pageSize })
    userList.value = res.records || []
    total.value = res.total || 0
  } catch (err) {
    console.error('加载用户列表失败:', err.message)
  } finally {
    loading.value = false
  }
}

function changePage(page) {
  currentPage.value = page
  loadUsers()
}

// 初始化权限对象
function initPermissions() {
  const perms = {}
  allPermKeys.forEach(key => { perms[key] = false })
  return perms
}

function openAddModal() {
  isEdit.value = false
  editingUserId.value = null
  form.userAccount = ''
  form.userPassword = ''
  form.userName = ''
  form.userRole = 'user'
  form.permissions = initPermissions()
  showModal.value = true
}

function openEditModal(user) {
  isEdit.value = true
  editingUserId.value = user.id
  form.userAccount = user.userAccount
  form.userPassword = ''
  form.userName = user.userName
  form.userRole = user.userRole

  // 解析已有权限
  const perms = initPermissions()
  try {
    const saved = user.pagePermissions ? JSON.parse(user.pagePermissions) : {}
    Object.keys(saved).forEach(key => {
      if (key in perms) perms[key] = saved[key] === true
    })
  } catch { /* ignore */ }
  form.permissions = perms
  showModal.value = true
}

function closeModal() {
  showModal.value = false
}

function selectAllPerms() {
  allPermKeys.forEach(key => { form.permissions[key] = true })
}

function clearAllPerms() {
  allPermKeys.forEach(key => { form.permissions[key] = false })
}

// 构建 pagePermissions JSON 字符串（仅保存 true 的项）
function buildPermissionsJson() {
  const result = {}
  Object.keys(form.permissions).forEach(key => {
    if (form.permissions[key]) result[key] = true
  })
  return JSON.stringify(result)
}

async function handleSubmit() {
  submitLoading.value = true
  try {
    const pagePermissions = buildPermissionsJson()
    if (isEdit.value) {
      await updateUser({
        id: editingUserId.value,
        userName: form.userName,
        userRole: form.userRole,
        pagePermissions
      })
    } else {
      await addUser({
        userAccount: form.userAccount,
        userPassword: form.userPassword,
        userName: form.userName,
        userRole: form.userRole,
        pagePermissions
      })
    }
    closeModal()
    loadUsers()
  } catch (err) {
    alert(err.message || '操作失败')
  } finally {
    submitLoading.value = false
  }
}

async function handleDelete(user) {
  if (!window.confirm(`确定要删除用户 "${user.userName}" 吗？`)) return
  try {
    await deleteUser(user.id)
    loadUsers()
  } catch (err) {
    alert(err.message || '删除失败')
  }
}
</script>
