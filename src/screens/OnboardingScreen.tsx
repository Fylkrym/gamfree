import React, { useState } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity,
  SafeAreaView, TextInput, ScrollView
} from 'react-native'
import { useAppStore, CURRENCIES } from '../store/useAppStore'
import { setupAllNotifications } from '../utils/notifications'

const STEPS = [
  {
    emoji: '🎯',
    title: 'Свободен от ставок',
    subtitle: 'Приложение поможет отслеживать прогресс, бороться с соблазнами и видеть результат каждый день.',
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
    title: 'Сколько тратил на ставки?',
    subtitle: 'Мы покажем сколько ты уже сэкономил',
    type: 'amount',
  },
]

export default function OnboardingScreen({ onDone }: { onDone: () => void }) {
  const { setStartDate, setDailyAmount, setCurrency } = useAppStore()
  const [step, setStep] = useState(0)
  const [dateInput, setDateInput] = useState('')
  const [amountInput, setAmountInput] = useState('500')
  const [period, setPeriod] = useState<'day' | 'month'>('day')
  const [selectedCurrency, setSelectedCurrency] = useState('RUB')

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
      const dailyAmount = period === 'month'
        ? Math.round((isNaN(amount) || amount <= 0 ? 15000 : amount) / 30)
        : (isNaN(amount) || amount <= 0 ? 500 : amount)
      await setDailyAmount(dailyAmount)
      await setCurrency(selectedCurrency)
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

  const currencySymbol = CURRENCIES.find(c => c.code === selectedCurrency)?.symbol ?? '₽'

  return (
    <SafeAreaView style={styles.container}>
      {/* Прогресс */}
      <View style={styles.dots}>
        {STEPS.map((_, i) => (
          <View key={i} style={[styles.dot, i === step && styles.dotActive]} />
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.emoji}>{STEPS[step].emoji}</Text>
          <Text style={styles.title}>{STEPS[step].title}</Text>
          <Text style={styles.subtitle}>{STEPS[step].subtitle}</Text>

          {/* Дата */}
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

          {/* Сумма */}
          {STEPS[step].type === 'amount' && (
            <View style={styles.inputBox}>

              {/* Переключатель день/месяц */}
              <View style={styles.periodSwitch}>
                <TouchableOpacity
                  style={[styles.periodBtn, period === 'day' && styles.periodBtnActive]}
                  onPress={() => setPeriod('day')}
                >
                  <Text style={[styles.periodText, period === 'day' && styles.periodTextActive]}>
                    В день
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.periodBtn, period === 'month' && styles.periodBtnActive]}
                  onPress={() => setPeriod('month')}
                >
                  <Text style={[styles.periodText, period === 'month' && styles.periodTextActive]}>
                    В месяц
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Поле суммы */}
              <View style={styles.amountRow}>
                <TouchableOpacity
                  style={styles.currencyToggle}
                  onPress={() => {
                    const idx = CURRENCIES.findIndex(c => c.code === selectedCurrency)
                    const next = CURRENCIES[(idx + 1) % CURRENCIES.length]
                    setSelectedCurrency(next.code)
                  }}
                >
                  <Text style={styles.currencyToggleText}>{currencySymbol}</Text>
                </TouchableOpacity>
                <TextInput
                  style={styles.amountInput}
                  value={amountInput}
                  onChangeText={setAmountInput}
                  keyboardType="numeric"
                  autoFocus
                />
              </View>
              <Text style={styles.inputHint}>
                {period === 'day' ? 'Средняя сумма ставок в день' : 'Средняя сумма ставок в месяц'}
              </Text>

              {/* Пресеты */}
              <View style={styles.presets}>
                {(period === 'day'
                  ? ['100', '500', '1000', '3000']
                  : ['3000', '10000', '30000', '100000']
                ).map(p => (
                  <TouchableOpacity
                    key={p}
                    style={[styles.preset, amountInput === p && styles.presetActive]}
                    onPress={() => setAmountInput(p)}
                  >
                    <Text style={[styles.presetText, amountInput === p && styles.presetTextActive]}>
                      {currencySymbol}{Number(p).toLocaleString('ru')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Выбор валюты */}
              <Text style={styles.currencyLabel}>Валюта</Text>
              <View style={styles.currencyGrid}>
                {CURRENCIES.map(c => (
                  <TouchableOpacity
                    key={c.code}
                    style={[styles.currencyBtn, selectedCurrency === c.code && styles.currencyBtnActive]}
                    onPress={() => setSelectedCurrency(c.code)}
                  >
                    <Text style={styles.currencySymbol}>{c.symbol}</Text>
                    <Text style={[styles.currencyName, selectedCurrency === c.code && styles.currencyNameActive]}>
                      {c.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.nextBtn, !canNext() && styles.nextBtnDisabled]}
          onPress={handleNext}
          disabled={!canNext()}
        >
          <Text style={styles.nextBtnText}>
            {step === STEPS.length - 1 ? 'Начать! 🚀' : 'Дальше →'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: '#07071a',
  },
  dots: {
    flexDirection: 'row', justifyContent: 'center',
    gap: 8, marginTop: 16, paddingHorizontal: 24,
  },
  dot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: '#1e1e40',
  },
  dotActive: { backgroundColor: '#7c3aed', width: 24 },
  scroll: { flexGrow: 1, padding: 24 },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 20 },
  emoji: { fontSize: 80, marginBottom: 24 },
  title: {
    color: '#fff', fontSize: 28, fontWeight: 'bold',
    textAlign: 'center', marginBottom: 12,
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

  periodSwitch: {
    flexDirection: 'row', backgroundColor: '#12122a',
    borderRadius: 14, padding: 4,
    marginBottom: 16, borderWidth: 1, borderColor: '#2a2a4a',
  },
  periodBtn: {
    flex: 1, paddingVertical: 10, paddingHorizontal: 20,
    borderRadius: 10, alignItems: 'center',
  },
  periodBtnActive: { backgroundColor: '#7c3aed' },
  periodText: { color: '#666', fontSize: 15, fontWeight: '600' },
  periodTextActive: { color: '#fff' },

  amountRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#12122a', borderRadius: 16,
    width: '100%', borderWidth: 1, borderColor: '#2a2a4a',
    marginBottom: 8, overflow: 'hidden',
  },
  currencyToggle: {
    backgroundColor: '#1e1040', paddingHorizontal: 18,
    paddingVertical: 16, borderRightWidth: 1, borderRightColor: '#2a2a4a',
    alignItems: 'center', justifyContent: 'center',
  },
  currencyToggleText: { color: '#a78bfa', fontSize: 24, fontWeight: 'bold' },
  amountInput: {
    color: '#fff', fontSize: 32, fontWeight: 'bold',
    flex: 1, padding: 16,
  },

  presets: {
    flexDirection: 'row', flexWrap: 'wrap',
    gap: 8, marginBottom: 24, justifyContent: 'center',
  },
  preset: {
    backgroundColor: '#1a1a2e', borderRadius: 10,
    paddingVertical: 8, paddingHorizontal: 14,
    borderWidth: 1, borderColor: '#2a2a4a',
  },
  presetActive: { backgroundColor: '#2d1a50', borderColor: '#7c3aed' },
  presetText: { color: '#666', fontSize: 14 },
  presetTextActive: { color: '#fff' },

  currencyLabel: {
    color: '#a78bfa', fontSize: 14, fontWeight: '700',
    alignSelf: 'flex-start', marginBottom: 10, letterSpacing: 1,
  },
  currencyGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    gap: 8, width: '100%',
  },
  currencyBtn: {
    backgroundColor: '#1a1a2e', borderRadius: 10,
    paddingVertical: 8, paddingHorizontal: 12,
    flexDirection: 'row', alignItems: 'center',
    gap: 6, borderWidth: 1, borderColor: '#2a2a4a',
  },
  currencyBtnActive: { backgroundColor: '#2d1a50', borderColor: '#7c3aed' },
  currencySymbol: { color: '#a78bfa', fontSize: 16, fontWeight: 'bold' },
  currencyName: { color: '#666', fontSize: 12 },
  currencyNameActive: { color: '#fff' },

  footer: { padding: 20, paddingBottom: 32 },
  nextBtn: {
    backgroundColor: '#7c3aed', borderRadius: 20,
    padding: 20, alignItems: 'center',
  },
  nextBtnDisabled: { backgroundColor: '#2a2a4a' },
  nextBtnText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
})