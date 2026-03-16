import React, { useState } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, SafeAreaView, ScrollView
} from 'react-native'
import { useAppStore, CURRENCIES } from '../store/useAppStore'
import { scheduleDangerHours, cancelAllNotifications, setupAllNotifications } from '../utils/notifications'

export default function SettingsScreen({ onClose }: { onClose: () => void }) {
  const {
    startDate, dailyAmount, dangerHourStart, dangerHourEnd, currency,
    setStartDate, setDailyAmount, resetCounter, setDangerHours, setCurrency
  } = useAppStore()

  const [dateInput, setDateInput] = useState(
    startDate ? new Date(startDate).toLocaleDateString('ru-RU') : ''
  )
  const [amountInput, setAmountInput] = useState(String(dailyAmount))
  const [dangerStart, setDangerStart] = useState(String(dangerHourStart))
  const [dangerEnd, setDangerEnd] = useState(String(dangerHourEnd))
  const [selectedCurrency, setSelectedCurrency] = useState(currency)

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
    onClose()
  }

  const handleReset = () => {
    const now = new Date().toISOString()
    resetCounter(now)
    setDateInput(new Date().toLocaleDateString('ru-RU'))
    onClose()
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>⚙️ Настройки</Text>

        <Text style={styles.label}>Дата начала воздержания</Text>
        <Text style={styles.hint}>Формат: ДД.ММ.ГГГГ</Text>
        <TextInput
          style={styles.input}
          value={dateInput}
          onChangeText={setDateInput}
          placeholder="01.03.2025"
          placeholderTextColor="#555"
          keyboardType="numeric"
        />

        <Text style={styles.label}>Средняя сумма ставок в день</Text>
        <TextInput
          style={styles.input}
          value={amountInput}
          onChangeText={setAmountInput}
          placeholder="500"
          placeholderTextColor="#555"
          keyboardType="numeric"
        />

        <Text style={styles.label}>💱 Валюта</Text>
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

        <Text style={styles.label}>⚠️ Опасные часы</Text>
        <Text style={styles.hint}>В это время придёт поддерживающее уведомление</Text>
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
          <Text style={styles.saveButtonText}>💾 Сохранить</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
          <Text style={styles.resetButtonText}>🔄 Сбросить счётчик</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>← Назад</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a14' },
  scroll: { padding: 24 },
  title: { color: '#fff', fontSize: 28, fontWeight: 'bold', marginBottom: 32, marginTop: 16 },
  label: { color: '#a78bfa', fontSize: 16, fontWeight: '600', marginBottom: 6, marginTop: 20 },
  hint: { color: '#555', fontSize: 13, marginBottom: 8 },
  input: {
    backgroundColor: '#1a1a2e', color: '#fff',
    borderRadius: 12, padding: 16, fontSize: 18,
    borderWidth: 1, borderColor: '#2a2a4a',
  },
  currencyGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4,
  },
  currencyBtn: {
    backgroundColor: '#1a1a2e', borderRadius: 12,
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
    backgroundColor: '#1a1a2e', borderRadius: 12,
    padding: 12, borderWidth: 1, borderColor: '#2a2a4a', gap: 8,
  },
  hourLabel: { color: '#666', fontSize: 14 },
  hourInput: { color: '#fff', fontSize: 22, fontWeight: 'bold', width: 40, textAlign: 'center' },
  hourSuffix: { color: '#555', fontSize: 16 },
  hourDash: { color: '#555', fontSize: 20 },
  saveButton: {
    backgroundColor: '#7c3aed', borderRadius: 16,
    padding: 18, alignItems: 'center', marginTop: 32,
  },
  saveButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  resetButton: {
    backgroundColor: '#1a1a2e', borderRadius: 16,
    padding: 18, alignItems: 'center', marginTop: 12,
    borderWidth: 1, borderColor: '#7c3aed',
  },
  resetButtonText: { color: '#a78bfa', fontSize: 16 },
  closeButton: { padding: 18, alignItems: 'center', marginTop: 8 },
  closeButtonText: { color: '#555', fontSize: 16 },
})