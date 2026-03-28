import React, { useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native'
import i18n from '../utils/i18n'
import { useAppStore } from '../store/useAppStore'

const TIPS = {
  ru: [
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
  ],
  uk: [
    { emoji: '🧘', title: 'Дихання 4-7-8', text: 'Вдих 4 секунди, затримка 7, видих 8. Повтори 3 рази. Знімає тривогу за 1 хвилину.' },
    { emoji: '🧠', title: 'Зміни думку', text: 'Коли хочеться поставити — запитай себе: "Що я насправді відчуваю?" Часто за бажанням ховається тривога або нудьга.' },
    { emoji: '⏰', title: 'Правило 15 хвилин', text: 'Скажи собі: зачекаю 15 хвилин. Бажання зробити ставку зазвичай проходить само.' },
    { emoji: '📝', title: 'Запиши тригери', text: 'Веди список ситуацій, коли хочеться поставити. Знання тригерів — половина перемоги.' },
    { emoji: '🏃', title: 'Фізична активність', text: 'Навіть 10 хвилин ходьби знижують рівень тривоги і бажання грати.' },
    { emoji: '👥', title: 'Розкажи комусь', text: 'Поділися своєю метою з другом або близьким. Соціальна відповідальність допомагає триматися.' },
    { emoji: '💰', title: 'Візуалізуй гроші', text: 'Щоразу коли хочеться поставити — відкрий застосунок і подивись скільки ти вже зекономив.' },
    { emoji: '🌙', title: 'Небезпечний час', text: 'Визнач години коли спокуса найсильніша. Плануй на цей час інші заняття.' },
    { emoji: '🎯', title: 'Маленькі цілі', text: 'Не думай про "ніколи більше". Думай: "Тільки сьогодні я не ставлю". Це простіше.' },
    { emoji: '❤️', title: 'Будь добрим до себе', text: 'Ти борешся із залежністю. Це важко. Хвали себе за кожен день.' },
    { emoji: '📵', title: 'Видали застосунки', text: 'Видали букмекерські застосунки з телефону. Фізичний бар\'єр реально працює.' },
    { emoji: '🌊', title: 'Surfing the urge', text: 'Уяви бажання як хвилю — воно наростає, досягає піку і спадає. Ти можеш пропливти крізь неї.' },
  ],
  en: [
    { emoji: '🧘', title: '4-7-8 Breathing', text: 'Inhale 4 seconds, hold 7, exhale 8. Repeat 3 times. Relieves anxiety in 1 minute.' },
    { emoji: '🧠', title: 'Change your thought', text: 'When you want to bet — ask yourself: "What am I really feeling?" Often anxiety or boredom hides behind the urge.' },
    { emoji: '⏰', title: '15-minute rule', text: 'Tell yourself: I\'ll wait 15 minutes. The urge to bet usually passes on its own.' },
    { emoji: '📝', title: 'Write down triggers', text: 'Keep a list of situations when you want to bet. Knowing your triggers is half the battle.' },
    { emoji: '🏃', title: 'Physical activity', text: 'Even 10 minutes of walking reduces anxiety and the urge to gamble.' },
    { emoji: '👥', title: 'Tell someone', text: 'Share your goal with a friend or loved one. Social accountability helps you stay on track.' },
    { emoji: '💰', title: 'Visualize money', text: 'Every time you want to bet — open the app and see how much you\'ve already saved.' },
    { emoji: '🌙', title: 'Danger time', text: 'Identify the hours when temptation is strongest. Plan other activities for those times.' },
    { emoji: '🎯', title: 'Small goals', text: 'Don\'t think about "never again". Think: "Just today I won\'t bet". That\'s easier.' },
    { emoji: '❤️', title: 'Be kind to yourself', text: 'You\'re fighting an addiction. It\'s hard. Praise yourself for every day.' },
    { emoji: '📵', title: 'Delete apps', text: 'Delete betting apps from your phone. A physical barrier really works.' },
    { emoji: '🌊', title: 'Surfing the urge', text: 'Imagine the urge as a wave — it builds, peaks and subsides. You can surf through it.' },
  ],
  kk: [
    { emoji: '🧘', title: '4-7-8 Дем алу', text: 'Дем алу 4 секунд, ұстап тұру 7, шығару 8. 3 рет қайтала. Алаңдаушылықты 1 минутта жояды.' },
    { emoji: '🧠', title: 'Ойыңды өзгерт', text: 'Бәс қоюды қалағанда — өзіңе сұра: "Мен шынымен не сезінемін?" Жиі тілек артында алаңдаушылық немесе жалықпа жасырынады.' },
    { emoji: '⏰', title: '15 минут ережесі', text: 'Өзіңе айт: 15 минут күтемін. Бәс қою ниеті әдетте өздігінен өтеді.' },
    { emoji: '📝', title: 'Триггерлерді жаз', text: 'Бәс қоюды қалайтын жағдайлар тізімін жүргіз. Триггерлерді білу — жеңістің жартысы.' },
    { emoji: '🏃', title: 'Физикалық белсенділік', text: 'Тіпті 10 минут жаяу жүру алаңдаушылық деңгейін және ойнау ниетін азайтады.' },
    { emoji: '👥', title: 'Біреуге айт', text: 'Мақсатыңды достарыңмен немесе жақындарыңмен бөліс. Әлеуметтік жауапкершілік ұстануға көмектеседі.' },
    { emoji: '💰', title: 'Ақшаны елестет', text: 'Бәс қоюды қалаған сайын — қолданбаны аш және қанша үнемдегеніңді қара.' },
    { emoji: '🌙', title: 'Қауіпті уақыт', text: 'Азғыру ең күшті болатын сағаттарды анықта. Сол уақытқа басқа іс-шаралар жоспарла.' },
    { emoji: '🎯', title: 'Кіші мақсаттар', text: '"Ешқашан" деп ойлама. Ойла: "Тек бүгін бәс қоймаймын". Бұл оңайырақ.' },
    { emoji: '❤️', title: 'Өзіңе мейірімді бол', text: 'Сен тәуелділікпен күресіп жатырсың. Бұл қиын. Әр күн үшін өзіңді мақта.' },
    { emoji: '📵', title: 'Қолданбаларды жой', text: 'Букмекерлік қолданбаларды телефоннан жой. Физикалық кедергі шынымен жұмыс істейді.' },
    { emoji: '🌊', title: 'Толқынмен сер', text: 'Ниетті толқын ретінде елестет — ол өседі, шыңына жетеді және қайтады. Сен оны кесіп өте аласың.' },
  ],
}

export default function TipsScreen({ onClose }: { onClose: () => void }) {
  const { language } = useAppStore()
  const [openTip, setOpenTip] = useState<number | null>(null)
  i18n.locale = language || 'ru'
  const t = (key: string) => i18n.t(key)
  const tips = TIPS[language as keyof typeof TIPS] ?? TIPS.ru

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onClose}>
          <Text style={styles.backBtnText}>{t('back')}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{t('tipsTitle')}</Text>
        <View style={{ width: 80 }} />
      </View>
      <ScrollView contentContainerStyle={styles.scroll}>
        {tips.map((tip, i) => (
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
  scroll: { padding: 16 },
  tipCard: {
    backgroundColor: '#0e0e28', borderRadius: 16,
    padding: 16, marginBottom: 10,
    borderWidth: 1, borderColor: '#1e1e40',
  },
  tipCardOpen: { borderColor: '#7c3aed' },
  tipHeader: { flexDirection: 'row', alignItems: 'center' },
  tipEmoji: { fontSize: 24, marginRight: 12 },
  tipTitle: { color: '#fff', fontSize: 16, fontWeight: '600', flex: 1 },
  tipArrow: { color: '#555', fontSize: 12 },
  tipText: { color: '#aaa', fontSize: 15, lineHeight: 22, marginTop: 12 },
})