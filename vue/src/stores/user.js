import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    account: null, // 存使用者資料
  }),
  getters: {
    isLogin: (state) => !!state.account,
  },
  actions: {
    login(accountData) {
      this.account = accountData
      localStorage.setItem('Account', JSON.stringify(accountData))
    },
    logout() {
      this.account = null
      localStorage.removeItem('Account')
    },
    loadFromStorage() {
      const data = localStorage.getItem('Account')
      if (data) this.account = JSON.parse(data)
    },
  },
})
