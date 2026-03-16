import { create } from 'zustand'
import AsyncStorage from '@react-native-async-storage/async-storage'

export const CURRENCIES = [
  { code: 'RUB', symbol: '₽', name: 'Рубль' },
  { code: 'UAH', symbol: '₴', name: 'Гривна' },
  { code: 'USD', symbol: '$', name: 'Доллар' },
  { code: 'EUR', symbol: '€', name: 'Евро' },
  { code: 'KZT', symbol: '₸', name: 'Тенге' },
  { code: 'TRY', symbol: '₺', name: 'Лира' },
  { code: 'BYN', symbol: 'Br', name: 'Белорусский рубль' },
  { code: 'GBP', symbol: '£', name: 'Фунт' },
  { code: 'PLN', symbol: 'zł', name: 'Злотый' },
  { code: 'GEL', symbol: '₾', name: 'Лари' },
]

interface AppState {
  startDate: string | null
  dailyAmount: number
  urgeCount: number
  dangerHourStart: number
  dangerHourEnd: number
  currency: string
  setStartDate: (date: string) => void
  setDailyAmount: (amount: number) => void
  incrementUrge: () => void
  resetCounter: (newDate: string) => void
  setDangerHours: (start: number, end: number) => void
  setCurrency: (currency: string) => void
  loadFromStorage: () => Promise<void>
}

export const useAppStore = create<AppState>((set, get) => ({
  startDate: null,
  dailyAmount: 500,
  urgeCount: 0,
  dangerHourStart: 20,
  dangerHourEnd: 23,
  currency: 'RUB',

  setStartDate: async (date) => {
    set({ startDate: date })
    await AsyncStorage.setItem('startDate', date)
  },

  setDailyAmount: async (amount) => {
    set({ dailyAmount: amount })
    await AsyncStorage.setItem('dailyAmount', String(amount))
  },

  incrementUrge: async () => {
    const newCount = get().urgeCount + 1
    set({ urgeCount: newCount })
    await AsyncStorage.setItem('urgeCount', String(newCount))
  },

  resetCounter: async (newDate) => {
    set({ startDate: newDate, urgeCount: 0 })
    await AsyncStorage.setItem('startDate', newDate)
    await AsyncStorage.setItem('urgeCount', '0')
  },

  setDangerHours: async (start, end) => {
    set({ dangerHourStart: start, dangerHourEnd: end })
    await AsyncStorage.setItem('dangerHourStart', String(start))
    await AsyncStorage.setItem('dangerHourEnd', String(end))
  },

  setCurrency: async (currency) => {
    set({ currency })
    await AsyncStorage.setItem('currency', currency)
  },

  loadFromStorage: async () => {
    const startDate = await AsyncStorage.getItem('startDate')
    const dailyAmount = await AsyncStorage.getItem('dailyAmount')
    const urgeCount = await AsyncStorage.getItem('urgeCount')
    const dangerHourStart = await AsyncStorage.getItem('dangerHourStart')
    const dangerHourEnd = await AsyncStorage.getItem('dangerHourEnd')
    const currency = await AsyncStorage.getItem('currency')
    set({
      startDate: startDate ?? null,
      dailyAmount: dailyAmount ? Number(dailyAmount) : 500,
      urgeCount: urgeCount ? Number(urgeCount) : 0,
      dangerHourStart: dangerHourStart ? Number(dangerHourStart) : 20,
      dangerHourEnd: dangerHourEnd ? Number(dangerHourEnd) : 23,
      currency: currency ?? 'RUB',
    })
  },
}))