import axios from 'axios'

const request = axios.create({
  baseURL: '/api',
  timeout: 30000
})

// 响应拦截器
request.interceptors.response.use(
  response => {
    const { code, data, message } = response.data
    if (code === 0) return data
    if (code === 40100) {
      // 未登录，清除状态并跳转登录页
      // 使用动态 import 避免循环依赖（auth.js 和 router 尚未创建）
      import('../auth.js').then(({ clearUser }) => clearUser())
      import('../router/index.js').then(({ default: router }) => router.push('/login'))
      throw new Error('未登录')
    }
    throw new Error(message || '请求失败')
  },
  error => Promise.reject(error)
)

export default request
