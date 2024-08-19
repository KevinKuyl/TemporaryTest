import { defineStore } from 'pinia'

export const useGlobalsStore = defineStore('globals', {
  state: () => ({
    drawer: false
  }),
  getters: {
    doubleCount: (state) => state.counter * 2
  },
  actions: {
    toggleDrawer () {
      this.drawer = !this.drawer
      return this.drawer
    }
  }
})
