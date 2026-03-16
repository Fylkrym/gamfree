import React, { useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native'

const TIPS = [
  { emoji: '🧘', title: 'Дыхание 4-7-8', text: 'Вдох 4 секунды, задержка 7, выдох 8. Повтори 3 раза. Снимает тревогу за 1 минуту.' },
  { emoji: '🧠', title: 'Смени мысль', text: 'Когда хочется поставить — спроси себя: "Что я на самом деле чувствую?" Часто за желанием прячется тревога или скука.' },
  { emoji: '⏰', title: 'Правило 15 минут', text: 'Скажи себе: подожду 15 минут. Желание сделать ставку обычно проходит само.' },
  { emoji: '📝', title: 'Запиши триггеры', text: 'Веди список ситуаций, когда хочется поставить. Знание триггеров — половина победы.' },
  { emoji: '🏃', title: 'Физическая активность', text: 'Даже 10 минут ходьбы снижают уровень тревоги и желание играть.' },
  { emoji: '👥', title: 'Расскажи кому-то', text: 'Поделись своей целью с другом или близким. Социальная ответственность помогает держаться.' },
  { emoji: '💰', title: 'Визуализируй деньги', text: 'Каждый раз когда хочется поставить — открой приложение и посмотри сколько ты уже сэкономил.' },
  { emoji: '🌙', title: 'Опасное время', text: 'Определи часы когда соблазн сильнее всего. Планируй на это время другие занятия.' },
  { emoji: '🎯', title: 'Маленькие цели', text: 'Не думай о "никогда больше". Думай: "Только сегодня я не ставлю". Это проще.' },
  { emoji: '❤️', title: 'Будь добр к себе', text: 'Ты борешься с зависимостью. Это тяжело. Хвали себя за каждый день.' },
  { emoji: '📵', title: 'Удали приложения', text: 'Удали букмекерские приложения с телефона. Физический барьер реально работает.' },
  { emoji: '🌊', title: 'Surfing the urge', text: 'Представь желание как волну — оно нарастает, достигает пика и спадает. Ты можешь проплыть сквозь неё.' },
]

export default function TipsScreen({ onClose }: { onClose: () => void }) {
  const [openTip, setOpenTip] = useState<number | null>(null)

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>💡 Советы психолога</Text>
        <TouchableOpacity onPress={onClose}>
          <Text style={styles.closeBtn}>✕</Text>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.scroll}>
        {TIPS.map((tip, i) => (
          <TouchableOpacity
            key={i}
            style={[styles.tipCard, openTip === i && styles.tipCardOpen]}
            onPress={() => setOpenTip(openTip === i ? null : i)}
          >
            <View style={styles.tipHeader}>
              <Text style={styles.tipEmoji}>{tip.emoji}</Text>
              <Text style={styles.tipTitle}>{tip.title}</Text>
              <Text style={styles.tipArrow}>{openTip === i ? '▲' : '▼'}</Text>
            </View>
            {openTip === i && (
              <Text style={styles.tipText}>{tip.text}</Text>
            )}
          </TouchableOpacity>
        ))}
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
  tipCard: {
    backgroundColor: '#12122a', borderRadius: 16,
    padding: 16, marginBottom: 10,
    borderWidth: 1, borderColor: '#1e1e40',
  },
  tipCardOpen: { borderColor: '#7c3aed' },
  tipHeader: { flexDirection: 'row', alignItems: 'center' },
  tipEmoji: { fontSize: 24, marginRight: 12 },
  tipTitle: { color: '#fff', fontSize: 16, fontWeight: '600', flex: 1 },
  tipArrow: { color: '#555', fontSize: 12 },
  tipText: { color: '#888', fontSize: 15, lineHeight: 22, marginTop: 12 },
})