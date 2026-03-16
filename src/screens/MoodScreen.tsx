import React, { useState } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity,
  SafeAreaView, ScrollView
} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'

const MOODS = [
  { emoji: '😊', label: 'Отлично', value: 5, color: '#22c55e' },
  { emoji: '🙂', label: 'Хорошо', value: 4, color: '#84cc16' },
  { emoji: '😐', label: 'Нормально', value: 3, color: '#eab308' },
  { emoji: '😔', label: 'Плохо', value: 2, color: '#f97316' },
  { emoji: '😰', label: 'Очень плохо', value: 1, color: '#ef4444' },
]

interface MoodEntry {
  date: string
  mood: number
  emoji: string
  label: string
  hadUrge: boolean
}

export default function MoodScreen({ onClose }: { onClose: () => void }) {
  const [selectedMood, setSelectedMood] = useState<number | null>(null)
  const [hadUrge, setHadUrge] = useState<boolean | null>(null)
  const [saved, setSaved] = useState(false)
  const [history, setHistory] = useState<MoodEntry[]>([])
  const [showHistory, setShowHistory] = useState(false)

  const loadHistory = async () => {
    const data = await AsyncStorage.getItem('moodHistory')
    if (data) setHistory(JSON.parse(data))
    setShowHistory(true)
  }

  const handleSave = async () => {
    if (selectedMood === null || hadUrge === null) return
    const mood = MOODS.find(m => m.value === selectedMood)!
    const entry: MoodEntry = {
      date: new Date().toLocaleDateString('ru-RU'),
      mood: selectedMood,
      emoji: mood.emoji,
      label: mood.label,
      hadUrge,
    }
    const data = await AsyncStorage.getItem('moodHistory')
    const history: MoodEntry[] = data ? JSON.parse(data) : []
    history.unshift(entry)
    await AsyncStorage.setItem('moodHistory', JSON.stringify(history.slice(0, 30)))
    setSaved(true)
  }

  if (saved) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.savedBox}>
          <Text style={styles.savedEmoji}>✅</Text>
          <Text style={styles.savedTitle}>Записано!</Text>
          <Text style={styles.savedSub}>Продолжай отслеживать своё состояние каждый день.</Text>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeBtnText}>← На главную</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.title}>😌 Как ты сейчас?</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.closeX}>✕</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.subtitle}>Отметь своё состояние сегодня</Text>

        {/* Выбор настроения */}
        <View style={styles.moodRow}>
          {MOODS.map(m => (
            <TouchableOpacity
              key={m.value}
              style={[styles.moodBtn, selectedMood === m.value && { borderColor: m.color, backgroundColor: m.color + '22' }]}
              onPress={() => setSelectedMood(m.value)}
            >
              <Text style={styles.moodEmoji}>{m.emoji}</Text>
              <Text style={[styles.moodLabel, selectedMood === m.value && { color: m.color }]}>{m.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Был ли соблазн */}
        <Text style={styles.question}>Был ли сегодня соблазн сделать ставку?</Text>
        <View style={styles.urgeRow}>
          <TouchableOpacity
            style={[styles.urgeBtn, hadUrge === true && styles.urgeBtnActive]}
            onPress={() => setHadUrge(true)}
          >
            <Text style={styles.urgeBtnText}>😤 Да, был</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.urgeBtn, hadUrge === false && styles.urgeBtnGood]}
            onPress={() => setHadUrge(false)}
          >
            <Text style={styles.urgeBtnText}>😌 Нет, всё ок</Text>
          </TouchableOpacity>
        </View>

        {/* Кнопка сохранить */}
        <TouchableOpacity
          style={[styles.saveBtn, (selectedMood === null || hadUrge === null) && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={selectedMood === null || hadUrge === null}
        >
          <Text style={styles.saveBtnText}>💾 Сохранить</Text>
        </TouchableOpacity>

        {/* История */}
        <TouchableOpacity style={styles.historyBtn} onPress={loadHistory}>
          <Text style={styles.historyBtnText}>📊 История настроения</Text>
        </TouchableOpacity>

        {showHistory && history.length > 0 && (
          <View style={styles.historyBox}>
            {history.map((h, i) => (
              <View key={i} style={styles.historyItem}>
                <Text style={styles.historyEmoji}>{h.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.historyLabel}>{h.label} — {h.date}</Text>
                  <Text style={styles.historySub}>{h.hadUrge ? '⚠️ Был соблазн' : '✅ Соблазна не было'}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {showHistory && history.length === 0 && (
          <Text style={styles.emptyHistory}>Пока нет записей</Text>
        )}

      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#07071a' },
  scroll: { padding: 24 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  title: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  closeX: { color: '#666', fontSize: 22, padding: 4 },
  subtitle: { color: '#888', fontSize: 16, marginBottom: 24 },
  moodRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 32 },
  moodBtn: {
    alignItems: 'center', padding: 12,
    borderRadius: 16, borderWidth: 2,
    borderColor: '#1a1a38', flex: 1, marginHorizontal: 3,
  },
  moodEmoji: { fontSize: 32, marginBottom: 6 },
  moodLabel: { color: '#666', fontSize: 11, textAlign: 'center' },
  question: { color: '#fff', fontSize: 17, fontWeight: '600', marginBottom: 16 },
  urgeRow: { flexDirection: 'row', gap: 12, marginBottom: 32 },
  urgeBtn: {
    flex: 1, padding: 16, borderRadius: 16,
    backgroundColor: '#0e0e28', borderWidth: 1,
    borderColor: '#1a1a38', alignItems: 'center',
  },
  urgeBtnActive: { borderColor: '#ef4444', backgroundColor: '#ef444422' },
  urgeBtnGood: { borderColor: '#22c55e', backgroundColor: '#22c55e22' },
  urgeBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  saveBtn: {
    backgroundColor: '#7c3aed', borderRadius: 16,
    padding: 18, alignItems: 'center', marginBottom: 16,
  },
  saveBtnDisabled: { backgroundColor: '#2a2a4a' },
  saveBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  historyBtn: { padding: 16, alignItems: 'center' },
  historyBtnText: { color: '#a78bfa', fontSize: 16 },
  historyBox: { marginTop: 16, gap: 10 },
  historyItem: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#0e0e28', borderRadius: 14,
    padding: 14, gap: 12, borderWidth: 1, borderColor: '#1a1a38',
  },
  historyEmoji: { fontSize: 28 },
  historyLabel: { color: '#fff', fontSize: 15, fontWeight: '600' },
  historySub: { color: '#888', fontSize: 13, marginTop: 2 },
  emptyHistory: { color: '#555', textAlign: 'center', marginTop: 16, fontSize: 15 },
  savedBox: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  savedEmoji: { fontSize: 64, marginBottom: 16 },
  savedTitle: { color: '#fff', fontSize: 28, fontWeight: 'bold', marginBottom: 12 },
  savedSub: { color: '#888', fontSize: 16, textAlign: 'center', lineHeight: 24, marginBottom: 32 },
  closeBtn: { padding: 16 },
  closeBtnText: { color: '#a78bfa', fontSize: 16 },
})