import React from 'react'
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native'
import { useAppStore } from '../store/useAppStore'
import { getElapsed } from '../utils/timeUtils'
import i18n from '../utils/i18n'

const DAY_BADGES = [
  { days: 1, emoji: '🌱', titleKey: '1', descKey: 'Первый шаг' },
  { days: 3, emoji: '⚡', titleKey: '3', descKey: 'Первые трудности' },
  { days: 7, emoji: '⚔️', titleKey: '7', descKey: 'Неделя силы' },
  { days: 14, emoji: '🔥', titleKey: '14', descKey: 'Две недели' },
  { days: 21, emoji: '🎯', titleKey: '21', descKey: 'Привычка' },
  { days: 30, emoji: '💪', titleKey: '30', descKey: 'Месяц свободы' },
  { days: 45, emoji: '🌟', titleKey: '45', descKey: 'Полтора месяца' },
  { days: 60, emoji: '🔥', titleKey: '60', descKey: 'Два месяца' },
  { days: 90, emoji: '🦁', titleKey: '90', descKey: 'Три месяца' },
  { days: 100, emoji: '🏆', titleKey: '100', descKey: 'Сотня' },
  { days: 180, emoji: '💎', titleKey: '180', descKey: 'Полгода' },
  { days: 365, emoji: '👑', titleKey: '365', descKey: 'Целый год' },
]

const URGE_BADGES = [
  { count: 1, emoji: '🛡️', title: '1', desc: 'win' },
  { count: 3, emoji: '💪', title: '3', desc: 'wins' },
  { count: 5, emoji: '⚡', title: '5', desc: 'wins' },
  { count: 10, emoji: '🎯', title: '10', desc: 'wins' },
  { count: 25, emoji: '🦁', title: '25', desc: 'wins' },
  { count: 50, emoji: '🌟', title: '50', desc: 'wins' },
  { count: 100, emoji: '👑', title: '100', desc: 'wins' },
]

const MONEY_BADGES = [
  { amount: 1000, emoji: '💵', title: '1 000' },
  { amount: 5000, emoji: '💴', title: '5 000' },
  { amount: 10000, emoji: '💶', title: '10 000' },
  { amount: 50000, emoji: '💷', title: '50 000' },
  { amount: 100000, emoji: '🏦', title: '100 000' },
]

const DAY_DESCS = {
  ru: ['Первый шаг', 'Первые трудности', 'Неделя силы', 'Две недели', 'Привычка', 'Месяц свободы', 'Полтора месяца', 'Два месяца', 'Три месяца', 'Сотня', 'Полгода', 'Целый год'],
  uk: ['Перший крок', 'Перші труднощі', 'Тиждень сили', 'Два тижні', 'Звичка', 'Місяць свободи', 'Півтора місяця', 'Два місяці', 'Три місяці', 'Сотня', 'Півроку', 'Цілий рік'],
  en: ['First step', 'First challenges', 'Week of strength', 'Two weeks', 'Habit formed', 'Month of freedom', '6 weeks', 'Two months', 'Three months', 'Century', 'Half a year', 'Full year'],
  kk: ['Бірінші қадам', 'Алғашқы қиындықтар', 'Күш аптасы', 'Екі апта', 'Әдет', 'Бостандық айы', 'Бір жарым ай', 'Екі ай', 'Үш ай', 'Жүздік', 'Жарты жыл', 'Толық жыл'],
}

const DAY_TITLES = {
  ru: ['1 день', '3 дня', '7 дней', '14 дней', '21 день', '30 дней', '45 дней', '60 дней', '90 дней', '100 дней', '180 дней', '365 дней'],
  uk: ['1 день', '3 дні', '7 днів', '14 днів', '21 день', '30 днів', '45 днів', '60 днів', '90 днів', '100 днів', '180 днів', '365 днів'],
  en: ['1 day', '3 days', '7 days', '14 days', '21 days', '30 days', '45 days', '60 days', '90 days', '100 days', '180 days', '365 days'],
  kk: ['1 күн', '3 күн', '7 күн', '14 күн', '21 күн', '30 күн', '45 күн', '60 күн', '90 күн', '100 күн', '180 күн', '365 күн'],
}

const MONEY_DESCS = {
  ru: ['Первая тысяча', 'Пять тысяч', 'Десять тысяч', 'Пятьдесят тысяч', 'Сто тысяч'],
  uk: ['Перша тисяча', 'П\'ять тисяч', 'Десять тисяч', 'П\'ятдесят тисяч', 'Сто тисяч'],
  en: ['First thousand', 'Five thousand', 'Ten thousand', 'Fifty thousand', 'Hundred thousand'],
  kk: ['Бірінші мың', 'Бес мың', 'Он мың', 'Елу мың', 'Жүз мың'],
}

