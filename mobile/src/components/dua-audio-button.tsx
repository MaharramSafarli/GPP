import { useAudioPlayer, useAudioPlayerStatus, type AudioSource } from 'expo-audio';
import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { stopSpeaking } from '@/lib/sound';
import { colors, fonts } from '@/theme';

/** Play / pause for one dua recording, or a "coming soon" note when there is none yet. */
export function DuaAudioButton({ source, color }: { source?: AudioSource; color: string }) {
  if (!source) {
    return (
      <View style={[styles.button, styles.soon]}>
        <Text style={styles.soonText}>🔈 Səs tezliklə əlavə olunacaq</Text>
      </View>
    );
  }
  return <Player source={source} color={color} />;
}

function Player({ source, color }: { source: AudioSource; color: string }) {
  const player = useAudioPlayer(source);
  const status = useAudioPlayerStatus(player);

  useEffect(() => {
    if (status.didJustFinish) {
      try {
        player.seekTo(0);
      } catch {}
    }
  }, [status.didJustFinish, player]);

  const toggle = () => {
    try {
      stopSpeaking();
      if (status.playing) player.pause();
      else player.play();
    } catch {
      // Audio is optional; never crash.
    }
  };

  return (
    <Pressable
      accessibilityRole="button"
      onPress={toggle}
      style={({ pressed }) => [styles.button, { backgroundColor: color }, pressed && { transform: [{ scale: 0.96 }] }]}>
      <Text style={styles.text}>{status.playing ? '⏸ Dayandır' : '▶️ Dinlə'}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 9,
  },
  text: { fontSize: 17, fontFamily: fonts.display, color: '#fff' },
  soon: { backgroundColor: '#F1EEFB' },
  soonText: { fontSize: 14, fontFamily: fonts.bold, color: colors.muted },
});
