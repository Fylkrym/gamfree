import React from 'react'
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native'
import { useAppStore } from '../store/useAppStore'
import { getElapsed } from '../utils/timeUtils'

const DAY_BADGES = [
  { days: 1, emoji: '🌱', title: '1 день', desc: 'Первый шаг' },
  { days: 7, emoji: '⚔️', title: '7 дней', desc: 'Неделя силы' },
  { days: 30, emoji: '💪', title: '30 дней', desc: 'Месяц свободы' },
  { days: 60, emoji: '🔥', title: '60 дней', desc: 'Два месяца' },
  { days: 100, emoji: '🏆', title: '100 дней', desc: 'Сотня' },
  { days: 180, emoji: '💎', title: '180 дней', desc: 'Полгода' },
  { days: 365, emoji: '👑', title: '365 дней', desc: 'Целый год' },
]

const URGE_BADGES = [
  { count: 1, emoji: '🛡️', title: 'Первая победа', desc: 'Первый соблазн' },
  { count: 5, emoji: '⚡', title: '5 побед', desc: 'Пять соблазнов' },
  { count: 10, emoji: '🎯', title: '10 побед', desc: 'Десять соблазнов' },
  { count: 25, emoji: '🦁', title: '25 побед', desc: '25 соблазнов' },
  { count: 50, emoji: '🌟', title: '50 побед', desc: 'Полсотни' },
]

export default function AchievementsScreen({ onClose }: { onClose: () => void }) {
  const { startDate, urgeCount } = useAppStore()
  const { days } = startDate ? getElapsed(startDate) : { days: 0 }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🏅 Достижения</Text>
        <TouchableOpacity onPress={onClose}>
          <Text style={styles.closeBtn}>✕</Text>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.scroll}>

        <Text style={styles.sectionTitle}>По дням</Text>
        <View style={styles.grid}>
          {DAY_BADGES.map((b, i) => {
            const unlocked = days >= b.days
            return (
              <View key={i} style={[styles.badge, !unlocked && styles.badgeLocked]}>
                <Text style={[styles.badgeEmoji, !unlocked && styles.locked]}>{b.emoji}</Text>
                <Text style={[styles.badgeTitle, !unlocked && styles.lockedText]}>{b.title}</Text>
                <Text style={styles.badgeDesc}>{b.desc}</Text>
                {unlocked && <Text style={styles.check}>✓</Text>}
              </View>
            )
          })}
        </View>

        <Text style={styles.sectionTitle}>За соблазны</Text>
        <View style={styles.grid}>
          {URGE_BADGES.map((b, i) => {
            const unlocked = urgeCount >= b.count
            return (
              <View key={i} style={[styles.badge, !unlocked && styles.badgeLocked]}>
                <Text style={[styles.badgeEmoji, !unlocked && styles.locked]}>{b.emoji}</Text>
                <Text style={[styles.badgeTitle, !unlocked && styles.lockedText]}>{b.title}</Text>
                <Text style={styles.badgeDesc}>{b.desc}</Text>
                {unlocked && <Text style={styles.check}>✓</Text>}
              </View>
            )
          })}
        </View>

      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a14' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', padding: 24, paddingBottom: 16,
  },
  title: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  closeBtn: { color: '#666', fontSize: 20, padding: 4 },
  scroll: { padding: 16, paddingTop: 0 },
  sectionTitle: {
    color: '#a78bfa', fontSize: 16, fontWeight: '700',
    letterSpacing: 1, marginBottom: 12, marginTop: 8,
  },
  grid: {
    flexDirection: 'row', flexWrap: 'wrap',
    gap: 10, marginBottom: 24,
  },
  badge: {
    backgroundColor: '#12122a', borderRadius: 16,
    padding: 16, alignItems: 'center', width: '30%',
    borderWidth: 1, borderColor: '#7c3aed',
  },
  badgeLocked: { borderColor: '#1e1e40', opacity: 0.5 },
  badgeEmoji: { fontSize: 32, marginBottom: 6 },
  locked: { filter: 'grayscale(1)' } as any,
  badgeTitle: { color: '#fff', fontSize: 12, fontWeight: 'bold', textAlign: 'center' },
  lockedText: { color: '#555' },
  badgeDesc: { color: '#555', fontSize: 10, textAlign: 'center', marginTop: 2 },
  check: { color: '#4ade80', fontSize: 16, marginTop: 4 },
})