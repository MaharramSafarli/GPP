/**
 * Daily duas for children, copied from the owner's screenshots of a dua book
 * (Arabic, Azerbaijani transliteration and meaning, with the book's sources).
 * Please have any change reviewed by someone knowledgeable.
 *
 * `scene` is a small emoji picture explaining the situation for children.
 * Audio files are wired up in `dua-audio.ts` (key `<id>-<part index>`).
 */
export type DuaPart = {
  /** A line before the dua, e.g. who says it. */
  intro?: string;
  arabic: string;
  translit: string;
  meaning: string;
};

export type Dua = {
  id: string;
  title: string;
  /** Short, child-friendly "when do we say it". */
  when: string;
  scene: string[];
  color: string;
  /** The virtue / hadith text shown above the dua. */
  note?: string;
  parts: DuaPart[];
  after?: string;
  source: string;
};

export const DUAS: Dua[] = [
  {
    id: 'wake-up',
    title: 'Yuxudan oyananda',
    when: 'Səhər yuxudan oyananda deyirik.',
    scene: ['🛏️', '🌅', '😊'],
    color: '#FFB703',
    parts: [
      {
        arabic: 'الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ',
        translit: 'Əlhəmdulilləhil-ləzi əhyanə bə\'də mə əmatənə və ileyhin-nuşur.',
        meaning: 'Bizi öldürdükdən sonra dirildən Allaha həmd olsun. (Ölüb dirildikdən sonra isə) qayıdış Onadır.',
      },
    ],
    source: 'Fəthul-Bari, 11/113; Muslim, 4/2083.',
  },
  {
    id: 'dressing',
    title: 'Paltar geyinəndə',
    when: 'Paltarımızı geyinəndə deyirik.',
    scene: ['👕', '👖', '🧦'],
    color: '#4D96FF',
    note: 'Kim paltarını geyinərkən bunu desə, keçmiş günahları bağışlanar.',
    parts: [
      {
        arabic:
          'الْحَمْدُ لِلَّهِ الَّذِي كَسَانِي هَذَا (الثَّوْبَ) وَرَزَقَنِيهِ مِنْ غَيْرِ حَوْلٍ مِنِّي وَلَا قُوَّةٍ',
        translit: 'Əlhəmdulilləhil-ləzi kəsani həzə (əs-səubə) və razəqanihi min ğayri haulin minni və lə quvvətin.',
        meaning:
          'Bunu (bu paltarı) mənə geyindirən və özüm heç bir qüdrət və güc sərf etmədən onu mənə bəxş edən Allaha həmd olsun!',
      },
    ],
    source:
      '«Sünən Əbu Davud», 4023; bu hədis "həsən"dir, bax: «Səhihul-Cami», 6086. Bunu, ən-Nəsai müstəsna olmaqla, «Sünən» əsərlərinin müəllifləri rəvayət etmişlər. Bax: «İrvaul-Ğəlil», 7/47.',
  },
  {
    id: 'new-clothes',
    title: 'Təzə paltar geyinəndə',
    when: 'Yeni paltarı ilk dəfə geyinəndə deyirik.',
    scene: ['🛍️', '👗', '✨'],
    color: '#FF8FC8',
    parts: [
      {
        arabic:
          'اللَّهُمَّ لَكَ الْحَمْدُ أَنْتَ كَسَوْتَنِيهِ، أَسْأَلُكَ مِنْ خَيْرِهِ وَخَيْرِ مَا صُنِعَ لَهُ، وَأَعُوذُ بِكَ مِنْ شَرِّهِ وَشَرِّ مَا صُنِعَ لَهُ',
        translit:
          'Allahummə, ləkəl-həmdu əntə kəsəutənihi, əs\'əlukə min xayrihi və xayri mə sunia ləhu və əuzu bikə min şərrihi və şərri mə sunia ləhu.',
        meaning:
          'Allahım, Həmd Sənədir! Bunu mənə Sən geyindirdin. Onun xeyrini və onun istifadəsinin xeyrini Səndən diləyirik! Onun şərindən və onun istifadəsinin şərindən Sənə sığınırıq!',
      },
    ],
    source:
      'Əbu Davud, ət-Tirmizi və əl-Bəğəvi. Bax: «Müxtəsər Şəmaili-t-Tirmizi», səh. 47. [Hədis səhihdir: «Mişkat əl-Məsabih», 2/486.]',
  },
  {
    id: 'undressing',
    title: 'Paltarı soyunanda',
    when: 'Paltarımızı çıxaranda deyirik.',
    scene: ['👕', '➡️', '🧺'],
    color: '#2EC4B6',
    note: 'Cinlərin gözləri ilə insanların ayıb yerləri arasına çəkilən örtük, birinizin paltarını soyunarkən bunu deməsidir.',
    parts: [{ arabic: 'بِسْمِ اللَّهِ', translit: 'Bismilləh.', meaning: 'Allahın adı ilə!' }],
    source: 'ət-Tirmizi, 2/505 və başqaları. Bax: «İrvaul-Ğəlil», №49 və «Səhihul-Cami», 3/203.',
  },
  {
    id: 'toilet-enter',
    title: 'Ayaqyoluna girəndə',
    when: 'Tualetə girməzdən əvvəl deyirik.',
    scene: ['🚻', '🚪', '👣'],
    color: '#9B5DE5',
    parts: [
      {
        arabic: '[بِسْمِ اللَّهِ] اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْخُبُثِ وَالْخَبَائِثِ',
        translit: '[Bismilləh]. Allahummə inni əuzu bikə minəl-xubsi vəl-xəbais.',
        meaning: '(Allahın adı ilə!) Allahım, pislikdən və pis əməllərdən (erkək və dişi cinlərdən) Sənə sığınıram!',
      },
    ],
    after:
      'Cinlərin gözləri ilə insanların ayıb yerləri arasına çəkilən örtük, birinizin ayaqyoluna daxil olmaq istədiyi zaman «Bismilləh» deməsidir.',
    source:
      'əl-Buxari, 1/45; Muslim, 1/283. Əvvəldəki "Bismilləh!" Səid ibn Mənsurun əlavəsidir. Bax: «Fəthul-Bari», 1/244. "Sunən ət-Tirmizi", 606; bu hədis "səhih"dir, bax: "Səhih əl-Cami", 3611.',
  },
  {
    id: 'toilet-exit',
    title: 'Ayaqyolundan çıxanda',
    when: 'Tualetdən çıxanda deyirik.',
    scene: ['🚪', '🧼', '🙌'],
    color: '#22A447',
    parts: [{ arabic: 'غُفْرَانَكَ', translit: 'Ğufranəkə.', meaning: '(Allahım!) Məni bağışla!' }],
    source:
      'Bunu, ən-Nəsai müstəsna olmaqla, «Sünən» əsərlərinin müəllifləri rəvayət etmişlər. ən-Nəsai isə «Əməlul-Yəumi vəl-Leyl» əsərində rəvayət etmişdir. Bax: «Zadul-Məad», 2/387. [Hədis səhihdir; «İrvaul-Ğəlil», 1/91.]',
  },
  {
    id: 'leave-home',
    title: 'Evdən çıxanda',
    when: 'Evdən bayıra çıxanda deyirik.',
    scene: ['🏠', '🚶', '☀️'],
    color: '#FF7A59',
    note:
      'Kim evindən bayıra çıxdığı zaman bunu desə, həmin vaxt mələk ona: "Doğru yola yönəldin, işlərin yoluna qoyuldu, şərdən qorundun!" deyər, üstəlik şeytan ondan uzaq durar!',
    parts: [
      {
        arabic: 'بِسْمِ اللَّهِ، تَوَكَّلْتُ عَلَى اللَّهِ، وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ',
        translit: 'Bismilləh, təvəkkəltu aləllahi və lə həulə və lə quvvətə illə billəh.',
        meaning: 'Allahın adı ilə! Allaha təvəkkül etdim. Qüdrət və güc yalnız Allahdadır!',
      },
    ],
    source: 'Əbu Davud, 4/325 və ət-Tirmizi, 5/490. Bax: «Səhihu-t-Tirmizi», 3/151.',
  },
  {
    id: 'enter-home',
    title: 'Evə girəndə',
    when: 'Evə qayıdıb içəri girəndə deyirik.',
    scene: ['🚶', '🏠', '👋'],
    color: '#E8743B',
    note:
      'Evinə girən adam həm evə daxil olarkən, həm də yemək yeyərkən Allahı zikr etsə, şeytanlar deyərlər: Sizin nə gecələməyə yeriniz, nə də şam yeməyiniz var!',
    parts: [
      {
        arabic: 'بِسْمِ اللَّهِ وَلَجْنَا، وَبِسْمِ اللَّهِ خَرَجْنَا، وَعَلَى رَبِّنَا تَوَكَّلْنَا',
        translit: 'Bismilləhi vələcnə və bismilləhi xaracnə və alə Rabbinə təvəkkəlnə.',
        meaning: 'Allahın adı ilə girdik, Allahın adı ilə çıxdıq və Rəbbimizə təvəkkül etdik!',
      },
    ],
    after: 'Bu zikri etdikdən sonra ailəsinə salam versin.',
    source:
      'Muslim, 2018. Əbu Davud, 4/325; İbn Baz, hədisin isnadını "həsən" hesab etmişdir. «Tuhfətul-Əxyar» səh. 28. [Şeyx əl-Albani isə bu hədisi zəif hesab etmişdir. Bax: «əl-Kəlimut-Teyyib», 1/91.]',
  },
  {
    id: 'eat-start',
    title: 'Yeməyə başlayanda',
    when: 'Yeməyə başlamazdan əvvəl deyirik.',
    scene: ['🍽️', '🥣', '🍞'],
    color: '#FFB703',
    parts: [
      {
        intro: 'Sizlərdən biri yemək yeməyə başlayarkən:',
        arabic: 'بِسْمِ اللَّهِ',
        translit: 'Bismilləh.',
        meaning: '«Allahın adı ilə!» desin.',
      },
      {
        intro: 'Əgər əvvəldə bunu unutsa, onda:',
        arabic: 'بِسْمِ اللَّهِ فِي أَوَّلِهِ وَآخِرِهِ',
        translit: 'Bismilləhi fi əvvəlihi və axirihi.',
        meaning: '«Əvvəlində də, axırında da Allahın adı ilə!» desin.',
      },
    ],
    source: 'Əbu Davud, 3/347; ət-Tirmizi, 4/288. Bax: «Səhihu-t-Tirmizi», 2/167. Muslim, 2018.',
  },
  {
    id: 'eat-end',
    title: 'Yeməkdən sonra',
    when: 'Yeməyimizi bitirəndə deyirik.',
    scene: ['😋', '🍽️', '🤲'],
    color: '#22A447',
    note: 'Hər kim yeməyini bitirdikdən sonra bu duanı etsə, keçmiş günahları bağışlanar.',
    parts: [
      {
        arabic:
          'الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنِي هَذَا وَرَزَقَنِيهِ مِنْ غَيْرِ حَوْلٍ مِنِّي وَلَا قُوَّةٍ',
        translit: 'Əlhəmdu lilləhil-ləzi ət\'aməni həzə və razəqanihi min ğayri həulin minni və lə quvvətin.',
        meaning:
          'Bunu mənə yedirdən və özüm heç bir qüdrət və güc sərf etmədən onu mənə bəxş edən Allaha həmd olsun!',
      },
    ],
    source:
      '«Sünən Əbu Davud», 4023; bu hədis "həsən"dir, bax: «Səhihul-Cami», 6086. ən-Nəsai istisna olmaqla «Sünən» əsərinin müəllifləri rəvayət etmişlər. Bax: «Səhihu-t-Tirmizi», 3/159.',
  },
  {
    id: 'sneeze',
    title: 'Asqıranda',
    when: 'Asqıranda və asqıran birinə cavab verəndə deyirik.',
    scene: ['🤧', '💨', '🙂'],
    color: '#4D96FF',
    parts: [
      {
        intro: 'Sizlərdən biri asqırsa:',
        arabic: 'الْحَمْدُ لِلَّهِ',
        translit: 'Əlhəmdulilləh.',
        meaning: '«Həmd olsun Allaha!» desin.',
      },
      {
        intro: 'Qardaşı və ya dostu isə ona:',
        arabic: 'يَرْحَمُكَ اللَّهُ',
        translit: 'Yərhəmukəllah.',
        meaning: '«Allah sənə rəhm etsin!» desin.',
      },
      {
        intro: 'O da «Allah sənə rəhm etsin!» deyənə:',
        arabic: 'يَهْدِيكُمُ اللَّهُ وَيُصْلِحُ بَالَكُمْ',
        translit: 'Yəhdikumullahu və yuslihu bələkum.',
        meaning: '«Allah sizi doğru yola yönəltsin və işinizi avand etsin!» desin.',
      },
    ],
    source: 'əl-Buxari, 7/125.',
  },
  {
    id: 'angry',
    title: 'Qəzəbləndikdə',
    when: 'Hirsləndiyimiz, əsəbiləşdiyimiz zaman deyirik.',
    scene: ['😠', '💢', '🤲'],
    color: '#FF4D6D',
    note: 'Kim qəzəblənərkən bu kəliməni söyləsə qəzəb halı ondan gedər.',
    parts: [
      {
        arabic: 'أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ',
        translit: 'Əuzu billəhi minəş-şeytanir-racim.',
        meaning: 'Lənətlənmiş şeytandan Allaha sığınıram!',
      },
    ],
    source: 'əl-Buxari, 7/99; Muslim, 4/2015.',
  },
  {
    id: 'surprised',
    title: 'Təəccüblənəndə və sevinəndə',
    when: 'Gözəl bir şey görüb heyrətlənəndə və ya sevinəndə deyirik.',
    scene: ['😲', '🌈', '🎉'],
    color: '#9B5DE5',
    parts: [{ arabic: 'سُبْحَانَ اللَّهِ', translit: 'Subhənallah!', meaning: 'Allah pak və müqəddəsdir!' }],
    source: '«Fəthul-Bari», 1/210, 390, 414; Muslim, 4/1857.',
  },
  {
    id: 'afraid',
    title: 'Qorxanda',
    when: 'Bir şeydən qorxduğumuz zaman deyirik.',
    scene: ['😨', '🌩️', '🤲'],
    color: '#1E3A8A',
    parts: [
      {
        arabic: 'لَا إِلَهَ إِلَّا اللَّهُ',
        translit: 'Lə ilahə illəllah!',
        meaning: 'Allahdan başqa ibadətə layiq haqq məbud yoxdur!',
      },
    ],
    source: '«Fəthul-Bari», 6/181; Muslim, 4/2208.',
  },
  {
    id: 'rain',
    title: 'Yağış yağanda',
    when: 'Yağış yağmağa başlayanda deyirik.',
    scene: ['🌧️', '☔', '🌱'],
    color: '#2EC4B6',
    parts: [{ arabic: 'اللَّهُمَّ صَيِّبًا نَافِعًا', translit: 'Allahummə sayyibən nafian.', meaning: 'Allahım, bu yağışı faydalı et!' }],
    source: '«Fəthul-Bari», 2/518. [Mişkatul-Məsabih, 1/338.]',
  },
  {
    id: 'wind',
    title: 'Külək əsəndə',
    when: 'Güclü külək əsəndə deyirik.',
    scene: ['🌬️', '🍃', '🌳'],
    color: '#4D96FF',
    note:
      'Peyğəmbər ﷺ demişdir: Küləyin əsdiyini gördüyünüz zaman onu söyməyin. Allahdan onun xeyrini diləyin, şərrindən isə Allaha sığının.',
    parts: [
      {
        arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ خَيْرَهَا، وَأَعُوذُ بِكَ مِنْ شَرِّهَا',
        translit: 'Allahummə inni əs\'əlukə xayrahə və əuzu bikə min şərrihə.',
        meaning: 'Allahım! Səndən onun (küləyin) xeyrini diləyirəm və onun şərindən Sənə sığınıram!',
      },
    ],
    source: 'Əbu Davud, 4/326; İbn Macə, 2/1228. Bax: «Səhih ibn Macə», 2/305.',
  },
];
