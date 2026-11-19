import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { DuaScene } from '@/components/dua-scene';
import { Screen } from '@/components/screen';
import { DUAS } from '@/data/duas';
import { playSound } from '@/lib/sound';
import { colors, fonts } from '@/theme';

export default function DuaList() {
  return (
    <Screen>
      <View style={styles.hero}>
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={styles.heroTitle}>Gündəlik dualar</Text>
          <Text style={styles.heroSub}>Oyananda, yeyəndə, evdən çıxanda… Hər gün deyəcəyimiz gözəl dualar.</Text>
        </View>
        <Text style={styles.heroEmoji}>🤲</Text>
      </View>
      <View style={styles.grid}>
        {DUAS.map((d) => (
          <Pressable
            key={d.id}
            accessibilityRole="button"
            onPress={() => {
              playSound('tap');
              router.push({ pathname: '/duas/[id]', params: { id: d.id } });
            }}
            style={({ pressed }) => [styles.card, { borderColor: d.color }, pressed && { transform: [{ scale: 0.96 }] }]}>
            <DuaScene scene={d.scene} color={d.color} size={0.6} />
            <Text style={styles.cardTitle} numberOfLines={2}>
              {d.title}
            </Text>
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2E9E6B',
    borderRadius: 26,
    padding: 18,
    borderWidth: 4,
    borderColor: '#fff',
  },
  heroTitle: { fontSize: 28, fontFamily: fonts.display, color: '#fff', lineHeight: 36 },
  heroSub: { fontSize: 15, fontFamily: fonts.body, color: '#fff', lineHeight: 20 },
  heroEmoji: { fontSize: 56 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card: {
    width: '47%',
    flexGrow: 1,
    backgroundColor: colors.card,
    borderRadius: 22,
    borderWidth: 3,
    borderBottomWidth: 7,
    padding: 8,
    gap: 8,
  },
  cardTitle: { fontSize: 16, fontFamily: fonts.display, color: colors.text, textAlign: 'center', lineHeight: 22, minHeight: 44 },
});
