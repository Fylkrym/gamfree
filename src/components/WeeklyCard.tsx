import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { useAppStore } from '../store/useAppStore'
import { getElapsed, getSavedMoney } from '../utils/timeUtils'
import { CURRENCIES } from '../store/useAppStore'

export default function WeeklyCard() {
  const { startDate, dailyAmount, urgeCount, currency } = useAppStore()

  if (!startDate) return null

  const { days } = getElapsed(startDate)
  const currentWeek = Math.floor(days / 7) + 1
  const daysThisWeek = days % 7
  const savedThisWeek = daysThisWeek * dailyAmount
  const currencySymbol = CURRENCIES.find(c => c.code === currency)?.symbol ?? '₽'

  const getMessage = () => {
    if (daysThisWeek === 7) return '🔥 Идеальная неделя!'
    if (daysThisWeek >= 5) return '💪 Отличная неделя!'
    if (daysThisWeek >= 3) return '👍 Хорошее начало!'
    return '🌱 Неделя только начинается'
  }

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.week}>Неделя {currentWeek}</Text>
        <Text style={styles.message}>{getMessage()}</Text>
      </View>
      <View style={styles.stats}>
        <View style={styles.stat}>
          <Text style={styles.statNum}>{daysThisWeek}/7</Text>
          <Text style={styles.statLabel}>дней</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.stat}>
          <Text style={styles.statNum}>{currencySymbol}{savedThisWeek.toLocaleString('ru')}</Text>
          <Text style={styles.statLabel}>сэкономлено</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.stat}>
          <Text style={styles.statNum}>{urgeCount}</Text>
          <Text style={styles.statLabel}>побед</Text>
        </View>
      </View>
      <View style={styles.progressRow}>
        {[...Array(7)].map((_, i) => (
          <View
            key={i}
            style={[styles.dot, i < daysThisWeek ? styles.dotActive : styles.dotEmpty]}
          />
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#0e0e28',
    borderRadius: 22, padding: 20,
    marginBottom: 14,
    borderWidth: 1, borderColor: '#1a1a45',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  week: { color: '#a78bfa', fontSize: 14, fontWeight: '800', letterSpacing: 1 },
  message: { color: '#fff', fontSize: 14, fontWeight: '600' },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  stat: { flex: 1, alignItems: 'center' },
  statNum: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 2 },
  statLabel: { color: '#666', fontSize: 12 },
  divider: { width: 1, height: 30, backgroundColor: '#1a1a38' },
  progressRow: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
  },
  dot: { width: 28, height: 8, borderRadius: 4 },
  dotActive: { backgroundColor: '#7c3aed' },
  dotEmpty: { backgroundColor: '#1a1a38' },
})