import React, { useState, useEffect } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity,
  SafeAreaView, ScrollView
} from 'react-native'
import { useAppStore } from '../store/useAppStore'
import { getElapsed, getSavedMoney } from '../utils/timeUtils'

const STEPS = [
  {
    id: 1,
    emoji: '🚶',
    title: 'Физическое действие',
    description: 'Встань с места. Выйди в другую комнату или на улицу. Сделай 10 глубоких вдохов.',
    action: 'Запускаю таймер на 10 минут',
    hasTimer: true,
  },
  {
    id: 2,
    emoji: '🧠',
    title: 'Что ты чувствуешь?',
    description: 'Выбери то, что ближе всего к твоему состоянию прямо сейчас:',
    hasTimer: false,
  },
  {
    id: 3,
    emoji: '🏆',
    title: 'Посмотри на свой прогресс',
    description: 'Ты уже прошёл такой путь. Не сдавайся сейчас.',
    hasTimer: false,
  },
  {
    id: 4,
    emoji: '💡',
    title: 'Сделай что-то другое',
    description: 'Выбери альтернативное действие:',
    hasTimer: false,
  },
]

const FEELINGS = ['😴 Скука', '😰 Тревога', '😡 Злость', '😢 Одиночество', '😔 Грусть']

const ALTERNATIVES = [
  '📞 Позвони другу или близкому',
  '🚶 Выйди на прогулку',
  '🎮 Поиграй в игру',
  '🎵 Послушай музыку',
  '💪 Сделай зарядку',
  '📺 Посмотри видео',
  '🍵 Выпей чай или воду',
  '📖 Почитай книгу',
]

