import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  type ScrollViewInstance,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Backdrop } from '@/components/brand/backdrop';
import { Composer } from '@/components/tutor/composer';
import { TutorErrorState } from '@/components/tutor/error-state';
import { FollowUps } from '@/components/tutor/follow-ups';
import { AssistantCard, ErrorBubble, Thinking, UserBubble } from '@/components/tutor/messages';
import { ActionSheet, IconButton, Text } from '@/components/ui';
import { Colors, MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import { useIsRtl } from '@/i18n/provider';
import { conversationTitle, subjectLabel } from '@/lib/tutor/format';
import { useTutor } from '@/lib/tutor/store';

/** Screen 48: the tutor chat. */
export default function TutorChat() {
  const { id, q } = useLocalSearchParams<{ id: string; q?: string }>();
  const { t } = useTranslation('tutor');
  const rtl = useIsRtl();
  const tutor = useTutor();
  const conv = tutor.conversations.find((c) => c.id === id);
  const thinking = !!tutor.thinking[id];
  const [retrying, setRetrying] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const scroll = useRef<ScrollViewInstance>(null);
  const autoSent = useRef(false);

  const ask = async (text: string) => {
    const result = await tutor.send(id, text);
    if (result === 'limit') router.push('/tutor/limit');
  };

  // Chats from the history list arrive without their messages.
  const { open, ready } = tutor;
  useEffect(() => {
    if (ready) open(id);
  }, [id, ready, open]);

  // A question passed in from the landing page or New conversation is sent once.
  useEffect(() => {
    if (!q || autoSent.current || !conv || conv.messages.length) return;
    autoSent.current = true;
    ask(q);
    router.setParams({ q: undefined });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, conv?.id]);

  if (!tutor.ready) return <View style={{ flex: 1, backgroundColor: Colors.background }} />;

  if (!conv) {
    return (
      <View style={{ flex: 1 }}>
        <Backdrop />
        <SafeAreaView style={{ flex: 1, padding: Spacing.lg }}>
          <TutorErrorState kind="missing" onBack={() => router.replace('/tutor')} />
        </SafeAreaView>
      </View>
    );
  }

  const lastOk = [...conv.messages].reverse().find((m) => m.role === 'assistant' && m.status === 'ok');
  const last = conv.messages[conv.messages.length - 1];

  return (
    <View style={{ flex: 1 }}>
      <Backdrop />
      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ flex: 1 }}>
          <View style={styles.header}>
            <IconButton
              // IconButton doesn't mirror icons, so pick the arrow that points back in this direction.
              icon={rtl ? 'chevron-forward' : 'chevron-back'}
              label={t('actions.back', { ns: 'common' })}
              onPress={() => (router.canGoBack() ? router.back() : router.replace('/tutor'))}
            />
            <View style={{ flex: 1 }}>
              <Text variant="bodyStrong" numberOfLines={1}>
                {conv.messages.length ? conversationTitle(conv.title) : t('shared.newConversation')}
              </Text>
              <Text variant="small" color={Colors.textMuted} style={{ fontSize: 12 }}>
                {t('chat.meta', {
                  subject: subjectLabel(conv.subject),
                  mode: t(`modes.${conv.mode}.label`),
                  level: t(`levels.${conv.level}`),
                })}
              </Text>
            </View>
            <IconButton icon="ellipsis-horizontal" label={t('chat.options')} onPress={() => setMenuOpen(true)} />
          </View>

          <ScrollView
            ref={scroll}
            style={{ flex: 1 }}
            contentContainerStyle={styles.thread}
            onContentSizeChange={() => scroll.current?.scrollToEnd({ animated: true })}
            keyboardShouldPersistTaps="handled">
            {conv.messages.length === 0 && !thinking && (
              <View style={styles.empty}>
                <Ionicons name="sparkles" size={28} color={Colors.primary} />
                <Text variant="heading" center>
                  {t('chat.emptyTitle')}
                </Text>
                <Text variant="small" color={Colors.textSecondary} center>
                  {t('chat.emptyBody')}
                </Text>
              </View>
            )}
            {conv.context && (
              <View style={styles.context}>
                <Ionicons name="document-attach" size={14} color={Colors.textSecondary} />
                <Text variant="small" color={Colors.textSecondary} style={{ fontSize: 12 }}>
                  {t('chat.using', { label: conv.context.label })}
                </Text>
              </View>
            )}
            {conv.messages.map((m) =>
              m.role === 'user' ? (
                <UserBubble key={m.id} message={m} />
              ) : m.status === 'error' ? (
                <ErrorBubble
                  key={m.id}
                  message={m}
                  retrying={retrying === m.id}
                  onRetry={async () => {
                    setRetrying(m.id);
                    await tutor.retry(conv.id, m.id);
                    setRetrying(null);
                  }}
                />
              ) : (
                <AssistantCard key={m.id} message={m} conversationId={conv.id} />
              ),
            )}
            {thinking && !retrying && <Thinking />}
            {lastOk?.role === 'assistant' && lastOk.answer && last?.id === lastOk.id && !thinking && (
              <FollowUps items={lastOk.answer.followUps} onPick={ask} disabled={thinking} />
            )}
          </ScrollView>

          <View style={styles.composer}>
            {tutor.remaining <= 0 ? (
              <Pressable onPress={() => router.push('/tutor/limit')} accessibilityRole="button" style={styles.limit}>
                <Ionicons name="lock-closed" size={18} color={Colors.reward} />
                <Text variant="small" style={{ flex: 1 }}>
                  {t('chat.limitReached')}
                </Text>
              </Pressable>
            ) : (
              <Composer
                conversationId={conv.id}
                onSend={ask}
                disabled={thinking}
                remaining={tutor.remaining}
                limit={tutor.limit}
              />
            )}
          </View>
        </View>
      </SafeAreaView>
      <ActionSheet
        visible={menuOpen}
        title={conversationTitle(conv.title)}
        onClose={() => setMenuOpen(false)}
        options={[
          {
            label: conv.pinned ? t('shared.unpin') : t('shared.pin'),
            icon: 'pin',
            onPress: () => tutor.togglePin(conv.id),
          },
          { label: t('shared.startNewChat'), icon: 'add-circle', onPress: () => router.replace('/tutor/new') },
          {
            label: t('shared.deleteConversation'),
            icon: 'trash',
            destructive: true,
            onPress: () => {
              tutor.remove(conv.id);
              router.back();
            },
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
  thread: { gap: Spacing.md, padding: Spacing.md, width: '100%', maxWidth: MaxContentWidth, alignSelf: 'center' },
  empty: { alignItems: 'center', gap: Spacing.xs, paddingVertical: Spacing.xxl, paddingHorizontal: Spacing.lg },
  context: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.pill,
    backgroundColor: Colors.surface,
  },
  composer: {
    padding: Spacing.md,
    paddingTop: Spacing.xs,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
  limit: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    backgroundColor: Colors.rewardSoft,
    borderWidth: 1,
    borderColor: Colors.reward,
  },
});
