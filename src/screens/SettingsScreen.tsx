import React, { useState } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, ScrollView
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAppStore, CURRENCIES } from '../store/useAppStore'
import { scheduleDangerHours, cancelAllNotifications, setupAllNotifications } from '../utils/notifications'
import i18n, { LANGUAGES } from '../utils/i18n'

export default function SettingsScreen({ onClose }: { onClose: () => void }) {
  const {
    startDate, dailyAmount, dangerHourStart, dangerHourEnd, currency, language,
    setStartDate, setDailyAmount, resetCounter, setDangerHours, setCurrency, setLanguage
  } = useAppStore()

  const [dateInput, setDateInput] = useState(
    startDate ? new Date(startDate).toLocaleDateString('ru-RU') : ''
  )
  const [amountInput, setAmountInput] = useState(String(dailyAmount))
  const [dangerStart, setDangerStart] = useState(String(dangerHourStart))
  const [dangerEnd, setDangerEnd] = useState(String(dangerHourEnd))
  const [selectedCurrency, setSelectedCurrency] = useState(currency)
  const [selectedLanguage, setSelectedLanguage] = useState(language)

  i18n.locale = language || 'ru'
  const t = (key: string) => i18n.t(key)

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

  const handleSave = async () => {
    const parts = dateInput.split('.')
    if (parts.length === 3) {
      const date = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`)
      if (!isNaN(date.getTime())) setStartDate(date.toISOString())
    }
    const amount = Number(amountInput)
    if (!isNaN(amount) && amount > 0) setDailyAmount(amount)

    const start = Number(dangerStart)
    const end = Number(dangerEnd)
    if (!isNaN(start) && !isNaN(end) && start >= 0 && end <= 23) {
      await setDangerHours(start, end)
      await cancelAllNotifications()
      await setupAllNotifications()
      await scheduleDangerHours(start, end)
    }
    await setCurrency(selectedCurrency)
    await setLanguage(selectedLanguage)
    onClose()
  }

  const handleReset = () => {
    const now = new Date().toISOString()
    resetCounter(now)
    setDateInput(new Date().toLocaleDateString('ru-RU'))
    onClose()
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Шапка с кнопкой назад */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onClose}>
          <Text style={styles.backBtnText}>← {t('back')}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{t('settings')}</Text>
        <View style={{ width: 80 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        <Text style={styles.label}>{t('startDate')}</Text>
        <Text style={styles.hint}>{t('dateFormat')}</Text>
        <TextInput
          style={styles.input}
          value={dateInput}
          onChangeText={handleDateChange}
          placeholder="01.03.2025"
          placeholderTextColor="#555"
          keyboardType="numeric"
          maxLength={10}
        />

        <Text style={styles.label}>{t('dailyAmount')}</Text>
        <TextInput
          style={styles.input}
          value={amountInput}
          onChangeText={setAmountInput}
          placeholder="500"
          placeholderTextColor="#555"
          keyboardType="numeric"
        />

        <Text style={styles.label}>{t('language')}</Text>
        <View style={styles.langGrid}>
          {LANGUAGES.map(l => (
            <TouchableOpacity
              key={l.code}
              style={[styles.langBtn, selectedLanguage === l.code && styles.langBtnActive]}
              onPress={() => setSelectedLanguage(l.code)}
            >
              <Text style={styles.langFlag}>{l.flag}</Text>
              <Text style={[styles.langName, selectedLanguage === l.code && styles.langNameActive]}>
                {l.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>{t('currency')}</Text>
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

        <Text style={styles.label}>{t('dangerHours')}</Text>
        <Text style={styles.hint}>{t('dangerHoursSub')}</Text>
        <View style={styles.hoursRow}>
          <View style={styles.hourBox}>
            <Text style={styles.hourLabel}>С</Text>
            <TextInput
              style={styles.hourInput}
              value={dangerStart}
              onChangeText={setDangerStart}
              keyboardType="numeric"
              maxLength={2}
              placeholder="20"
              placeholderTextColor="#555"
            />
            <Text style={styles.hourSuffix}>:00</Text>
          </View>
          <Text style={styles.hourDash}>—</Text>
          <View style={styles.hourBox}>
            <Text style={styles.hourLabel}>До</Text>
            <TextInput
              style={styles.hourInput}
              value={dangerEnd}
              onChangeText={setDangerEnd}
              keyboardType="numeric"
              maxLength={2}
              placeholder="23"
              placeholderTextColor="#555"
            />
            <Text style={styles.hourSuffix}>:00</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>{t('save')}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
          <Text style={styles.resetButtonText}>{t('resetCounter')}</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#07071a' },
  header: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 16,
    borderBottomWidth: 1, borderBottomColor: '#1a1a38',
  },
  backBtn: {
    backgroundColor: '#1e1040', borderRadius: 12,
    paddingVertical: 8, paddingHorizontal: 16,
    borderWidth: 1, borderColor: '#4c1d95',
  },
  backBtnText: { color: '#a78bfa', fontSize: 15, fontWeight: '600' },
  title: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  scroll: { padding: 20, paddingBottom: 40 },
  label: { color: '#a78bfa', fontSize: 16, fontWeight: '600', marginBottom: 6, marginTop: 20 },
  hint: { color: '#666', fontSize: 13, marginBottom: 8 },
  input: {
    backgroundColor: '#12122a', color: '#fff',
    borderRadius: 12, padding: 16, fontSize: 18,
    borderWidth: 1, borderColor: '#2a2a4a',
  },
  langGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 4 },
  langBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#12122a', borderRadius: 12,
    paddingVertical: 12, paddingHorizontal: 16,
    borderWidth: 1, borderColor: '#2a2a4a',
  },
  langBtnActive: { backgroundColor: '#2d1a50', borderColor: '#7c3aed' },
  langFlag: { fontSize: 20 },
  langName: { color: '#888', fontSize: 14 },
  langNameActive: { color: '#fff', fontWeight: '600' },
  currencyGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  currencyBtn: {
    backgroundColor: '#12122a', borderRadius: 12,
    paddingVertical: 10, paddingHorizontal: 14,
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderWidth: 1, borderColor: '#2a2a4a',
  },
  currencyBtnActive: { backgroundColor: '#2d1a50', borderColor: '#7c3aed' },
  currencySymbol: { color: '#a78bfa', fontSize: 18, fontWeight: 'bold' },
  currencyName: { color: '#666', fontSize: 13 },
  currencyNameActive: { color: '#fff' },
  hoursRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 4 },
  hourBox: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#12122a', borderRadius: 12,
    padding: 12, borderWidth: 1, borderColor: '#2a2a4a', gap: 8,
  },
  hourLabel: { color: '#888', fontSize: 14 },
  hourInput: { color: '#fff', fontSize: 22, fontWeight: 'bold', width: 40, textAlign: 'center' },
  hourSuffix: { color: '#666', fontSize: 16 },
  hourDash: { color: '#666', fontSize: 20 },
  saveButton: {
    backgroundColor: '#7c3aed', borderRadius: 16,
    padding: 18, alignItems: 'center', marginTop: 32,
  },
  saveButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  resetButton: {
    backgroundColor: '#12122a', borderRadius: 16,
    padding: 18, alignItems: 'center', marginTop: 12,
    borderWidth: 1, borderColor: '#7c3aed',
  },
  resetButtonText: { color: '#a78bfa', fontSize: 16 },
})