import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/screen';
import { Tile } from '@/components/tile';
import { SECTIONS } from '@/data/catalog';
import { colors, fonts } from '@/theme';

export default function HomeScreen() {
  return (
    <Screen>
      <View style={styles.hero}>
        <Text style={styles.wave}>👋</Text>
        <Text style={styles.heading}>Salam!</Text>
        <Text style={styles.sub}>Bölməni seç və oynamağa başla</Text>
      </View>
      {SECTIONS.map((section) => (
        <Tile
          key={section.id}
          emoji={section.emoji}
          title={section.title}
          description={section.href ? section.description : 'Tezliklə'}
          color={section.color}
          disabled={!section.href}
          onPress={() => section.href && router.push(section.href)}
        />
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', marginVertical: 8 },
  wave: { fontSize: 56 },
  heading: { fontSize: 40, fontFamily: fonts.display, color: colors.text, lineHeight: 50 },
  sub: { fontSize: 17, fontFamily: fonts.body, color: colors.muted },
});
