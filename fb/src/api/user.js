import api from './client';

// 用户管理相关 API
export const userApi = {
  login(body) {
    return api.post('/user/login', body);
  },
  logout() {
    return api.post('/user/logout');
  },
  getLoginUser() {
    return api.get('/user/get/login');
  },
  listPage(body) {
    return api.post('/user/list/page/vo', body);
  },
  add(body) {
    return api.post('/user/add', body);
  },
  update(body) {
    return api.post('/user/update', body);
  },
  remove(id) {
    return api.post('/user/delete', { id });
  },
};

export default userApi;


