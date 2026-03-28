import React, { useEffect, useState } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity,
  StatusBar, ScrollView
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
import MoodScreen from './src/screens/MoodScreen'
import { setupAllNotifications, checkAndScheduleMilestone } from './src/utils/notifications'
import i18n from './src/utils/i18n'
import WeeklyCard from './src/components/WeeklyCard'
import HealthCard from './src/components/HealthCard'

type Tab = 'home' | 'achievements' | 'tips' | 'analytics'

const DAILY_TIPS = {
  ru: [
    { emoji: '🧘', text: 'Сделай 10 глубоких вдохов. Это снимает тревогу за 1 минуту.' },
    { emoji: '💪', text: 'Каждый день без ставок — это победа. Ты уже победитель.' },
    { emoji: '💰', text: 'Посмотри сколько ты уже сэкономил. Эти деньги твои.' },
    { emoji: '🎯', text: 'Думай только о сегодня. Не о "никогда". Только сегодня.' },
    { emoji: '🌊', text: 'Желание сделать ставку — это волна. Оно придёт и уйдёт.' },
    { emoji: '👥', text: 'Позвони другу. Общение помогает справиться с соблазном.' },
    { emoji: '🏃', text: '10 минут ходьбы снижают желание играть. Встань и пройдись.' },
  ],
  uk: [
    { emoji: '🧘', text: 'Зроби 10 глибоких вдихів. Це знімає тривогу за 1 хвилину.' },
    { emoji: '💪', text: 'Кожен день без ставок — це перемога. Ти вже переможець.' },
    { emoji: '💰', text: 'Подивись скільки ти вже зекономив. Ці гроші твої.' },
    { emoji: '🎯', text: 'Думай тільки про сьогодні. Не про "ніколи". Тільки сьогодні.' },
    { emoji: '🌊', text: 'Бажання зробити ставку — це хвиля. Воно прийде і піде.' },
    { emoji: '👥', text: 'Зателефонуй другу. Спілкування допомагає впоратись зі спокусою.' },
    { emoji: '🏃', text: '10 хвилин ходьби знижують бажання грати. Встань і пройдись.' },
  ],
  en: [
    { emoji: '🧘', text: 'Take 10 deep breaths. It relieves anxiety in 1 minute.' },
    { emoji: '💪', text: 'Every day without bets is a victory. You are already a winner.' },
    { emoji: '💰', text: 'Look how much you\'ve already saved. That money is yours.' },
    { emoji: '🎯', text: 'Think only about today. Not about "never". Just today.' },
    { emoji: '🌊', text: 'The urge to bet is a wave. It will come and go.' },
    { emoji: '👥', text: 'Call a friend. Communication helps deal with temptation.' },
    { emoji: '🏃', text: '10 minutes of walking reduces the urge to play. Get up and walk.' },
  ],
  kk: [
    { emoji: '🧘', text: '10 терең дем алыңыз. Бұл алаңдаушылықты 1 минутта жояды.' },
    { emoji: '💪', text: 'Бәссіз өткен әр күн — жеңіс. Сен әлдеқашан жеңімпазсың.' },
    { emoji: '💰', text: 'Қанша үнемдегеніңді қара. Ол ақша сенікі.' },
    { emoji: '🎯', text: 'Тек бүгін туралы ойла. "Ешқашан" туралы емес. Тек бүгін.' },
    { emoji: '🌊', text: 'Бәс қою ниеті — толқын. Ол келеді де кетеді.' },
    { emoji: '👥', text: 'Досыңа қоңырау шал. Қарым-қатынас азғыруды жеңуге көмектеседі.' },
    { emoji: '🏃', text: '10 минут жаяу жүру ойнау ниетін азайтады. Тұр да жүр.' },
  ],
}

function getDailyTip(lang: string) {
  const tips = DAILY_TIPS[lang as keyof typeof DAILY_TIPS] ?? DAILY_TIPS.ru
  const dayOfYear = Math.floor(Date.now() / 86400000)
  return tips[dayOfYear % tips.length]
}

