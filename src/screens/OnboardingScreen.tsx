import React, { useState } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity,
  SafeAreaView, TextInput
} from 'react-native'
import { useAppStore } from '../store/useAppStore'
import { setupAllNotifications } from '../utils/notifications'

const STEPS = [
  {
    emoji: '🎯',
    title: 'Свободен от ставок',
    subtitle: 'Приложение поможет тебе отслеживать прогресс, бороться с соблазнами и видеть результат каждый день.',
    type: 'intro',
  },
  {
    emoji: '📅',
    title: 'Когда ты остановился?',
    subtitle: 'Укажи дату последней ставки',
    type: 'date',
  },
  {
    emoji: '💰',
    title: 'Сколько тратил в день?',
    subtitle: 'Мы покажем сколько ты уже сэкономил',
    type: 'amount',
  },
]

export default function OnboardingScreen({ onDone }: { onDone: () => void }) {
  const { setStartDate, setDailyAmount } = useAppStore()
  const [step, setStep] = useState(0)
  const [dateInput, setDateInput] = useState('')
  const [amountInput, setAmountInput] = useState('500')

  const handleDateChange = (text: string) => {
    const digits = text.replace(/\D/g, '')
    let formatted = digits
    if (digits.length >= 3 && digits.length <= 4) {
      formatted = digits.slice(0, 2) + '.' + digits.slice(2)
    } else if (digits.length >= 5) {
      formatted = digits.slice(0, 2) + '.' + digits.slice(2, 4) + '.' + digits.slice(4, 8)
    }
    setDateInput(formatted)
  }

  const handleNext = async () => {
    if (step === STEPS.length - 1) {
      const parts = dateInput.split('.')
      if (parts.length === 3) {
        const date = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`)
        if (!isNaN(date.getTime())) {
          await setStartDate(date.toISOString())
        } else {
          await setStartDate(new Date().toISOString())
        }
      } else {
        await setStartDate(new Date().toISOString())
      }
      const amount = Number(amountInput)
      await setDailyAmount(isNaN(amount) || amount <= 0 ? 500 : amount)
      await setupAllNotifications()
      onDone()
    } else {
      setStep(s => s + 1)
    }
  }

  const canNext = () => {
    if (STEPS[step].type === 'date') return dateInput.length >= 8
    return true
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.dots}>
        {STEPS.map((_, i) => (
          <View key={i} style={[styles.dot, i === step && styles.dotActive]} />
        ))}
      </View>

      <View style={styles.content}>
        <Text style={styles.emoji}>{STEPS[step].emoji}</Text>
        <Text style={styles.title}>{STEPS[step].title}</Text>
        <Text style={styles.subtitle}>{STEPS[step].subtitle}</Text>

        {STEPS[step].type === 'date' && (
          <View style={styles.inputBox}>
            <TextInput
              style={styles.input}
              value={dateInput}
              onChangeText={handleDateChange}
              placeholder="01.01.2025"
              placeholderTextColor="#444"
              keyboardType="numeric"
              maxLength={10}
              autoFocus
            />
            <Text style={styles.inputHint}>Формат: ДД.ММ.ГГГГ</Text>
            <TouchableOpacity
              style={styles.todayBtn}
              onPress={() => {
                const today = new Date()
                const d = String(today.getDate()).padStart(2, '0')
                const m = String(today.getMonth() + 1).padStart(2, '0')
                const y = today.getFullYear()
                setDateInput(`${d}.${m}.${y}`)
              }}
            >
              <Text style={styles.todayBtnText}>📅 Сегодня</Text>
            </TouchableOpacity>
          </View>
        )}

        {STEPS[step].type === 'amount' && (
          <View style={styles.inputBox}>
            <View style={styles.amountRow}>
              <Text style={styles.currency}>₽</Text>
              <TextInput
                style={styles.amountInput}
                value={amountInput}
                onChangeText={setAmountInput}
                keyboardType="numeric"
                autoFocus
              />
            </View>
            <Text style={styles.inputHint}>Средняя сумма ставок в день</Text>
            <View style={styles.presets}>
              {['100', '500', '1000', '3000'].map(p => (
                <TouchableOpacity
                  key={p}
                  style={[styles.preset, amountInput === p && styles.presetActive]}
                  onPress={() => setAmountInput(p)}
                >
                  <Text style={[styles.presetText, amountInput === p && styles.presetTextActive]}>
                    ₽{p}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </View>

      <TouchableOpacity
        style={[styles.nextBtn, !canNext() && styles.nextBtnDisabled]}
        onPress={handleNext}
        disabled={!canNext()}
      >
        <Text style={styles.nextBtnText}>
          {step === STEPS.length - 1 ? 'Начать! 🚀' : 'Дальше →'}
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: '#0a0a14',
    padding: 24, justifyContent: 'space-between',
  },
  dots: {
    flexDirection: 'row', justifyContent: 'center',
    gap: 8, marginTop: 16,
  },
  dot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: '#1e1e40',
  },
  dotActive: { backgroundColor: '#7c3aed', width: 24 },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 80, marginBottom: 24 },
  title: {
    color: '#fff', fontSize: 28, fontWeight: 'bold',
    textAlign: 'center', marginBottom: 16,
  },
  subtitle: {
    color: '#666', fontSize: 16, textAlign: 'center',
    lineHeight: 24, marginBottom: 32,
  },
  inputBox: { width: '100%', alignItems: 'center' },
  input: {
    backgroundColor: '#12122a', color: '#fff',
    borderRadius: 16, padding: 18, fontSize: 24,
    width: '100%', textAlign: 'center',
    borderWidth: 1, borderColor: '#2a2a4a',
    marginBottom: 8,
  },
  inputHint: { color: '#444', fontSize: 13, marginBottom: 16 },
  todayBtn: {
    backgroundColor: '#1a1a2e', borderRadius: 12,
    paddingVertical: 10, paddingHorizontal: 20,
    borderWidth: 1, borderColor: '#2a2a4a',
  },
  todayBtnText: { color: '#a78bfa', fontSize: 15 },
  amountRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#12122a', borderRadius: 16,
    paddingHorizontal: 20, width: '100%',
    borderWidth: 1, borderColor: '#2a2a4a', marginBottom: 8,
  },
  currency: { color: '#a78bfa', fontSize: 28, marginRight: 8 },
  amountInput: {
    color: '#fff', fontSize: 36, fontWeight: 'bold',
    flex: 1, padding: 16,
  },
  presets: { flexDirection: 'row', gap: 10, marginTop: 8 },
  preset: {
    backgroundColor: '#1a1a2e', borderRadius: 10,
    paddingVertical: 8, paddingHorizontal: 16,
    borderWidth: 1, borderColor: '#2a2a4a',
  },
  presetActive: { backgroundColor: '#2d1a50', borderColor: '#7c3aed' },
  presetText: { color: '#666', fontSize: 14 },
  presetTextActive: { color: '#fff' },
  nextBtn: {
    backgroundColor: '#7c3aed', borderRadius: 20,
    padding: 20, alignItems: 'center',
  },
  nextBtnDisabled: { backgroundColor: '#2a2a4a' },
  nextBtnText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
})