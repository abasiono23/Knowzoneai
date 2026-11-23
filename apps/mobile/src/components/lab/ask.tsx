import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { CoinCost, FONT, PrimaryButton, W } from '@/components/games/ui';
import { Text } from '@/components/ui';
import { Fonts, NoWebOutline } from '@/constants/theme';
import { useSession } from '@/lib/session';

import { ASK_COST } from './hud';

/** Ask Kora about the current task, for 10 coins a question. Kora guides; it won't give the answer. */
export function AskKora({
  visible,
  onClose,
  onAsk,
}: {
  visible: boolean;
  onClose: () => void;
  onAsk: (question: string) => Promise<string | null>;
}) {
  const { t } = useTranslation('lab');
  const { user } = useSession();
  const [question, setQuestion] = useState('');
  const [busy, setBusy] = useState(false);
  const [chat, setChat] = useState<{ q: string; a: string }[]>([]);
  const broke = (user?.coins ?? 0) < ASK_COST;
  const quick = [t('ask.quick.hint'), t('ask.quick.explain'), t('ask.quick.next')];

  const send = async (q: string) => {
    if (busy || broke) return;
    setBusy(true);
    const reply = await onAsk(q);
    setBusy(false);
    if (reply) {
      setChat((c) => [...c, { q: q || t('ask.quick.hint'), a: reply }]);
      setQuestion('');
    }
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <Animated.View entering={FadeIn.duration(150)} style={styles.backdrop}>
        <Pressable style={{ flex: 1 }} onPress={onClose} accessibilityLabel={t('ask.close')} />
        <View style={styles.sheet} accessibilityViewIsModal>
          <View style={styles.head}>
            <View style={styles.icon}>
              <Ionicons name="chatbubble-ellipses-outline" size={22} color={W.ink} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.title} accessibilityRole="header">
                {t('ask.title')}
              </Text>
              <Text style={styles.small}>{t('ask.cost', { cost: ASK_COST })}</Text>
            </View>
            <View style={styles.coins} accessibilityLabel={String(user?.coins ?? 0)}>
              <CoinCost cost={user?.coins ?? 0} />
            </View>
            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel={t('ask.close')}
              hitSlop={8}
              style={styles.close}>
              <Ionicons name="close" size={22} color={W.ink} />
            </Pressable>
          </View>
          <ScrollView style={{ maxHeight: 300 }} contentContainerStyle={{ gap: 10 }}>
            {chat.map((m, k) => (
              <Animated.View key={k} entering={FadeInDown.duration(180)} style={{ gap: 6 }}>
                <View style={[styles.bubble, styles.me]}>
                  <Text style={{ color: '#fff', fontFamily: Fonts.semibold, fontSize: 15 }}>{m.q}</Text>
                </View>
                <View style={[styles.bubble, styles.kora]} accessibilityLiveRegion="polite">
                  <Text style={{ color: W.ink, fontFamily: Fonts.regular, fontSize: 15, lineHeight: 22 }}>{m.a}</Text>
                </View>
              </Animated.View>
            ))}
            {busy && <ActivityIndicator color={W.ink} />}
          </ScrollView>
          {broke ? (
            <Text style={[styles.small, { color: W.wrong, textAlign: 'center' }]}>{t('ask.noCoins', { cost: ASK_COST })}</Text>
          ) : (
            <>
              <View style={styles.quick}>
                {quick.map((q) => (
                  <Pressable
                    key={q}
                    onPress={() => void send(q)}
                    disabled={busy}
                    accessibilityRole="button"
                    style={({ pressed }) => [styles.chip, pressed && { backgroundColor: W.key }]}>
                    <Text style={{ fontFamily: Fonts.semibold, fontSize: 14, color: W.ink }}>{q}</Text>
                  </Pressable>
                ))}
              </View>
              <View style={styles.inputRow}>
                <TextInput
                  value={question}
                  onChangeText={setQuestion}
                  placeholder={t('ask.placeholder')}
                  placeholderTextColor={W.muted}
                  style={[styles.input, NoWebOutline]}
                  maxLength={300}
                  onSubmitEditing={() => question.trim() && void send(question.trim())}
                  accessibilityLabel={t('ask.placeholder')}
                />
                <PrimaryButton
                  title={t('ask.send', { cost: ASK_COST })}
                  disabled={!question.trim() || busy}
                  onPress={() => void send(question.trim())}
                  style={{ minHeight: 48, paddingHorizontal: 18 }}
                />
              </View>
            </>
          )}
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(14,16,32,0.5)' },
  sheet: {
    gap: 12,
    padding: 18,
    paddingBottom: 28,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: W.surface,
    maxWidth: 620,
    width: '100%',
    alignSelf: 'center',
  },
  head: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  icon: { width: 44, height: 44, borderRadius: 22, backgroundColor: W.given, alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: FONT, fontSize: 19, color: W.ink, letterSpacing: -0.2 },
  small: { fontFamily: Fonts.regular, fontSize: 13, lineHeight: 18, color: W.inkSoft },
  coins: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, borderWidth: 1, borderColor: W.line },
  close: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: W.line,
  },
  bubble: { paddingVertical: 10, paddingHorizontal: 12, borderRadius: 14, maxWidth: '88%' },
  me: { alignSelf: 'flex-end', backgroundColor: W.ink, borderBottomRightRadius: 4 },
  kora: { alignSelf: 'flex-start', backgroundColor: W.given, borderBottomLeftRadius: 4 },
  quick: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    minHeight: 40,
    justifyContent: 'center',
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: W.lineStrong,
    backgroundColor: W.surface,
  },
  inputRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  input: {
    flex: 1,
    height: 48,
    borderRadius: 999,
    paddingHorizontal: 16,
    color: W.ink,
    fontFamily: Fonts.regular,
    fontSize: 15,
    backgroundColor: W.page,
    borderWidth: 1,
    borderColor: W.line,
  },
});
