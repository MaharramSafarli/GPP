import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { BigButton } from '@/components/big-button';
import { formatTime } from '@/components/game-top-bar';
import { ModalCard } from '@/components/modal-card';
import { colors, fonts } from '@/theme';

type Props = {
  visible: boolean;
  stars: number;
  seconds: number;
  extra?: string;
  onPlayAgain: () => void;
};

/** "Afərin!" result pop-up shared by the puzzle games. */
export function WinModal({ visible, stars, seconds, extra, onPlayAgain }: Props) {
  return (
    <ModalCard visible={visible} icon="🏅" title="Afərin!" onRequestClose={onPlayAgain}>
      <Text style={styles.stars}>
        {'⭐'.repeat(stars)}
        <Text style={styles.dim}>{'⭐'.repeat(3 - stars)}</Text>
      </Text>
      <View style={styles.timeBox}>
        <Text style={styles.time}>⏳ {formatTime(seconds)}</Text>
        {extra ? <Text style={styles.extra}>{extra}</Text> : null}
      </View>
      <BigButton label="🔁 Yenə oyna" color={colors.correct} onPress={onPlayAgain} />
      <BigButton label="🏠 Oyunlara qayıt" color="#FF7A59" onPress={() => router.dismissTo('/children')} />
    </ModalCard>
  );
}

/** 3 stars when fast, 2 when okay, 1 otherwise. */
export function starsFor(seconds: number, fastLimit: number) {
  if (seconds <= fastLimit) return 3;
  if (seconds <= fastLimit * 2) return 2;
  return 1;
}

const styles = StyleSheet.create({
  stars: { fontSize: 40, textAlign: 'center', letterSpacing: 4 },
  dim: { opacity: 0.2 },
  timeBox: { alignItems: 'center', gap: 2 },
  time: { fontSize: 26, fontFamily: fonts.display, color: colors.text },
  extra: { fontSize: 16, fontFamily: fonts.bold, color: colors.muted },
});
