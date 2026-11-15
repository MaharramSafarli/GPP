import { router } from 'expo-router';
import { StyleSheet, Text } from 'react-native';

import { Screen } from '@/components/screen';
import { Tile } from '@/components/tile';
import { SECTIONS } from '@/data/catalog';
import { colors, fonts } from '@/theme';

const section = SECTIONS.find((s) => s.id === 'children')!;

export default function ChildrenScreen() {
  return (
    <Screen>
      <Text style={styles.heading}>🎮 Oyunlar</Text>
      {section.games.map((game) => (
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
  heading: { fontSize: 32, fontFamily: fonts.display, color: colors.text, lineHeight: 42 },
});
