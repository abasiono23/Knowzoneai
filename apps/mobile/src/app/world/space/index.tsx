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
import { Defender } from '@/components/space/games/defender';
import { Explorer } from '@/components/space/games/explorer';
import { GravityBoard } from '@/components/space/games/gravity';
import { RocketWorkshop } from '@/components/space/games/rocket';
import { Survival } from '@/components/space/games/survival';
import { ConfirmDialog, PauseMenu } from '@/components/world/overlays';
import { Text } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { errorText } from '@/i18n/errors';
import { api, type SpaceCatalogue, type SpaceGameId, type SpaceRun } from '@/lib/api';
import { USE_MOCKS } from '@/lib/config';
import { ACADEMY, SPACE_SCENES, SPACE_STATION_OF, SPACE_STATIONS, type SpaceStation } from '@/lib/games/space';
import { useLabRun } from '@/lib/games/use-lab-run';

/**
 * The Space Academy (Knowzone World). Walk around the station in your space suit, enter the hangar,
 * the rocket workshop, the gravity lab or the observatory, and play the five Space & Physics games.
 */
export default function SpaceAcademy() {
  const { t } = useTranslation('space');
  const tl = useTranslation('lab').t;
  const g = useLabRun<SpaceRun>();
  const run = g.run;
  const [catalogue, setCatalogue] = useState<SpaceCatalogue | null>(null);
  const [offline, setOffline] = useState<string | null>(null);
  const [station, setStation] = useState<SpaceStation | null>(null);
  const [asking, setAsking] = useState(false);
  const [paused, setPaused] = useState(false);
  const [confirm, setConfirm] = useState<'quit' | 'leave' | null>(null);
  const [current, setCurrent] = useState<{ game: SpaceGameId; level: number } | null>(null);

  const load = useCallback(() => {
    if (USE_MOCKS) {
      setOffline(t('offline'));
      return;
    }
    api
      .getSpaceGames()
      .then((c) => {
        setCatalogue(c);
        setOffline(null);
      })
      .catch((e) => setOffline(errorText(e, t('offline'))));
  }, [t]);
  useFocusEffect(load);

  const levelsOf = (game: SpaceGameId) => catalogue?.games.find((x) => x.id === game)?.levels ?? [];
  const start = async (game: SpaceGameId, level: number) => {
    if (await g.start(game, level)) setCurrent({ game, level });
  };
  const playing = run?.status === 'playing' ? run : null;
  const hold = paused || asking || !!confirm;

  const stationBadge = (s: SpaceStation) => {
    const games = SPACE_STATIONS[s].games;
    const stars = games.reduce((n, game) => n + levelsOf(game).reduce((m, l) => m + l.bestStars, 0), 0);
    return t('hall.stars', { count: stars, max: games.length * 15 });
  };

  const game = (() => {
    if (!playing) return null;
    switch (playing.game) {
      case 'galaxy-defender':
        return <Defender g={g} run={playing} paused={hold} />;
      case 'asteroid-survival':
        return <Survival g={g} run={playing} paused={hold} />;
      case 'rocket-builder':
        return <RocketWorkshop g={g} run={playing} />;
      case 'gravity-master':
        return <GravityBoard g={g} run={playing} />;
      case 'solar-explorer':
        return <Explorer g={g} run={playing} paused={hold} />;
    }
  })();

  return (
    <View style={styles.root}>
      {game ?? (
        <>
          <LabHall<SpaceStation>
            place={ACADEMY}
            ns="space"
            topReserve={170}
            onOpen={setStation}
            badges={Object.fromEntries(
              (Object.keys(SPACE_STATIONS) as SpaceStation[]).map((s) => [s, stationBadge(s)]),
            )}
            goal={current ? SPACE_STATION_OF[current.game] : null}
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
              scene={SPACE_SCENES[station]}
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
                    ns="space"
                    games={SPACE_STATIONS[station].games}
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
            {playing.game !== 'gravity-master' && <Hearts left={playing.hearts} />}
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
          ns="space"
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
