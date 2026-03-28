import React, { useState, useEffect } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAppStore } from '../store/useAppStore'
import { getElapsed, getSavedMoney } from '../utils/timeUtils'
import { CURRENCIES } from '../store/useAppStore'
import i18n from '../utils/i18n'

const FEELINGS = {
  ru: ['😴 Скука', '😰 Тревога', '😡 Злость', '😢 Одиночество', '😔 Грусть'],
  uk: ['😴 Нудьга', '😰 Тривога', '😡 Злість', '😢 Самотність', '😔 Смуток'],
  en: ['😴 Boredom', '😰 Anxiety', '😡 Anger', '😢 Loneliness', '😔 Sadness'],
  kk: ['😴 Жалықпа', '😰 Алаңдаушылық', '😡 Ашу', '😢 Жалғыздық', '😔 Қайғы'],
}

const ALTERNATIVES = {
  ru: ['📞 Позвони другу', '🚶 Выйди на прогулку', '🎮 Поиграй в игру', '🎵 Послушай музыку', '💪 Сделай зарядку', '📺 Посмотри видео', '🍵 Выпей чай', '📖 Почитай книгу'],
  uk: ['📞 Зателефонуй другу', '🚶 Вийди на прогулянку', '🎮 Зіграй у гру', '🎵 Послухай музику', '💪 Зроби зарядку', '📺 Подивись відео', '🍵 Випий чай', '📖 Почитай книгу'],
  en: ['📞 Call a friend', '🚶 Go for a walk', '🎮 Play a game', '🎵 Listen to music', '💪 Exercise', '📺 Watch a video', '🍵 Drink tea', '📖 Read a book'],
  kk: ['📞 Досыңа қоңырау шал', '🚶 Серуенге шық', '🎮 Ойын ойна', '🎵 Музыка тыңда', '💪 Жаттығу жаса', '📺 Бейне қара', '🍵 Шай іш', '📖 Кітап оқы'],
}

