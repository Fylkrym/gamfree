import React, { useState } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useAppStore } from '../store/useAppStore'
import i18n from '../utils/i18n'

interface MoodEntry {
  date: string
  mood: number
  emoji: string
  label: string
  hadUrge: boolean
}

export default function MoodScreen({ onClose }: { onClose: () => void }) {
  const { language } = useAppStore()
  i18n.locale = language || 'ru'
  const t = (key: string) => i18n.t(key)

  const MOODS = [
    { emoji: '😊', label: t('moodExcellent'), value: 5, color: '#22c55e' },
    { emoji: '🙂', label: t('moodGood'), value: 4, color: '#84cc16' },
    { emoji: '😐', label: t('moodOk'), value: 3, color: '#eab308' },
    { emoji: '😔', label: t('moodBad'), value: 2, color: '#f97316' },
    { emoji: '😰', label: t('moodTerrible'), value: 1, color: '#ef4444' },
  ]

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
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.savedBox}>
          <Text style={styles.savedEmoji}>✅</Text>
          <Text style={styles.savedTitle}>{t('moodSaved')}</Text>
          <Text style={styles.savedSub}>{t('moodSavedSub')}</Text>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeBtnText}>{t('moodBack')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onClose}>
          <Text style={styles.backBtnText}>{t('back')}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{t('moodTitle')}</Text>
        <View style={{ width: 80 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.subtitle}>{t('moodSubtitle')}</Text>

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

        <Text style={styles.question}>{t('moodQuestion')}</Text>
        <View style={styles.urgeRow}>
          <TouchableOpacity
            style={[styles.urgeBtn, hadUrge === true && styles.urgeBtnActive]}
            onPress={() => setHadUrge(true)}
          >
            <Text style={styles.urgeBtnText}>{t('moodYes')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.urgeBtn, hadUrge === false && styles.urgeBtnGood]}
            onPress={() => setHadUrge(false)}
          >
            <Text style={styles.urgeBtnText}>{t('moodNo')}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.saveBtn, (selectedMood === null || hadUrge === null) && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={selectedMood === null || hadUrge === null}
        >
          <Text style={styles.saveBtnText}>{t('moodSave')}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.historyBtn} onPress={loadHistory}>
          <Text style={styles.historyBtnText}>{t('moodHistory')}</Text>
        </TouchableOpacity>

        {showHistory && history.length > 0 && (
          <View style={styles.historyBox}>
            {history.map((h, i) => (
              <View key={i} style={styles.historyItem}>
                <Text style={styles.historyEmoji}>{h.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.historyLabel}>{h.label} — {h.date}</Text>
                  <Text style={styles.historySub}>{h.hadUrge ? '⚠️ ' + t('moodYes') : '✅ ' + t('moodNo')}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {showHistory && history.length === 0 && (
          <Text style={styles.emptyHistory}>{t('moodEmpty')}</Text>
        )}
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
  backBtnText: { color: '#a78bfa', fontSize: 15, fontWeight: '600' },
  title: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  scroll: { padding: 20, paddingBottom: 40 },
  subtitle: { color: '#888', fontSize: 16, marginBottom: 24 },
  moodRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 32 },
  moodBtn: {
    alignItems: 'center', padding: 10,
    borderRadius: 16, borderWidth: 2,
    borderColor: '#1a1a38', flex: 1, marginHorizontal: 3,
  },
  moodEmoji: { fontSize: 30, marginBottom: 6 },
  moodLabel: { color: '#666', fontSize: 10, textAlign: 'center' },
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
  closeBtn: {
    backgroundColor: '#7c3aed', borderRadius: 16,
    paddingVertical: 16, paddingHorizontal: 40,
  },
  closeBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
})