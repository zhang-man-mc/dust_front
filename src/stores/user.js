// 加载状态的逻辑管理

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useLoginUserStore = defineStore('loginUser', () => {
  // 当前登陆的用户名
  const currentLoginUser = ref('-1')
  // 修改
  function setUser(user) {
    currentLoginUser.value = user
  }

  const getUserName = computed(() => {
    return currentLoginUser.value == '-1'
      ? localStorage.getItem('currentUserName')
      : currentLoginUser.value
  })
  return { currentLoginUser, setUser, getUserName }
})
