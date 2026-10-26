import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { Text } from '@/components/ui';
import { Colors, Fonts, NoWebOutline, Radius, Spacing } from '@/constants/theme';

type Props = {
  conversationId: string;
  onSend: (text: string) => void;
  disabled?: boolean;
  remaining: number;
  limit: number;
};

/** Message box with attach (photo / page upload) and the remaining daily questions. */
export function Composer({ conversationId, onSend, disabled, remaining, limit }: Props) {
  const { t } = useTranslation('tutor');
  const [text, setText] = useState('');
  const [attachOpen, setAttachOpen] = useState(false);
  const canSend = !!text.trim() && !disabled;

  const send = () => {
    if (!canSend) return;
    onSend(text.trim());
    setText('');
  };

  return (
    <View style={{ gap: 6 }}>
      {attachOpen && (
        <Animated.View entering={FadeIn.duration(150)} style={styles.attachMenu}>
          <AttachOption
            icon="camera"
            label={t('composer.photo')}
            onPress={() => {
              setAttachOpen(false);
              router.push({ pathname: '/tutor/scan', params: { c: conversationId } });
            }}
          />
          <AttachOption
            icon="document-attach"
            label={t('composer.upload')}
            onPress={() => {
              setAttachOpen(false);
              router.push({ pathname: '/tutor/upload', params: { c: conversationId } });
            }}
          />
        </Animated.View>
      )}
      <View style={styles.box}>
        <Pressable
          onPress={() => setAttachOpen((o) => !o)}
          accessibilityRole="button"
          accessibilityLabel={t('composer.attach')}
          style={styles.attach}>
          <Ionicons name={attachOpen ? 'close' : 'add'} size={22} color={Colors.text} />
        </Pressable>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder={t('composer.placeholder')}
          placeholderTextColor={Colors.textMuted}
          selectionColor={Colors.primary}
          multiline
          accessibilityLabel={t('composer.inputLabel')}
          style={styles.input}
          onSubmitEditing={send}
          blurOnSubmit={false}
        />
        <Pressable
          onPress={send}
          disabled={!canSend}
          accessibilityRole="button"
          accessibilityLabel={t('composer.send')}
          style={[styles.send, !canSend && { opacity: 0.4 }]}>
          <Ionicons name="arrow-up" size={20} color={Colors.textOnAccent} />
        </Pressable>
      </View>
      <Text variant="small" color={remaining <= 3 ? Colors.reward : Colors.textMuted} center style={{ fontSize: 12 }}>
        {t('composer.footer', { remaining, limit })}
      </Text>
    </View>
  );
}

function AttachOption({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} style={styles.option}>
      <Ionicons name={icon} size={18} color={Colors.primary} />
      <Text variant="small">{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  box: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.xs,
    padding: Spacing.xs,
    borderRadius: Radius.lg,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
  },
  attach: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surfaceRaised,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    ...NoWebOutline,
    flex: 1,
    color: Colors.text,
    fontFamily: Fonts.regular,
    fontSize: 16,
    maxHeight: 120,
    paddingHorizontal: Spacing.xs,
    paddingVertical: 10,
  },
  send: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  attachMenu: { flexDirection: 'row', gap: Spacing.xs },
  option: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: Spacing.sm,
    borderRadius: Radius.md,
    backgroundColor: Colors.surfaceRaised,
    borderWidth: 1,
    borderColor: Colors.border,
  },
});
