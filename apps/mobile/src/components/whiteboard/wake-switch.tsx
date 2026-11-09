import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { problemKey, useWake } from '@/lib/whiteboard/wake';

/**
 * The "Listen for Hey Kora" switch, with what Kora is hearing and any problem underneath. `dark` is for
 * the sidebar. Shown only where listening can work (the web version in Chrome or Edge).
 */
export function WakeSwitch({ dark = false }: { dark?: boolean }) {
  const { t } = useTranslation('tutor');
  const { available, on, heard, problem, setOn } = useWake();
  if (!available) return null;
  const text = dark ? '#fff' : Colors.text;
  const soft = dark ? 'rgba(255,255,255,0.7)' : Colors.textSecondary;
  const accent = dark ? '#c9b8ff' : Colors.primary;
  return (
    <View style={{ gap: 4 }}>
      <Pressable
        onPress={() => setOn(!on)}
        accessibilityRole="switch"
        accessibilityState={{ checked: on }}
        accessibilityLabel={t('board.wakeToggle')}
        style={({ hovered }: { hovered?: boolean }) => [
          styles.row,
          dark && styles.darkRow,
          on && (dark ? styles.darkOn : styles.on),
          hovered && dark && !on && { backgroundColor: 'rgba(255,255,255,0.09)' },
        ]}>
        <Ionicons name={on ? 'mic' : 'mic-outline'} size={17} color={on ? Colors.danger : accent} />
        <Text variant="small" color={on ? text : accent} style={{ flexShrink: 1 }}>
          {on ? t('board.wakeOn') : t('board.wakeToggle')}
        </Text>
        {on && <View style={styles.dot} />}
      </Pressable>
      {on && !!heard && (
        <Text variant="small" color={soft} numberOfLines={2} style={styles.note}>
          {t('board.heard', { text: heard })}
        </Text>
      )}
      {!!problem && (
        <Text variant="small" color={dark ? '#ff9aa8' : Colors.danger} style={styles.note}>
          {t(problemKey(problem))}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: Radius.pill,
  },
  on: { backgroundColor: Colors.danger + '14' },
  darkRow: { alignSelf: 'stretch', paddingHorizontal: 8, borderRadius: Radius.sm },
  darkOn: { backgroundColor: 'rgba(255,90,110,0.18)' },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.danger, marginStart: 'auto' },
  note: { paddingHorizontal: Spacing.xs, textAlign: 'center' },
});
