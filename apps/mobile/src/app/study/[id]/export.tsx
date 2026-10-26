import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, Pressable, Share, StyleSheet, View } from 'react-native';

import { AuthScreen } from '@/components/auth/auth-screen';
import { ReadyMaterial } from '@/components/materials/ready-material';
import { ChoiceChip, ChipWrap } from '@/components/personalize/choice-chip';
import { Card, Text } from '@/components/ui';
import { Colors, Palette, Radius, Spacing } from '@/constants/theme';
import { useFlipStyle } from '@/i18n/provider';
import { toggleIn } from '@/lib/personalization';
import { toHtml, toText, type ExportPart } from '@/lib/studio/export';

// Labels live in the `study` namespace under export.parts.
const PARTS: ExportPart[] = ['summary', 'notes', 'concepts', 'points', 'flashcards', 'quiz'];

/** Screen 83: export or share a study pack as PDF, text or a link. */
export default function ExportScreen() {
  const { t } = useTranslation('study');
  const flip = useFlipStyle();
  const [parts, setParts] = useState<ExportPart[]>(['summary', 'notes', 'concepts', 'points']);
  const [done, setDone] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  return (
    <ReadyMaterial>
      {(m) => {
        const flash = (msg: string) => {
          setDone(msg);
          setTimeout(() => setDone(null), 2200);
        };
        const run = async (id: string, fn: () => Promise<void>) => {
          setBusy(id);
          try {
            await fn();
          } catch {
            flash(t('export.failed'));
          } finally {
            setBusy(null);
          }
        };

        const actions = [
          {
            id: 'pdf',
            icon: 'document' as const,
            color: Palette.coral400,
            title: t('export.pdf.title'),
            body: t('export.pdf.body'),
            go: () =>
              run('pdf', async () => {
                const html = toHtml(m, parts);
                if (Platform.OS === 'web') {
                  await Print.printAsync({ html });
                } else {
                  const { uri } = await Print.printToFileAsync({ html });
                  if (await Sharing.isAvailableAsync())
                    await Sharing.shareAsync(uri, {
                      mimeType: 'application/pdf',
                      dialogTitle: m.title,
                      UTI: 'com.adobe.pdf',
                    });
                }
                flash(t('export.pdf.done'));
              }),
          },
          {
            id: 'share',
            icon: 'share-social' as const,
            color: Palette.teal400,
            title: t('export.share.title'),
            body: t('export.share.body'),
            go: () => run('share', async () => void (await Share.share({ title: m.title, message: toText(m, parts) }))),
          },
          {
            id: 'copy',
            icon: 'copy' as const,
            color: Palette.purple300,
            title: t('export.copy.title'),
            body: t('export.copy.body'),
            go: () =>
              run('copy', async () => {
                await Clipboard.setStringAsync(toText(m, parts));
                flash(t('export.copy.done'));
              }),
          },
          {
            id: 'link',
            icon: 'link' as const,
            color: Palette.gold400,
            title: t('export.link.title'),
            body: t('export.link.body'),
            go: () =>
              run('link', async () => {
                await Clipboard.setStringAsync(`https://knowzone.ai/m/${m.id}`);
                flash(t('export.link.done'));
              }),
          },
        ];

        return (
          <AuthScreen title={t('export.title')} subtitle={m.title}>
            <Text variant="heading">{t('export.include')}</Text>
            <ChipWrap>
              {PARTS.map((p) => (
                <ChoiceChip
                  key={p}
                  label={t(`export.parts.${p}`)}
                  selected={parts.includes(p)}
                  onPress={() => setParts(toggleIn(parts, p))}
                />
              ))}
            </ChipWrap>
            {actions.map((a) => (
              <Pressable
                key={a.id}
                onPress={a.go}
                disabled={!parts.length || !!busy}
                accessibilityRole="button"
                accessibilityLabel={a.title}
                style={({ pressed }) => [styles.action, { opacity: !parts.length ? 0.5 : pressed ? 0.8 : 1 }]}>
                <View style={[styles.icon, { backgroundColor: a.color + '22' }]}>
                  <Ionicons name={a.icon} size={22} color={a.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text variant="bodyStrong">{a.title}</Text>
                  <Text variant="small" color={Colors.textSecondary}>
                    {busy === a.id ? t('export.working') : a.body}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} style={flip} />
              </Pressable>
            ))}
            {done && (
              <Card style={styles.toast}>
                <Ionicons name="checkmark-circle" size={18} color={Colors.success} />
                <Text variant="small">{done}</Text>
              </Card>
            )}
            <Text variant="small" color={Colors.textMuted} center>
              {t('export.footnote')}
            </Text>
          </AuthScreen>
        );
      }}
    </ReadyMaterial>
  );
}

const styles = StyleSheet.create({
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  icon: { width: 46, height: 46, borderRadius: Radius.sm, alignItems: 'center', justifyContent: 'center' },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    borderColor: Colors.success,
    backgroundColor: Colors.successSoft,
  },
});
