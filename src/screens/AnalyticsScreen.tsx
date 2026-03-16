import React, { useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Dimensions } from 'react-native'
import { useAppStore } from '../store/useAppStore'
import { getElapsed, getSavedMoney } from '../utils/timeUtils'

const { width } = Dimensions.get('window')

function getWeeklyData(startDate: string, dailyAmount: number) {
  const start = new Date(startDate)
  const now = new Date()
  const weeks = []

  for (let i = 6; i >= 0; i--) {
    const weekStart = new Date(now)
    weekStart.setDate(now.getDate() - i * 7)
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 7)

    const label = `Нед ${7 - i}`
    const daysInWeek = weekStart >= start ? 7 : Math.max(0, Math.floor((weekEnd.getTime() - start.getTime()) / 86400000))
    const money = Math.min(daysInWeek, 7) * dailyAmount

    weeks.push({ label, days: Math.min(daysInWeek, 7), money })
  }
  return weeks
}

export default function AnalyticsScreen({ onClose }: { onClose: () => void }) {
  const { startDate, dailyAmount } = useAppStore()
  const [period, setPeriod] = useState<'2w' | '1m' | '3m'>('1m')

  if (!startDate) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.empty}>Нет данных. Укажи дату начала.</Text>
      </SafeAreaView>
    )
  }

  const { days } = getElapsed(startDate)
  const saved = getSavedMoney(startDate, dailyAmount)
  const weeks = getWeeklyData(startDate, dailyAmount)
  const maxMoney = Math.max(...weeks.map(w => w.money), 1)
  const maxDays = 7

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>📊 Аналитика</Text>
        <TouchableOpacity onPress={onClose}>
          <Text style={styles.closeBtn}>✕</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>

        {/* Общая статистика */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{days}</Text>
            <Text style={styles.statLabel}>всего дней</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>₽{(saved / 1000).toFixed(1)}к</Text>
            <Text style={styles.statLabel}>сэкономлено</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{Math.floor(days / 7)}</Text>
            <Text style={styles.statLabel}>недель</Text>
          </View>
        </View>

        {/* График денег */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>💰 Сэкономлено по неделям (₽)</Text>
          <View style={styles.barChart}>
            {weeks.map((w, i) => (
              <View key={i} style={styles.barItem}>
                <Text style={styles.barValue}>
                  {w.money >= 1000 ? `${(w.money/1000).toFixed(0)}к` : w.money}
                </Text>
                <View style={styles.barWrapper}>
                  <View style={[
                    styles.bar,
                    { height: Math.max(4, (w.money / maxMoney) * 120) },
                    w.money > 0 ? styles.barActive : styles.barEmpty
                  ]} />
                </View>
                <Text style={styles.barLabel}>{w.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* График дней */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>📅 Дней без ставок по неделям</Text>
          <View style={styles.barChart}>
            {weeks.map((w, i) => (
              <View key={i} style={styles.barItem}>
                <Text style={styles.barValue}>{w.days}</Text>
                <View style={styles.barWrapper}>
                  <View style={[
                    styles.bar,
                    { height: Math.max(4, (w.days / maxDays) * 120) },
                    w.days === 7 ? styles.barPerfect : w.days > 0 ? styles.barActive : styles.barEmpty
                  ]} />
                </View>
                <Text style={styles.barLabel}>{w.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Мотивирующий итог */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryEmoji}>🎯</Text>
          <Text style={styles.summaryTitle}>Твой результат</Text>
          <Text style={styles.summaryText}>
            За {days} дней ты сэкономил ₽{saved.toLocaleString('ru')}. {'\n'}
            На эти деньги можно:{'\n'}
            {saved >= 50000 ? '✈️ Слетать в отпуск' :
             saved >= 10000 ? '📱 Купить новый телефон' :
             saved >= 5000 ? '👟 Купить кроссовки' :
             saved >= 1000 ? '🍕 Устроить вечеринку' :
             '☕ Угостить друзей кофе'}
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a14' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', padding: 24, paddingBottom: 16,
  },
  title: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  closeBtn: { color: '#666', fontSize: 20, padding: 4 },
  scroll: { padding: 16, paddingTop: 0 },
  empty: { color: '#666', textAlign: 'center', marginTop: 100, fontSize: 16 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  statCard: {
    flex: 1, backgroundColor: '#12122a', borderRadius: 16,
    padding: 16, alignItems: 'center',
    borderWidth: 1, borderColor: '#1e1e40',
  },
  statValue: { color: '#a78bfa', fontSize: 22, fontWeight: 'bold' },
  statLabel: { color: '#555', fontSize: 12, marginTop: 4 },
  chartCard: {
    backgroundColor: '#12122a', borderRadius: 20,
    padding: 20, marginBottom: 16,
    borderWidth: 1, borderColor: '#1e1e40',
  },
  chartTitle: { color: '#fff', fontSize: 15, fontWeight: '600', marginBottom: 16 },
  barChart: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 160 },
  barItem: { flex: 1, alignItems: 'center' },
  barValue: { color: '#666', fontSize: 9, marginBottom: 4 },
  barWrapper: { height: 120, justifyContent: 'flex-end', width: '70%' },
  bar: { width: '100%', borderRadius: 6 },
  barActive: { backgroundColor: '#7c3aed' },
  barPerfect: { backgroundColor: '#4ade80' },
  barEmpty: { backgroundColor: '#1e1e40' },
  barLabel: { color: '#555', fontSize: 9, marginTop: 6, textAlign: 'center' },
  summaryCard: {
    backgroundColor: '#12122a', borderRadius: 20,
    padding: 24, alignItems: 'center',
    borderWidth: 1, borderColor: '#1e1e40', marginBottom: 16,
  },
  summaryEmoji: { fontSize: 40, marginBottom: 12 },
  summaryTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  summaryText: { color: '#888', fontSize: 15, textAlign: 'center', lineHeight: 26 },
})