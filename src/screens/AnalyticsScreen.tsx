import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAppStore, CURRENCIES } from '../store/useAppStore'
import { getElapsed, getSavedMoney } from '../utils/timeUtils'
import i18n from '../utils/i18n'

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

  const canBuyText = (saved: number) => {
    const options = {
      ru: ['Угостить друзей кофе', 'Устроить вечеринку', 'Купить кроссовки', 'Купить телефон', 'Купить ноутбук', 'Слетать в отпуск'],
      uk: ['Пригостити друзів кавою', 'Влаштувати вечірку', 'Купити кросівки', 'Купити телефон', 'Купити ноутбук', 'Поїхати у відпустку'],
      en: ['Treat friends to coffee', 'Have a party', 'Buy sneakers', 'Buy a phone', 'Buy a laptop', 'Go on vacation'],
      kk: ['Достарыңды кофемен сыйла', 'Той жаса', 'Кроссовка сатып ал', 'Телефон сатып ал', 'Ноутбук сатып ал', 'Демалысқа бар'],
    }
    const lang = (language as keyof typeof options) || 'ru'
    const texts = options[lang] ?? options.ru
    const emojis = ['☕', '🍕', '👟', '📱', '💻', '✈️']
    const idx = saved >= 100000 ? 5 : saved >= 50000 ? 4 : saved >= 10000 ? 3 : saved >= 5000 ? 2 : saved >= 1000 ? 1 : 0
    return `${emojis[idx]} ${texts[idx]}`
  }

  const canBuyLabel = () => {
    const labels = { ru: 'На эти деньги можна:', uk: 'На ці гроші можна:', en: 'With this money you can:', kk: 'Бұл ақшаға болады:' }
    return labels[(language as keyof typeof labels)] ?? labels.ru
  }

  const perfectWeekLabel = () => {
    const labels = { ru: 'Идеальная неделя', uk: 'Ідеальний тиждень', en: 'Perfect week', kk: 'Мінсіз апта' }
    return labels[(language as keyof typeof labels)] ?? labels.ru
  }

  const partialLabel = () => {
    const labels = { ru: 'Частично', uk: 'Частково', en: 'Partial', kk: 'Ішінара' }
    return labels[(language as keyof typeof labels)] ?? labels.ru
  }

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
          <Text style={styles.emptyText}>{t('moodEmpty')}</Text>
        </View>
      </SafeAreaView>
    )
  }

  const { days } = getElapsed(startDate)
  const saved = getSavedMoney(startDate, dailyAmount)
  const weeks = getWeeklyData(startDate, dailyAmount)
  const maxMoney = Math.max(...weeks.map(w => w.money), 1)

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

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>📅</Text>
            <Text style={styles.statValue}>{days}</Text>
            <Text style={styles.statLabel}>{t('totalDays')}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>💰</Text>
            <Text style={styles.statValue}>{currencySymbol}{saved >= 1000 ? (saved/1000).toFixed(1)+'к' : saved}</Text>
            <Text style={styles.statLabel}>{t('totalSaved')}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>📆</Text>
            <Text style={styles.statValue}>{Math.floor(days / 7)}</Text>
            <Text style={styles.statLabel}>{t('totalWeeks')}</Text>
          </View>
        </View>

        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>💰 {t('saved')} ({currencySymbol})</Text>
          <View style={styles.chart}>
            {weeks.map((w, i) => {
              const barH = Math.max(4, (w.money / maxMoney) * 140)
              return (
                <View key={i} style={styles.barCol}>
                  <Text style={styles.barVal}>
                    {w.money > 0 ? (w.money >= 1000 ? `${(w.money/1000).toFixed(0)}к` : w.money) : ''}
                  </Text>
                  <View style={styles.barTrack}>
                    <View style={[styles.bar, { height: barH }, w.money > 0 ? styles.barMoney : styles.barEmpty]} />
                  </View>
                  <Text style={styles.barLabel}>{w.label}</Text>
                </View>
              )
            })}
          </View>
        </View>

        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>📅 {t('totalDays')}</Text>
          <View style={styles.chart}>
            {weeks.map((w, i) => {
              const barH = Math.max(4, (w.days / 7) * 140)
              return (
                <View key={i} style={styles.barCol}>
                  <Text style={styles.barVal}>{w.days > 0 ? w.days : ''}</Text>
                  <View style={styles.barTrack}>
                    <View style={[styles.bar, { height: barH }, w.days === 7 ? styles.barPerfect : w.days > 0 ? styles.barDays : styles.barEmpty]} />
                  </View>
                  <Text style={styles.barLabel}>{w.label}</Text>
                </View>
              )
            })}
          </View>
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#4ade80' }]} />
              <Text style={styles.legendText}>{perfectWeekLabel()}</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#7c3aed' }]} />
              <Text style={styles.legendText}>{partialLabel()}</Text>
            </View>
          </View>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryEmoji}>🎯</Text>
          <Text style={styles.summaryTitle}>{t('yourResult')}</Text>
          <Text style={styles.summaryDays}>{days} {t('days')}</Text>
          <Text style={styles.summaryMoney}>{currencySymbol}{saved.toLocaleString('ru')}</Text>
          <View style={styles.divider} />
          <Text style={styles.summaryCanBuy}>{canBuyLabel()}</Text>
          <Text style={styles.summaryBuy}>{canBuyText(saved)}</Text>
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
  backBtnText: { color: '#a78bfa', fontSize: 16, fontWeight: '600' },
  title: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  scroll: { padding: 16, paddingBottom: 40 },
  emptyBox: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { color: '#666', fontSize: 18 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  statCard: {
    flex: 1, backgroundColor: '#0e0e28', borderRadius: 20,
    padding: 16, alignItems: 'center',
    borderWidth: 1, borderColor: '#1a1a38',
  },
  statEmoji: { fontSize: 26, marginBottom: 8 },
  statValue: { color: '#a78bfa', fontSize: 22, fontWeight: 'bold', marginBottom: 4 },
  statLabel: { color: '#666', fontSize: 13, textAlign: 'center' },
  chartCard: {
    backgroundColor: '#0e0e28', borderRadius: 22,
    padding: 20, marginBottom: 16,
    borderWidth: 1, borderColor: '#1a1a38',
  },
  chartTitle: { color: '#fff', fontSize: 17, fontWeight: '700', marginBottom: 20 },
  chart: {
    flexDirection: 'row', alignItems: 'flex-end',
    justifyContent: 'space-between', height: 180, paddingBottom: 4,
  },
  barCol: { flex: 1, alignItems: 'center' },
  barVal: { color: '#888', fontSize: 11, marginBottom: 4, fontWeight: '600' },
  barTrack: { height: 140, justifyContent: 'flex-end', width: '70%' },
  bar: { width: '100%', borderRadius: 8 },
  barMoney: { backgroundColor: '#7c3aed' },
  barDays: { backgroundColor: '#4c1d95' },
  barPerfect: { backgroundColor: '#4ade80' },
  barEmpty: { backgroundColor: '#1e1e40', height: 4 },
  barLabel: { color: '#555', fontSize: 11, marginTop: 8, fontWeight: '600' },
  legend: { flexDirection: 'row', gap: 16, marginTop: 12, justifyContent: 'center' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { color: '#666', fontSize: 13 },
  summaryCard: {
    backgroundColor: '#0e0e28', borderRadius: 22,
    padding: 28, alignItems: 'center',
    borderWidth: 1, borderColor: '#1a1a38',
  },
  summaryEmoji: { fontSize: 48, marginBottom: 12 },
  summaryTitle: { color: '#a78bfa', fontSize: 16, fontWeight: '800', letterSpacing: 1, marginBottom: 16 },
  summaryDays: { color: '#fff', fontSize: 48, fontWeight: '900', lineHeight: 52 },
  summaryMoney: { color: '#4ade80', fontSize: 32, fontWeight: 'bold', marginBottom: 16 },
  divider: { width: '100%', height: 1, backgroundColor: '#1a1a38', marginBottom: 16 },
  summaryCanBuy: { color: '#666', fontSize: 16, marginBottom: 8 },
  summaryBuy: { color: '#fff', fontSize: 20, fontWeight: 'bold', textAlign: 'center' },
})