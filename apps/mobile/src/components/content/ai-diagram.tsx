import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { Button, Card, Text } from '@/components/ui';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useSession } from '@/lib/session';

export type DrawResult = 'ok' | 'error' | 'no-credits' | 'unavailable';

type Props = {
  /** The drawing, once made. */
  image?: string;
  /** False where drawing isn't possible (the offline demo). */
  canDraw: boolean;
  onDraw: () => Promise<DrawResult>;
};

/**
 * A diagram drawn by AI on request (tutor answers, study packs). Each new drawing uses 1 AI credit,
 * refunded if it fails; once drawn it's kept and shown here.
 */
export function AiDiagram({ image, canDraw, onDraw }: Props) {
  const { t } = useTranslation('tutor');
  const { user } = useSession();
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<DrawResult | null>(null);

  if (image) {
    return (
      <Card style={{ gap: Spacing.xs, padding: Spacing.sm }}>
        <Image
          source={{ uri: image }}
          style={styles.image}
          contentFit="contain"
          accessibilityLabel={t('diagram.alt')}
          transition={200}
        />
        <Text variant="small" color={Colors.textMuted} center style={{ fontSize: 12 }}>
          {t('diagram.caption')}
        </Text>
      </Card>
    );
  }
  if (!canDraw) return null;

  const credits = user?.aiCredits ?? 0;
  const draw = async () => {
    setBusy(true);
    setResult(null);
    setResult(await onDraw());
    setBusy(false);
  };

  return (
    <Card style={{ gap: Spacing.sm }}>
      <View style={styles.row}>
        <View style={styles.icon}>
          <Ionicons name="image" size={20} color={Colors.primary} />
        </View>
        <View style={{ flex: 1, gap: 2 }}>
          <Text variant="bodyStrong">{t('diagram.title')}</Text>
          <Text variant="small" color={Colors.textSecondary}>
            {busy ? t('diagram.drawing') : t('diagram.body', { credits })}
          </Text>
        </View>
      </View>
      {result === 'error' && (
        <Text variant="small" color={Colors.danger} accessibilityLiveRegion="polite">
          {t('diagram.failed')}
        </Text>
      )}
      {result === 'no-credits' || (credits < 1 && !busy) ? (
        <>
          <Text variant="small" color={Colors.textSecondary}>
            {t('diagram.noCredits')}
          </Text>
          <Button variant="secondary" icon="gift" title={t('diagram.getCredits')} onPress={() => router.push('/referrals')} />
        </>
      ) : (
        <Button variant="secondary" icon="color-palette" title={t('diagram.draw')} loading={busy} onPress={draw} />
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  image: { width: '100%', aspectRatio: 1, borderRadius: Radius.md, backgroundColor: '#fff' },
  row: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'center' },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary + '22',
  },
});
