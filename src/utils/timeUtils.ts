export function getElapsed(startDate: string) {
  const start = new Date(startDate).getTime()
  const now = Date.now()
  const diff = Math.max(0, now - start)

  const totalSeconds = Math.floor(diff / 1000)
  const seconds = totalSeconds % 60
  const totalMinutes = Math.floor(totalSeconds / 60)
  const minutes = totalMinutes % 60
  const totalHours = Math.floor(totalMinutes / 60)
  const hours = totalHours % 24
  const days = Math.floor(totalHours / 24)

  return { days, hours, minutes, seconds, totalHours }
}

export function getSavedMoney(startDate: string, dailyAmount: number) {
  const { totalHours } = getElapsed(startDate)
  return Math.floor((totalHours / 24) * dailyAmount)
}

export function getLevel(days: number) {
  if (days >= 100) return { name: 'Мастер', emoji: '🏆' }
  if (days >= 30) return { name: 'Стойкий', emoji: '💪' }
  if (days >= 7) return { name: 'Борец', emoji: '⚔️' }
  if (days >= 1) return { name: 'Новичок', emoji: '🌱' }
  return { name: 'Старт', emoji: '🚀' }
}

// Глобальные размеры шрифтов
export const FONTS = {
  xs: 13,
  sm: 15,
  md: 17,
  lg: 20,
  xl: 24,
  xxl: 28,
}