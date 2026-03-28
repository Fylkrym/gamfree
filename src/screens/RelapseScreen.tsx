import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAppStore } from '../store/useAppStore'
import { getElapsed } from '../utils/timeUtils'
import i18n from '../utils/i18n'

export default function RelapseScreen({ onClose, onRestart }: {
  onClose: () => void
  onRestart: () => void
}) {
  const { startDate, language } = useAppStore()
  i18n.locale = language || 'ru'
  const t = (key: string) => i18n.t(key)
  const { days } = startDate ? getElapsed(startDate) : { days: 0 }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.content}>
        <Text style={styles.emoji}>💙</Text>
        <Text style={styles.title}>{t('notTheEnd')}</Text>
        <Text style={styles.subtitle}>{t('partOfJourney')}</Text>

        <View style={styles.card}>
          <Text style={styles.cardText}>{t('youHeld')}</Text>
          <Text style={styles.daysText}>{days}</Text>
          <Text style={styles.daysLabel}>{t('daysText')}</Text>
          <Text style={styles.cardSub}>{t('itsValuable')}</Text>
        </View>

        <Text style={styles.message}>{t('relapseMessage')}</Text>

        <TouchableOpacity style={styles.restartButton} onPress={onRestart}>
          <Text style={styles.restartButtonText}>{t('startOver')}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>{t('back')}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#07071a' },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emoji: { fontSize: 72, marginBottom: 16 },
  title: { color: '#fff', fontSize: 36, fontWeight: 'bold' },
  subtitle: { color: '#666', fontSize: 20, marginBottom: 32 },
  card: {
    backgroundColor: '#0e0e28', borderRadius: 24, padding: 32,
    alignItems: 'center', width: '100%', marginBottom: 24,
    borderWidth: 1, borderColor: '#1e1e40',
  },
  cardText: { color: '#888', fontSize: 16, marginBottom: 8 },
  daysText: { color: '#a78bfa', fontSize: 56, fontWeight: 'bold' },
  daysLabel: { color: '#666', fontSize: 18, marginBottom: 8 },
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