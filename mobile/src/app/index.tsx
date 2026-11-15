import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text } from 'react-native';

import { Tile } from '@/components/tile';
import { SECTIONS } from '@/data/catalog';
import { colors } from '@/theme';

export default function HomeScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Choose a section</Text>
      {SECTIONS.map((section) => (
        <Tile
          key={section.id}
          emoji={section.emoji}
          title={section.title}
          description={section.href ? section.description : 'Coming soon'}
          color={section.color}
          disabled={!section.href}
          onPress={() => section.href && router.push(section.href)}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 16 },
  heading: { fontSize: 28, fontWeight: '800', color: colors.text, marginBottom: 4 },
});
