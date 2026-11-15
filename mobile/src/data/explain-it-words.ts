/**
 * "İzah et!" oyunu üçün söz kartları.
 *
 * Hər kartda:
 *  - word:      izah edilməli olan söz
 *  - forbidden: deməsi QADAĞAN olan 5 söz
 *  - category:  mövzu (aşağıdakı CATEGORIES siyahısından)
 *
 * Yeni söz əlavə etmək üçün uyğun bölməyə bir sətir əlavə edin.
 */

export type CategoryId = 'sade' | 'sahabe' | 'peygember' | 'islam' | 'umumi';

export type Category = {
  id: CategoryId;
  title: string;
  emoji: string;
  color: string;
};

export const CATEGORIES: Category[] = [
  { id: 'sade', title: 'Sadə sözlər', emoji: '🍎', color: '#FF7A59' },
  { id: 'umumi', title: 'Ümumi sözlər', emoji: '🎈', color: '#4D96FF' },
  { id: 'sahabe', title: 'Səhabələr', emoji: '🌙', color: '#2BB673' },
  { id: 'peygember', title: 'Peyğəmbərlər', emoji: '📜', color: '#9B5DE5' },
  { id: 'islam', title: 'İslami terminlər', emoji: '🕌', color: '#00A6A6' },
];

export type WordCard = {
  word: string;
  forbidden: [string, string, string, string, string];
  category: CategoryId;
};

type Entry = [word: string, forbidden: [string, string, string, string, string]];

const cards = (category: CategoryId, entries: Entry[]): WordCard[] =>
  entries.map(([word, forbidden]) => ({ word, forbidden, category }));

