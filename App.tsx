import React, { useEffect, useState } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity,
  StatusBar, ScrollView, Platform
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAppStore, CURRENCIES } from './src/store/useAppStore'
import { getElapsed, getSavedMoney, getLevel } from './src/utils/timeUtils'
import SettingsScreen from './src/screens/SettingsScreen'
import UrgeScreen from './src/screens/UrgeScreen'
import RelapseScreen from './src/screens/RelapseScreen'
import TipsScreen from './src/screens/TipsScreen'
import AchievementsScreen from './src/screens/AchievementsScreen'
import AnalyticsScreen from './src/screens/AnalyticsScreen'
import OnboardingScreen from './src/screens/OnboardingScreen'
import { setupAllNotifications, checkAndScheduleMilestone } from './src/utils/notifications'

type Tab = 'home' | 'achievements' | 'tips' | 'analytics'

const DAILY_TIPS = [
  { emoji: '🧘', text: 'Сделай 10 глубоких вдохов. Это снимает тревогу за 1 минуту.' },
  { emoji: '💪', text: 'Каждый день без ставок — это победа. Ты уже победитель.' },
  { emoji: '💰', text: 'Посмотри сколько ты уже сэкономил. Эти деньги твои.' },
  { emoji: '🎯', text: 'Думай только о сегодня. Не о "никогда". Только сегодня.' },
  { emoji: '🌊', text: 'Желание сделать ставку — это волна. Оно придёт и уйдёт.' },
  { emoji: '👥', text: 'Позвони другу. Общение помогает справиться с соблазном.' },
  { emoji: '🏃', text: '10 минут ходьбы снижают желание играть. Встань и пройдись.' },
]

function getDailyTip() {
  const dayOfYear = Math.floor(Date.now() / 86400000)
  return DAILY_TIPS[dayOfYear % DAILY_TIPS.length]
}

