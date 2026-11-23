import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { FONT, PrimaryButton, W } from '@/components/games/ui';
import { LadderScale } from '@/components/world/play-frame';
import { WORLD_ACCENT, WorldCover } from '@/components/world/world-cover';
import { levelHref, Stars, Wallet, worldStyles } from '@/components/world/world-ui';
import { Screen, ScreenHeader, Text } from '@/components/ui';
import { Fonts } from '@/constants/theme';
import { formatDate } from '@/i18n';
import { levelKey } from '@/lib/games/english';
import { dailyLevel, dayKey } from '@/lib/world/levels';
import { useWorld } from '@/lib/world/store';

/** Hours and minutes until the next daily challenge. */
function untilMidnight(now: number) {
  const end = new Date(now);
  end.setHours(24, 0, 0, 0);
  const s = Math.max(0, Math.floor((end.getTime() - now) / 1000));
  return { hours: Math.floor(s / 3600), minutes: String(Math.floor((s % 3600) / 60)).padStart(2, '0') };
}

/** The daily challenge: one world and level a day, the same for everyone, with a gentle streak. */
export default function DailyChallengeScreen() {
  const { t } = useTranslation('world');
  const { t: tg } = useTranslation('games');
  const { dailyHistory, dailyDone, dailyStreak, freezes } = useWorld();
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(timer);
  }, []);
  const level = dailyLevel(dayKey(now));
  const today = dailyHistory[dayKey(now)];
  const week = Array.from({ length: 7 }, (_, k) => {
    const at = now - (6 - k) * 86400000;
    const key = dayKey(at);
    return { key, label: formatDate(at, { weekday: 'narrow' }), long: formatDate(at, { weekday: 'long' }), entry: dailyHistory[key], today: k === 6 };
  });
  const recent = Object.entries(dailyHistory)
    .filter(([, v]) => !v.frozen)
    .sort(([a], [b]) => (a < b ? 1 : -1))
    .slice(0, 5);

  return (
    <Screen withTabBar={false}>
      <ScreenHeader eyebrow={t('eyebrow')} title={t('daily.title')} right={<Wallet compact />} />

      <Animated.View entering={FadeIn.duration(200)} style={styles.card}>
        <Text style={styles.eyebrow}>{formatDate(now, { weekday: 'long', day: 'numeric', month: 'long' }).toUpperCase()}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <WorldCover world={level.world.id} size={64} />
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={styles.title}>{dailyDone ? t('daily.done') : level.world.name}</Text>
            <Text style={worldStyles.body}>
              {dailyDone && today
                ? t('daily.doneBody', { count: today.score, ...untilMidnight(now) })
                : `${tg('ui.levelName', { level: level.tier, name: tg(`levels.names.${levelKey(level.tier)}`) })} · ${t('adv.dailyCount')}`}
            </Text>
          </View>
          {!dailyDone && <LadderScale level={level.tier} accent={WORLD_ACCENT[level.world.id]} />}
        </View>
        {dailyDone && today ? (
          <Stars value={today.stars} size={22} />
        ) : (
          <>
            <Text style={worldStyles.small}>{t('adv.dailyReward', { xp: level.xp, count: level.coins })}</Text>
            <PrimaryButton title={t('daily.start')} icon="arrow-forward" onPress={() => router.push(levelHref(level))} />
          </>
        )}
      </Animated.View>

      <View style={styles.card}>
        <View style={styles.between}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Ionicons name="flame-outline" size={20} color={W.ink} />
            <Text style={worldStyles.heading}>{t('daily.streak', { count: dailyStreak })}</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Ionicons name="snow-outline" size={14} color={W.inkSoft} />
            <Text style={worldStyles.meta}>{t('daily.freezes', { count: freezes })}</Text>
          </View>
        </View>
        <View style={styles.week}>
          {week.map((d) => (
            <View
              key={d.key}
              style={{ alignItems: 'center', gap: 4 }}
              accessible
              accessibilityLabel={`${d.long}: ${d.entry ? (d.entry.frozen ? t('adv.dayFrozen') : t('adv.dayDone')) : t('adv.dayMissed')}`}>
              <View style={[styles.day, d.entry && !d.entry.frozen && styles.dayDone, d.entry?.frozen && styles.dayFrozen, d.today && !d.entry && styles.dayToday]}>
                {d.entry ? <Ionicons name={d.entry.frozen ? 'snow-outline' : 'checkmark'} size={16} color={d.entry.frozen ? W.inkSoft : '#fff'} /> : null}
              </View>
              <Text style={[worldStyles.meta, d.today && { color: W.ink }]}>{d.label}</Text>
            </View>
          ))}
        </View>
        <Text style={worldStyles.small}>{t('daily.freezeNote')}</Text>
      </View>

      {recent.length > 0 && (
        <View style={{ gap: 10 }}>
          <Text style={worldStyles.heading}>{t('daily.recent')}</Text>
          <View style={styles.list}>
            {recent.map(([key, v], k) => (
              <View key={key} style={[worldStyles.row, k > 0 && worldStyles.rowLine, { justifyContent: 'space-between', minHeight: 48 }]}>
                <Text style={worldStyles.strong}>{formatDate(new Date(key + 'T12:00:00'), { weekday: 'short', day: 'numeric', month: 'short' })}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <Text style={worldStyles.meta}>{t('daily.points', { count: v.score })}</Text>
                  <Stars value={v.stars} size={13} />
                </View>
              </View>
            ))}
          </View>
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { gap: 14, padding: 16, borderRadius: 16, backgroundColor: W.surface, borderWidth: 1, borderColor: W.line },
  eyebrow: { fontFamily: Fonts.bold, fontSize: 11, letterSpacing: 1.2, color: W.muted },
  title: { fontFamily: FONT, fontSize: 22, letterSpacing: -0.3, color: W.ink },
  between: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  week: { flexDirection: 'row', justifyContent: 'space-between' },
  day: { width: 36, height: 36, borderRadius: 18, backgroundColor: W.given, alignItems: 'center', justifyContent: 'center' },
  dayDone: { backgroundColor: W.ink },
  dayFrozen: { backgroundColor: W.surface, borderWidth: 1.5, borderColor: W.lineStrong },
  dayToday: { borderWidth: 1.5, borderColor: W.ink, borderStyle: 'dashed', backgroundColor: W.surface },
  list: { borderRadius: 16, backgroundColor: W.surface, borderWidth: 1, borderColor: W.line, overflow: 'hidden' },
});