export default function UrgeScreen({ onClose }: { onClose: (resisted: boolean) => void }) {
  const { startDate, dailyAmount, incrementUrge } = useAppStore()
  const [step, setStep] = useState(0)
  const [timerSeconds, setTimerSeconds] = useState(600)
  const [timerRunning, setTimerRunning] = useState(false)
  const [selectedFeeling, setSelectedFeeling] = useState('')

  useEffect(() => {
    if (!timerRunning) return
    if (timerSeconds <= 0) {
      setTimerRunning(false)
      return
    }
    const interval = setInterval(() => setTimerSeconds(t => t - 1), 1000)
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
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>

        {/* Шапка */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Стоп. Подожди.</Text>
          <Text style={styles.headerSub}>Шаг {step + 1} из {STEPS.length}</Text>
        </View>

        {/* Прогресс бар */}
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${((step + 1) / STEPS.length) * 100}%` }]} />
        </View>

        {/* Контент шага */}
        <View style={styles.stepCard}>
          <Text style={styles.stepEmoji}>{STEPS[step].emoji}</Text>
          <Text style={styles.stepTitle}>{STEPS[step].title}</Text>
          <Text style={styles.stepDescription}>{STEPS[step].description}</Text>

          {/* Шаг 1 — таймер */}
          {step === 0 && (
            <View style={styles.timerBox}>
              <Text style={styles.timerText}>{formatTimer(timerSeconds)}</Text>
              {!timerRunning && timerSeconds === 600 && (
                <TouchableOpacity style={styles.timerButton} onPress={() => setTimerRunning(true)}>
                  <Text style={styles.timerButtonText}>▶ Запустить таймер</Text>
                </TouchableOpacity>
              )}
              {timerRunning && (
                <Text style={styles.timerHint}>Дыши... ты справишься 🌬️</Text>
              )}
              {timerSeconds === 0 && (
                <Text style={styles.timerDone}>✅ Отлично! Идём дальше</Text>
              )}
            </View>
          )}

          {/* Шаг 2 — чувства */}
          {step === 1 && (
            <View style={styles.feelingsBox}>
              {FEELINGS.map(f => (
                <TouchableOpacity
                  key={f}
                  style={[styles.feelingBtn, selectedFeeling === f && styles.feelingBtnActive]}
                  onPress={() => setSelectedFeeling(f)}
                >
                  <Text style={[styles.feelingText, selectedFeeling === f && styles.feelingTextActive]}>
                    {f}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Шаг 3 — прогресс */}
          {step === 2 && (
            <View style={styles.progressStats}>
              <View style={styles.progressStatItem}>
                <Text style={styles.progressStatNumber}>{days}</Text>
                <Text style={styles.progressStatLabel}>дней пути</Text>
              </View>
              <View style={styles.progressStatItem}>
                <Text style={styles.progressStatNumber}>₽{saved.toLocaleString('ru')}</Text>
                <Text style={styles.progressStatLabel}>сэкономлено</Text>
              </View>
            </View>
          )}

          {/* Шаг 4 — альтернативы */}
          {step === 3 && (
            <View style={styles.alternativesBox}>
              {ALTERNATIVES.map(a => (
                <View key={a} style={styles.alternativeItem}>
                  <Text style={styles.alternativeText}>{a}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Кнопки навигации */}
        {step < STEPS.length - 1 ? (
          <TouchableOpacity style={styles.nextButton} onPress={() => setStep(s => s + 1)}>
            <Text style={styles.nextButtonText}>Дальше →</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.finalButtons}>
            <TouchableOpacity style={styles.resistedButton} onPress={handleResisted}>
              <Text style={styles.resistedButtonText}>💪 Справился!</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.relapseButton} onPress={() => onClose(false)}>
              <Text style={styles.relapseButtonText}>Был срыв...</Text>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity style={styles.skipButton} onPress={() => onClose(false)}>
          <Text style={styles.skipButtonText}>← Назад</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a14' },
  scroll: { padding: 24 },
  header: { marginBottom: 16, marginTop: 8 },
  headerTitle: { color: '#fff', fontSize: 28, fontWeight: 'bold' },
  headerSub: { color: '#666', fontSize: 14, marginTop: 4 },
  progressBar: {
    height: 4, backgroundColor: '#1a1a2e',
    borderRadius: 2, marginBottom: 28,
  },
  progressFill: {
    height: 4, backgroundColor: '#7c3aed',
    borderRadius: 2,
  },
  stepCard: {
    backgroundColor: '#12122a', borderRadius: 24,
    padding: 28, marginBottom: 20,
    borderWidth: 1, borderColor: '#1e1e40',
    alignItems: 'center',
  },
  stepEmoji: { fontSize: 56, marginBottom: 16 },
  stepTitle: {
    color: '#fff', fontSize: 22,
    fontWeight: 'bold', marginBottom: 12,
    textAlign: 'center',
  },
  stepDescription: {
    color: '#888', fontSize: 16,
    textAlign: 'center', lineHeight: 24,
  },
  timerBox: { marginTop: 24, alignItems: 'center' },
  timerText: {
    color: '#a78bfa', fontSize: 64,
    fontFamily: 'monospace', fontWeight: 'bold',
  },
  timerButton: {
    backgroundColor: '#7c3aed', borderRadius: 14,
    paddingVertical: 14, paddingHorizontal: 32, marginTop: 16,
  },
  timerButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  timerHint: { color: '#666', fontSize: 15, marginTop: 16 },
  timerDone: { color: '#4ade80', fontSize: 16, marginTop: 16, fontWeight: 'bold' },
  feelingsBox: { marginTop: 20, width: '100%', gap: 10 },
  feelingBtn: {
    backgroundColor: '#1a1a2e', borderRadius: 12,
    padding: 16, borderWidth: 1, borderColor: '#2a2a4a',
  },
  feelingBtnActive: { backgroundColor: '#2d1a50', borderColor: '#7c3aed' },
  feelingText: { color: '#888', fontSize: 16, textAlign: 'center' },
  feelingTextActive: { color: '#fff' },
  progressStats: {
    flexDirection: 'row', gap: 20,
    marginTop: 24,
  },
  progressStatItem: { alignItems: 'center' },
  progressStatNumber: {
    color: '#a78bfa', fontSize: 32,
    fontWeight: 'bold',
  },
  progressStatLabel: { color: '#666', fontSize: 14, marginTop: 4 },
  alternativesBox: { marginTop: 16, width: '100%', gap: 8 },
  alternativeItem: {
    backgroundColor: '#1a1a2e', borderRadius: 12,
    padding: 14, borderWidth: 1, borderColor: '#2a2a4a',
  },
  alternativeText: { color: '#ccc', fontSize: 15 },
  nextButton: {
    backgroundColor: '#7c3aed', borderRadius: 18,
    padding: 18, alignItems: 'center', marginBottom: 12,
  },
  nextButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  finalButtons: { gap: 12, marginBottom: 12 },
  resistedButton: {
    backgroundColor: '#14532d', borderRadius: 18,
    padding: 18, alignItems: 'center',
    borderWidth: 1, borderColor: '#166534',
  },
  resistedButtonText: { color: '#4ade80', fontSize: 18, fontWeight: 'bold' },
  relapseButton: {
    backgroundColor: '#1a1a2e', borderRadius: 18,
    padding: 18, alignItems: 'center',
    borderWidth: 1, borderColor: '#3a1a1a',
  },
  relapseButtonText: { color: '#888', fontSize: 16 },
  skipButton: { padding: 16, alignItems: 'center' },
  skipButtonText: { color: '#555', fontSize: 15 },
})