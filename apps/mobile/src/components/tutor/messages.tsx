import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from '@/components/ui/gradient';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

import { LogoMark } from '@/components/brand/logo';
import { Button, Text } from '@/components/ui';
import { Colors, Gradients, Radius, Spacing } from '@/constants/theme';
import type { AssistantMessage, UserMessage } from '@/lib/tutor/types';

import { AnswerActions } from './answer-actions';
import { AnswerBlocks } from './answer-blocks';

export function UserBubble({ message }: { message: UserMessage }) {
  const { t } = useTranslation('tutor');
  return (
    <Animated.View entering={FadeInDown.duration(250)} style={styles.userWrap}>
      {message.attachment && (
        <View style={styles.attachment}>
          {message.attachment.kind === 'image' ? (
            <Image source={{ uri: message.attachment.uri }} style={styles.thumb} contentFit="cover" />
          ) : (
            <View style={[styles.thumb, styles.pdf]}>
              <Ionicons name="document-text" size={28} color={Colors.text} />
            </View>
          )}
          <Text variant="small" color="rgba(255,255,255,0.85)" numberOfLines={1} style={{ fontSize: 12 }}>
            {message.attachment.page
              ? t('messages.page', { name: message.attachment.name, page: message.attachment.page })
              : message.attachment.name}
          </Text>
        </View>
      )}
      {!!message.text && (
        <LinearGradient colors={Gradients.ai} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.user}>
          <Text>{message.text}</Text>
        </LinearGradient>
      )}
    </Animated.View>
  );
}

function TutorAvatar() {
  return (
    <View style={styles.avatar}>
      <LogoMark size={28} />
    </View>
  );
}

/** Tutor reply: summary, the first part of the explanation, and actions. */
export function AssistantCard({ message, conversationId }: { message: AssistantMessage; conversationId: string }) {
  const { t } = useTranslation('tutor');
  const a = message.answer;
  if (!a) return null;
  const preview = a.body.slice(0, 3);
  const more = a.body.length > preview.length || a.keyTerms.length > 0;

  return (
    <Animated.View entering={FadeInDown.duration(350)} style={styles.assistantRow}>
      <TutorAvatar />
      <View style={styles.assistant}>
        <Text variant="bodyStrong">{a.summary}</Text>
        <AnswerBlocks blocks={preview} />
        {a.finalAnswer && (
          <View style={styles.final}>
            <Ionicons name="checkmark-circle" size={18} color={Colors.success} />
            <Text variant="bodyStrong" style={{ flex: 1 }}>
              {a.finalAnswer}
            </Text>
          </View>
        )}
        {a.sources.length > 0 && (
          <View style={styles.source}>
            <Ionicons name="document-attach" size={13} color={Colors.textMuted} />
            <Text variant="small" color={Colors.textMuted} style={{ fontSize: 12, flex: 1 }}>
              {a.sources.join(' · ')}
            </Text>
          </View>
        )}
        {more && (
          <Text variant="small" color={Colors.primary}>
            {t('messages.continues')}
          </Text>
        )}
        <AnswerActions conversationId={conversationId} messageId={message.id} answer={a} />
      </View>
    </Animated.View>
  );
}

/** Screen 61 (inline): an answer that failed, with retry. */
export function ErrorBubble({
  message,
  onRetry,
  retrying,
}: {
  message: AssistantMessage;
  onRetry: () => void;
  retrying?: boolean;
}) {
  const { t } = useTranslation('tutor');
  const errorMessage =
    message.error?.kind === 'network'
      ? t('messages.networkError')
      : (message.error?.message ?? t('messages.genericError'));
  return (
    <Animated.View entering={FadeInDown.duration(300)} style={styles.assistantRow}>
      <TutorAvatar />
      <View style={[styles.assistant, styles.error]}>
        <View style={{ flexDirection: 'row', gap: Spacing.xs, alignItems: 'center' }}>
          <Ionicons
            name={message.error?.kind === 'network' ? 'cloud-offline' : 'alert-circle'}
            size={20}
            color={Colors.danger}
          />
          <Text variant="bodyStrong">{t('messages.failedTitle')}</Text>
        </View>
        <Text variant="small" color={Colors.textSecondary}>
          {t('messages.failedBody', { message: errorMessage })}
        </Text>
        <Button
          title={t('actions.retry', { ns: 'common' })}
          icon="refresh"
          variant="secondary"
          onPress={onRetry}
          loading={retrying}
        />
      </View>
    </Animated.View>
  );
}

