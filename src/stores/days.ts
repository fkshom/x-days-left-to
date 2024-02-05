import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useDaysStore = defineStore('days', () => {
  const to_year = ref(2024)
  const to_month = ref(4)
  const to_day = ref(31)
  const include_first_day = ref(false)

  return { to_year, to_month, to_day, include_first_day }
},
{
  persist: true,
})
