<template>
  <MobileSubShell :title="mShellTitles.userMgmt" content-class="">
    <div class="um-page">
      <!-- 搜索 + 新增 -->
      <div class="um-top-bar">
        <div class="um-search">
          <i class="bi bi-search"></i>
          <input
            v-model="searchText"
            type="text"
            placeholder="搜索账号、用户名..."
            @keypress.enter="() => {}"
          />
        </div>
        <button class="um-add-btn" @click="openAddModal">
          <i class="bi bi-plus-lg"></i> 新增
        </button>
      </div>

      <!-- 统计卡片 -->
      <div class="um-stats">
        <div class="um-stat">
          <div class="um-stat__icon um-stat__icon--total"><i class="bi bi-people"></i></div>
          <div class="um-stat__val">{{ allUsers.length }}</div>
          <div class="um-stat__label">用户总数</div>
        </div>
        <div class="um-stat">
          <div class="um-stat__icon um-stat__icon--admin"><i class="bi bi-shield-check"></i></div>
          <div class="um-stat__val">{{ adminCount }}</div>
          <div class="um-stat__label">管理员</div>
        </div>
        <div class="um-stat">
          <div class="um-stat__icon um-stat__icon--user"><i class="bi bi-person"></i></div>
          <div class="um-stat__val">{{ userCount }}</div>
          <div class="um-stat__label">普通用户</div>
        </div>
        <div class="um-stat">
          <div class="um-stat__icon um-stat__icon--active"><i class="bi bi-activity"></i></div>
          <div class="um-stat__val">{{ activeCount }}</div>
          <div class="um-stat__label">活跃用户</div>
        </div>
      </div>

      <!-- 加载中 -->
      <div v-if="loading" class="um-empty">
        <i class="bi bi-arrow-repeat um-spin"></i>
        <span>加载中...</span>
      </div>

      <!-- 空状态 -->
      <div v-else-if="filteredUsers.length === 0" class="um-empty">
        <i class="bi bi-person-slash"></i>
        <span>{{ searchText ? '没有找到匹配的用户' : '暂无用户数据' }}</span>
      </div>

      <!-- 用户列表 -->
      <div v-else class="um-list">
        <div v-for="user in filteredUsers" :key="user.id" class="um-user-card">
          <div class="um-user-card__head">
            <div
              class="um-user-card__avatar"
              :class="user.userRole === 'admin' ? 'um-user-card__avatar--admin' : 'um-user-card__avatar--user'"
            >{{ avatarLetter(user) }}</div>
            <div class="um-user-card__info">
              <div class="um-user-card__name">
                {{ user.userName || user.userAccount }}
                <span
                  class="um-role-badge"
                  :class="user.userRole === 'admin' ? 'um-role-badge--admin' : 'um-role-badge--user'"
                >
                  <i :class="user.userRole === 'admin' ? 'bi bi-shield-check' : 'bi bi-person'"></i>
                  {{ user.userRole === 'admin' ? '管理员' : '普通用户' }}
                </span>
              </div>
              <div class="um-user-card__account">{{ user.userAccount }}</div>
            </div>
            <div class="um-user-card__status">
              <span
                class="um-status-dot"
                :class="user.userStatus === 'active' ? 'um-status-dot--active' : 'um-status-dot--inactive'"
              ></span>
              {{ user.userStatus === 'active' ? '活跃' : '禁用' }}
            </div>
          </div>
          <div class="um-user-card__body">
            <div class="um-user-card__detail">
              <div class="um-detail-item">
                <div class="um-detail-item__label">密码</div>
                <div class="um-detail-item__value um-detail-item__value--password">
                  {{ passwordVisible[user.id] ? user.userPassword : '••••••••' }}
                  <button class="um-pwd-toggle" @click="togglePassword(user.id)">
                    <i :class="passwordVisible[user.id] ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
                  </button>
                </div>
              </div>
              <div class="um-detail-item">
                <div class="um-detail-item__label">创建时间</div>
                <div class="um-detail-item__value">{{ formatTime(user.createTime) }}</div>
              </div>
              <div class="um-detail-item">
                <div class="um-detail-item__label">最后登录</div>
                <div class="um-detail-item__value">{{ formatTime(user.lastLoginTime) }}</div>
              </div>
              <div class="um-detail-item">
                <div class="um-detail-item__label">ID</div>
                <div class="um-detail-item__value">#{{ user.id }}</div>
              </div>
            </div>
          </div>
          <div class="um-user-card__actions">
            <button class="um-action-btn um-action-btn--edit" @click="openEditModal(user)">
              <i class="bi bi-pencil"></i> 编辑
            </button>
            <button class="um-action-btn um-action-btn--perm" @click="openPermModal(user)">
              <i class="bi bi-key"></i> 权限
            </button>
            <button class="um-action-btn um-action-btn--delete" @click="confirmDelete(user)">
              <i class="bi bi-trash"></i> 删除
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ===== 新增/编辑用户弹窗 ===== -->
    <Teleport to="body">
      <div v-if="showModal" class="um-modal-overlay" @click.self="closeModal">
        <div class="um-modal">
          <div class="um-modal__header">
            <div class="um-modal__title">
              <i :class="isEdit ? 'bi bi-pencil-square' : 'bi bi-person-plus'" style="color: var(--primary)"></i>
              {{ isEdit ? '编辑用户' : '新增用户' }}
            </div>
            <button class="um-modal__close" @click="closeModal"><i class="bi bi-x-lg"></i></button>
          </div>
          <div class="um-modal__body">
            <div class="um-form-group">
              <label class="um-form-group__label">用户账号 <span class="um-required">*</span></label>
              <input v-model="form.userAccount" class="um-form-input" type="text" placeholder="请输入账号（用于登录）" :disabled="isEdit" />
              <div class="um-form-group__help">用于登录界面使用</div>
            </div>
            <div class="um-form-group">
              <label class="um-form-group__label">用户昵称</label>
              <input v-model="form.userName" class="um-form-input" type="text" placeholder="请输入用户昵称（可选）" />
              <div class="um-form-group__help">显示名称，可以使用中文</div>
            </div>
            <div class="um-form-row">
              <div class="um-form-group">
                <label class="um-form-group__label">密码 <span class="um-required">*</span></label>
                <input v-model="form.userPassword" class="um-form-input" type="password" placeholder="请输入密码" />
              </div>
              <div v-if="!isEdit" class="um-form-group">
                <label class="um-form-group__label">确认密码 <span class="um-required">*</span></label>
                <input v-model="form.confirmPassword" class="um-form-input" type="password" placeholder="再次输入密码" />
              </div>
            </div>
            <div class="um-form-row">
              <div class="um-form-group">
                <label class="um-form-group__label">角色 <span class="um-required">*</span></label>
                <select v-model="form.userRole" class="um-form-select">
                  <option value="user">普通用户</option>
                  <option value="admin">管理员</option>
                </select>
              </div>
              <div class="um-form-group">
                <label class="um-form-group__label">状态</label>
                <select v-model="form.userStatus" class="um-form-select">
                  <option value="active">活跃</option>
                  <option value="inactive">禁用</option>
                </select>
              </div>
            </div>
          </div>
          <div class="um-modal__footer">
            <button class="um-btn um-btn--secondary" @click="closeModal">取消</button>
            <button class="um-btn um-btn--primary" :disabled="submitLoading || !canSubmit" @click="handleSubmit">
              <i :class="submitLoading ? 'bi bi-arrow-repeat um-spin' : 'bi bi-check-lg'"></i>
              {{ submitLoading ? '提交中...' : (isEdit ? '保存修改' : '创建用户') }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ===== 权限管理弹窗 ===== -->
    <Teleport to="body">
      <div v-if="showPermModal" class="um-modal-overlay" @click.self="closePermModal">
        <div class="um-modal">
          <div class="um-modal__header">
            <div class="um-modal__title">
              <i class="bi bi-shield-lock" style="color: #8b5cf6"></i> 页面访问权限
            </div>
            <button class="um-modal__close" @click="closePermModal"><i class="bi bi-x-lg"></i></button>
          </div>
          <div class="um-modal__body">
            <div class="um-perm-info">
              <i class="bi bi-person-circle"></i>
              用户: <span class="um-perm-info__name">{{ permUser?.userAccount }}</span>
              ({{ permUser?.userName || '未设置昵称' }})
            </div>
            <div class="um-perm-toolbar">
              <div class="um-perm-quick">
                <button class="um-perm-quick-btn" @click="permSelectAll"><i class="bi bi-check-all"></i> 全选</button>
                <button class="um-perm-quick-btn" @click="permClearAll"><i class="bi bi-x-lg"></i> 全不选</button>
              </div>
              <div class="um-perm-stats">
                <span class="um-perm-stats__selected">已选 <b>{{ permSelectedCount }}</b></span>
                <span class="um-perm-stats__unselected">未选 <b>{{ permUnselectedCount }}</b></span>
              </div>
            </div>

            <!-- 统计报表分组 -->
            <div class="um-perm-section">
              <div class="um-perm-section__head" @click="coreCollapsed = !coreCollapsed">
                <i class="bi bi-chevron-down um-perm-section__arrow" :class="{ 'is-collapsed': coreCollapsed }"></i>
                <span class="um-perm-section__icon">📊</span>
                <span class="um-perm-section__title">统计报表</span>
                <span class="um-perm-section__count">{{ coreSelectedCount }} / {{ corePermItems.length }}</span>
              </div>
              <div v-show="!coreCollapsed" class="um-perm-grid">
                <div
                  v-for="item in corePermItems"
                  :key="item.key"
                  class="um-perm-card"
                  :class="{ 'is-active': permForm[item.key] }"
                  @click="togglePerm(item.key)"
                >
                  <span class="um-perm-card__icon">{{ item.icon }}</span>
                  <div>
                    <div class="um-perm-card__name">{{ item.name }}</div>
                    <div class="um-perm-card__desc">{{ item.desc }}</div>
                  </div>
                  <span class="um-perm-card__check">
                    <i v-if="permForm[item.key]" class="bi bi-check"></i>
                  </span>
                </div>
              </div>
            </div>

            <!-- 车间监控分组 -->
            <div class="um-perm-section">
              <div class="um-perm-section__head" @click="workshopCollapsed = !workshopCollapsed">
                <i class="bi bi-chevron-down um-perm-section__arrow" :class="{ 'is-collapsed': workshopCollapsed }"></i>
                <span class="um-perm-section__icon">🏭</span>
                <span class="um-perm-section__title">车间监控</span>
                <span class="um-perm-section__count">{{ workshopSelectedCount }} / {{ workshopPermItems.length }}</span>
              </div>
              <div v-show="!workshopCollapsed" class="um-perm-grid">
                <div
                  v-for="item in workshopPermItems"
                  :key="item.key"
                  class="um-perm-card"
                  :class="{ 'is-active': permForm[item.key] }"
                  @click="togglePerm(item.key)"
                >
                  <span class="um-perm-card__icon">{{ item.icon }}</span>
                  <div>
                    <div class="um-perm-card__name">{{ item.name }}</div>
                    <div class="um-perm-card__desc">{{ item.desc }}</div>
                  </div>
                  <span class="um-perm-card__check">
                    <i v-if="permForm[item.key]" class="bi bi-check"></i>
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div class="um-modal__footer">
            <button class="um-btn um-btn--secondary" @click="closePermModal">取消</button>
            <button class="um-btn um-btn--primary" :disabled="permSaving" @click="savePermissions">
              <i :class="permSaving ? 'bi bi-arrow-repeat um-spin' : 'bi bi-save'"></i>
              {{ permSaving ? '保存中...' : '保存权限' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ===== 删除确认弹窗 ===== -->
    <Teleport to="body">
      <div v-if="showDeleteConfirm" class="um-confirm-overlay" @click.self="showDeleteConfirm = false">
        <div class="um-confirm">
          <div class="um-confirm__body">
            <div class="um-confirm__icon"><i class="bi bi-exclamation-triangle"></i></div>
            <div class="um-confirm__title">确认删除</div>
            <div class="um-confirm__desc">
              确定要删除用户 <b>"{{ deletingUser?.userName || deletingUser?.userAccount }}"</b> 吗？<br/>此操作不可恢复！
            </div>
          </div>
          <div class="um-confirm__actions">
            <button class="um-btn um-btn--secondary" @click="showDeleteConfirm = false">取消</button>
            <button class="um-btn um-btn--danger" @click="handleDelete">确认删除</button>
          </div>
        </div>
      </div>
    </Teleport>
  </MobileSubShell>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import MobileSubShell from '@/components/MobileSubShell.vue'
import { mShellTitles } from '@/views/mobile/mobileUiStrings'
import { listUserByPage, addUser, updateUser, deleteUser } from '@/api/user'
import { authState, fetchCurrentUser } from '@/auth'
import { workshopRoutes } from '@/router/index'
import '@/styles/mobile/mobile-user-management.css'

const router = useRouter()

// ===== 权限定义 =====
const corePermItems = [
  { key: 'monthly-energy', icon: '📊', name: '月度能耗统计', desc: '查看月度电能消耗数据' },
  { key: 'hourly-energy', icon: '📈', name: '日能耗统计', desc: '查看日度电能消耗数据' },
  { key: 'electricity-cost-allocation', icon: '💰', name: '电费分摊计算', desc: '电费分摊计算与统计' }
]

const workshopPermItems = workshopRoutes.map(r => ({
  key: r.meta.permKey,
  name: r.meta.title,
  icon: '🏭',
  desc: r.meta.title + '能耗监控'
}))

const allPermItems = [...corePermItems, ...workshopPermItems]
const allPermKeys = allPermItems.map(i => i.key)

// ===== 数据状态 =====
const allUsers = ref([])
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

// ===== 权限模态框 =====
const showPermModal = ref(false)
const permUser = ref(null)
const permForm = reactive({})
const permSaving = ref(false)
const coreCollapsed = ref(false)
const workshopCollapsed = ref(false)

const permSelectedCount = computed(() => Object.values(permForm).filter(v => v === true).length)
const permUnselectedCount = computed(() => allPermKeys.length - permSelectedCount.value)
const coreSelectedCount = computed(() => corePermItems.filter(i => permForm[i.key]).length)
const workshopSelectedCount = computed(() => workshopPermItems.filter(i => permForm[i.key]).length)

// ===== 删除确认 =====
const showDeleteConfirm = ref(false)
const deletingUser = ref(null)

// ===== 工具函数 =====
function avatarLetter(user) {
  const name = user.userName || user.userAccount || '?'
  return name.charAt(0).toUpperCase()
}

function formatTime(raw) {
  if (!raw) return '-'
  const d = new Date(raw)
  if (isNaN(d.getTime())) return '-'
  const pad = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

const legacyKeyMap = {
  'airConditioning': 'air-conditioning',
  'injection_workshop': 'injection-workshop',
  'granulation_workshop': 'granulation-workshop',
  'office_building': 'office-building',
  'feeding_workshop': 'feeding-workshop',
  'granule102': 'granule-102'
}

const reverseKeyMap = Object.fromEntries(Object.entries(legacyKeyMap).map(([k, v]) => [v, k]))

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

function togglePassword(userId) {
  passwordVisible[userId] = !passwordVisible[userId]
}

// ===== 数据加载 =====
onMounted(() => {
  if (!authState.isAdmin) {
    router.push('/m/home')
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
function confirmDelete(user) {
  deletingUser.value = user
  showDeleteConfirm.value = true
}

async function handleDelete() {
  if (!deletingUser.value) return
  try {
    await deleteUser(deletingUser.value.id)
    showDeleteConfirm.value = false
    deletingUser.value = null
    loadUsers()
  } catch (err) {
    alert(err.message || '删除失败')
  }
}

// ===== 权限管理 =====
function openPermModal(user) {
  permUser.value = user
  const perms = initPermissions(user.pagePermissions)
  Object.keys(perms).forEach(key => { permForm[key] = perms[key] })
  coreCollapsed.value = false
  workshopCollapsed.value = false
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