/** 50 sadə söz */
const SADE: Entry[] = [
  ['Pişik', ['Miyov', 'Quyruq', 'Siçan', 'Bığ', 'Pəncə']],
  ['İt', ['Hav-hav', 'Sümük', 'Quyruq', 'Dost', 'Hürmək']],
  ['Alma', ['Meyvə', 'Qırmızı', 'Ağac', 'Yaşıl', 'Dişləmək']],
  ['Günəş', ['İsti', 'Göy', 'Sarı', 'Gündüz', 'İşıq']],
  ['Ay', ['Gecə', 'Göy', 'Ulduz', 'Yarımay', 'Parlaq']],
  ['Su', ['İçmək', 'Susamaq', 'Stəkan', 'Maye', 'Kran']],
  ['Top', ['Futbol', 'Dəyirmi', 'Oynamaq', 'Atmaq', 'Vurmaq']],
  ['Ev', ['Yaşamaq', 'Otaq', 'Qapı', 'Dam', 'Ailə']],
  ['Ana', ['Ata', 'Qadın', 'Uşaq', 'Sevgi', 'Ailə']],
  ['Ata', ['Ana', 'Kişi', 'Uşaq', 'Ailə', 'Oğul']],
  ['Çörək', ['Un', 'Çörəkçi', 'Yemək', 'Təndir', 'Dilim']],
  ['Süd', ['Ağ', 'İnək', 'İçmək', 'Pendir', 'Qatıq']],
  ['Quş', ['Uçmaq', 'Qanad', 'Lələk', 'Yuva', 'Cik-cik']],
  ['Balıq', ['Su', 'Üzmək', 'Dəniz', 'Qəlsəmə', 'Tilov']],
  ['Ağac', ['Yarpaq', 'Budaq', 'Kök', 'Meşə', 'Yaşıl']],
  ['Gül', ['Çiçək', 'Qoxu', 'Tikan', 'Qırmızı', 'Bağ']],
  ['Maşın', ['Təkər', 'Sürmək', 'Yol', 'Sükan', 'Benzin']],
  ['Kitab', ['Oxumaq', 'Səhifə', 'Kitabxana', 'Hekayə', 'Yazıçı']],
  ['Qələm', ['Yazmaq', 'Mürəkkəb', 'Kağız', 'Dəftər', 'Karandaş']],
  ['Yağış', ['Su', 'Bulud', 'Çətir', 'Islaq', 'Damcı']],
  ['Qar', ['Ağ', 'Qış', 'Soyuq', 'Lopa', 'Kirşə']],
  ['Dovşan', ['Yerkökü', 'Qulaq', 'Tullanmaq', 'Ağ', 'Qorxaq']],
  ['At', ['Minmək', 'Yal', 'Nal', 'Çapmaq', 'Kişnəmək']],
  ['İnək', ['Süd', 'Mö', 'Buynuz', 'Ferma', 'Ot']],
  ['Qoyun', ['Yun', 'Mələmək', 'Çoban', 'Quzu', 'Sürü']],
  ['Toyuq', ['Yumurta', 'Cücə', 'Xoruz', 'Qanad', 'Hin']],
  ['Yumurta', ['Toyuq', 'Ağ', 'Sarı', 'Qabıq', 'Qayğanaq']],
  ['Banan', ['Sarı', 'Meymun', 'Qabıq', 'Meyvə', 'Uzun']],
  ['Kartof', ['Tərəvəz', 'Qızartmaq', 'Torpaq', 'Püre', 'Soymaq']],
  ['Pomidor', ['Qırmızı', 'Tərəvəz', 'Salat', 'Xiyar', 'Ketçup']],
  ['Dondurma', ['Soyuq', 'Şirin', 'Yay', 'Vafli', 'Şokolad']],
  ['Tort', ['Ad günü', 'Şam', 'Şirin', 'Krem', 'Bayram']],
  ['Şokolad', ['Şirin', 'Qəhvəyi', 'Konfet', 'Kakao', 'Plitka']],
  ['Paltar', ['Geyinmək', 'Köynək', 'Şalvar', 'Don', 'Şkaf']],
  ['Ayaqqabı', ['Ayaq', 'Geyinmək', 'Bağ', 'Corab', 'Daban']],
  ['Papaq', ['Baş', 'Qış', 'Geyinmək', 'Günəş', 'Kepka']],
  ['Çanta', ['Məktəb', 'Kitab', 'Daşımaq', 'Kürək', 'Fermuar']],
  ['Saat', ['Vaxt', 'Əqrəb', 'Dəqiqə', 'Zəng', 'Qol']],
  ['Telefon', ['Zəng', 'Ekran', 'Danışmaq', 'Nömrə', 'Mobil']],
  ['Yataq', ['Yatmaq', 'Yastıq', 'Yorğan', 'Gecə', 'Otaq']],
  ['Stol', ['Masa', 'Ayaq', 'Yemək', 'Stul', 'Taxta']],
  ['Stul', ['Oturmaq', 'Ayaq', 'Stol', 'Söykənmək', 'Taxta']],
  ['Qapı', ['Açmaq', 'Bağlamaq', 'Açar', 'Dəstək', 'Giriş']],
  ['Pəncərə', ['Şüşə', 'Pərdə', 'Açmaq', 'Baxmaq', 'Hava']],
  ['Göz', ['Görmək', 'Baxmaq', 'Kirpik', 'Eynək', 'Üz']],
  ['Qulaq', ['Eşitmək', 'Səs', 'Baş', 'Sırğa', 'İki']],
  ['Əl', ['Barmaq', 'Tutmaq', 'Ovuc', 'Beş', 'Əlcək']],
  ['Diş', ['Fırça', 'Ağız', 'Həkim', 'Pasta', 'Dişləmək']],
  ['Dəniz', ['Su', 'Duzlu', 'Dalğa', 'Sahil', 'Üzmək']],
  ['Ulduz', ['Gecə', 'Göy', 'Parlamaq', 'Səma', 'Sayrışmaq']],
];

