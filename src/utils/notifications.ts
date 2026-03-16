import * as Notifications from 'expo-notifications'
import { Platform } from 'react-native'

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
})

const isNative = Platform.OS !== 'web'

export async function requestPermissions() {
  if (!isNative) return true
  const { status } = await Notifications.requestPermissionsAsync()
  return status === 'granted'
}

export async function cancelAllNotifications() {
  if (!isNative) return
  await Notifications.cancelAllScheduledNotificationsAsync()
}

export async function scheduleDailyMorning(hour = 9, minute = 0) {
  if (!isNative) return
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '💪 Доброе утро!',
      body: 'Ещё один день свободы. Ты справляешься!',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  })
}

export async function scheduleEveningReminder(hour = 21, minute = 0) {
  if (!isNative) return
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '🌙 Как прошёл день?',
      body: 'Открой приложение и посмотри на свой прогресс.',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  })
}

const MILESTONE_MESSAGES: Record<number, string> = {
  1:   '🌱 1 день! Первый шаг сделан. Ты молодец!',
  3:   '⚡ 3 дня! Самое тяжёлое позади.',
  7:   '⚔️ Неделя! Ты уже борец.',
  14:  '🔥 Две недели! Привычка формируется.',
  30:  '💪 Месяц свободы! Это огромно.',
  60:  '🏆 60 дней! Ты настоящий мастер.',
  100: '👑 100 дней! Легендарный результат!',
  365: '💎 Год без ставок! Ты изменил свою жизнь.',
}

export async function checkAndScheduleMilestone(days: number) {
  if (!isNative) return
  const message = MILESTONE_MESSAGES[days]
  if (!message) return
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '🎉 Новое достижение!',
      body: message,
    },
    trigger: null,
  })
}

export async function scheduleDangerHours(hourStart: number, hourEnd: number) {
  if (!isNative) return
  const messages = [
    '💪 Сейчас опасное время. Ты справишься!',
    '🛡️ Помни зачем ты начал. Держись!',
    '⏰ Опасный час. Открой приложение — я помогу.',
    '🎯 Не сдавайся. Ты уже так далеко зашёл!',
    '🌊 Прокатись на волне желания — оно пройдёт.',
  ]
  for (let hour = hourStart; hour <= hourEnd; hour++) {
    const message = messages[hour % messages.length]
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '⚠️ Опасное время',
        body: message,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute: 0,
      },
    })
  }
}

export async function setupAllNotifications() {
  if (!isNative) return
  const granted = await requestPermissions()
  if (!granted) return
  await cancelAllNotifications()
  await scheduleDailyMorning()
  await scheduleEveningReminder()
}