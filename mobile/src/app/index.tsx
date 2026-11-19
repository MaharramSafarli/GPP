import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/screen';
import { Tile } from '@/components/tile';
import { GAMES } from '@/data/catalog';
import { colors, fonts } from '@/theme';

/** Home: the games list straight away (no section step). */
export default function HomeScreen() {
  return (
    <Screen>
      <View style={styles.hero}>
        <Text style={styles.wave}>👋</Text>
        <Text style={styles.heading}>Salam!</Text>
        <Text style={styles.sub}>Dua öyrən və ya oyun seç</Text>
      </View>
      <Tile
        emoji="🤲"
        title="Dualar"
        description="Gündəlik dualar: ərəbcə, oxunuşu və mənası ilə"
        color="#2E9E6B"
        onPress={() => router.push('/duas')}
      />
      <Text style={styles.section}>🎮 Oyunlar</Text>
      {GAMES.map((game) => (
        <Tile
          key={game.id}
          emoji={game.emoji}
          title={game.title}
          description={game.description}
          color={game.color}
          onPress={() => router.push(game.href)}
        />
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', marginVertical: 4 },
  wave: { fontSize: 52 },
  heading: { fontSize: 40, fontFamily: fonts.display, color: colors.text, lineHeight: 50 },
  sub: { fontSize: 17, fontFamily: fonts.body, color: colors.muted },
  section: { fontSize: 26, fontFamily: fonts.display, color: colors.text, lineHeight: 34, marginBottom: -4 },
});