function BottomNav({ tab, setTab, language }: { tab: Tab, setTab: (t: Tab) => void, language: string }) {
  i18n.locale = language || 'ru'
  const items = [
    { id: 'home', icon: '🏠', label: i18n.t('home') },
    { id: 'analytics', icon: '📊', label: i18n.t('chart') },
    { id: 'achievements', icon: '🏅', label: i18n.t('awards') },
    { id: 'tips', icon: '💡', label: i18n.t('tips') },
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

export default function App() {
  const { startDate, dailyAmount, urgeCount, currency, language, loadFromStorage, resetCounter } = useAppStore()
  const [tick, setTick] = useState(0)
  const [tab, setTab] = useState<Tab>('home')
  const [showSettings, setShowSettings] = useState(false)
  const [showUrge, setShowUrge] = useState(false)
  const [showRelapse, setShowRelapse] = useState(false)
  const [showMood, setShowMood] = useState(false)
  const [onboardingDone, setOnboardingDone] = useState(false)
  const [, forceUpdate] = useState(0)

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

  useEffect(() => {
    i18n.locale = language || 'ru'
    forceUpdate(n => n + 1)
  }, [language])

  i18n.locale = language || 'ru'
  const t = (key: string) => i18n.t(key)

  if (!onboardingDone && !startDate) {
    return <OnboardingScreen onDone={() => setOnboardingDone(true)} />
  }

  if (showSettings) return <SettingsScreen onClose={() => { setShowSettings(false); forceUpdate(n => n + 1) }} />
  if (showMood) return <MoodScreen onClose={() => setShowMood(false)} />
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
      <BottomNav tab={tab} setTab={setTab} language={language} />
    </View>
  )
  if (tab === 'tips') return (
    <View style={{ flex: 1, backgroundColor: '#07071a' }}>
      <TipsScreen onClose={() => setTab('home')} />
      <BottomNav tab={tab} setTab={setTab} language={language} />
    </View>
  )
  if (tab === 'analytics') return (
    <View style={{ flex: 1, backgroundColor: '#07071a' }}>
      <AnalyticsScreen onClose={() => setTab('home')} />
      <BottomNav tab={tab} setTab={setTab} language={language} />
    </View>
  )

  if (!startDate) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#07071a" />
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>🎯</Text>
          <Text style={styles.emptyTitle}>{t('appName')}</Text>
          <Text style={styles.emptySubtitle}>{t('onboardingSub1')}</Text>
          <TouchableOpacity style={styles.startButton} onPress={() => setShowSettings(true)}>
            <Text style={styles.startButtonText}>{t('start')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  const { days, hours, minutes, seconds } = getElapsed(startDate)
  const saved = getSavedMoney(startDate, dailyAmount)
  const level = getLevel(days)
  const tip = getDailyTip(language)
  const currencySymbol = CURRENCIES.find(c => c.code === currency)?.symbol ?? '₽'

  const nextLevel = days < 1 ? { name: t('levelNewbie'), days: 1 } :
    days < 7 ? { name: t('levelFighter'), days: 7 } :
    days < 30 ? { name: t('levelStrong'), days: 30 } :
    days < 100 ? { name: t('levelMaster'), days: 100 } : null

  const progressPct = nextLevel
    ? Math.min((days / nextLevel.days) * 100, 100)
    : 100

  const levelName = days >= 100 ? t('levelMaster') :
    days >= 30 ? t('levelStrong') :
    days >= 7 ? t('levelFighter') :
    days >= 1 ? t('levelNewbie') : t('levelStart')

  const timerLabels = language === 'en'
    ? ['HRS', 'MIN', 'SEC']
    : language === 'kk'
    ? ['САҒ', 'МИН', 'СЕК']
    : language === 'uk'
    ? ['ГОД', 'ХВ', 'СЕК']
    : ['ЧАС', 'МИН', 'СЕК']

  return (
    <View style={{ flex: 1, backgroundColor: '#07071a' }}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <StatusBar barStyle="light-content" backgroundColor="#07071a" />
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

          <View style={styles.header}>
            <View>
              <Text style={styles.appName}>{t('appName')}</Text>
              <Text style={styles.appSub}>{t('appSub')}</Text>
            </View>
            <TouchableOpacity style={styles.settingsBtn} onPress={() => setShowSettings(true)}>
              <Text style={styles.settingsIcon}>⚙️</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.heroCard}>
            <View style={styles.circle1} />
            <View style={styles.circle2} />
            <View style={styles.levelPill}>
              <Text style={styles.levelPillText}>{level.emoji}  {levelName}</Text>
            </View>
            <Text style={styles.heroNumber}>{days}</Text>
            <Text style={styles.heroLabel}>{t('daysWithout')}</Text>
            <View style={styles.timerRow}>
              <View style={styles.timerBlock}>
                <Text style={styles.timerNum}>{String(hours).padStart(2, '0')}</Text>
                <Text style={styles.timerSub}>{timerLabels[0]}</Text>
              </View>
              <Text style={styles.timerColon}>:</Text>
              <View style={styles.timerBlock}>
                <Text style={styles.timerNum}>{String(minutes).padStart(2, '0')}</Text>
                <Text style={styles.timerSub}>{timerLabels[1]}</Text>
              </View>
              <Text style={styles.timerColon}>:</Text>
              <View style={styles.timerBlock}>
                <Text style={styles.timerNum}>{String(seconds).padStart(2, '0')}</Text>
                <Text style={styles.timerSub}>{timerLabels[2]}</Text>
              </View>
            </View>
            {nextLevel && (
              <View style={styles.progressBox}>
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: `${progressPct}%` as any }]} />
                </View>
                <Text style={styles.progressHint}>
                  {t('toLevel')} «{nextLevel.name}»: {nextLevel.days - days} {t('days')}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.statsRow}>
            <View style={[styles.statCard, { backgroundColor: '#0d1f18' }]}>
              <Text style={styles.statIcon}>💰</Text>
              <Text style={styles.statNum}>{currencySymbol}{saved.toLocaleString('ru')}</Text>
              <Text style={styles.statSub}>{t('saved')}</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: '#150d2a' }]}>
              <Text style={styles.statIcon}>🛡️</Text>
              <Text style={styles.statNum}>{urgeCount}</Text>
              <Text style={styles.statSub}>{t('winsOverUrge')}</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: '#0d1525' }]}>
              <Text style={styles.statIcon}>📅</Text>
              <Text style={styles.statNum}>{Math.floor(days / 7)}</Text>
              <Text style={styles.statSub}>{t('weeksOfFreedom')}</Text>
            </View>
          </View>

          <View style={styles.tipCard}>
            <Text style={styles.tipBadge}>{t('tipOfDay')}</Text>
            <View style={styles.tipBody}>
              <Text style={styles.tipEmoji}>{tip.emoji}</Text>
              <Text style={styles.tipText}>{tip.text}</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.moodCard} onPress={() => setShowMood(true)}>
            <Text style={styles.moodCardEmoji}>😌</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.moodCardTitle}>Как ты сегодня?</Text>
              <Text style={styles.moodCardSub}>Отметь своё настроение</Text>
            </View>
            <Text style={styles.sosArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.sosButton} activeOpacity={0.9} onPress={() => setShowUrge(true)}>
            <View style={styles.sosLeft}>
              <View style={styles.sosDot} />
              <View>
                <Text style={styles.sosTitle}>{t('urgeButton')}</Text>
                <Text style={styles.sosSub}>{t('urgeSub')}</Text>
              </View>
            </View>
            <Text style={styles.sosArrow}>›</Text>
          </TouchableOpacity>

        </ScrollView>
      </SafeAreaView>
      <BottomNav tab={tab} setTab={setTab} language={language} />
    </View>
  )
}

