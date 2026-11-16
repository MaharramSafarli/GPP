import Slider from '@react-native-community/slider';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';

import { playSound } from '@/lib/sound';
import { colors, fonts } from '@/theme';

export function SliderRow({
  icon,
  label,
  value,
  unit = '',
  min,
  max,
  step = 1,
  onChange,
}: {
  icon: string;
  label: string;
  value: number;
  unit?: string;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
}) {
  return (
    <View style={styles.block}>
      <View style={styles.row}>
        <Text style={styles.label}>
          {icon} {label}
        </Text>
        <View style={styles.valueBox}>
          <Text style={styles.value}>
            {value}
            {unit}
          </Text>
        </View>
      </View>
      <Slider
        value={value}
        minimumValue={min}
        maximumValue={max}
        step={step}
        onValueChange={(v) => onChange(Math.round(v))}
        minimumTrackTintColor={colors.primary}
        maximumTrackTintColor="#DCD6F7"
        thumbTintColor={colors.primary}
      />
    </View>
  );
}

export function ToggleRow({
  icon,
  label,
  value,
  onChange,
}: {
  icon: string;
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>
        {icon} {label}
      </Text>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: '#DCD6F7', true: colors.primary }}
        thumbColor="#fff"
      />
    </View>
  );
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { id: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <View style={styles.segment}>
      {options.map((o) => {
        const on = o.id === value;
        return (
          <Pressable
            key={o.id}
            accessibilityRole="radio"
            accessibilityState={{ selected: on }}
            onPress={() => {
              playSound('tap');
              onChange(o.id);
            }}
            style={[styles.segItem, on && styles.segItemOn]}>
            <Text style={[styles.segText, on && styles.segTextOn]}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/** A small round button with an emoji, e.g. pause, home, sound. */
export function RoundButton({
  icon,
  onPress,
  label,
  color = colors.card,
}: {
  icon: string;
  onPress: () => void;
  label: string;
  color?: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      hitSlop={8}
      style={({ pressed }) => [styles.round, { backgroundColor: color }, pressed && styles.pressed]}>
      <Text style={styles.roundIcon}>{icon}</Text>
    </Pressable>
  );
}

/** Round toggle used in the pause menu (music / sound / vibration). */
export function IconToggle({
  icon,
  label,
  value,
  onChange,
}: {
  icon: string;
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      accessibilityLabel={label}
      onPress={() => onChange(!value)}
      style={styles.iconToggle}>
      <View style={[styles.iconCircle, !value && styles.iconCircleOff]}>
        <Text style={[styles.iconToggleIcon, !value && { opacity: 0.35 }]}>{icon}</Text>
        {!value && <View style={styles.strike} />}
      </View>
      <Text style={styles.iconToggleLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  block: { gap: 2 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  label: { fontSize: 17, fontFamily: fonts.bold, color: colors.text, flexShrink: 1 },
  valueBox: {
    borderWidth: 2,
    borderColor: '#E9E3FF',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 2,
    minWidth: 64,
    alignItems: 'center',
  },
  value: { fontSize: 16, fontFamily: fonts.bold, color: colors.primary },
  segment: { flexDirection: 'row', backgroundColor: '#F1EEFF', borderRadius: 16, padding: 4 },
  segItem: { flex: 1, paddingVertical: 10, borderRadius: 12, alignItems: 'center' },
  segItemOn: { backgroundColor: colors.primary },
  segText: { fontSize: 15, fontFamily: fonts.bold, color: colors.muted },
  segTextOn: { color: '#fff' },
  round: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 4,
    borderBottomColor: 'rgba(0,0,0,0.15)',
  },
  pressed: { transform: [{ scale: 0.92 }] },
  roundIcon: { fontSize: 24 },
  iconToggle: { alignItems: 'center', gap: 4, minWidth: 72 },
  iconCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircleOff: { backgroundColor: '#E6E2F5' },
  iconToggleIcon: { fontSize: 26 },
  strike: {
    position: 'absolute',
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.foul,
    transform: [{ rotate: '-45deg' }],
  },
  iconToggleLabel: { fontSize: 14, fontFamily: fonts.bold, color: colors.muted },
});
