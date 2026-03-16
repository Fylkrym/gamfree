import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native'
import { useAppStore } from '../store/useAppStore'
import { getElapsed } from '../utils/timeUtils'

export default function RelapseScreen({ onClose, onRestart }: {
  onClose: () => void
  onRestart: () => void
}) {
  const { startDate } = useAppStore()
  const { days } = startDate ? getElapsed(startDate) : { days: 0 }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.emoji}>💙</Text>
        <Text style={styles.title}>Это не конец.</Text>
        <Text style={styles.subtitle}>Это часть пути.</Text>
        <View style={styles.card}>
          <Text style={styles.cardText}>Ты продержался</Text>
          <Text style={styles.daysText}>{days} дней</Text>
          <Text style={styles.cardSub}>Это ценно. Правда.</Text>
        </View>
        <Text style={styles.message}>
          Срыв — это не провал. Каждый день без ставок имел значение. Начни снова — прямо сейчас.
        </Text>
        <TouchableOpacity style={styles.restartButton} onPress={onRestart}>
          <Text style={styles.restartButtonText}>🔄 Начать заново</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>← Назад</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a14' },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emoji: { fontSize: 72, marginBottom: 16 },
  title: { color: '#fff', fontSize: 36, fontWeight: 'bold' },
  subtitle: { color: '#666', fontSize: 20, marginBottom: 32 },
  card: {
    backgroundColor: '#12122a', borderRadius: 24, padding: 32,
    alignItems: 'center', width: '100%', marginBottom: 24,
    borderWidth: 1, borderColor: '#1e1e40',
  },
  cardText: { color: '#888', fontSize: 16 },
  daysText: { color: '#a78bfa', fontSize: 56, fontWeight: 'bold' },
  cardSub: { color: '#666', fontSize: 16 },
  message: {
    color: '#888', fontSize: 15, textAlign: 'center',
    lineHeight: 24, marginBottom: 32,
  },
  restartButton: {
    backgroundColor: '#7c3aed', borderRadius: 18,
    padding: 18, alignItems: 'center', width: '100%', marginBottom: 12,
  },
  restartButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  closeButton: { padding: 16 },
  closeButtonText: { color: '#555', fontSize: 15 },
})