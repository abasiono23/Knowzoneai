import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Text } from '@/components/ui';
import { Colors, NoWebOutline, Spacing } from '@/constants/theme';
import { KORA_IMAGE } from '@/lib/games/english';
import { useSession } from '@/lib/session';

import { ASK_COST, BOLD, Coins, GoldButton } from './hud';

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
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable style={{ flex: 1 }} onPress={onClose} accessibilityLabel={t('ask.close')} />
        <View style={styles.sheet}>
          <View style={styles.head}>
            <Image source={KORA_IMAGE} style={{ width: 52, height: 52 }} contentFit="contain" accessible={false} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: BOLD, fontSize: 18, color: '#fff' }}>{t('ask.title')}</Text>
              <Text style={{ fontSize: 12, color: 'rgba(235,238,255,0.8)' }}>{t('ask.cost', { cost: ASK_COST })}</Text>
            </View>
            <Coins />
            <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel={t('ask.close')} hitSlop={10}>
              <Ionicons name="close" size={24} color="#fff" />
            </Pressable>
          </View>
          <ScrollView style={{ maxHeight: 300 }} contentContainerStyle={{ gap: Spacing.sm }}>
            {chat.map((m, k) => (
              <Animated.View key={k} entering={FadeInDown} style={{ gap: 6 }}>
                <View style={[styles.bubble, styles.me]}>
                  <Text style={{ color: '#fff' }}>{m.q}</Text>
                </View>
                <View style={[styles.bubble, styles.kora]}>
                  <Text style={{ color: '#1E145A' }}>{m.a}</Text>
                </View>
              </Animated.View>
            ))}
            {busy && <ActivityIndicator color={Colors.reward} />}
          </ScrollView>
          {broke ? (
            <Text style={{ color: '#FF8FA6', textAlign: 'center' }}>{t('ask.noCoins', { cost: ASK_COST })}</Text>
          ) : (
            <>
              <View style={styles.quick}>
                {quick.map((q) => (
                  <Pressable
                    key={q}
                    onPress={() => void send(q)}
                    disabled={busy}
                    accessibilityRole="button"
                    style={styles.chip}>
                    <Text style={{ fontSize: 13, color: '#fff' }}>{q}</Text>
                  </Pressable>
                ))}
              </View>
              <View style={styles.inputRow}>
                <TextInput
                  value={question}
                  onChangeText={setQuestion}
                  placeholder={t('ask.placeholder')}
                  placeholderTextColor="rgba(235,238,255,0.5)"
                  style={[styles.input, NoWebOutline]}
                  maxLength={300}
                  onSubmitEditing={() => question.trim() && void send(question.trim())}
                  accessibilityLabel={t('ask.placeholder')}
                />
                <View style={{ width: 120 }}>
                  <GoldButton
                    title={t('ask.send', { cost: ASK_COST })}
                    disabled={!question.trim() || busy}
                    onPress={() => void send(question.trim())}
                  />
                </View>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(5,6,20,0.6)' },
  sheet: {
    gap: Spacing.sm,
    padding: Spacing.md,
    paddingBottom: Spacing.xl,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: '#141A45',
    maxWidth: 620,
    width: '100%',
    alignSelf: 'center',
  },
  head: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  bubble: { padding: 10, borderRadius: 16, maxWidth: '88%' },
  me: { alignSelf: 'flex-end', backgroundColor: '#4B36D6', borderBottomRightRadius: 4 },
  kora: { alignSelf: 'flex-start', backgroundColor: '#D9CCFF', borderBottomLeftRadius: 4 },
  quick: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,200,87,0.5)',
  },
  inputRow: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'center' },
  input: {
    flex: 1,
    height: 52,
    borderRadius: 999,
    paddingHorizontal: 16,
    color: '#fff',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
});
