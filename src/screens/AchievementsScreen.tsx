import React from 'react'
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native'
import { useAppStore } from '../store/useAppStore'
import { getElapsed } from '../utils/timeUtils'
import i18n from '../utils/i18n'

const DAY_BADGES = [
  { days: 1, emoji: '🌱', title: '1 день', desc: 'Первый шаг' },
  { days: 3, emoji: '⚡', title: '3 дня', desc: 'Первые трудности' },
  { days: 7, emoji: '⚔️', title: '7 дней', desc: 'Неделя силы' },
  { days: 14, emoji: '🔥', title: '14 дней', desc: 'Две недели' },
  { days: 21, emoji: '🎯', title: '21 день', desc: 'Привычка' },
  { days: 30, emoji: '💪', title: '30 дней', desc: 'Месяц свободы' },
  { days: 45, emoji: '🌟', title: '45 дней', desc: 'Полтора месяца' },
  { days: 60, emoji: '🔥', title: '60 дней', desc: 'Два месяца' },
  { days: 90, emoji: '🦁', title: '90 дней', desc: 'Три месяца' },
  { days: 100, emoji: '🏆', title: '100 дней', desc: 'Сотня' },
  { days: 180, emoji: '💎', title: '180 дней', desc: 'Полгода' },
  { days: 365, emoji: '👑', title: '365 дней', desc: 'Целый год' },
]

const URGE_BADGES = [
  { count: 1, emoji: '🛡️', title: '1 победа', desc: 'Первый соблазн' },
  { count: 3, emoji: '💪', title: '3 победы', desc: 'Три соблазна' },
  { count: 5, emoji: '⚡', title: '5 побед', desc: 'Пять соблазнов' },
  { count: 10, emoji: '🎯', title: '10 побед', desc: 'Десять соблазнов' },
  { count: 25, emoji: '🦁', title: '25 побед', desc: '25 соблазнов' },
  { count: 50, emoji: '🌟', title: '50 побед', desc: 'Полсотни' },
  { count: 100, emoji: '👑', title: '100 побед', desc: 'Сто соблазнов' },
]

const MONEY_BADGES = [
  { amount: 1000, emoji: '💵', title: '1 000', desc: 'Первая тысяча' },
  { amount: 5000, emoji: '💴', title: '5 000', desc: 'Пять тысяч' },
  { amount: 10000, emoji: '💶', title: '10 000', desc: 'Десять тысяч' },
  { amount: 50000, emoji: '💷', title: '50 000', desc: 'Пятьдесят тысяч' },
  { amount: 100000, emoji: '🏦', title: '100 000', desc: 'Сто тысяч' },
]

export default function AchievementsScreen({ onClose }: { onClose: () => void }) {
  const { startDate, urgeCount, dailyAmount, language } = useAppStore()
  const { days } = startDate ? getElapsed(startDate) : { days: 0 }
  const saved = days * dailyAmount

  i18n.locale = language || 'ru'
  const t = (key: string) => i18n.t(key)

  const unlockedDays = DAY_BADGES.filter(b => days >= b.days).length
  const unlockedUrges = URGE_BADGES.filter(b => urgeCount >= b.count).length
  const unlockedMoney = MONEY_BADGES.filter(b => saved >= b.amount).length
  const total = DAY_BADGES.length + URGE_BADGES.length + MONEY_BADGES.length
  const unlocked = unlockedDays + unlockedUrges + unlockedMoney

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onClose}>
          <Text style={styles.backBtnText}>{t('back')}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{t('achievementsTitle')}</Text>
        <View style={{ width: 80 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>

        {/* Прогресс */}
        <View style={styles.progressCard}>
          <Text style={styles.progressText}>{unlocked} / {total} достижений</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${(unlocked / total) * 100}%` as any }]} />
          </View>
        </View>

        <Text style={styles.sectionTitle}>{t('byDays')}</Text>
        <View style={styles.grid}>
          {DAY_BADGES.map((b, i) => {
            const unlocked = days >= b.days
            return (
              <View key={i} style={[styles.badge, !unlocked && styles.badgeLocked]}>
                <Text style={styles.badgeEmoji}>{unlocked ? b.emoji : '🔒'}</Text>
                <Text style={[styles.badgeTitle, !unlocked && styles.lockedText]}>{b.title}</Text>
                <Text style={styles.badgeDesc}>{b.desc}</Text>
                {unlocked && <Text style={styles.check}>✓</Text>}
              </View>
            )
          })}
        </View>

        <Text style={styles.sectionTitle}>{t('byUrges')}</Text>
        <View style={styles.grid}>
          {URGE_BADGES.map((b, i) => {
            const unlocked = urgeCount >= b.count
            return (
              <View key={i} style={[styles.badge, !unlocked && styles.badgeLocked]}>
                <Text style={styles.badgeEmoji}>{unlocked ? b.emoji : '🔒'}</Text>
                <Text style={[styles.badgeTitle, !unlocked && styles.lockedText]}>{b.title}</Text>
                <Text style={styles.badgeDesc}>{b.desc}</Text>
                {unlocked && <Text style={styles.check}>✓</Text>}
              </View>
            )
          })}
        </View>

        <Text style={styles.sectionTitle}>💰 По деньгам</Text>
        <View style={styles.grid}>
          {MONEY_BADGES.map((b, i) => {
            const unlocked = saved >= b.amount
            return (
              <View key={i} style={[styles.badge, !unlocked && styles.badgeLocked]}>
                <Text style={styles.badgeEmoji}>{unlocked ? b.emoji : '🔒'}</Text>
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
  scroll: { padding: 16, paddingBottom: 40 },
  progressCard: {
    backgroundColor: '#0e0e28', borderRadius: 16,
    padding: 16, marginBottom: 20,
    borderWidth: 1, borderColor: '#1a1a45',
  },
  progressText: { color: '#a78bfa', fontSize: 14, fontWeight: '700', marginBottom: 10, textAlign: 'center' },
  progressBar: { height: 8, backgroundColor: '#1a1a38', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: 8, backgroundColor: '#7c3aed', borderRadius: 4 },
  sectionTitle: {
    color: '#a78bfa', fontSize: 15, fontWeight: '700',
    letterSpacing: 1, marginBottom: 12, marginTop: 8,
  },
  grid: {
    flexDirection: 'row', flexWrap: 'wrap',
    gap: 10, marginBottom: 24,
  },
  badge: {
    backgroundColor: '#0e0e28', borderRadius: 16,
    padding: 14, alignItems: 'center', width: '30%',
    borderWidth: 1, borderColor: '#7c3aed',
  },
  badgeLocked: { borderColor: '#1e1e40', opacity: 0.5 },
  badgeEmoji: { fontSize: 28, marginBottom: 6 },
  badgeTitle: { color: '#fff', fontSize: 12, fontWeight: 'bold', textAlign: 'center' },
  lockedText: { color: '#555' },
  badgeDesc: { color: '#555', fontSize: 10, textAlign: 'center', marginTop: 2 },
  check: { color: '#4ade80', fontSize: 14, marginTop: 4 },
})