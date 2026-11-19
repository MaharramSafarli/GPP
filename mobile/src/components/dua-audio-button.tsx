import { useAudioPlayer, useAudioPlayerStatus, type AudioSource } from 'expo-audio';
import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { stopSpeaking } from '@/lib/sound';
import { colors, fonts } from '@/theme';

/** Play / pause for one dua recording, or a "coming soon" note when there is none yet. */
export function DuaAudioButton({ source, color, label }: { source?: AudioSource; color: string; label: string }) {
  if (!source) {
    return (
      <View style={[styles.button, styles.soon]}>
        <Text style={styles.soonText}>🔈 Səs tezliklə</Text>
      </View>
    );
  }
  return <Player source={source} color={color} label={label} />;
}

function Player({ source, color, label }: { source: AudioSource; color: string; label: string }) {
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
      else {
        player.seekTo(0);
        player.play();
      }
    } catch {
      // Audio is optional; never crash.
    }
  };

  return (
    <Pressable
      accessibilityRole="button"
      onPress={toggle}
      style={({ pressed }) => [styles.button, { backgroundColor: color }, pressed && { transform: [{ scale: 0.96 }] }]}>
      <Text style={styles.text}>{status.playing ? '⏸ Dayandır' : `▶️ ${label}`}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  text: { fontSize: 16, fontFamily: fonts.display, color: '#fff' },
  soon: { backgroundColor: '#F1EEFB' },
  soonText: { fontSize: 14, fontFamily: fonts.bold, color: colors.muted },
});
