// 加载状态的逻辑管理

import { defineStore } from 'pinia'

export const useLoadingStore = defineStore('loading', {
  state: () => {
    return {
      loadingStatus: []
    }
  },
  actions: {
    clearLoading() {
      this.loadingStatus.forEach(l => {
        if (typeof l === 'function') {
          l()
        }
      });
      if (this.loadingStatus.length > 0) {
        this.loadingStatus = []        
      }
    }
  }
})