/** 20 səhabə */
const SAHABE: Entry[] = [
  ['Əbu Bəkr', ['Xəlifə', 'Birinci', 'Siddiq', 'Mağara', 'Aişə']],
  ['Ömər', ['Xəlifə', 'İkinci', 'Ədalət', 'Faruq', 'Qüds']],
  ['Osman', ['Xəlifə', 'Üçüncü', 'Quran', 'Zinnureyn', 'Zəngin']],
  ['Əli', ['Xəlifə', 'Dördüncü', 'Fatimə', 'Həsən', 'Hüseyn']],
  ['Bilal', ['Azan', 'Müəzzin', 'Həbəşistan', 'Qul', 'Əhəd']],
  ['Xədicə', ['Həyat yoldaşı', 'Birinci', 'Ticarət', 'Fatimə', 'Məkkə']],
  ['Aişə', ['Əbu Bəkr', 'Qızı', 'Həyat yoldaşı', 'Hədis', 'Ana']],
  ['Fatimə', ['Qızı', 'Əli', 'Həsən', 'Hüseyn', 'Zəhra']],
  ['Həmzə', ['Əmi', 'Şir', 'Uhud', 'Şəhid', 'Cəsur']],
  ['Xalid ibn Vəlid', ['Qılınc', 'Sərkərdə', 'Döyüş', 'Ordu', 'Qəhrəman']],
  ['Səlman Farsi', ['İran', 'Xəndək', 'Fars', 'Həqiqət', 'Qul']],
  ['Əbu Hureyrə', ['Pişik', 'Hədis', 'Ata', 'Yaddaş', 'Rəvayət']],
  ['Muaz ibn Cəbəl', ['Yəmən', 'Alim', 'Halal', 'Gənc', 'Müəllim']],
  ['Zeyd ibn Harisə', ['Oğulluq', 'Quran', 'Usamə', 'Mutə', 'Sevimli']],
  ['Abdullah ibn Məsud', ['Quran', 'Qiraət', 'Qısa', 'Çoban', 'Alim']],
  ['Abdullah ibn Abbas', ['Əmioğlu', 'Təfsir', 'Alim', 'Gənc', 'Dua']],
  ['Ənəs ibn Malik', ['Xidmət', 'On il', 'Uşaq', 'Hədis', 'Mədinə']],
  ['Əbu Ubeydə', ['Əmin', 'Etibarlı', 'Komandir', 'Şam', 'Cənnət']],
  ['Musab ibn Umeyr', ['Səfir', 'Mədinə', 'Bayraq', 'Zəngin', 'Uhud']],
  ['Sümeyyə', ['Birinci', 'Şəhid', 'Ammar', 'Qadın', 'Səbr']],
];

/** 10 peyğəmbər */
const PEYGEMBER: Entry[] = [
  ['Adəm', ['Birinci', 'İnsan', 'Həvva', 'Cənnət', 'Torpaq']],
  ['Nuh', ['Gəmi', 'Tufan', 'Heyvanlar', 'Su', 'Daşqın']],
  ['İbrahim', ['Od', 'Bütlər', 'Kəbə', 'İsmayıl', 'Qurban']],
  ['İsmayıl', ['İbrahim', 'Qurban', 'Qoç', 'Zəmzəm', 'Kəbə']],
  ['Yusif', ['Quyu', 'Qardaşlar', 'Misir', 'Yuxu', 'Gözəl']],
  ['Musa', ['Firon', 'Dəniz', 'Əsa', 'Misir', 'Tövrat']],
  ['Davud', ['Calut', 'Zəbur', 'Səs', 'Dəmir', 'Padşah']],
  ['Süleyman', ['Qarışqa', 'Quşlar', 'Padşah', 'Külək', 'Cinlər']],
  ['Yunus', ['Balıq', 'Dəniz', 'Qarın', 'Dua', 'Gəmi']],
  ['İsa', ['Məryəm', 'İncil', 'Atasız', 'Möcüzə', 'Göy']],
];

/** 20 islami termin */
const ISLAM: Entry[] = [
  ['Namaz', ['Qılmaq', 'Səcdə', 'Beş', 'Vaxt', 'Məscid']],
  ['Oruc', ['Ramazan', 'Ac', 'Yemək', 'İftar', 'Səhur']],
  ['Zəkat', ['Pul', 'Kasıb', 'Vermək', 'Var-dövlət', 'İl']],
  ['Həcc', ['Məkkə', 'Kəbə', 'Ehram', 'Zəvvar', 'Səfər']],
  ['Kəbə', ['Məkkə', 'Qara', 'Qiblə', 'Təvaf', 'Ev']],
  ['Quran', ['Kitab', 'Oxumaq', 'Surə', 'Ayə', 'Müqəddəs']],
  ['Məscid', ['Namaz', 'Minarə', 'Cümə', 'İmam', 'Bina']],
  ['Azan', ['Müəzzin', 'Çağırış', 'Minarə', 'Namaz', 'Səs']],
  ['Dəstəmaz', ['Su', 'Yumaq', 'Əl', 'Üz', 'Təmiz']],
  ['Ramazan', ['Ay', 'Oruc', 'İftar', 'Bayram', 'Quran']],
  ['Cənnət', ['Bağ', 'Axirət', 'Gözəl', 'Mükafat', 'Cəhənnəm']],
  ['Mələk', ['Qanad', 'Nur', 'Cəbrayıl', 'Göy', 'Görünməz']],
  ['Dua', ['Allah', 'İstəmək', 'Əllər', 'Amin', 'Yalvarmaq']],
  ['Sədəqə', ['Vermək', 'Kasıb', 'Yaxşılıq', 'Pul', 'Kömək']],
  ['Bismillah', ['Başlamaq', 'Allah', 'Ad', 'Söz', 'Yemək']],
  ['Qiblə', ['İstiqamət', 'Kəbə', 'Namaz', 'Məkkə', 'Tərəf']],
  ['Təsbeh', ['Muncuq', 'Zikr', 'Sübhanallah', 'Saymaq', 'Əl']],
  ['İftar', ['Axşam', 'Oruc', 'Yemək', 'Xurma', 'Açmaq']],
  ['Səhur', ['Səhər', 'Erkən', 'Oruc', 'Yemək', 'Qalxmaq']],
  ['Qurban bayramı', ['Qoç', 'Ət', 'Kəsmək', 'Həcc', 'Paylamaq']],
];

