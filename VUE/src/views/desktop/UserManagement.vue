<template>
  <div class="user-management">
    <!-- 非管理员提示 -->
    <div v-if="!authState.isAdmin" class="no-permission">
      <i class="bi bi-shield-lock"></i>
      <p>您没有权限访问此页面</p>
    </div>

    <template v-else>
      <!-- 操作栏：标题 + 搜索 + 新增 -->
      <div class="user-toolbar">
        <h5 style="margin: 0; font-weight: 700; color: #1e293b;">
          <i class="bi bi-people-fill" style="color: #3b82f6; margin-right: 8px;"></i>用户管理
        </h5>
        <div class="toolbar-right">
          <div class="search-wrap">
            <i class="bi bi-search search-icon"></i>
            <input
              v-model="searchText"
              type="text"
              placeholder="搜索账号、用户名、角色..."
              @keypress.enter="doSearch"
            />
          </div>
          <button class="btn-add" @click="openAddModal">
            <i class="bi bi-plus-lg"></i> 新增用户
          </button>
        </div>
      </div>

      <!-- 统计卡片 -->
      <div class="stats-row">
        <div class="stat-card">
          <div class="stat-icon total"><i class="bi bi-people"></i></div>
          <div class="stat-info"><h3>{{ allUsers.length }}</h3><p>用户总数</p></div>
        </div>
        <div class="stat-card">
          <div class="stat-icon admin"><i class="bi bi-shield-check"></i></div>
          <div class="stat-info"><h3>{{ adminCount }}</h3><p>管理员</p></div>
        </div>
        <div class="stat-card">
          <div class="stat-icon user-stat"><i class="bi bi-person"></i></div>
          <div class="stat-info"><h3>{{ userCount }}</h3><p>普通用户</p></div>
        </div>
        <div class="stat-card">
          <div class="stat-icon active"><i class="bi bi-activity"></i></div>
          <div class="stat-info"><h3>{{ activeCount }}</h3><p>活跃用户</p></div>
        </div>
      </div>

      <!-- 用户列表表格 -->
      <div class="table-card">
        <div style="overflow-x: auto;">
          <table class="user-table">
            <thead>
              <tr>
                <th style="width: 50px; text-align: center;">ID</th>
                <th>用户账号</th>
                <th>用户昵称</th>
                <th>角色</th>
                <th>密码</th>
                <th>状态</th>
                <th>创建时间</th>
                <th>最后登录</th>
                <th style="text-align: center;">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading">
                <td colspan="9" style="text-align: center; padding: 40px; color: #94a3b8;">加载中...</td>
              </tr>
              <tr v-else-if="filteredUsers.length === 0">
                <td colspan="9" style="text-align: center; padding: 40px; color: #94a3b8;">暂无数据</td>
              </tr>
              <tr v-for="user in filteredUsers" :key="user.id">
                <td style="text-align: center; color: #94a3b8;">{{ user.id }}</td>
                <td>{{ user.userAccount }}</td>
                <td>{{ user.userName || '-' }}</td>
                <td>
                  <span class="role-badge" :class="user.userRole">
                    {{ user.userRole === 'admin' ? '管理员' : '普通用户' }}
                  </span>
                </td>
                <td style="text-align: center;">
                  <span class="password-display">{{ passwordVisible[user.id] ? user.userPassword : '••••••••' }}</span>
                  <button class="btn-pwd-toggle" @click="togglePassword(user.id)">
                    <i :class="passwordVisible[user.id] ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
                    {{ passwordVisible[user.id] ? '隐藏' : '显示' }}
                  </button>
                </td>
                <td style="text-align: center;">
                  <span class="status-dot" :class="user.userStatus === 'active' ? 'active' : 'inactive'"></span>
                  {{ user.userStatus === 'active' ? '活跃' : '禁用' }}
                </td>
                <td class="time-text">{{ formatTime(user.createTime) }}</td>
                <td class="time-text">{{ formatTime(user.lastLoginTime) }}</td>
                <td>
                  <div class="action-group">
                    <button class="btn-action edit" @click="openEditModal(user)">
                      <i class="bi bi-pencil"></i> 编辑
                    </button>
                    <button class="btn-action perm" @click="openPermModal(user)">
                      <i class="bi bi-key"></i> 权限
                    </button>
                    <button class="btn-action delete" @click="handleDelete(user)">
                      <i class="bi bi-trash"></i> 删除
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ===== 新增/编辑用户模态框 ===== -->
      <div v-if="showModal" class="modal fade show" style="display: block;" tabindex="-1">
        <div class="modal-dialog modal-lg user-modal">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">
                <i :class="isEdit ? 'bi bi-pencil-square' : 'bi bi-person-plus'" style="color: #3b82f6; margin-right: 6px;"></i>
                {{ isEdit ? '编辑用户' : '新增用户' }}
              </h5>
              <button type="button" class="btn-close" @click="closeModal"></button>
            </div>
            <div class="modal-body">
              <div class="form-group">
                <label class="form-label">用户账号 <span class="required">*</span></label>
                <input v-model="form.userAccount" type="text" class="form-control" placeholder="请输入账号（用于登录）" :disabled="isEdit" />
                <div class="form-help">用于登录界面使用</div>
              </div>
              <div class="form-group">
                <label class="form-label">用户昵称</label>
                <input v-model="form.userName" type="text" class="form-control" placeholder="请输入用户昵称（可选）" />
                <div class="form-help">显示名称，可以使用中文</div>
              </div>
              <div class="form-row-2col">
                <div class="form-group">
                  <label class="form-label">密码 <span class="required">*</span></label>
                  <input v-model="form.userPassword" type="password" class="form-control" placeholder="请输入密码" />
                  <div class="form-help">建议使用6位以上的密码</div>
                </div>
                <div v-if="!isEdit" class="form-group">
                  <label class="form-label">确认密码 <span class="required">*</span></label>
                  <input v-model="form.confirmPassword" type="password" class="form-control" placeholder="请再次输入密码" />
                </div>
              </div>
              <div class="form-row-2col">
                <div class="form-group">
                  <label class="form-label">角色 <span class="required">*</span></label>
                  <select v-model="form.userRole" class="form-select">
                    <option value="user">普通用户</option>
                    <option value="admin">管理员</option>
                  </select>
                  <div class="form-help">管理员拥有所有权限</div>
                </div>
                <div class="form-group">
                  <label class="form-label">状态</label>
                  <select v-model="form.userStatus" class="form-select">
                    <option value="active">活跃</option>
                    <option value="inactive">禁用</option>
                  </select>

                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="closeModal">取消</button>
              <button type="button" class="btn btn-primary" :disabled="submitLoading || !canSubmit" @click="handleSubmit">
                {{ submitLoading ? '提交中...' : (isEdit ? '保存修改' : '创建用户') }}
              </button>
            </div>
          </div>
        </div>
      </div>
      <div v-if="showModal" class="modal-backdrop fade show"></div>

      <!-- ===== 独立权限模态框（卡片式） ===== -->
      <div v-if="showPermModal" class="modal fade show" style="display: block;" tabindex="-1">
        <div class="modal-dialog modal-xl user-modal perm-modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">
                <i class="bi bi-shield-lock" style="color: #8b5cf6; margin-right: 6px;"></i>
                页面访问权限设置
              </h5>
              <button type="button" class="btn-close" @click="closePermModal"></button>
            </div>
            <div class="modal-body">
              <!-- 用户信息提示 -->
              <div class="perm-user-info">
                用户: <span class="perm-user-name">{{ permUser?.userAccount }}</span>
                <span class="perm-user-nick">({{ permUser?.userName || '未设置昵称' }})</span>
              </div>

              <!-- 快捷操作 + 统计 -->
              <div class="perm-toolbar">
                <div class="perm-quick-actions">
                  <button class="perm-quick-btn" @click="permSelectAll"><i class="bi bi-check-all"></i> 全选</button>
                  <button class="perm-quick-btn" @click="permClearAll"><i class="bi bi-x-lg"></i> 全不选</button>
                </div>
                <div class="perm-stats">
                  <span class="perm-stat-item selected">已选择 <b>{{ permSelectedCount }}</b></span>
                  <span class="perm-stat-item unselected">未选择 <b>{{ permUnselectedCount }}</b></span>
                </div>
              </div>

              <!-- 📊 统计报表分组 -->
              <div class="perm-section-group">
                <div class="perm-section-header" @click="coreCollapsed = !coreCollapsed">
                  <i class="bi" :class="coreCollapsed ? 'bi-chevron-right' : 'bi-chevron-down'"></i>
                  <span class="perm-section-icon">📊</span>
                  <span class="perm-section-title">统计报表</span>
                  <span class="perm-section-count">{{ coreSelectedCount }} / {{ corePermItemsFull.length }}</span>
                </div>
                <div v-show="!coreCollapsed" class="perm-cards-grid">
                  <div
                    v-for="item in corePermItemsFull"
                    :key="item.key"
                    class="perm-card"
                    :class="{ active: permForm[item.key] }"
                    @click="togglePerm(item.key)"
                  >
                    <div class="perm-card-content">
                      <span class="perm-card-icon">{{ item.icon }}</span>
                      <div class="perm-card-label">
                        <div class="perm-card-name">{{ item.name }}</div>
                        <div class="perm-card-desc">{{ item.desc }}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 🏭 车间监控分组 -->
              <div class="perm-section-group">
                <div class="perm-section-header" @click="workshopCollapsed = !workshopCollapsed">
                  <i class="bi" :class="workshopCollapsed ? 'bi-chevron-right' : 'bi-chevron-down'"></i>
                  <span class="perm-section-icon">🏭</span>
                  <span class="perm-section-title">车间监控</span>
                  <span class="perm-section-count">{{ workshopSelectedCount }} / {{ workshopPermItemsFull.length }}</span>
                </div>
                <div v-show="!workshopCollapsed" class="perm-cards-grid">
                  <div
                    v-for="item in workshopPermItemsFull"
                    :key="item.key"
                    class="perm-card"
                    :class="{ active: permForm[item.key] }"
                    @click="togglePerm(item.key)"
                  >
                    <div class="perm-card-content">
                      <span class="perm-card-icon">{{ item.icon }}</span>
                      <div class="perm-card-label">
                        <div class="perm-card-name">{{ item.name }}</div>
                        <div class="perm-card-desc">{{ item.desc }}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <div class="perm-footer-tip">💡 提示：点击卡片切换权限，设置完成后点击保存</div>
              <div class="perm-footer-btns">
                <button type="button" class="btn btn-secondary" @click="closePermModal">取消</button>
                <button type="button" class="btn btn-primary" :disabled="permSaving" @click="savePermissions">
                  {{ permSaving ? '保存中...' : '💾 保存权限' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-if="showPermModal" class="modal-backdrop fade show"></div>
    </template>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { listUserByPage, addUser, updateUser, deleteUser } from '@/api/user'
import { authState, fetchCurrentUser } from '@/auth'
import { workshopRoutes } from '@/router/index'
import '@/styles/desktop/user-management.css'

const router = useRouter()

// ===== 权限定义（与旧版React一致，含icon/desc/category） =====
const corePermItemsFull = [
  { key: 'monthly-energy', icon: '📊', name: '月度能耗统计', desc: '查看月度电能消耗数据', category: '统计' },
  { key: 'hourly-energy', icon: '📈', name: '日能耗统计', desc: '查看日度电能消耗数据', category: '统计' },
  { key: 'electricity-cost-allocation', icon: '💰', name: '电费分摊计算', desc: '电费分摊计算与统计', category: '统计' }
]

const workshopPermItemsFull = workshopRoutes.map(r => ({
  key: r.meta.permKey,
  name: r.meta.title,
  icon: '🏭',
  desc: r.meta.title + '能耗监控',
  category: '车间'
}))

const allPermItemsFull = [...corePermItemsFull, ...workshopPermItemsFull]
const allPermKeys = allPermItemsFull.map(i => i.key)

// ===== 数据状态 =====
const allUsers = ref([])       // 全量用户（一次加载）
const loading = ref(false)
const searchText = ref('')
const passwordVisible = reactive({})

// 统计
const adminCount = computed(() => allUsers.value.filter(u => u.userRole === 'admin').length)
const userCount = computed(() => allUsers.value.filter(u => u.userRole !== 'admin').length)
const activeCount = computed(() => allUsers.value.filter(u => u.userStatus === 'active').length)

// 客户端搜索过滤
const filteredUsers = computed(() => {
  const q = searchText.value.trim().toLowerCase()
  if (!q) return allUsers.value
  return allUsers.value.filter(u =>
    (u.userAccount || '').toLowerCase().includes(q) ||
    (u.userName || '').toLowerCase().includes(q) ||
    (u.userRole || '').toLowerCase().includes(q)
  )
})

// ===== 新增/编辑模态框 =====
const showModal = ref(false)
const isEdit = ref(false)
const submitLoading = ref(false)
const editingUserId = ref(null)

const form = reactive({
  userAccount: '',
  userPassword: '',
  confirmPassword: '',
  userName: '',
  userRole: 'user',
  userStatus: 'active'
})

const canSubmit = computed(() => {
  if (isEdit.value) return form.userName !== undefined
  return form.userAccount.trim() !== '' && form.userPassword.trim() !== ''
})

// ===== 独立权限模态框 =====
const showPermModal = ref(false)
const permUser = ref(null)
const permForm = reactive({})
const permSaving = ref(false)
const coreCollapsed = ref(true)
const workshopCollapsed = ref(true)

const permSelectedCount = computed(() => Object.values(permForm).filter(v => v === true).length)
const permUnselectedCount = computed(() => allPermKeys.length - permSelectedCount.value)
const coreSelectedCount = computed(() => corePermItemsFull.filter(i => permForm[i.key]).length)
const workshopSelectedCount = computed(() => workshopPermItemsFull.filter(i => permForm[i.key]).length)

// ===== 工具函数 =====
function formatTime(raw) {
  if (!raw) return '-'
  const d = new Date(raw)
  if (isNaN(d.getTime())) return '-'
  const pad = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

// 旧版React permKey -> 新版Vue permKey 映射表
const legacyKeyMap = {
  'airConditioning': 'air-conditioning',
  'injection_workshop': 'injection-workshop',
  'granulation_workshop': 'granulation-workshop',
  'office_building': 'office-building',
  'feeding_workshop': 'feeding-workshop',
  'granule102': 'granule-102'
}

function initPermissions(saved) {
  const perms = {}
  allPermKeys.forEach(key => { perms[key] = false })
  if (saved) {
    try {
      const obj = typeof saved === 'string' ? JSON.parse(saved) : saved
      Object.keys(obj).forEach(key => {
        const mapped = legacyKeyMap[key] || key
        if (mapped in perms) perms[mapped] = obj[key] === true
      })
    } catch { /* ignore */ }
  }
  return perms
}

// ===== 数据加载（一次全量，与旧版一致） =====
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
    const res = await listUserByPage({ current: 1, pageSize: 100, sortField: 'createTime', sortOrder: 'descend' })
    allUsers.value = res.records || []
  } catch (err) {
    console.error('加载用户列表失败:', err.message)
  } finally {
    loading.value = false
  }
}

// ===== 搜索 =====
function doSearch() {
  // 搜索由 computed filteredUsers 自动处理
}

// ===== 密码显示/隐藏 =====
function togglePassword(userId) {
  passwordVisible[userId] = !passwordVisible[userId]
}

// ===== 新增/编辑 =====
function openAddModal() {
  isEdit.value = false
  editingUserId.value = null
  form.userAccount = ''
  form.userPassword = ''
  form.confirmPassword = ''
  form.userName = ''
  form.userRole = 'user'
  form.userStatus = 'active'
  showModal.value = true
}

function openEditModal(user) {
  isEdit.value = true
  editingUserId.value = user.id
  form.userAccount = user.userAccount
  form.userPassword = user.userPassword || ''
  form.confirmPassword = ''
  form.userName = user.userName
  form.userRole = user.userRole
  form.userStatus = user.userStatus || 'active'
  showModal.value = true
}

function closeModal() {
  showModal.value = false
}

async function handleSubmit() {
  if (!isEdit.value && form.userPassword !== form.confirmPassword) {
    alert('两次输入的密码不一致！')
    return
  }
  submitLoading.value = true
  try {
    if (isEdit.value) {
      await updateUser({
        id: editingUserId.value,
        userAccount: form.userAccount,
        userPassword: form.userPassword,
        userName: form.userName,
        userRole: form.userRole,
        userStatus: form.userStatus
      })
    } else {
      await addUser({
        userAccount: form.userAccount,
        userPassword: form.userPassword,
        userName: form.userName,
        userRole: form.userRole,
        userStatus: form.userStatus
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

// ===== 删除 =====
async function handleDelete(user) {
  if (!window.confirm(`确定要删除用户 "${user.userName || user.userAccount}" 吗？此操作不可恢复！`)) return
  try {
    await deleteUser(user.id)
    loadUsers()
  } catch (err) {
    alert(err.message || '删除失败')
  }
}

// ===== 独立权限模态框 =====
function openPermModal(user) {
  permUser.value = user
  const perms = initPermissions(user.pagePermissions)
  Object.keys(perms).forEach(key => { permForm[key] = perms[key] })
  showPermModal.value = true
}

function closePermModal() {
  showPermModal.value = false
  permUser.value = null
}

function togglePerm(key) {
  permForm[key] = !permForm[key]
}

function permSelectAll() {
  allPermKeys.forEach(key => { permForm[key] = true })
}

function permClearAll() {
  allPermKeys.forEach(key => { permForm[key] = false })
}

// 新版Vue permKey -> 旧版React permKey 反向映射
const reverseKeyMap = Object.fromEntries(Object.entries(legacyKeyMap).map(([k, v]) => [v, k]))

async function savePermissions() {
  if (!permUser.value) return
  const hasAny = Object.values(permForm).some(v => v === true)
  if (!hasAny) {
    alert('请至少选择一个页面访问权限！')
    return
  }
  permSaving.value = true
  try {
    const permJson = {}
    allPermKeys.forEach(key => {
      if (permForm[key]) {
        const saveKey = reverseKeyMap[key] || key
        permJson[saveKey] = true
      }
    })
    await updateUser({
      id: permUser.value.id,
      pagePermissions: JSON.stringify(permJson)
    })
    const count = Object.keys(permJson).length
    alert(`权限保存成功！已选择 ${count} 项权限`)
    // 如果修改的是当前登录用户，刷新侧边栏权限
    if (permUser.value.id === authState.user?.id) {
      await fetchCurrentUser()
    }
    closePermModal()
    loadUsers()
  } catch (err) {
    alert(err.message || '保存权限失败')
  } finally {
    permSaving.value = false
  }
}
</script>
