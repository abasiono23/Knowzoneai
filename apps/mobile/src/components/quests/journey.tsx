import { Ionicons } from '@expo/vector-icons';
import { router, type Href } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { FONT, PrimaryButton, W } from '@/components/games/ui';
import { Meter } from '@/components/world/world-ui';
import { Text } from '@/components/ui';
import { Fonts } from '@/constants/theme';
import type { QuestBoards } from '@/lib/api';
import { questRoute } from '@/lib/quests/art';

import { PlaceIcon, useQuestTitle } from './quest-ui';

type Journey = QuestBoards['journey'];

/**
 * The weekly journey: a route of quests, one step at a time, ending at the weekly chest. Done steps are
 * ticked, the current one shows its progress and where to play it.
 */
export function JourneyMap({ journey, onOpenChest, busy }: { journey: Journey; onOpenChest: () => void; busy?: boolean }) {
  const { t } = useTranslation('quests');
  const titleOf = useQuestTitle();
  const steps = journey.steps;
  return (
    <View style={styles.list}>
      {steps.map((s, i) => {
        const done = i < journey.at;
        const now = i === journey.at;
        let goTo: Href | null = null;
        if (now) goTo = questRoute(s);
        return (
          <View
            key={i}
            style={styles.step}
            accessible={!now}
            accessibilityLabel={t('journey.stepA11y', {
              n: i + 1,
              title: titleOf(s),
              state: done ? t('journey.stateDone') : now ? t('journey.stateCurrent') : t('journey.stateLater'),
            })}>
            <View style={styles.rail}>
              <View style={[styles.line, i === 0 && { top: 22 }, done && { backgroundColor: W.ink }]} />
              <View style={[styles.dot, done && styles.dotDone, now && styles.dotNow]}>
                {done ? <Ionicons name="checkmark" size={14} color="#fff" /> : <Text style={[styles.dotText, now && { color: '#fff' }]}>{i + 1}</Text>}
              </View>
            </View>
            <View style={[styles.body, now && styles.bodyNow]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <PlaceIcon place={s.place} size={32} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.title, !done && !now && { color: W.inkSoft }]}>{titleOf(s)}</Text>
                  <Text style={styles.meta}>{t(`places.${s.place}`)}</Text>
                </View>
              </View>
              {now && (
                <>
                  <Meter value={s.progress / s.target} />
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Text style={styles.meta}>{t('progress', { progress: s.progress, target: s.target })}</Text>
                    {goTo && (
                      <Pressable
                        onPress={() => router.push(goTo)}
                        accessibilityRole="button"
                        accessibilityLabel={t('goTo', { place: t(`places.${s.place}`) })}
                        style={styles.go}>
                        <Text style={{ fontFamily: Fonts.bold, color: '#fff' }}>{t('go')}</Text>
                      </Pressable>
                    )}
                  </View>
                </>
              )}
            </View>
          </View>
        );
      })}
      <View style={styles.step}>
        <View style={styles.rail}>
          <View style={[styles.line, { bottom: '50%' }]} />
          <View style={[styles.dot, journey.chest.claimed && styles.dotDone]}>
            <Ionicons name={journey.chest.claimed ? 'checkmark' : 'gift-outline'} size={14} color={journey.chest.claimed ? '#fff' : W.ink} />
          </View>
        </View>
        <View style={[styles.body, { gap: 10 }]}>
          {journey.at < steps.length ? (
            <Text style={styles.meta}>{t('journey.locked')}</Text>
          ) : journey.chest.claimed ? (
            <Text style={[styles.title, { color: W.correct }]}>{t('journey.done')}</Text>
          ) : (
            <PrimaryButton title={t('journey.openChest')} icon="gift-outline" disabled={busy} onPress={onOpenChest} />
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  list: { borderRadius: 16, backgroundColor: W.surface, borderWidth: 1, borderColor: W.line, paddingVertical: 8, paddingRight: 12 },
  step: { flexDirection: 'row', alignItems: 'stretch' },
  rail: { width: 52, alignItems: 'center' },
  line: { position: 'absolute', top: 0, bottom: 0, width: 2, backgroundColor: W.line },
  dot: {
    marginTop: 10,
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1.5,
    borderColor: W.lineStrong,
    backgroundColor: W.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotDone: { backgroundColor: W.ink, borderColor: W.ink },
  dotNow: { backgroundColor: W.focus, borderColor: W.focus },
  dotText: { fontFamily: FONT, fontSize: 12, color: W.ink },
  body: { flex: 1, gap: 8, paddingVertical: 8, marginVertical: 2 },
  bodyNow: { padding: 12, borderRadius: 12, backgroundColor: W.page, borderWidth: 1, borderColor: W.line },
  title: { fontFamily: Fonts.bold, fontSize: 15, color: W.ink },
  meta: { fontFamily: Fonts.semibold, fontSize: 12, color: W.muted },
  go: { paddingHorizontal: 18, minHeight: 40, justifyContent: 'center', borderRadius: 999, backgroundColor: W.ink },
});