export function Thinking() {
  const { t } = useTranslation('tutor');
  return (
    <Animated.View entering={FadeInDown.duration(250)} style={styles.assistantRow}>
      <TutorAvatar />
      <View style={[styles.assistant, styles.thinking]}>
        {[0, 1, 2].map((i) => (
          <Dot key={i} i={i} />
        ))}
        <Text variant="small" color={Colors.textSecondary} style={{ marginStart: 6 }}>
          {t('messages.thinking')}
        </Text>
      </View>
    </Animated.View>
  );
}

function Dot({ i }: { i: number }) {
  const t = useSharedValue(0.3);
  useEffect(() => {
    t.value = withDelay(
      i * 160,
      withRepeat(withSequence(withTiming(1, { duration: 380 }), withTiming(0.3, { duration: 380 })), -1),
    );
  }, [t, i]);
  return <DotView t={t} />;
}

function DotView({ t }: { t: SharedValue<number> }) {
  const style = useAnimatedStyle(() => ({ opacity: t.value, transform: [{ translateY: (1 - t.value) * 3 }] }));
  return <Animated.View style={[styles.dot, style]} />;
}

/** Big "new chat" call to action reused on the landing page. */
export function AskCard({ onPress, title, subtitle }: { onPress: () => void; title: string; subtitle: string }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={title}>
      {({ pressed }) => (
        <LinearGradient
          colors={Gradients.ai}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.ask, { transform: [{ scale: pressed ? 0.98 : 1 }] }]}>
          <View style={{ flex: 1, gap: 4 }}>
            <Text variant="title">{title}</Text>
            <Text variant="small" color="rgba(255,255,255,0.88)">
              {subtitle}
            </Text>
          </View>
          <View style={styles.askIcon}>
            <Ionicons name="chatbubble-ellipses" size={26} color={Colors.textOnAccent} />
          </View>
        </LinearGradient>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  userWrap: { alignSelf: 'flex-end', maxWidth: '85%', gap: 6, alignItems: 'flex-end' },
  user: {
    borderRadius: Radius.lg,
    borderBottomRightRadius: 6,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  attachment: { gap: 4, alignItems: 'flex-end' },
  thumb: { width: 180, height: 130, borderRadius: Radius.md, backgroundColor: Colors.surfaceRaised },
  pdf: { alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.borderStrong },
  assistantRow: { flexDirection: 'row', gap: Spacing.xs, alignItems: 'flex-start' },
  avatar: { marginTop: 2 },
  assistant: {
    flex: 1,
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderTopLeftRadius: 6,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  final: {
    flexDirection: 'row',
    gap: Spacing.xs,
    alignItems: 'center',
    padding: Spacing.sm,
    borderRadius: Radius.sm,
    backgroundColor: Colors.successSoft,
  },
  source: { flexDirection: 'row', gap: 4, alignItems: 'center' },
  error: { borderColor: Colors.danger + '66', backgroundColor: Colors.dangerSoft },
  // flexGrow (not flex: 0) so web keeps an auto width instead of collapsing to zero.
  thinking: {
    flexGrow: 0,
    flexShrink: 1,
    flexBasis: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: Spacing.sm,
  },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: Colors.primary },
  ask: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    shadowColor: Colors.primary,
    shadowOpacity: 0.45,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  askIcon: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
