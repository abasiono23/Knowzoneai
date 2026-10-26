import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AskKora } from '@/components/lab/ask';
import { LabHall } from '@/components/lab/hall';
import { AskButton, BOLD, Coins, Hearts, KoraTip, PANEL, RoundButton } from '@/components/lab/hud';
import { GamePicker, LabResult, StationView } from '@/components/lab/station';
import { AfricaExplorer } from '@/components/history/games/africa';
import { LostCivilization } from '@/components/history/games/dig';
import { TimeMachine } from '@/components/history/games/time-machine';
import { ConfirmDialog, PauseMenu } from '@/components/world/overlays';
import { Text } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { errorText } from '@/i18n/errors';
import { api, type HistoryCatalogue, type HistoryGameId, type HistoryRun } from '@/lib/api';
import { USE_MOCKS } from '@/lib/config';
import { MUSEUM, MUSEUM_SCENES, MUSEUM_STATION_OF, MUSEUM_STATIONS, type MuseumStation } from '@/lib/games/history';
import { useLabRun } from '@/lib/games/use-lab-run';

/**
 * The Museum of Time (Knowzone World). Walk around the museum as a young explorer, step into the
 * time machine, visit the lost civilizations gallery or the Africa map, and play the History &
 * Geography games.
 */
export default function MuseumOfTime() {
  const { t } = useTranslation('history');
  const tl = useTranslation('lab').t;
  const g = useLabRun<HistoryRun>();
  const run = g.run;
  const [catalogue, setCatalogue] = useState<HistoryCatalogue | null>(null);
  const [offline, setOffline] = useState<string | null>(null);
  const [station, setStation] = useState<MuseumStation | null>(null);
  const [asking, setAsking] = useState(false);
  const [paused, setPaused] = useState(false);
  const [confirm, setConfirm] = useState<'quit' | 'leave' | null>(null);
  const [current, setCurrent] = useState<{ game: HistoryGameId; level: number } | null>(null);

  const load = useCallback(() => {
    if (USE_MOCKS) {
      setOffline(t('offline'));
      return;
    }
    api
      .getHistoryGames()
      .then((c) => {
        setCatalogue(c);
        setOffline(null);
      })
      .catch((e) => setOffline(errorText(e, t('offline'))));
  }, [t]);
  useFocusEffect(load);

  const levelsOf = (game: HistoryGameId) => catalogue?.games.find((x) => x.id === game)?.levels ?? [];
  const start = async (game: HistoryGameId, level: number) => {
    if (await g.start(game, level)) setCurrent({ game, level });
  };
  const playing = run?.status === 'playing' ? run : null;
  const hold = paused || asking || !!confirm;

  const stationBadge = (s: MuseumStation) => {
    const games = MUSEUM_STATIONS[s].games;
    const stars = games.reduce((n, game) => n + levelsOf(game).reduce((m, l) => m + l.bestStars, 0), 0);
    return t('hall.stars', { count: stars, max: games.length * 15 });
  };

  const game = (() => {
    if (!playing) return null;
    switch (playing.game) {
      case 'time-machine':
        return <TimeMachine g={g} run={playing} paused={hold} />;
      case 'lost-civilization':
        return <LostCivilization g={g} run={playing} paused={hold} />;
      case 'africa-explorer':
        return <AfricaExplorer g={g} run={playing} />;
    }
  })();

  return (
    <View style={styles.root}>
      {game ?? (
        <>
          <LabHall<MuseumStation>
            place={MUSEUM}
            ns="history"
            topReserve={170}
            onOpen={setStation}
            badges={Object.fromEntries(
              (Object.keys(MUSEUM_STATIONS) as MuseumStation[]).map((s) => [s, stationBadge(s)]),
            )}
            goal={current ? MUSEUM_STATION_OF[current.game] : null}
            paused={!!station || hold}
          />
          {!station && (
            <SafeAreaView edges={['top']} style={styles.hallTop} pointerEvents="box-none">
              <View style={styles.bar} pointerEvents="box-none">
                <RoundButton icon="arrow-back" label={t('leave')} onPress={() => router.back()} />
                <View style={styles.title}>
                  <Text style={{ fontFamily: BOLD, fontSize: 14, color: '#fff' }}>{t('title')}</Text>
                </View>
                <Coins />
              </View>
              <KoraTip text={offline ?? t('hall.tip')} />
            </SafeAreaView>
          )}
          {station && (
            <StationView
              scene={MUSEUM_SCENES[station]}
              title={t(`stations.${station}`)}
              backLabel={t('leave')}
              onBack={() => setStation(null)}>
              {() =>
                offline ? (
                  <View style={styles.tip}>
                    <KoraTip text={offline} />
                  </View>
                ) : (
                  <GamePicker
                    ns="history"
                    games={MUSEUM_STATIONS[station].games}
                    levelsOf={levelsOf}
                    busy={g.busy}
                    onStart={(id, level) => void start(id, level)}
                  />
                )
              }
            </StationView>
          )}
        </>
      )}

      {playing && (
        <SafeAreaView edges={['top']} style={styles.hallTop} pointerEvents="box-none">
          <View style={styles.bar} pointerEvents="box-none">
            <RoundButton icon="pause" label={tl('pause')} onPress={() => setPaused(true)} />
            <Hearts left={playing.hearts} />
            <View style={{ flex: 1 }} />
            <AskButton onPress={() => setAsking(true)} />
            <Coins />
          </View>
        </SafeAreaView>
      )}

      {!!g.error && (
        <Pressable onPress={() => g.setError(null)} style={styles.toast} accessibilityRole="alert">
          <Ionicons name="alert-circle" size={18} color="#fff" />
          <Text style={{ flex: 1, color: '#fff' }}>{g.error}</Text>
          <Ionicons name="close" size={18} color="#fff" />
        </Pressable>
      )}

      {g.summary && current && (
        <LabResult
          ns="history"
          game={current.game}
          level={current.level}
          summary={g.summary}
          onNext={() => void start(current.game, current.level + 1)}
          onReplay={() => void start(current.game, current.level)}
          onBack={() => {
            g.close();
            load();
          }}
        />
      )}

      <AskKora visible={asking} onClose={() => setAsking(false)} onAsk={g.ask} />
      <PauseMenu
        visible={paused && !confirm}
        title={current ? t(`games.${current.game}.name`) : t('title')}
        subtitle={current ? tl('pauseSubtitle', { level: current.level }) : ''}
        onResume={() => setPaused(false)}
        onRestart={() => {
          setPaused(false);
          if (current) void start(current.game, current.level);
        }}
        onQuit={() => setConfirm('quit')}
      />
      <ConfirmDialog
        visible={!!confirm}
        icon="exit-outline"
        destructive
        title={tl('quitTitle')}
        body={tl('quitBody')}
        confirmLabel={tl('quit')}
        onConfirm={() => {
          const leaving = confirm === 'leave';
          setConfirm(null);
          setPaused(false);
          void g.quit().then(() => (leaving ? router.back() : undefined));
        }}
        onCancel={() => setConfirm(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0B0F2A', overflow: 'hidden' },
  hallTop: { position: 'absolute', left: 0, right: 0, top: 0, paddingHorizontal: Spacing.md, gap: Spacing.sm },
  bar: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingTop: Spacing.xs },
  title: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 999, backgroundColor: PANEL },
  toast: {
    position: 'absolute',
    left: Spacing.md,
    right: Spacing.md,
    top: 120,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.sm,
    borderRadius: 14,
    backgroundColor: 'rgba(255,90,122,0.92)',
  },
  tip: { position: 'absolute', left: Spacing.md, right: Spacing.md, bottom: 110 },
});
