import { Image } from 'expo-image';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui';
import { Colors, Radius, Spacing } from '@/constants/theme';
import type { Card } from '@/lib/studio/types';

/**
 * A flashcard's picture (textbook packs): a real photo or labelled diagram from Wikimedia Commons,
 * credited as its licence requires, or a realistic AI picture. Shown whole ("contain") so a
 * diagram's labels are never cropped, on white so transparent drawings stay readable. Tap to see
 * it larger.
 */
export function CardPicture({ card, height = 180, onLight }: { card: Card; height?: number; onLight?: boolean }) {
  const { t } = useTranslation('study');
  const { t: tc } = useTranslation('common');
  const [open, setOpen] = useState(false);
  if (!card.image) return null;
  const credit = card.credit ? t('flashcards.photoCredit', { author: card.credit.author, license: card.credit.license }) : null;
  return (
    <View style={styles.wrap}>
      {/* Full width: the picture sizes itself from this box (an unsized box would shrink it to nothing). */}
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="imagebutton"
        accessibilityLabel={t('flashcards.pictureA11y')}
        style={styles.tap}>
        <Image source={{ uri: card.image }} style={[styles.picture, { height }]} contentFit="contain" transition={200} />
      </Pressable>
      {credit && (
        <Text variant="small" numberOfLines={1} color={onLight ? 'rgba(255,255,255,0.85)' : Colors.textMuted} style={styles.credit}>
          {credit}
        </Text>
      )}
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable
          style={styles.backdrop}
          onPress={() => setOpen(false)}
          accessibilityRole="button"
          accessibilityLabel={tc('actions.close')}>
          <Image source={{ uri: card.image }} style={styles.large} contentFit="contain" />
          {credit && (
            <Text variant="small" color="rgba(255,255,255,0.85)" center>
              {credit}
            </Text>
          )}
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: '100%', gap: 4, alignItems: 'center' },
  picture: { width: '100%', borderRadius: Radius.md, backgroundColor: '#fff' },
  tap: { width: '100%', maxWidth: 480, alignSelf: 'center' },
  credit: { fontSize: 11, width: '100%', maxWidth: 480, textAlign: 'center' },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(4, 6, 20, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  large: { width: '100%', maxWidth: 900, aspectRatio: 1, maxHeight: '85%', borderRadius: Radius.md, backgroundColor: '#fff' },
});