export default function AchievementsScreen({ onClose }: { onClose: () => void }) {
  const { startDate, urgeCount, dailyAmount, language } = useAppStore()
  const { days } = startDate ? getElapsed(startDate) : { days: 0 }
  const saved = days * dailyAmount

  i18n.locale = language || 'ru'
  const t = (key: string) => i18n.t(key)

  const lang = (language as keyof typeof DAY_DESCS) || 'ru'
  const dayDescs = DAY_DESCS[lang] ?? DAY_DESCS.ru
  const dayTitles = DAY_TITLES[lang] ?? DAY_TITLES.ru
  const moneyDescs = MONEY_DESCS[lang] ?? MONEY_DESCS.ru

  const unlockedDays = DAY_BADGES.filter(b => days >= b.days).length
  const unlockedUrges = URGE_BADGES.filter(b => urgeCount >= b.count).length
  const unlockedMoney = MONEY_BADGES.filter(b => saved >= b.amount).length
  const total = DAY_BADGES.length + URGE_BADGES.length + MONEY_BADGES.length
  const unlocked = unlockedDays + unlockedUrges + unlockedMoney

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onClose}>
          <Text style={styles.backBtnText}>{t('back')}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{t('achievementsTitle')}</Text>
        <View style={{ width: 80 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>

        <View style={styles.progressCard}>
          <Text style={styles.progressText}>{unlocked} / {total}</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${(unlocked / total) * 100}%` as any }]} />
          </View>
        </View>

        <Text style={styles.sectionTitle}>{t('byDays')}</Text>
        <View style={styles.grid}>
          {DAY_BADGES.map((b, i) => {
            const isUnlocked = days >= b.days
            return (
              <View key={i} style={[styles.badge, !isUnlocked && styles.badgeLocked]}>
                <Text style={styles.badgeEmoji}>{isUnlocked ? b.emoji : '🔒'}</Text>
                <Text style={[styles.badgeTitle, !isUnlocked && styles.lockedText]}>{dayTitles[i]}</Text>
                <Text style={styles.badgeDesc}>{dayDescs[i]}</Text>
                {isUnlocked && <Text style={styles.check}>✓</Text>}
              </View>
            )
          })}
        </View>

        <Text style={styles.sectionTitle}>{t('byUrges')}</Text>
        <View style={styles.grid}>
          {URGE_BADGES.map((b, i) => {
            const isUnlocked = urgeCount >= b.count
            const winsText = language === 'en' ? `${b.count} wins` :
              language === 'uk' ? `${b.count} перемог` :
              language === 'kk' ? `${b.count} жеңіс` :
              `${b.count} побед`
            return (
              <View key={i} style={[styles.badge, !isUnlocked && styles.badgeLocked]}>
                <Text style={styles.badgeEmoji}>{isUnlocked ? b.emoji : '🔒'}</Text>
                <Text style={[styles.badgeTitle, !isUnlocked && styles.lockedText]}>{winsText}</Text>
                {isUnlocked && <Text style={styles.check}>✓</Text>}
              </View>
            )
          })}
        </View>

        <Text style={styles.sectionTitle}>💰 {t('totalSaved')}</Text>
        <View style={styles.grid}>
          {MONEY_BADGES.map((b, i) => {
            const isUnlocked = saved >= b.amount
            return (
              <View key={i} style={[styles.badge, !isUnlocked && styles.badgeLocked]}>
                <Text style={styles.badgeEmoji}>{isUnlocked ? b.emoji : '🔒'}</Text>
                <Text style={[styles.badgeTitle, !isUnlocked && styles.lockedText]}>{b.title}</Text>
                <Text style={styles.badgeDesc}>{moneyDescs[i]}</Text>
                {isUnlocked && <Text style={styles.check}>✓</Text>}
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
  progressText: { color: '#a78bfa', fontSize: 16, fontWeight: '700', marginBottom: 10, textAlign: 'center' },
  progressBar: { height: 8, backgroundColor: '#1a1a38', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: 8, backgroundColor: '#7c3aed', borderRadius: 4 },
  sectionTitle: {
    color: '#a78bfa', fontSize: 17, fontWeight: '700',
    letterSpacing: 1, marginBottom: 12, marginTop: 8,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  badge: {
    backgroundColor: '#0e0e28', borderRadius: 16,
    padding: 14, alignItems: 'center', width: '30%',
    borderWidth: 1, borderColor: '#7c3aed',
  },
  badgeLocked: { borderColor: '#1e1e40', opacity: 0.5 },
  badgeEmoji: { fontSize: 32, marginBottom: 8 },
  badgeTitle: { color: '#fff', fontSize: 14, fontWeight: 'bold', textAlign: 'center' },
  lockedText: { color: '#555' },
  badgeDesc: { color: '#888', fontSize: 11, textAlign: 'center', marginTop: 4 },
  check: { color: '#4ade80', fontSize: 16, marginTop: 4 },
})