export default function UrgeScreen({ onClose }: { onClose: (resisted: boolean) => void }) {
  const { startDate, dailyAmount, incrementUrge, language, currency } = useAppStore()
  i18n.locale = language || 'ru'
  const t = (key: string) => i18n.t(key)

  const STEPS = [
    {
      id: 1, emoji: '🚶',
      title: t('physicalAction'),
      description: t('physicalDesc'),
      hasTimer: true,
    },
    {
      id: 2, emoji: '🧠',
      title: t('howFeeling'),
      description: t('howFeelingDesc'),
      hasTimer: false,
    },
    {
      id: 3, emoji: '🏆',
      title: t('yourProgress'),
      description: t('yourProgressDesc'),
      hasTimer: false,
    },
    {
      id: 4, emoji: '💡',
      title: t('doSomething'),
      description: t('doSomethingDesc'),
      hasTimer: false,
    },
  ]

  const [step, setStep] = useState(0)
  const [timerSeconds, setTimerSeconds] = useState(600)
  const [timerRunning, setTimerRunning] = useState(false)
  const [selectedFeeling, setSelectedFeeling] = useState('')

  const currencySymbol = CURRENCIES.find(c => c.code === currency)?.symbol ?? '₽'
  const feelings = FEELINGS[language as keyof typeof FEELINGS] ?? FEELINGS.ru
  const alternatives = ALTERNATIVES[language as keyof typeof ALTERNATIVES] ?? ALTERNATIVES.ru

  useEffect(() => {
    if (!timerRunning) return
    if (timerSeconds <= 0) { setTimerRunning(false); return }
    const interval = setInterval(() => setTimerSeconds(s => s - 1), 1000)
    return () => clearInterval(interval)
  }, [timerRunning, timerSeconds])

  const formatTimer = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  }

  const handleResisted = () => {
    incrementUrge()
    onClose(true)
  }

  const { days } = startDate ? getElapsed(startDate) : { days: 0 }
  const saved = startDate ? getSavedMoney(startDate, dailyAmount) : 0

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>

        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t('stopWait')}</Text>
          <Text style={styles.headerSub}>{t('step')} {step + 1} {t('of')} {STEPS.length}</Text>
        </View>

        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${((step + 1) / STEPS.length) * 100}%` as any }]} />
        </View>

        <View style={styles.stepCard}>
          <Text style={styles.stepEmoji}>{STEPS[step].emoji}</Text>
          <Text style={styles.stepTitle}>{STEPS[step].title}</Text>
          <Text style={styles.stepDescription}>{STEPS[step].description}</Text>

          {step === 0 && (
            <View style={styles.timerBox}>
              <Text style={styles.timerText}>{formatTimer(timerSeconds)}</Text>
              {!timerRunning && timerSeconds === 600 && (
                <TouchableOpacity style={styles.timerButton} onPress={() => setTimerRunning(true)}>
                  <Text style={styles.timerButtonText}>{t('startTimer')}</Text>
                </TouchableOpacity>
              )}
              {timerRunning && <Text style={styles.timerHint}>{t('breathing')}</Text>}
              {timerSeconds === 0 && <Text style={styles.timerDone}>{t('timerDone')}</Text>}
            </View>
          )}

          {step === 1 && (
            <View style={styles.feelingsBox}>
              {feelings.map(f => (
                <TouchableOpacity
                  key={f}
                  style={[styles.feelingBtn, selectedFeeling === f && styles.feelingBtnActive]}
                  onPress={() => setSelectedFeeling(f)}
                >
                  <Text style={[styles.feelingText, selectedFeeling === f && styles.feelingTextActive]}>{f}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {step === 2 && (
            <View style={styles.progressStats}>
              <View style={styles.progressStatItem}>
                <Text style={styles.progressStatNumber}>{days}</Text>
                <Text style={styles.progressStatLabel}>{t('daysLabel')}</Text>
              </View>
              <View style={styles.progressStatItem}>
                <Text style={styles.progressStatNumber}>{currencySymbol}{saved.toLocaleString('ru')}</Text>
                <Text style={styles.progressStatLabel}>{t('saved')}</Text>
              </View>
            </View>
          )}

          {step === 3 && (
            <View style={styles.alternativesBox}>
              {alternatives.map(a => (
                <View key={a} style={styles.alternativeItem}>
                  <Text style={styles.alternativeText}>{a}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {step < STEPS.length - 1 ? (
          <TouchableOpacity style={styles.nextButton} onPress={() => setStep(s => s + 1)}>
            <Text style={styles.nextButtonText}>{t('nextStep')}</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.finalButtons}>
            <TouchableOpacity style={styles.resistedButton} onPress={handleResisted}>
              <Text style={styles.resistedButtonText}>{t('resisted')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.relapseButton} onPress={() => onClose(false)}>
              <Text style={styles.relapseButtonText}>{t('relapsed')}</Text>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity style={styles.skipButton} onPress={() => onClose(false)}>
          <Text style={styles.skipButtonText}>{t('back')}</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#07071a' },
  scroll: { padding: 24 },
  header: { marginBottom: 16, marginTop: 8 },
  headerTitle: { color: '#fff', fontSize: 28, fontWeight: 'bold' },
  headerSub: { color: '#666', fontSize: 14, marginTop: 4 },
  progressBar: { height: 4, backgroundColor: '#1a1a2e', borderRadius: 2, marginBottom: 28 },
  progressFill: { height: 4, backgroundColor: '#7c3aed', borderRadius: 2 },
  stepCard: {
    backgroundColor: '#0e0e28', borderRadius: 24,
    padding: 28, marginBottom: 20,
    borderWidth: 1, borderColor: '#1e1e40', alignItems: 'center',
  },
  stepEmoji: { fontSize: 56, marginBottom: 16 },
  stepTitle: { color: '#fff', fontSize: 22, fontWeight: 'bold', marginBottom: 12, textAlign: 'center' },
  stepDescription: { color: '#888', fontSize: 16, textAlign: 'center', lineHeight: 24 },
  timerBox: { marginTop: 24, alignItems: 'center' },
  timerText: { color: '#a78bfa', fontSize: 64, fontFamily: 'monospace', fontWeight: 'bold' },
  timerButton: { backgroundColor: '#7c3aed', borderRadius: 14, paddingVertical: 14, paddingHorizontal: 32, marginTop: 16 },
  timerButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  timerHint: { color: '#666', fontSize: 15, marginTop: 16 },
  timerDone: { color: '#4ade80', fontSize: 16, marginTop: 16, fontWeight: 'bold' },
  feelingsBox: { marginTop: 20, width: '100%', gap: 10 },
  feelingBtn: { backgroundColor: '#1a1a2e', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#2a2a4a' },
  feelingBtnActive: { backgroundColor: '#2d1a50', borderColor: '#7c3aed' },
  feelingText: { color: '#888', fontSize: 16, textAlign: 'center' },
  feelingTextActive: { color: '#fff' },
  progressStats: { flexDirection: 'row', gap: 20, marginTop: 24 },
  progressStatItem: { alignItems: 'center' },
  progressStatNumber: { color: '#a78bfa', fontSize: 32, fontWeight: 'bold' },
  progressStatLabel: { color: '#666', fontSize: 14, marginTop: 4 },
  alternativesBox: { marginTop: 16, width: '100%', gap: 8 },
  alternativeItem: { backgroundColor: '#1a1a2e', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#2a2a4a' },
  alternativeText: { color: '#ccc', fontSize: 15 },
  nextButton: { backgroundColor: '#7c3aed', borderRadius: 18, padding: 18, alignItems: 'center', marginBottom: 12 },
  nextButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  finalButtons: { gap: 12, marginBottom: 12 },
  resistedButton: { backgroundColor: '#14532d', borderRadius: 18, padding: 18, alignItems: 'center', borderWidth: 1, borderColor: '#166534' },
  resistedButtonText: { color: '#4ade80', fontSize: 18, fontWeight: 'bold' },
  relapseButton: { backgroundColor: '#1a1a2e', borderRadius: 18, padding: 18, alignItems: 'center', borderWidth: 1, borderColor: '#3a1a1a' },
  relapseButtonText: { color: '#888', fontSize: 16 },
  skipButton: { padding: 16, alignItems: 'center' },
  skipButtonText: { color: '#555', fontSize: 15 },
})