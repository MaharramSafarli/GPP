/**
 * "Kartları tap" (yaddaş) oyunu üçün səviyyələr.
 * Hər kartda: emoji, ad və uşaqlar üçün qısa izah.
 */
export type MemoryItem = { id: string; emoji: string; name: string; info: string };

export type MemoryLevel = {
  id: string;
  title: string;
  /** Title shown above the cards in the game. */
  subtitle: string;
  emoji: string;
  color: string;
  items: MemoryItem[];
};

export const MEMORY_LEVELS: MemoryLevel[] = [
  {
    id: 'islam',
    title: 'İslam',
    subtitle: 'İslamın 5 şərti',
    emoji: '🕋',
    color: '#22C55E',
    items: [
      {
        id: 'sehadet',
        emoji: '☝️',
        name: 'Şəhadət',
        info: 'Allahdan başqa ilah olmadığına və Məhəmmədin ﷺ Onun elçisi olduğuna şəhadət vermək.',
      },
      {
        id: 'namaz',
        emoji: '🧎',
        name: 'Namaz',
        info: 'Hər gün beş vaxt namaz qılmaq. Namaz Allahla danışmaqdır.',
      },
      {
        id: 'zekat',
        emoji: '🤲',
        name: 'Zəkat',
        info: 'Malın bir hissəsini ehtiyacı olan insanlara vermək.',
      },
      {
        id: 'oruc',
        emoji: '🌙',
        name: 'Oruc',
        info: 'Ramazan ayında sübhdən axşama qədər yeyib-içməmək.',
      },
      {
        id: 'hecc',
        emoji: '🕋',
        name: 'Həcc',
        info: 'Gücü çatan müsəlmanın ömründə bir dəfə Məkkəyə, Kəbəyə getməsi.',
      },
    ],
  },
  {
    id: 'iman',
    title: 'İman',
    subtitle: 'İmanın 6 şərti',
    emoji: '💚',
    color: '#4D96FF',
    items: [
      { id: 'allah', emoji: '☀️', name: 'Allaha iman', info: 'Allah birdir, hər şeyi O yaradıb.' },
      {
        id: 'melekler',
        emoji: '👼',
        name: 'Mələklərə iman',
        info: 'Mələklər nurdan yaradılıb və Allahın əmrlərini yerinə yetirirlər.',
      },
      {
        id: 'kitablar',
        emoji: '📖',
        name: 'Kitablara iman',
        info: 'Allah Tövrat, Zəbur, İncil və Quranı göndərib. Sonuncusu Qurandır.',
      },
      {
        id: 'peygemberler',
        emoji: '🌟',
        name: 'Peyğəmbərlərə iman',
        info: 'Allah insanlara yol göstərmək üçün peyğəmbərlər göndərib.',
      },
      {
        id: 'axiret',
        emoji: '⚖️',
        name: 'Axirət gününə iman',
        info: 'Bir gün hamı dirilib etdiklərinin hesabını verəcək.',
      },
      {
        id: 'qeder',
        emoji: '🧭',
        name: 'Qədərə iman',
        info: 'Xeyir də, şər də Allahın bilgisi və istəyi ilə olur.',
      },
    ],
  },
  {
    id: 'animals',
    title: 'Heyvanlar',
    subtitle: 'Quranda adı keçən heyvanlar',
    emoji: '🐪',
    color: '#FF7A59',
    items: [
      {
        id: 'deve',
        emoji: '🐪',
        name: 'Dəvə',
        info: 'Quranda Allahın möcüzəsi kimi xatırlanır. Səhrada günlərlə susuz qala bilir.',
      },
      {
        id: 'fil',
        emoji: '🐘',
        name: 'Fil',
        info: 'Quranda “Fil” surəsi var. Kəbəni dağıtmaq istəyən fil ordusundan bəhs edir.',
      },
      {
        id: 'inek',
        emoji: '🐄',
        name: 'İnək',
        info: 'Quranın ən uzun surəsi “Bəqərə”, yəni “İnək” adlanır.',
      },
      {
        id: 'at',
        emoji: '🐎',
        name: 'At',
        info: '“Adiyat” surəsində sürətlə qaçan atlara and içilir.',
      },
      {
        id: 'baliq',
        emoji: '🐋',
        name: 'Balıq',
        info: 'Yunus peyğəmbəri böyük balıq uddu, o, balığın qarnında Allaha dua etdi.',
      },
    ],
  },
  {
    id: 'insects',
    title: 'Həşəratlar',
    subtitle: 'Quranda adı keçən həşəratlar',
    emoji: '🐝',
    color: '#FFB703',
    items: [
      {
        id: 'ari',
        emoji: '🐝',
        name: 'Arı',
        info: '“Nəhl” surəsi arıdan bəhs edir. Arının balında insanlar üçün şəfa var.',
      },
      {
        id: 'qarisqa',
        emoji: '🐜',
        name: 'Qarışqa',
        info: '“Nəml” surəsində bir qarışqa yoldaşlarını Süleymanın ordusundan xəbərdar edir.',
      },
      {
        id: 'horumcek',
        emoji: '🕷️',
        name: 'Hörümçək',
        info: '“Ənkəbut”, yəni “Hörümçək” surəsi var. Onun toru çox zəifdir.',
      },
      {
        id: 'milcek',
        emoji: '🪰',
        name: 'Milçək',
        info: 'Quranda deyilir ki, bütlər bir milçək belə yarada bilməzlər.',
      },
      {
        id: 'agcaqanad',
        emoji: '🦟',
        name: 'Ağcaqanad',
        info: 'Allah Quranda ağcaqanadı misal çəkir: kiçik məxluqda da böyük hikmət var.',
      },
    ],
  },
  {
    id: 'foods',
    title: 'Sünnə yeməkləri',
    subtitle: 'Peyğəmbərimizin ﷺ sevdiyi yeməklər',
    emoji: '🍯',
    color: '#9B5DE5',
    items: [
      {
        id: 'xurma',
        emoji: '🌴',
        name: 'Xurma',
        info: 'Peyğəmbərimiz ﷺ orucunu çox vaxt xurma ilə açardı.',
      },
      { id: 'bal', emoji: '🍯', name: 'Bal', info: 'Peyğəmbərimiz ﷺ şirin şeyləri və balı sevərdi.' },
      { id: 'sud', emoji: '🥛', name: 'Süd', info: 'Süd içəndə Allahdan bərəkət istəyərdi.' },
      {
        id: 'zeytun',
        emoji: '🫒',
        name: 'Zeytun',
        info: 'Zeytun ağacı Quranda mübarək ağac adlanır.',
      },
      {
        id: 'qarpiz',
        emoji: '🍉',
        name: 'Qarpız',
        info: 'Peyğəmbərimiz ﷺ qarpızı xurma ilə birlikdə yeyərdi.',
      },
    ],
  },
  {
    id: 'stories',
    title: 'Peyğəmbər hekayələri',
    subtitle: 'Peyğəmbər hekayələri',
    emoji: '⛵',
    color: '#00A6A6',
    items: [
      {
        id: 'nuh',
        emoji: '⛵',
        name: 'Nuhun gəmisi',
        info: 'Nuh peyğəmbər böyük gəmi düzəltdi, möminləri və heyvanları tufandan qurtardı.',
      },
      {
        id: 'ibrahim',
        emoji: '🔥',
        name: 'İbrahim və od',
        info: 'İbrahimi oda atdılar, Allah odu ona sərin və salamat etdi.',
      },
      {
        id: 'musa',
        emoji: '🌊',
        name: 'Musa və dəniz',
        info: 'Musa əsasını vurdu, dəniz yarıldı və möminlər Firondan xilas oldu.',
      },
      {
        id: 'yunus',
        emoji: '🐳',
        name: 'Yunus və balıq',
        info: 'Yunus balığın qarnında dua etdi, Allah onu xilas etdi.',
      },
      {
        id: 'yusif',
        emoji: '🪣',
        name: 'Yusif və quyu',
        info: 'Qardaşları Yusifi quyuya atdılar, sonra o, Misirdə böyük vəzifəyə çatdı.',
      },
      {
        id: 'suleyman',
        emoji: '🐜',
        name: 'Süleyman və qarışqa',
        info: 'Süleyman peyğəmbər qarışqanın sözünü eşidib gülümsədi və Allaha şükür etdi.',
      },
    ],
  },
];
