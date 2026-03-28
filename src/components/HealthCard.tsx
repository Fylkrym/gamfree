import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { useAppStore } from '../store/useAppStore'
import { getElapsed } from '../utils/timeUtils'
import i18n from '../utils/i18n'

export default function HealthCard() {
  const { startDate, language } = useAppStore()
  i18n.locale = language || 'ru'
  const t = (key: string) => i18n.t(key)

  if (!startDate) return null

  const { days } = getElapsed(startDate)

  // Примерные расчёты здоровья
  const nervousBreakdowns = Math.floor(days * 0.3)
  const normalSleepNights = Math.floor(days * 0.7)
  const stressFreeDays = Math.floor(days * 0.5)

  const items = [
    { emoji: '🧠', value: nervousBreakdowns, label: t('healthNerves') },
    { emoji: '😴', value: normalSleepNights, label: t('healthSleep') },
    { emoji: '☮️', value: stressFreeDays, label: t('healthStress') },
  ]

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{t('healthTitle')}</Text>
      <Text style={styles.sub}>{t('healthSub')}</Text>
      <View style={styles.items}>
        {items.map((item, i) => (
          <View key={i} style={styles.item}>
            <Text style={styles.itemEmoji}>{item.emoji}</Text>
            <Text style={styles.itemValue}>{item.value}</Text>
            <Text style={styles.itemLabel}>{item.label}</Text>
          </View>
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#0e1f18',
    borderRadius: 22, padding: 20,
    marginBottom: 14,
    borderWidth: 1, borderColor: '#1a3a28',
  },
  title: { color: '#4ade80', fontSize: 16, fontWeight: '800', marginBottom: 4 },
  sub: { color: '#666', fontSize: 13, marginBottom: 16 },
  items: { flexDirection: 'row', justifyContent: 'space-between' },
  item: { alignItems: 'center', flex: 1 },
  itemEmoji: { fontSize: 28, marginBottom: 6 },
  itemValue: { color: '#fff', fontSize: 22, fontWeight: 'bold', marginBottom: 4 },
  itemLabel: { color: '#666', fontSize: 11, textAlign: 'center', lineHeight: 16 },
})