const nav = StyleSheet.create({
  safeArea: { backgroundColor: '#0d0d20' },
  bar: {
    flexDirection: 'row', backgroundColor: '#0d0d20',
    borderTopWidth: 1, borderTopColor: '#16163a',
    paddingVertical: 10, paddingHorizontal: 12,
  },
  item: { flex: 1, alignItems: 'center' },
  pill: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 10, paddingHorizontal: 14,
    borderRadius: 20, gap: 6,
  },
  pillActive: { backgroundColor: '#1e1040' },
  icon: { fontSize: 24 },
  label: { color: '#a78bfa', fontSize: 14, fontWeight: '700' },
})

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#07071a' },
  scroll: { padding: 20, paddingBottom: 40 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emptyEmoji: { fontSize: 80, marginBottom: 24 },
  emptyTitle: { color: '#fff', fontSize: 30, fontWeight: 'bold', marginBottom: 12, textAlign: 'center' },
  emptySubtitle: { color: '#aaa', fontSize: 17, textAlign: 'center', marginBottom: 40, lineHeight: 26 },
  startButton: { backgroundColor: '#6d28d9', borderRadius: 20, paddingVertical: 18, paddingHorizontal: 48 },
  startButtonText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, marginTop: 4 },
  appName: { color: '#fff', fontSize: 22, fontWeight: '800' },
  appSub: { color: '#7878aa', fontSize: 14, marginTop: 2 },
  settingsBtn: { width: 44, height: 44, backgroundColor: '#111130', borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#1e1e50' },
  settingsIcon: { fontSize: 22 },
  heroCard: { backgroundColor: '#0e0e28', borderRadius: 32, padding: 28, alignItems: 'center', marginBottom: 14, borderWidth: 1, borderColor: '#1a1a45', overflow: 'hidden' },
  circle1: { position: 'absolute', width: 250, height: 250, borderRadius: 125, backgroundColor: '#5b21b6', opacity: 0.12, top: -80, right: -80 },
  circle2: { position: 'absolute', width: 180, height: 180, borderRadius: 90, backgroundColor: '#1d4ed8', opacity: 0.1, bottom: -60, left: -60 },
  levelPill: { backgroundColor: '#1e1040', borderRadius: 20, paddingVertical: 8, paddingHorizontal: 20, marginBottom: 20, borderWidth: 1, borderColor: '#4c1d95' },
  levelPillText: { color: '#c4b5fd', fontSize: 16, fontWeight: '700' },
  heroNumber: { color: '#ffffff', fontSize: 100, fontWeight: '900', lineHeight: 100, letterSpacing: -6 },
  heroLabel: { color: '#8888bb', fontSize: 16, fontWeight: '800', letterSpacing: 4, marginTop: 8, marginBottom: 24 },
  timerRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 24, backgroundColor: '#07071a', borderRadius: 16, paddingVertical: 14, paddingHorizontal: 20, borderWidth: 1, borderColor: '#16163a' },
  timerBlock: { alignItems: 'center', minWidth: 56 },
  timerNum: { color: '#e0d7ff', fontSize: 30, fontWeight: '700', fontFamily: 'monospace' },
  timerSub: { color: '#7878aa', fontSize: 10, letterSpacing: 2, marginTop: 4 },
  timerColon: { color: '#7878aa', fontSize: 28, fontWeight: 'bold', marginBottom: 14 },
  progressBox: { width: '100%' },
  progressTrack: { height: 6, backgroundColor: '#16163a', borderRadius: 3, overflow: 'hidden', marginBottom: 10 },
  progressFill: { height: 6, backgroundColor: '#7c3aed', borderRadius: 3 },
  progressHint: { color: '#8888bb', fontSize: 14, textAlign: 'center' },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  statCard: { flex: 1, borderRadius: 22, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: '#1a1a38' },
  statIcon: { fontSize: 28, marginBottom: 8 },
  statNum: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 6 },
  statSub: { color: '#aaa', fontSize: 13, textAlign: 'center', lineHeight: 18 },
  tipCard: { backgroundColor: '#0e0e28', borderRadius: 22, padding: 20, marginBottom: 14, borderWidth: 1, borderColor: '#1a1a45' },
  tipBadge: { color: '#a78bfa', fontSize: 13, fontWeight: '800', letterSpacing: 2, marginBottom: 12 },
  tipBody: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  tipEmoji: { fontSize: 34 },
  tipText: { color: '#ccc', fontSize: 16, lineHeight: 24, flex: 1 },
  moodCard: {
    backgroundColor: '#0e1428', borderRadius: 22, padding: 20,
    borderWidth: 1, borderColor: '#1a2a4a',
    flexDirection: 'row', alignItems: 'center',
    gap: 14, marginBottom: 14,
  },
  moodCardEmoji: { fontSize: 34 },
  moodCardTitle: { color: '#fff', fontSize: 17, fontWeight: 'bold', marginBottom: 3 },
  moodCardSub: { color: '#4a6a9a', fontSize: 13 },
  sosButton: { backgroundColor: '#120828', borderRadius: 22, padding: 22, borderWidth: 1.5, borderColor: '#4c1d95', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sosLeft: { flexDirection: 'row', alignItems: 'center', gap: 14, flex: 1 },
  sosDot: { width: 14, height: 14, borderRadius: 7, backgroundColor: '#dc2626' },
  sosTitle: { color: '#fff', fontSize: 17, fontWeight: 'bold', marginBottom: 4 },
  sosSub: { color: '#a78bfa', fontSize: 14 },
  sosArrow: { color: '#a78bfa', fontSize: 32, fontWeight: 'bold' },
})