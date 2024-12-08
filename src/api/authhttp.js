import http from './http';

// 登录
const login = (loginaccount, password) => {
  const path = 'api/auth/login';
  return http.post(path, { loginaccount, password });
};

// 修改密码
const resetPassword = (oldPassword, newPassword, confirmNewPassword) => {
  const path = 'api/auth/resetpwd';
  return http.post(path, { oldPassword, newPassword, confirmNewPassword });
};

export default { login, resetPassword };
