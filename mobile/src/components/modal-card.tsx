import type { ReactNode } from 'react';
import { Modal, ScrollView, StyleSheet, Text, View } from 'react-native';

import { colors, fonts } from '@/theme';

type Props = {
  visible: boolean;
  icon: string;
  title: string;
  children: ReactNode;
  onRequestClose?: () => void;
};

/** A white rounded pop-up with a round icon badge on top, used for settings, pause, results. */
export function ModalCard({ visible, icon, title, children, onRequestClose }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onRequestClose}>
      <View style={styles.backdrop}>
        <View style={styles.wrap}>
          <View style={styles.card}>
            <ScrollView contentContainerStyle={styles.content} bounces={false}>
              <Text style={styles.title}>{title}</Text>
              {children}
            </ScrollView>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeIcon}>{icon}</Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(30, 20, 70, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  wrap: { width: '100%', maxWidth: 440, maxHeight: '92%', paddingTop: 34 },
  card: {
    backgroundColor: colors.card,
    borderRadius: 30,
    borderBottomWidth: 8,
    borderBottomColor: '#D9D0FF',
    overflow: 'hidden',
  },
  content: { padding: 20, paddingTop: 44, gap: 14 },
  badge: {
    position: 'absolute',
    top: 0,
    alignSelf: 'center',
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#E9E3FF',
  },
  badgeIcon: { fontSize: 32 },
  title: {
    fontSize: 28,
    fontFamily: fonts.display,
    color: colors.primary,
    textAlign: 'center',
    lineHeight: 36,
  },
});
