import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text } from 'react-native';

import { Tile } from '@/components/tile';
import { SECTIONS } from '@/data/catalog';
import { colors } from '@/theme';

const section = SECTIONS.find((s) => s.id === 'children')!;

export default function ChildrenScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Games</Text>
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 16 },
  heading: { fontSize: 28, fontWeight: '800', color: colors.text, marginBottom: 4 },
});
