import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { BigButton } from '@/components/big-button';
import { ExplainSettingsModal } from '@/components/explain-settings';
import { ModalCard } from '@/components/modal-card';
import { Screen } from '@/components/screen';
import { playSound } from '@/lib/sound';
import { colors, fonts } from '@/theme';

const RULES = [
  '👥 İki komanda növbə ilə oynayır.',
  '📱 Bir oyunçu telefonu tutur və sözü öz komandasına izah edir.',
  '🚫 Sözün özünü və 5 qadağan sözü demək olmaz!',
  '✅ Düzgün tapılan söz +1 xal, qadağan söz deyilsə −1 xal.',
  '⏭️ Çətin sözü pas keçə bilərsən, amma pas haqqı məhduddur.',
  '⏸️ Oyunu istənilən vaxt dayandıra bilərsən.',
];

export default function ExplainItMenu() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [rulesOpen, setRulesOpen] = useState(false);

  return (
    <Screen>
      <View style={styles.hero}>
        <Text style={styles.heroEmoji}>💬💡</Text>
        <Text style={styles.title}>İzah et!</Text>
        <Text style={styles.sub}>Sözü izah et, qadağan sözləri demə!</Text>
      </View>

      <View style={styles.menu}>
        <BigButton
          label="▶ Oyuna başla"
          color={colors.skip}
          onPress={() => {
            playSound('tap');
            router.push('/children/explain-it/setup');
          }}
        />
        <BigButton
          label="⚙️ Ayarlar"
          color={colors.primary}
          onPress={() => {
            playSound('tap');
            setSettingsOpen(true);
          }}
        />
        <BigButton
          label="❓ Necə oynanılır?"
          color="#4D96FF"
          onPress={() => {
            playSound('tap');
            setRulesOpen(true);
          }}
        />
      </View>

      <ExplainSettingsModal visible={settingsOpen} onClose={() => setSettingsOpen(false)} />

      <ModalCard
        visible={rulesOpen}
        icon="❓"
        title="Necə oynanılır?"
        onRequestClose={() => setRulesOpen(false)}>
        {RULES.map((r) => (
          <Text key={r} style={styles.rule}>
            {r}
          </Text>
        ))}
        <BigButton label="Anladım!" color={colors.correct} onPress={() => setRulesOpen(false)} />
      </ModalCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', marginTop: 24, marginBottom: 24 },
  heroEmoji: { fontSize: 72 },
  title: { fontSize: 56, fontFamily: fonts.display, color: colors.primary, lineHeight: 68 },
  sub: { fontSize: 17, fontFamily: fonts.body, color: colors.muted, textAlign: 'center' },
  menu: { gap: 14, paddingHorizontal: 12 },
  rule: { fontSize: 17, fontFamily: fonts.body, color: colors.text, lineHeight: 24 },
});