export default function App() {
  const { startDate, dailyAmount, urgeCount, currency, loadFromStorage, resetCounter } = useAppStore()
  const [tick, setTick] = useState(0)
  const [tab, setTab] = useState<Tab>('home')
  const [showSettings, setShowSettings] = useState(false)
  const [showUrge, setShowUrge] = useState(false)
  const [showRelapse, setShowRelapse] = useState(false)
  const [onboardingDone, setOnboardingDone] = useState(false)

  useEffect(() => {
    loadFromStorage()
    setupAllNotifications()
  }, [])

  useEffect(() => {
    if (startDate) {
      const { days } = getElapsed(startDate)
      checkAndScheduleMilestone(days)
    }
  }, [startDate])

  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 1000)
    return () => clearInterval(interval)
  }, [])

  if (!onboardingDone && !startDate) {
    return <OnboardingScreen onDone={() => setOnboardingDone(true)} />
  }

  if (showSettings) return <SettingsScreen onClose={() => setShowSettings(false)} />
  if (showUrge) return (
    <UrgeScreen onClose={(resisted) => {
      setShowUrge(false)
      if (!resisted) setShowRelapse(true)
    }} />
  )
  if (showRelapse) return (
    <RelapseScreen
      onClose={() => setShowRelapse(false)}
      onRestart={() => {
        resetCounter(new Date().toISOString())
        setShowRelapse(false)
      }}
    />
  )

  if (tab === 'achievements') return (
    <View style={{ flex: 1, backgroundColor: '#07071a' }}>
      <AchievementsScreen onClose={() => setTab('home')} />
      <BottomNav tab={tab} setTab={setTab} />
    </View>
  )
  if (tab === 'tips') return (
    <View style={{ flex: 1, backgroundColor: '#07071a' }}>
      <TipsScreen onClose={() => setTab('home')} />
      <BottomNav tab={tab} setTab={setTab} />
    </View>
  )
  if (tab === 'analytics') return (
    <View style={{ flex: 1, backgroundColor: '#07071a' }}>
      <AnalyticsScreen onClose={() => setTab('home')} />
      <BottomNav tab={tab} setTab={setTab} />
    </View>
  )

  if (!startDate) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#07071a" />
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>🎯</Text>
          <Text style={styles.emptyTitle}>Свободен от ставок</Text>
          <Text style={styles.emptySubtitle}>Начни отслеживать свой прогресс прямо сейчас</Text>
          <TouchableOpacity style={styles.startButton} onPress={() => setShowSettings(true)}>
            <Text style={styles.startButtonText}>Начать →</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  const { days, hours, minutes, seconds } = getElapsed(startDate)
  const saved = getSavedMoney(startDate, dailyAmount)
  const level = getLevel(days)
  const tip = getDailyTip()
  const currencySymbol = CURRENCIES.find(c => c.code === currency)?.symbol ?? '₽'

  const nextLevel = days < 1 ? { name: 'Новичок', days: 1 } :
    days < 7 ? { name: 'Борец', days: 7 } :
    days < 30 ? { name: 'Стойкий', days: 30 } :
    days < 100 ? { name: 'Мастер', days: 100 } : null

  const progressPct = nextLevel
    ? Math.min((days / nextLevel.days) * 100, 100)
    : 100

  return (
    <View style={{ flex: 1, backgroundColor: '#07071a' }}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <StatusBar barStyle="light-content" backgroundColor="#07071a" />
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {/* Шапка */}
          <View style={styles.header}>
            <View>
              <Text style={styles.appName}>Свободен от ставок</Text>
              <Text style={styles.appSub}>Продолжай. Ты на верном пути ✨</Text>
            </View>
            <TouchableOpacity style={styles.settingsBtn} onPress={() => setShowSettings(true)}>
              <Text style={styles.settingsIcon}>⚙️</Text>
            </TouchableOpacity>
          </View>

          {/* Главная карточка */}
          <View style={styles.heroCard}>
            <View style={styles.circle1} />
            <View style={styles.circle2} />

            <View style={styles.levelPill}>
              <Text style={styles.levelPillText}>{level.emoji}  {level.name}</Text>
            </View>

            <Text style={styles.heroNumber}>{days}</Text>
            <Text style={styles.heroLabel}>ДНЕЙ БЕЗ СТАВОК</Text>

            <View style={styles.timerRow}>
              <View style={styles.timerBlock}>
                <Text style={styles.timerNum}>{String(hours).padStart(2, '0')}</Text>
                <Text style={styles.timerSub}>ЧАС</Text>
              </View>
              <Text style={styles.timerColon}>:</Text>
              <View style={styles.timerBlock}>
                <Text style={styles.timerNum}>{String(minutes).padStart(2, '0')}</Text>
                <Text style={styles.timerSub}>МИН</Text>
              </View>
              <Text style={styles.timerColon}>:</Text>
              <View style={styles.timerBlock}>
                <Text style={styles.timerNum}>{String(seconds).padStart(2, '0')}</Text>
                <Text style={styles.timerSub}>СЕК</Text>
              </View>
            </View>

            {nextLevel && (
              <View style={styles.progressBox}>
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: `${progressPct}%` as any }]} />
                </View>
                <Text style={styles.progressHint}>
                  До уровня «{nextLevel.name}»: {nextLevel.days - days} дн.
                </Text>
              </View>
            )}
          </View>

          {/* Статистика */}
          <View style={styles.statsRow}>
            <View style={[styles.statCard, { backgroundColor: '#0d1f18' }]}>
              <Text style={styles.statIcon}>💰</Text>
              <Text style={styles.statNum}>{currencySymbol}{saved.toLocaleString('ru')}</Text>
              <Text style={styles.statSub}>сэкономлено</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: '#150d2a' }]}>
              <Text style={styles.statIcon}>🛡️</Text>
              <Text style={styles.statNum}>{urgeCount}</Text>
              <Text style={styles.statSub}>побед над{'\n'}соблазном</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: '#0d1525' }]}>
              <Text style={styles.statIcon}>📅</Text>
              <Text style={styles.statNum}>{Math.floor(days / 7)}</Text>
              <Text style={styles.statSub}>недель{'\n'}свободы</Text>
            </View>
          </View>

          {/* Совет дня */}
          <View style={styles.tipCard}>
            <Text style={styles.tipBadge}>💡 СОВЕТ ДНЯ</Text>
            <View style={styles.tipBody}>
              <Text style={styles.tipEmoji}>{tip.emoji}</Text>
              <Text style={styles.tipText}>{tip.text}</Text>
            </View>
          </View>

          {/* SOS кнопка */}
          <TouchableOpacity
            style={styles.sosButton}
            activeOpacity={0.9}
            onPress={() => setShowUrge(true)}
          >
            <View style={styles.sosLeft}>
              <View style={styles.sosDot} />
              <View>
                <Text style={styles.sosTitle}>Хочется сделать ставку</Text>
                <Text style={styles.sosSub}>Нажми — помогу справиться за 10 мин</Text>
              </View>
            </View>
            <Text style={styles.sosArrow}>›</Text>
          </TouchableOpacity>

        </ScrollView>
      </SafeAreaView>
      <BottomNav tab={tab} setTab={setTab} />
    </View>
  )
}

