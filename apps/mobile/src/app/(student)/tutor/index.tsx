import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { LogoMark } from '@/components/brand/logo';
import { SoftGlow } from '@/components/brand/soft-glow';
import { AskCard } from '@/components/tutor/messages';
import { UsageMeter } from '@/components/tutor/usage-meter';
import { Card, Screen, ScreenHeader, SectionHeader, Text } from '@/components/ui';
import { Colors, Palette, Radius, Spacing } from '@/constants/theme';
import { useFlipStyle } from '@/i18n/provider';
import { conversationTitle, subjectLabel, timeAgoMs } from '@/lib/tutor/format';
import { useTutor } from '@/lib/tutor/store';

/** Starter questions; the text is `tutor:landing.starters.<id>`, the subject is a catalogue name. */
const STARTERS = [
  { id: 'biology', subject: 'Biology', emoji: '🧬' },
  { id: 'chemistry', subject: 'Chemistry', emoji: '🧪' },
  { id: 'mathematics', subject: 'Mathematics', emoji: '➗' },
  { id: 'physics', subject: 'Physics', emoji: '⚛️' },
  { id: 'economics', subject: 'Economics', emoji: '📈' },
] as const;

/** Screen 47: AI tutor home: ask, snap, upload, recent chats and today's allowance. */
export default function TutorLanding() {
  const { t } = useTranslation('tutor');
  const flip = useFlipStyle();
  const { conversations, remaining, limit, createConversation, notes } = useTutor();
  const recent = [...conversations]
    .sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.updatedAt - a.updatedAt)
    .slice(0, 3);

  const quickAsk = (question: string) => {
    if (remaining <= 0) return router.push('/tutor/limit');
    const id = createConversation({ mode: 'explain', level: 'beginner' });
    router.push({ pathname: '/tutor/[id]', params: { id, q: question } });
  };

  return (
    <Screen withTabBar={false}>
      <ScreenHeader
        eyebrow={t('landing.eyebrow')}
        right={
          <Pressable
            onPress={() => router.push('/tutor/history')}
            accessibilityRole="button"
            accessibilityLabel={t('landing.historyLabel')}
            style={styles.histBtn}>
            <Ionicons name="time" size={18} color={Colors.text} />
            <Text variant="small">{t('landing.history')}</Text>
          </Pressable>
        }
      />

      <View style={styles.hero}>
        <SoftGlow color={Palette.purple500} size={280} />
        <LogoMark size={76} />
        <Text variant="display" center>
          {t('landing.title')}
        </Text>
        <Text color={Colors.textSecondary} center>
          {t('landing.subtitle')}
        </Text>
      </View>

      <AskCard
        title={t('shared.startNewChat')}
        subtitle={t('landing.askSubtitle')}
        onPress={() => router.push('/tutor/new')}
      />

      <View style={styles.row}>
        <Tile
          icon="camera"
          color={Palette.teal400}
          title={t('landing.snapTitle')}
          body={t('landing.snapBody')}
          onPress={() => router.push('/tutor/scan')}
        />
        <Tile
          icon="document-attach"
          color={Palette.gold400}
          title={t('landing.uploadTitle')}
          body={t('landing.uploadBody')}
          onPress={() => router.push('/tutor/upload')}
        />
      </View>

      <UsageMeter remaining={remaining} limit={limit} />

      <View style={{ gap: Spacing.xs }}>
        <SectionHeader title={t('landing.tryAsking')} />
        {STARTERS.map((s, i) => {
          const question = t(`landing.starters.${s.id}`);
          return (
            <Animated.View key={s.id} entering={FadeInDown.delay(i * 60)}>
              <Pressable
                onPress={() => quickAsk(question)}
                accessibilityRole="button"
                accessibilityLabel={question}
                style={styles.starter}>
                <Text style={{ fontSize: 20 }}>{s.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text variant="bodyStrong" style={{ fontSize: 15 }}>
                    {question}
                  </Text>
                  <Text variant="small" color={Colors.textMuted} style={{ fontSize: 12 }}>
                    {subjectLabel(s.subject)}
                  </Text>
                </View>
                <Ionicons name="arrow-forward" size={18} color={Colors.primary} style={flip} />
              </Pressable>
            </Animated.View>
          );
        })}
      </View>

      {recent.length > 0 && (
        <View style={{ gap: Spacing.xs }}>
          <SectionHeader
            title={t('landing.recentChats')}
            action={t('actions.seeAll', { ns: 'common' })}
            onAction={() => router.push('/tutor/history')}
          />
          {recent.map((c) => (
            <Pressable
              key={c.id}
              onPress={() => router.push(`/tutor/${c.id}`)}
              accessibilityRole="button"
              accessibilityLabel={conversationTitle(c.title)}>
              <Card style={styles.recent}>
                <Ionicons
                  name={c.pinned ? 'pin' : 'chatbubbles'}
                  size={18}
                  color={c.pinned ? Colors.reward : Colors.primary}
                />
                <View style={{ flex: 1 }}>
                  <Text variant="bodyStrong" numberOfLines={1}>
                    {conversationTitle(c.title)}
                  </Text>
                  <Text variant="small" color={Colors.textMuted} style={{ fontSize: 12 }}>
                    {t('landing.meta', { subject: subjectLabel(c.subject), time: timeAgoMs(c.updatedAt) })}
                  </Text>
                </View>
              </Card>
            </Pressable>
          ))}
        </View>
      )}

      <Pressable
        onPress={() => router.push('/tutor/notes')}
        accessibilityRole="button"
        accessibilityLabel={t('landing.myNotesLabel')}>
        <Card style={styles.recent}>
          <Ionicons name="bookmark" size={18} color={Colors.reward} />
          <Text style={{ flex: 1 }}>{t('landing.mySavedNotes')}</Text>
          <Text variant="small" color={Colors.textMuted}>
            {notes.length}
          </Text>
          <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} style={flip} />
        </Card>
      </Pressable>
    </Screen>
  );
}

function Tile({
  icon,
  color,
  title,
  body,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  title: string;
  body: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
      style={({ pressed }) => [styles.tile, { transform: [{ scale: pressed ? 0.97 : 1 }] }]}>
      <View style={[styles.tileIcon, { backgroundColor: color + '22' }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <Text variant="bodyStrong">{title}</Text>
      <Text variant="small" color={Colors.textSecondary} style={{ fontSize: 12 }}>
        {body}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  histBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Radius.pill,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  hero: { alignItems: 'center', gap: Spacing.xs, paddingVertical: Spacing.sm },
  row: { flexDirection: 'row', gap: Spacing.sm },
  tile: {
    flex: 1,
    gap: 4,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tileIcon: {
    width: 44,
    height: 44,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  starter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.sm,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  recent: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
});
