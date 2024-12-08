import { ref, computed } from 'vue';
import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', () => {
  const USER_KEY = 'SCHEDULE_USER_KEY';
  const TOKEN_KEY = 'SCHEDULE_TOKEN_KEY';
  const _user = ref(JSON.parse(localStorage.getItem(USER_KEY)) || {});
  const _token = ref(localStorage.getItem(TOKEN_KEY) || '');

  // 提供一个函数来设置用户和令牌，并更新localStorage
  const setUserToken = (user, token) => {
    _user.value = user;
    _token.value = token;

    localStorage.setItem(USER_KEY, JSON.stringify(user));
    localStorage.setItem(TOKEN_KEY, token);
  };

  const clearUserToken = () => {
    _user.value = {};
    _token.value = '';

    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(TOKEN_KEY);
  };

  const isLogined = computed(() => {
    if (Object.keys(_user.value).length > 0 && _token.value) {
      return true;
    } else {
      return false;
    }
  });

  // 直接返回响应式引用
  return {
    user: _user,
    token: _token,
    setUserToken,
    clearUserToken,
    isLogined,
  };

  // 注意：这里没有使用computed属性来封装_user和_token，因为它们是直接暴露的响应式引用
  // 如果需要计算属性，可以在组件中或其他地方基于这些引用创建
});