/** 100 ümumi söz */
const UMUMI: Entry[] = [
  ['Məktəb', ['Müəllim', 'Dərs', 'Şagird', 'Sinif', 'Oxumaq']],
  ['Müəllim', ['Məktəb', 'Dərs', 'Şagird', 'Öyrətmək', 'Lövhə']],
  ['Həkim', ['Xəstə', 'Xəstəxana', 'Dərman', 'İynə', 'Ağ xalat']],
  ['Polis', ['Oğru', 'Qanun', 'Maşın', 'Fit', 'Forma']],
  ['Aşpaz', ['Yemək', 'Mətbəx', 'Bişirmək', 'Qazan', 'Papaq']],
  ['Velosiped', ['Təkər', 'Pedal', 'Sürmək', 'İki', 'Zəng']],
  ['Təyyarə', ['Uçmaq', 'Pilot', 'Hava limanı', 'Qanad', 'Göy']],
  ['Qatar', ['Vaqon', 'Rels', 'Vağzal', 'Dəmir yolu', 'Maşinist']],
  ['Gəmi', ['Dəniz', 'Kapitan', 'Üzmək', 'Liman', 'Yelkən']],
  ['Avtobus', ['Dayanacaq', 'Sürücü', 'Sərnişin', 'Bilet', 'Yol']],
  ['Fil', ['Xortum', 'Böyük', 'Boz', 'Qulaq', 'Afrika']],
  ['Zürafə', ['Uzun', 'Boyun', 'Ləkə', 'Afrika', 'Hündür']],
  ['Şir', ['Kral', 'Yal', 'Nərilti', 'Pişik', 'Afrika']],
  ['Meymun', ['Banan', 'Ağac', 'Quyruq', 'Tullanmaq', 'Zoopark']],
  ['Ayı', ['Bal', 'Yuxu', 'Qəhvəyi', 'Meşə', 'Böyük']],
  ['Tülkü', ['Hiyləgər', 'Qırmızı', 'Quyruq', 'Toyuq', 'Meşə']],
  ['Canavar', ['Ulamaq', 'Meşə', 'Qoyun', 'Boz', 'Dəstə']],
  ['Dəvə', ['Səhra', 'Hörgüc', 'Su', 'Qum', 'Karvan']],
  ['Tısbağa', ['Yavaş', 'Çanaq', 'Ləng', 'Qabıq', 'Uzun ömür']],
  ['İlan', ['Sürünmək', 'Zəhər', 'Uzun', 'Fısıltı', 'Ayaqsız']],
  ['Kəpənək', ['Qanad', 'Rəngli', 'Çiçək', 'Uçmaq', 'Tırtıl']],
  ['Arı', ['Bal', 'Vızıltı', 'Sancmaq', 'Çiçək', 'Pətək']],
  ['Qarışqa', ['Kiçik', 'Zəhmətkeş', 'Yuva', 'Altı ayaq', 'Çalışqan']],
  ['Hörümçək', ['Tor', 'Səkkiz', 'Ayaq', 'Milçək', 'Toxumaq']],
  ['Pinqvin', ['Qütb', 'Buz', 'Ağ-qara', 'Soyuq', 'Uçmaq']],
  ['Delfin', ['Dəniz', 'Ağıllı', 'Üzmək', 'Tullanmaq', 'Balıq']],
  ['Dinozavr', ['Qədim', 'Nəhəng', 'Sümük', 'Yox olmaq', 'Muzey']],
  ['Hədiyyə', ['Qutu', 'Vermək', 'Bayram', 'Lent', 'Sürpriz']],
  ['Şar', ['Hava', 'Partlamaq', 'Üfürmək', 'Rəngli', 'İp']],
  ['Göy qurşağı', ['Rəng', 'Yeddi', 'Yağış', 'Günəş', 'Qövs']],
  ['Bulud', ['Göy', 'Ağ', 'Yağış', 'Pambıq', 'Hava']],
  ['İldırım', ['Şimşək', 'Gurultu', 'Yağış', 'İşıq', 'Səs']],
  ['Külək', ['Əsmək', 'Hava', 'Soyuq', 'Fırtına', 'Uçurtma']],
  ['Dağ', ['Hündür', 'Zirvə', 'Qar', 'Dırmaşmaq', 'Daş']],
  ['Meşə', ['Ağac', 'Heyvanlar', 'Yaşıl', 'Göbələk', 'Cığır']],
  ['Səhra', ['Qum', 'İsti', 'Dəvə', 'Su', 'Kaktus']],
  ['Ada', ['Su', 'Dəniz', 'Ətraf', 'Okean', 'Sahil']],
  ['Vulkan', ['Lava', 'Od', 'Dağ', 'Püskürmək', 'İsti']],
  ['Kosmos', ['Ulduz', 'Planet', 'Astronavt', 'Raket', 'Ay']],
  ['Raket', ['Kosmos', 'Uçmaq', 'Astronavt', 'Od', 'Sürətli']],
  ['Robot', ['Maşın', 'Dəmir', 'Kompüter', 'Düymə', 'Hərəkət']],
  ['Kompüter', ['Ekran', 'Klaviatura', 'Siçan', 'İnternet', 'Oyun']],
  ['Televizor', ['Ekran', 'Kanal', 'Pult', 'Cizgi filmi', 'Baxmaq']],
  ['Soyuducu', ['Soyuq', 'Yemək', 'Mətbəx', 'Buz', 'Qapı']],
  ['Tozsoran', ['Toz', 'Təmizləmək', 'Səs', 'Xalça', 'Ev']],
  ['Çətir', ['Yağış', 'Açmaq', 'Islanmaq', 'Tutmaq', 'Günəş']],
  ['Eynək', ['Göz', 'Görmək', 'Şüşə', 'Burun', 'Taxmaq']],
  ['Diş fırçası', ['Diş', 'Pasta', 'Səhər', 'Ağız', 'Təmizləmək']],
  ['Sabun', ['Əl', 'Yumaq', 'Köpük', 'Su', 'Təmiz']],
  ['Güzgü', ['Baxmaq', 'Üz', 'Şüşə', 'Əks', 'Daranmaq']],
  ['Açar', ['Qapı', 'Kilid', 'Açmaq', 'Bağlamaq', 'Dəmir']],
  ['Qayçı', ['Kəsmək', 'Kağız', 'İti', 'Saç', 'Dəmir']],
  ['Kitabxana', ['Kitab', 'Oxumaq', 'Rəf', 'Sakit', 'Götürmək']],
  ['Xəstəxana', ['Həkim', 'Xəstə', 'Tibb bacısı', 'Yataq', 'Dərman']],
  ['Park', ['Ağac', 'Skamya', 'Gəzmək', 'Yelləncək', 'Yaşıl']],
  ['Zoopark', ['Heyvanlar', 'Qəfəs', 'Şir', 'Fil', 'Baxmaq']],
  ['Bazar', ['Almaq', 'Satmaq', 'Meyvə', 'Pul', 'Tərəvəz']],
  ['Futbol', ['Top', 'Qapı', 'Qol', 'Komanda', 'Oyunçu']],
  ['Basketbol', ['Top', 'Səbət', 'Hündür', 'Komanda', 'Atmaq']],
  ['Üzgüçülük', ['Su', 'Hovuz', 'Dəniz', 'Qollar', 'İdman']],
  ['Yelləncək', ['Park', 'Yellənmək', 'İrəli', 'Geri', 'Oturmaq']],
  ['Kukla', ['Qız', 'Oyuncaq', 'Paltar', 'Saç', 'Oynamaq']],
  ['Oyuncaq', ['Oynamaq', 'Uşaq', 'Kukla', 'Maşın', 'Mağaza']],
  ['Tapmaca', ['Tapmaq', 'Sual', 'Cavab', 'Fikirləşmək', 'Bilmək']],
  ['Nağıl', ['Danışmaq', 'Nənə', 'Qəhrəman', 'Biri vardı', 'Yatmaq']],
  ['Mahnı', ['Oxumaq', 'Musiqi', 'Söz', 'Səs', 'Müğənni']],
  ['Rəsm', ['Çəkmək', 'Boya', 'Fırça', 'Kağız', 'Rəssam']],
  ['Nənə', ['Baba', 'Ana', 'Qoca', 'Nağıl', 'Nəvə']],
  ['Baba', ['Nənə', 'Ata', 'Qoca', 'Nəvə', 'Saqqal']],
  ['Qardaş', ['Bacı', 'Oğlan', 'Ailə', 'Böyük', 'Kiçik']],
  ['Bacı', ['Qardaş', 'Qız', 'Ailə', 'Böyük', 'Kiçik']],
  ['Dost', ['Yoldaş', 'Oynamaq', 'Sevmək', 'Yaxın', 'Kömək']],
  ['Körpə', ['Kiçik', 'Ağlamaq', 'Əmzik', 'Beşik', 'Uşaq']],
  ['Qarpız', ['Yaşıl', 'Qırmızı', 'Yay', 'Tum', 'Böyük']],
  ['Üzüm', ['Salxım', 'Meyvə', 'Şirin', 'Gilə', 'Bağ']],
  ['Limon', ['Turş', 'Sarı', 'Çay', 'Meyvə', 'Sitrus']],
  ['Portağal', ['Narıncı', 'Şirə', 'Meyvə', 'Dilim', 'Qabıq']],
  ['Çiyələk', ['Qırmızı', 'Kiçik', 'Meyvə', 'Mürəbbə', 'Yaz']],
  ['Yerkökü', ['Narıncı', 'Tərəvəz', 'Dovşan', 'Torpaq', 'Göz']],
  ['Bal', ['Arı', 'Şirin', 'Sarı', 'Pətək', 'Ayı']],
  ['Pendir', ['Süd', 'Ağ', 'Səhər yeməyi', 'Çörək', 'Duzlu']],
  ['Plov', ['Düyü', 'Bayram', 'Qazan', 'Ət', 'Zəfəran']],
  ['Dolma', ['Yarpaq', 'Ət', 'Bükmək', 'Kələm', 'Düyü']],
  ['Şəkərbura', ['Novruz', 'Şirin', 'Qoz', 'Xəmir', 'Naxış']],
  ['Novruz', ['Bayram', 'Yaz', 'Tonqal', 'Səməni', 'Çərşənbə']],
  ['Səməni', ['Novruz', 'Yaşıl', 'Buğda', 'Lent', 'Göyərmək']],
  ['Qış', ['Qar', 'Soyuq', 'Fəsil', 'Dekabr', 'Şaxta']],
  ['Yay', ['İsti', 'Tətil', 'Dəniz', 'Fəsil', 'Günəş']],
  ['Payız', ['Yarpaq', 'Sarı', 'Fəsil', 'Yağış', 'Sentyabr']],
  ['Yaz', ['Çiçək', 'Yaşıl', 'Fəsil', 'Novruz', 'Mart']],
  ['Səhər', ['Oyanmaq', 'Günəş', 'Erkən', 'Gün', 'Xoruz']],
  ['Gecə', ['Qaranlıq', 'Ay', 'Ulduz', 'Yatmaq', 'Yuxu']],
  ['Yuxu', ['Yatmaq', 'Gecə', 'Görmək', 'Yataq', 'Gözlər']],
  ['Uçurtma', ['Külək', 'Uçmaq', 'İp', 'Göy', 'Quyruq']],
  ['Qar adamı', ['Qış', 'Yerkökü', 'Kürə', 'Burun', 'Soyuq']],
  ['Ad günü', ['Tort', 'Hədiyyə', 'Şam', 'Yaş', 'Bayram']],
  ['Yanğınsöndürən', ['Od', 'Su', 'Maşın', 'Yanğın', 'Şlanq']],
  ['Poçtalyon', ['Məktub', 'Poçt', 'Çanta', 'Gətirmək', 'Zərf']],
  ['Bağban', ['Ağac', 'Bağ', 'Su', 'Gül', 'Bel']],
  ['Fermer', ['Kənd', 'Torpaq', 'Heyvanlar', 'Traktor', 'Əkmək']],
];

export const EXPLAIN_IT_WORDS: WordCard[] = [
  ...cards('sade', SADE),
  ...cards('sahabe', SAHABE),
  ...cards('peygember', PEYGEMBER),
  ...cards('islam', ISLAM),
  ...cards('umumi', UMUMI),
];
