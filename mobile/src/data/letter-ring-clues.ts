/**
 * "Hərf dairəsi" clues. One clue per letter is picked each game.
 * mode 'start': the answer starts with the letter; 'contains': the letter is inside the answer
 * (used for Ğ, which never starts a word, and for some I clues).
 * `alt` = other accepted spellings. `islamic: true` marks religious content (please have it reviewed).
 */
export type RingClue = {
  letter: string;
  answer: string;
  clue: string;
  mode?: 'start' | 'contains';
  alt?: string[];
  islamic?: boolean;
};

export const RING_CLUES: RingClue[] = [
  { letter: 'A', answer: 'Allah', clue: 'Hər şeyi yaradan, tək olan, şəriki olmayan', islamic: true },
  { letter: 'A', answer: 'alma', clue: 'Qırmızı, yaşıl və ya sarı rəngli dəyirmi meyvə' },
  { letter: 'A', answer: 'ay', clue: 'Gecələr göydə parlayan, Yerin peyki' },
  { letter: 'A', answer: 'Adəm', clue: 'İlk insan və ilk peyğəmbər', islamic: true },

  { letter: 'B', answer: 'bal', clue: 'Arıların hazırladığı şirin qida' },
  { letter: 'B', answer: 'bulud', clue: 'Göydə üzən, yağış gətirən ağ və ya boz kütlə' },
  { letter: 'B', answer: 'Bilal', clue: 'İslamda ilk əzan oxuyan səhabə', islamic: true },

  { letter: 'C', answer: 'cənnət', clue: 'Möminlərin axirətdə qalacağı gözəl məkan', islamic: true },
  { letter: 'C', answer: 'cümə', clue: 'Müsəlmanlar üçün həftənin mübarək günü', islamic: true },
  { letter: 'C', answer: 'cib', clue: 'Paltarda əşya qoymaq üçün tikilmiş kiçik yer' },
  { letter: 'C', answer: 'Cəbrayıl', alt: ['Cəbrail'], clue: 'Peyğəmbərlərə vəhy gətirən mələk', islamic: true },

  { letter: 'Ç', answer: 'çay', clue: 'Həm isti içki, həm də axan su' },
  { letter: 'Ç', answer: 'çiçək', clue: 'Bitkinin rəngli, ətirli hissəsi' },
  { letter: 'Ç', answer: 'çörək', clue: 'Undan bişirilən, süfrənin əsas qidası' },

  { letter: 'D', answer: 'dua', clue: 'Allaha yalvarmaq, Ondan bir şey istəmək', islamic: true },
  { letter: 'D', answer: 'dəniz', clue: 'Böyük, duzlu su hövzəsi' },
  { letter: 'D', answer: 'dəstəmaz', clue: 'Namazdan əvvəl üz, əl və ayaqları yumaqla alınan təharət', islamic: true },
  { letter: 'D', answer: 'Davud', clue: 'Gözəl səsi olan, Zəbur verilən peyğəmbər', islamic: true },

  { letter: 'E', answer: 'ev', clue: 'İnsanların yaşadığı bina' },
  { letter: 'E', answer: 'elm', clue: 'Bilik; Peyğəmbərimiz ﷺ onu öyrənməyi tövsiyə edib', islamic: true },
  { letter: 'E', answer: 'eynək', clue: 'Daha yaxşı görmək üçün gözə taxılan şüşələr' },

  { letter: 'Ə', answer: 'əzan', clue: 'Namaz vaxtını bildirmək üçün oxunan çağırış', islamic: true },
  { letter: 'Ə', answer: 'əl', clue: 'Beş barmağı olan bədən üzvü' },
  { letter: 'Ə', answer: 'əlifba', clue: 'Hərflərin sıralı toplusu' },
  { letter: 'Ə', answer: 'ədəb', clue: 'Gözəl əxlaq, tərbiyəli davranış', islamic: true },

  { letter: 'F', answer: 'Fatihə', clue: 'Quranın ilk surəsi', islamic: true },
  { letter: 'F', answer: 'fil', clue: 'Xortumu olan iri heyvan; Quranda bu adda surə var' },
  { letter: 'F', answer: 'fənər', clue: 'Qaranlıqda işıq verən əl lampası' },

  { letter: 'G', answer: 'günəş', clue: 'Gündüz yerə işıq və istilik verən ulduz' },
  { letter: 'G', answer: 'gül', clue: 'Tikanlı budağı olan ətirli çiçək' },
  { letter: 'G', answer: 'gəmi', clue: 'Dənizdə üzən böyük nəqliyyat; Nuh peyğəmbər də belə birini düzəltdi' },

  { letter: 'Ğ', answer: 'dağ', mode: 'contains', clue: 'Yerin çox uca, zirvəli hissəsi' },
  { letter: 'Ğ', answer: 'bağ', mode: 'contains', clue: 'Meyvə ağacları əkilən yer' },
  { letter: 'Ğ', answer: 'ağac', mode: 'contains', clue: 'Gövdəsi, budaqları və yarpaqları olan böyük bitki' },

  { letter: 'H', answer: 'hac', clue: 'Məkkəyə gedib Kəbəni ziyarət etmək ibadəti', islamic: true },
  { letter: 'H', answer: 'hilal', clue: 'Yeni ayın nazik, oraq kimi görünüşü' },
  { letter: 'H', answer: 'hicrət', clue: 'Peyğəmbərimiz ﷺ-in Məkkədən Mədinəyə köçü', islamic: true },
  { letter: 'H', answer: 'hədiyyə', clue: 'Birini sevindirmək üçün verilən bəxşiş' },

  { letter: 'X', answer: 'xurma', clue: 'İsti ölkələrdə bitən şirin, qəhvəyi meyvə' },
  { letter: 'X', answer: 'xalça', clue: 'Yerə sərilən naxışlı toxuma' },
  { letter: 'X', answer: 'xeyir', clue: 'Yaxşılıq; şərin əksi', islamic: true },

  { letter: 'I', answer: 'ılıq', clue: 'Nə isti, nə də soyuq' },
  { letter: 'I', answer: 'balıq', mode: 'contains', clue: 'Suda yaşayan, üzgəcli canlı' },
  { letter: 'I', answer: 'qızıl', mode: 'contains', clue: 'Sarı rəngli qiymətli metal' },

  { letter: 'İ', answer: 'iman', clue: 'Allaha, mələklərə, kitablara və peyğəmbərlərə inanmaq', islamic: true },
  { letter: 'İ', answer: 'iftar', clue: 'Axşam orucu açmaq üçün yeyilən yemək', islamic: true },
  { letter: 'İ', answer: 'İbrahim', clue: 'Oğlu İsmayıl ilə birlikdə Kəbəni tikən peyğəmbər', islamic: true },
  { letter: 'İ', answer: 'işıq', clue: 'Qaranlığı yox edən şey' },

  { letter: 'J', answer: 'jurnal', clue: 'Şəkilli, mütəmadi çap olunan nəşr' },
  { letter: 'J', answer: 'jilet', clue: 'Qolsuz üst geyim' },

  { letter: 'K', answer: 'Kəbə', clue: 'Məkkədə, müsəlmanların üz tutub namaz qıldığı müqəddəs ev', islamic: true },
  { letter: 'K', answer: 'kitab', clue: 'Səhifələri olan, oxumaq üçün çap olunmuş əsər' },
  { letter: 'K', answer: 'kəpənək', clue: 'Rəngli qanadları olan, çiçəkdən çiçəyə qonan həşərat' },

  { letter: 'Q', answer: 'Quran', clue: 'Allahın son peyğəmbərə endirdiyi müqəddəs kitab', islamic: true },
  { letter: 'Q', answer: 'qiblə', clue: 'Namaz qılarkən üz tutulan istiqamət', islamic: true },
  { letter: 'Q', answer: 'qar', clue: 'Qışda göydən yağan ağ, soyuq dənəciklər' },
  { letter: 'Q', answer: 'qələm', clue: 'Yazmaq üçün alət' },

  { letter: 'L', answer: 'limon', clue: 'Turş dadlı, sarı meyvə' },
  { letter: 'L', answer: 'lalə', clue: 'Yazda açan, qırmızı kasa şəkilli çiçək' },
  { letter: 'L', answer: 'lövhə', clue: 'Sinifdə üzərinə yazı yazılan böyük taxta' },

  { letter: 'M', answer: 'məscid', clue: 'Müsəlmanların birlikdə namaz qıldığı ev', islamic: true },
  { letter: 'M', answer: 'Məkkə', clue: 'Peyğəmbərimiz ﷺ-in doğulduğu şəhər', islamic: true },
  { letter: 'M', answer: 'mələk', clue: 'Nurdan yaradılmış, Allaha həmişə itaət edən varlıq', islamic: true },
  { letter: 'M', answer: 'Musa', clue: 'Tur dağında Allahla danışan peyğəmbər', islamic: true },

  { letter: 'N', answer: 'namaz', clue: 'Gündə beş vaxt qılınan ibadət', islamic: true },
  { letter: 'N', answer: 'Nuh', clue: 'Tufandan əvvəl böyük gəmi düzəldən peyğəmbər', islamic: true },
  { letter: 'N', answer: 'nar', clue: 'İçi qırmızı dənələrlə dolu meyvə' },

  { letter: 'O', answer: 'oruc', clue: 'Ramazanda sübhdən axşama qədər yeyib-içməkdən çəkinmək', islamic: true },
  { letter: 'O', answer: 'od', clue: 'Yanan, istilik verən alov' },
  { letter: 'O', answer: 'oyuncaq', clue: 'Uşaqların oynadığı əşya' },

  { letter: 'Ö', answer: 'ördək', clue: 'Suda üzən, enli dimdikli quş' },
  { letter: 'Ö', answer: 'ölkə', clue: 'Öz sərhədi və dövləti olan torpaq' },
  { letter: 'Ö', answer: 'övlad', clue: 'Oğul və ya qız; ata-ananın uşağı' },

  { letter: 'P', answer: 'peyğəmbər', clue: 'Allahın insanlara elçi olaraq göndərdiyi seçilmiş insan', islamic: true },
  { letter: 'P', answer: 'pişik', clue: 'Miyovlayan ev heyvanı' },
  { letter: 'P', answer: 'paltar', clue: 'Bədənimizə geyindiyimiz şeylər' },

  { letter: 'R', answer: 'Ramazan', clue: 'Orucun tutulduğu mübarək ay', islamic: true },
  { letter: 'R', answer: 'rəng', clue: 'Qırmızı, yaşıl, mavi – bunların hər biri nədir?' },
  { letter: 'R', answer: 'ruzi', clue: 'Allahın bəndələrinə verdiyi yemək və nemət', islamic: true },

  { letter: 'S', answer: 'səbr', clue: 'Çətinliyə dözmək, tələsməmək', islamic: true },
  { letter: 'S', answer: 'sədəqə', clue: 'Allah rizası üçün könüllü verilən yardım', islamic: true },
  { letter: 'S', answer: 'su', clue: 'Həyat üçün vacib olan, içdiyimiz maye' },
  { letter: 'S', answer: 'Süleyman', clue: 'Küləyə hökm edən, Davudun oğlu olan peyğəmbər', islamic: true },

  { letter: 'Ş', answer: 'şükür', clue: 'Allaha verdiyi nemətlərə görə minnətdarlıq', islamic: true },
  { letter: 'Ş', answer: 'şəkər', clue: 'Çaya qatılan şirin dənəciklər' },
  { letter: 'Ş', answer: 'şam', clue: 'Yandırılanda işıq verən mum' },

  { letter: 'T', answer: 'Tövrat', clue: 'Musa peyğəmbərə endirilən kitab', islamic: true },
  { letter: 'T', answer: 'təsbeh', clue: 'Zikr edərkən dənələri sayılan muncuq düzümü', islamic: true },
  { letter: 'T', answer: 'tülkü', clue: 'Hiyləgər kimi tanınan, quyruğu qalın heyvan' },

  { letter: 'U', answer: 'ulduz', clue: 'Gecə göydə parıldayan işıqlar' },
  { letter: 'U', answer: 'uşaq', clue: 'Kiçik yaşlı insan' },
  { letter: 'U', answer: 'un', clue: 'Buğdadan üyüdülən, çörək bişirilən ağ toz' },

  { letter: 'Ü', answer: 'üzüm', clue: 'Salxım-salxım bitən meyvə' },
  { letter: 'Ü', answer: 'ürək', clue: 'Qanı bütün bədənə vuran orqan' },
  { letter: 'Ü', answer: 'üzük', clue: 'Barmağa taxılan bəzək' },

  { letter: 'V', answer: 'vətən', clue: 'Doğulub böyüdüyümüz torpaq' },
  { letter: 'V', answer: 'vaxt', clue: 'Zaman; saat onu göstərir' },
  { letter: 'V', answer: 'vəhy', clue: 'Allahın peyğəmbərlərə mələk vasitəsilə göndərdiyi xəbər', islamic: true },

  { letter: 'Y', answer: 'Yusuf', clue: 'Qardaşlarının quyuya atdığı peyğəmbər', islamic: true },
  { letter: 'Y', answer: 'yağış', clue: 'Buludlardan yağan su damcıları' },
  { letter: 'Y', answer: 'Yunus', clue: 'Balığın qarnında qalıb Allaha dua edən peyğəmbər', islamic: true },

  { letter: 'Z', answer: 'zəkat', clue: 'Varlı müsəlmanın malından kasıblara verdiyi vacib pay', islamic: true },
  { letter: 'Z', answer: 'zəmzəm', clue: 'Kəbənin yanındakı mübarək su quyusu', islamic: true },
  { letter: 'Z', answer: 'zürafə', clue: 'Boynu çox uzun olan heyvan' },
];
