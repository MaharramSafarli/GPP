import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { RoundButton } from '@/components/controls';
import { useSettings } from '@/lib/settings';
import { playSound, stopMusic, stopSpeaking } from '@/lib/sound';
import { colors, fonts } from '@/theme';

export function formatTime(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/** Home button · optional timer · sound on/off, for the puzzle games. */
export function GameTopBar({ seconds, title }: { seconds?: number; title: string }) {
  const insets = useSafeAreaInsets();
  const { settings, update } = useSettings();
  const soundOn = settings.sfx;

  return (
    <View style={{ marginTop: insets.top, gap: 6 }}>
      <View style={styles.row}>
        <RoundButton
          icon="🏠"
          label="Ana səhifə"
          color="#FF7A59"
          onPress={() => {
            stopMusic();
            stopSpeaking();
            router.dismissTo('/');
          }}
        />
        {seconds !== undefined ? (
          <View style={styles.timer}>
            <Text style={styles.timerText}>⏱ {formatTime(seconds)}</Text>
          </View>
        ) : (
          <View />
        )}
        <RoundButton
          icon={soundOn ? '🔊' : '🔇'}
          label={soundOn ? 'Səsi bağla' : 'Səsi aç'}
          color={colors.skip}
          onPress={() => {
            update({ sfx: !soundOn });
            if (!soundOn) playSound('tap', true);
            else stopSpeaking();
          }}
        />
      </View>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  timer: {
    backgroundColor: '#fff',
    borderRadius: 999,
    borderWidth: 3,
    borderColor: colors.text,
    paddingHorizontal: 14,
    paddingVertical: 2,
  },
  timerText: { fontSize: 18, fontFamily: fonts.bold, color: colors.text, fontVariant: ['tabular-nums'] },
  title: {
    fontSize: 26,
    fontFamily: fonts.display,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 34,
  },
});
