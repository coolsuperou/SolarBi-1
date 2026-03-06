import request from './request'

export function login(userAccount, userPassword) {
  return request.post('/user/login', { userAccount, userPassword })
}

export function logout() {
  return request.post('/user/logout')
}

export function getLoginUser() {
  return request.get('/user/get/login')
}

export function listUserByPage(params) {
  return request.post('/user/list/page', params)
}

export function addUser(data) {
  return request.post('/user/add', data)
}

export function updateUser(data) {
  return request.post('/user/update', data)
}

export function deleteUser(id) {
  return request.post('/user/delete', { id })
}