function BottomNav({ tab, setTab }: { tab: Tab, setTab: (t: Tab) => void }) {
  const items = [
    { id: 'home', icon: '🏠', label: 'Главная' },
    { id: 'analytics', icon: '📊', label: 'График' },
    { id: 'achievements', icon: '🏅', label: 'Награды' },
    { id: 'tips', icon: '💡', label: 'Советы' },
  ] as const

  return (
    <SafeAreaView edges={['bottom']} style={nav.safeArea}>
      <View style={nav.bar}>
        {items.map(item => (
          <TouchableOpacity key={item.id} style={nav.item} onPress={() => setTab(item.id)}>
            <View style={[nav.pill, tab === item.id && nav.pillActive]}>
              <Text style={nav.icon}>{item.icon}</Text>
              {tab === item.id && <Text style={nav.label}>{item.label}</Text>}
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  )
}

const nav = StyleSheet.create({
  safeArea: { backgroundColor: '#0d0d20' },
  bar: {
    flexDirection: 'row',
    backgroundColor: '#0d0d20',
    borderTopWidth: 1,
    borderTopColor: '#16163a',
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  item: { flex: 1, alignItems: 'center' },
  pill: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 8, paddingHorizontal: 12,
    borderRadius: 20, gap: 6,
  },
  pillActive: { backgroundColor: '#1e1040' },
  icon: { fontSize: 22 },
  label: { color: '#a78bfa', fontSize: 13, fontWeight: '600' },
})

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#07071a' },
  scroll: { padding: 20, paddingBottom: 32 },

  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emptyEmoji: { fontSize: 72, marginBottom: 24 },
  emptyTitle: { color: '#fff', fontSize: 28, fontWeight: 'bold', marginBottom: 12, textAlign: 'center' },
  emptySubtitle: { color: '#888', fontSize: 16, textAlign: 'center', marginBottom: 40, lineHeight: 24 },
  startButton: { backgroundColor: '#6d28d9', borderRadius: 20, paddingVertical: 18, paddingHorizontal: 48 },
  startButtonText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },

  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 20, marginTop: 4,
  },
  appName: { color: '#fff', fontSize: 20, fontWeight: '800' },
  appSub: { color: '#4a4a7a', fontSize: 13, marginTop: 2 },
  settingsBtn: {
    width: 42, height: 42, backgroundColor: '#111130',
    borderRadius: 14, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: '#1e1e50',
  },
  settingsIcon: { fontSize: 20 },

  heroCard: {
    backgroundColor: '#0e0e28',
    borderRadius: 32, padding: 28,
    alignItems: 'center', marginBottom: 14,
    borderWidth: 1, borderColor: '#1a1a45',
    overflow: 'hidden',
  },
  circle1: {
    position: 'absolute', width: 250, height: 250,
    borderRadius: 125, backgroundColor: '#5b21b6',
    opacity: 0.12, top: -80, right: -80,
  },
  circle2: {
    position: 'absolute', width: 180, height: 180,
    borderRadius: 90, backgroundColor: '#1d4ed8',
    opacity: 0.1, bottom: -60, left: -60,
  },
  levelPill: {
    backgroundColor: '#1e1040', borderRadius: 20,
    paddingVertical: 6, paddingHorizontal: 18,
    marginBottom: 20, borderWidth: 1, borderColor: '#4c1d95',
  },
  levelPillText: { color: '#c4b5fd', fontSize: 14, fontWeight: '700' },

  heroNumber: {
    color: '#ffffff', fontSize: 96,
    fontWeight: '900', lineHeight: 96,
    letterSpacing: -6,
  },
  heroLabel: {
    color: '#3a3a7a', fontSize: 11,
    fontWeight: '800', letterSpacing: 5,
    marginTop: 4, marginBottom: 24,
  },

  timerRow: {
    flexDirection: 'row', alignItems: 'center',
    gap: 4, marginBottom: 24,
    backgroundColor: '#07071a',
    borderRadius: 16, paddingVertical: 12, paddingHorizontal: 20,
    borderWidth: 1, borderColor: '#16163a',
  },
  timerBlock: { alignItems: 'center', minWidth: 50 },
  timerNum: { color: '#e0d7ff', fontSize: 26, fontWeight: '700', fontFamily: 'monospace' },
  timerSub: { color: '#3a3a7a', fontSize: 8, letterSpacing: 2, marginTop: 2 },
  timerColon: { color: '#3a3a7a', fontSize: 24, fontWeight: 'bold', marginBottom: 10 },

  progressBox: { width: '100%' },
  progressTrack: {
    height: 6, backgroundColor: '#16163a',
    borderRadius: 3, overflow: 'hidden', marginBottom: 8,
  },
  progressFill: {
    height: 6, backgroundColor: '#7c3aed', borderRadius: 3,
  },
  progressHint: { color: '#555', fontSize: 12, textAlign: 'center' },

  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  statCard: {
    flex: 1, borderRadius: 22, padding: 16,
    alignItems: 'center', borderWidth: 1, borderColor: '#1a1a38',
  },
  statIcon: { fontSize: 26, marginBottom: 8 },
  statNum: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  statSub: { color: '#666', fontSize: 11, textAlign: 'center', lineHeight: 16 },

  tipCard: {
    backgroundColor: '#0e0e28', borderRadius: 22,
    padding: 18, marginBottom: 14,
    borderWidth: 1, borderColor: '#1a1a45',
  },
  tipBadge: { color: '#6d28d9', fontSize: 11, fontWeight: '800', letterSpacing: 2, marginBottom: 12 },
  tipBody: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  tipEmoji: { fontSize: 32 },
  tipText: { color: '#bbb', fontSize: 14, lineHeight: 22, flex: 1 },

  sosButton: {
    backgroundColor: '#120828',
    borderRadius: 22, padding: 20,
    borderWidth: 1.5, borderColor: '#4c1d95',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sosLeft: { flexDirection: 'row', alignItems: 'center', gap: 14, flex: 1 },
  sosDot: {
    width: 12, height: 12, borderRadius: 6,
    backgroundColor: '#dc2626',
  },
  sosTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginBottom: 3 },
  sosSub: { color: '#7c3aed', fontSize: 12 },
  sosArrow: { color: '#7c3aed', fontSize: 30, fontWeight: 'bold' },
})