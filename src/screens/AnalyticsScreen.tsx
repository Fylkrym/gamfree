import React, { useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native'
import { useAppStore, CURRENCIES } from '../store/useAppStore'
import { getElapsed, getSavedMoney } from '../utils/timeUtils'
import i18n from '../utils/i18n'

function getWeeklyData(startDate: string, dailyAmount: number) {
  const start = new Date(startDate)
  const now = new Date()
  const weeks = []

  for (let i = 6; i >= 0; i--) {
    const weekStart = new Date(now)
    weekStart.setDate(now.getDate() - i * 7)
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 7)

    const label = `W${7 - i}`
    const daysInWeek = weekStart >= start ? 7 : Math.max(0, Math.floor((weekEnd.getTime() - start.getTime()) / 86400000))
    const money = Math.min(daysInWeek, 7) * dailyAmount

    weeks.push({ label, days: Math.min(daysInWeek, 7), money })
  }
  return weeks
}

export default function AnalyticsScreen({ onClose }: { onClose: () => void }) {
  const { startDate, dailyAmount, currency, language } = useAppStore()
  i18n.locale = language || 'ru'
  const t = (key: string) => i18n.t(key)
  const currencySymbol = CURRENCIES.find(c => c.code === currency)?.symbol ?? '₽'

  if (!startDate) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={onClose}>
            <Text style={styles.backBtnText}>{t('back')}</Text>
          </TouchableOpacity>
          <Text style={styles.title}>{t('analyticsTitle')}</Text>
          <View style={{ width: 80 }} />
        </View>
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>Нет данных</Text>
        </View>
      </SafeAreaView>
    )
  }

  const { days } = getElapsed(startDate)
  const saved = getSavedMoney(startDate, dailyAmount)
  const weeks = getWeeklyData(startDate, dailyAmount)
  const maxMoney = Math.max(...weeks.map(w => w.money), 1)

  const canBuy = saved >= 100000 ? '✈️ Слетать в отпуск' :
    saved >= 50000 ? '💻 Купить ноутбук' :
    saved >= 10000 ? '📱 Купить телефон' :
    saved >= 5000 ? '👟 Купить кроссовки' :
    saved >= 1000 ? '🍕 Устроить вечеринку' : '☕ Угостить друзей кофе'

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onClose}>
          <Text style={styles.backBtnText}>{t('back')}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{t('analyticsTitle')}</Text>
        <View style={{ width: 80 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Карточки статистики */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>📅</Text>
            <Text style={styles.statValue}>{days}</Text>
            <Text style={styles.statLabel}>{t('totalDays')}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>💰</Text>
            <Text style={styles.statValue}>{currencySymbol}{(saved / 1000).toFixed(1)}к</Text>
            <Text style={styles.statLabel}>{t('totalSaved')}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>📆</Text>
            <Text style={styles.statValue}>{Math.floor(days / 7)}</Text>
            <Text style={styles.statLabel}>{t('totalWeeks')}</Text>
          </View>
        </View>

        {/* График денег */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>💰 {t('totalSaved')} ({currencySymbol})</Text>
          <View style={styles.barChart}>
            {weeks.map((w, i) => (
              <View key={i} style={styles.barItem}>
                <Text style={styles.barValue}>
                  {w.money >= 1000 ? `${(w.money / 1000).toFixed(0)}к` : w.money}
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
          <Text style={styles.chartTitle}>📅 {t('totalDays')}</Text>
          <View style={styles.barChart}>
            {weeks.map((w, i) => (
              <View key={i} style={styles.barItem}>
                <Text style={styles.barValue}>{w.days}</Text>
                <View style={styles.barWrapper}>
                  <View style={[
                    styles.bar,
                    { height: Math.max(4, (w.days / 7) * 120) },
                    w.days === 7 ? styles.barPerfect : w.days > 0 ? styles.barActive : styles.barEmpty
                  ]} />
                </View>
                <Text style={styles.barLabel}>{w.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Итог */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryEmoji}>🎯</Text>
          <Text style={styles.summaryTitle}>{t('yourResult')}</Text>
          <Text style={styles.summaryText}>
            За {days} дней ты сэкономил {currencySymbol}{saved.toLocaleString('ru')}.{'\n'}
            На эти деньги можно:{'\n'}
            {canBuy}
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#07071a' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', padding: 20, paddingBottom: 16,
    borderBottomWidth: 1, borderBottomColor: '#1a1a38',
  },
  backBtn: {
    backgroundColor: '#1e1040', borderRadius: 12,
    paddingVertical: 8, paddingHorizontal: 16,
    borderWidth: 1, borderColor: '#4c1d95',
  },
  backBtnText: { color: '#a78bfa', fontSize: 15, fontWeight: '600' },
  title: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  scroll: { padding: 16, paddingBottom: 40 },
  emptyBox: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { color: '#666', fontSize: 16 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  statCard: {
    flex: 1, backgroundColor: '#0e0e28', borderRadius: 20,
    padding: 16, alignItems: 'center',
    borderWidth: 1, borderColor: '#1a1a38',
  },
  statEmoji: { fontSize: 24, marginBottom: 8 },
  statValue: { color: '#a78bfa', fontSize: 20, fontWeight: 'bold', marginBottom: 4 },
  statLabel: { color: '#555', fontSize: 12, textAlign: 'center' },
  chartCard: {
    backgroundColor: '#0e0e28', borderRadius: 20,
    padding: 20, marginBottom: 16,
    borderWidth: 1, borderColor: '#1a1a38',
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
    backgroundColor: '#0e0e28', borderRadius: 20,
    padding: 24, alignItems: 'center',
    borderWidth: 1, borderColor: '#1a1a38',
  },
  summaryEmoji: { fontSize: 40, marginBottom: 12 },
  summaryTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  summaryText: { color: '#888', fontSize: 15, textAlign: 'center', lineHeight: 26 },
})