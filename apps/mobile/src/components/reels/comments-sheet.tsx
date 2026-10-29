import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, FlatList, Modal, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/components/ui';
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';
import { errorText } from '@/i18n/errors';
import { reelsApi, type Reel, type ReelComment } from '@/lib/reels';
import { useSession } from '@/lib/session';

/**
 * Comments on a reel. A plain text field (no keyboard wrappers, no autofocus); the server screens
 * every comment before it appears. Your own comments can be deleted; others' can be reported.
 */
export function CommentsSheet({
  reel,
  onClose,
  onCount,
}: {
  /** A reel, or a video in the Videos feed (they share likes and comments). */
  reel: Pick<Reel, 'id' | 'comments'> | null;
  onClose: () => void;
  onCount: (id: string, n: number) => void;
}) {
  const { t } = useTranslation('reels');
  const { user } = useSession();
  const insets = useSafeAreaInsets();
  const [list, setList] = useState<ReelComment[] | null>(null);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [reported, setReported] = useState<string[]>([]);

  const load = useCallback((id: string) => {
    reelsApi
      .comments(id)
      .then((r) => setList(r.comments))
      .catch((e) => setNote(errorText(e)));
  }, []);
  useEffect(() => {
    if (reel) load(reel.id);
  }, [reel, load]);

  const close = () => {
    setList(null);
    setText('');
    setNote(null);
    onClose();
  };

  const send = async () => {
    if (!reel || !text.trim() || busy) return;
    setBusy(true);
    setNote(null);
    try {
      const { comment } = await reelsApi.comment(reel.id, text.trim());
      const next = [comment, ...(list ?? [])];
      setList(next);
      setText('');
      onCount(reel.id, next.length);
    } catch (e) {
      setNote(errorText(e));
    } finally {
      setBusy(false);
    }
  };

  const remove = async (c: ReelComment) => {
    if (!reel) return;
    try {
      await reelsApi.remove(c.id);
      const next = (list ?? []).filter((x) => x.id !== c.id);
      setList(next);
      onCount(reel.id, next.length);
    } catch (e) {
      setNote(errorText(e));
    }
  };

  const report = async (c: ReelComment) => {
    try {
      await reelsApi.report(c.id);
      setReported((r) => [...r, c.id]);
    } catch (e) {
      setNote(errorText(e));
    }
  };

  return (
    <Modal visible={!!reel} transparent animationType="slide" onRequestClose={close}>
      <View style={styles.backdrop}>
        <Pressable style={{ flex: 1 }} onPress={close} accessibilityRole="button" accessibilityLabel={t('close')} />
        <View style={[styles.sheet, { paddingBottom: insets.bottom + Spacing.sm }]}>
          <View style={styles.head}>
            <Text variant="heading">{t('commentsTitle', { count: list?.length ?? reel?.comments ?? 0 })}</Text>
            <Pressable onPress={close} accessibilityRole="button" accessibilityLabel={t('close')} hitSlop={10}>
              <Ionicons name="close" size={24} color={Colors.text} />
            </Pressable>
          </View>

          {!list ? (
            <ActivityIndicator color={Colors.primary} style={{ marginVertical: Spacing.xl }} />
          ) : (
            <FlatList
              data={list}
              keyExtractor={(c) => c.id}
              style={{ maxHeight: 380 }}
              ListEmptyComponent={
                <Text variant="small" color={Colors.textMuted} center style={{ marginVertical: Spacing.lg }}>
                  {t('noComments')}
                </Text>
              }
              renderItem={({ item }) => (
                <View style={styles.comment}>
                  <View style={styles.avatar}>
                    <Ionicons name="person" size={16} color={Colors.primary} />
                  </View>
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text style={{ fontFamily: Fonts.bold, fontSize: 13 }}>
                      {item.mine ? t('you') : (item.name ?? t('learner'))}
                    </Text>
                    <Text variant="small">{item.text}</Text>
                  </View>
                  {item.mine ? (
                    <Pressable
                      onPress={() => void remove(item)}
                      accessibilityRole="button"
                      accessibilityLabel={t('delete')}
                      hitSlop={8}>
                      <Ionicons name="trash-outline" size={18} color={Colors.textMuted} />
                    </Pressable>
                  ) : reported.includes(item.id) ? (
                    <Text variant="small" color={Colors.textMuted}>
                      {t('reported')}
                    </Text>
                  ) : (
                    <Pressable
                      onPress={() => void report(item)}
                      accessibilityRole="button"
                      accessibilityLabel={t('report')}
                      hitSlop={8}>
                      <Ionicons name="flag-outline" size={18} color={Colors.textMuted} />
                    </Pressable>
                  )}
                </View>
              )}
            />
          )}

          {!!note && (
            <Text variant="small" color={Colors.danger}>
              {note}
            </Text>
          )}
          {user ? (
            <View style={styles.inputRow}>
              <TextInput
                value={text}
                onChangeText={setText}
                placeholder={t('placeholder')}
                placeholderTextColor={Colors.textMuted}
                maxLength={300}
                style={styles.input}
                accessibilityLabel={t('placeholder')}
              />
              <Pressable
                onPress={() => void send()}
                disabled={!text.trim() || busy}
                accessibilityRole="button"
                accessibilityLabel={t('send')}
                style={[styles.send, (!text.trim() || busy) && { opacity: 0.4 }]}>
                {busy ? <ActivityIndicator color="#fff" /> : <Ionicons name="send" size={18} color="#fff" />}
              </Pressable>
            </View>
          ) : null}
          <Text variant="small" color={Colors.textMuted} style={{ fontSize: 11 }}>
            {t('rules')}
          </Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)' },
  sheet: {
    gap: Spacing.sm,
    padding: Spacing.md,
    borderTopLeftRadius: Radius.lg,
    borderTopRightRadius: Radius.lg,
    backgroundColor: Colors.surface,
  },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  comment: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm, paddingVertical: Spacing.xs },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primarySoft,
  },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  input: {
    flex: 1,
    minHeight: 46,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surfaceRaised,
    color: Colors.text,
    fontFamily: Fonts.regular,
    fontSize: 15,
  },
  send: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
  },
});
