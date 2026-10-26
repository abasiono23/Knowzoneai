import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AskKora } from '@/components/lab/ask';
import { ElementCabinet } from '@/components/lab/games/elements';
import { MixtureBench } from '@/components/lab/games/mixture';
import { MoleculeDesk } from '@/components/lab/games/molecules';
import { MysteryBench } from '@/components/lab/games/mystery';
import { RushBoard } from '@/components/lab/games/rush';
import { LabHall } from '@/components/lab/hall';
import {
  AskButton,
  BOLD,
  Coins,
  Hearts,
  Inventory,
  KoraTip,
  Objective,
  PANEL,
  RoundButton,
  type InventoryItem,
} from '@/components/lab/hud';
import { GlasswareStation, ShelvesStation } from '@/components/lab/pickups';
import { GamePicker, LabResult, StationView, type CoverMap } from '@/components/lab/station';
import { ConfirmDialog, PauseMenu } from '@/components/world/overlays';
import { Text } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { errorText } from '@/i18n/errors';
import { api, type ChemGameId, type Glassware, type LabCatalogue, type LabReagent } from '@/lib/api';
import { USE_MOCKS } from '@/lib/config';
import { bottleArt, STATION_OF, STATIONS, type StationId } from '@/lib/games/lab';
import { useLabRun } from '@/lib/games/use-lab-run';

type Carried = { kind: 'reagent'; reagent: LabReagent } | { kind: 'glass'; glass: Glassware };

/**
 * The chemistry lab (Knowzone World). Walk around the lab, open stations, and play the five lab
 * games: Mixture Lab, Element Quest, Molecule Builder, Reaction Rush and Mystery Substance.
 */
export default function ChemistryLab() {
  const { t } = useTranslation('lab');
  const g = useLabRun();
  const run = g.run;
  const [catalogue, setCatalogue] = useState<LabCatalogue | null>(null);
  const [offline, setOffline] = useState<string | null>(null);
  const [station, setStation] = useState<StationId | null>(null);
  const [carry, setCarry] = useState<Carried[]>([]);
  const [poured, setPoured] = useState<string[]>([]);
  const [collected, setCollected] = useState<string[]>([]);
  const [asking, setAsking] = useState(false);
  const [paused, setPaused] = useState(false);
  const [confirm, setConfirm] = useState<'quit' | 'leave' | null>(null);
  const [current, setCurrent] = useState<{ game: ChemGameId; level: number } | null>(null);

  const load = useCallback(() => {
    if (USE_MOCKS) {
      setOffline(t('offline'));
      return;
    }
    api
      .getLabGames()
      .then((c) => {
        setCatalogue(c);
        setOffline(null);
      })
      .catch((e) => setOffline(errorText(e, t('offline'))));
  }, [t]);
  useFocusEffect(load);

  const levelsOf = (game: ChemGameId) => catalogue?.games.find((x) => x.id === game)?.levels ?? [];
  const reset = () => {
    setCarry([]);
    setPoured([]);
    setCollected([]);
  };
  const start = async (game: ChemGameId, level: number) => {
    reset();
    if (await g.start(game, level)) {
      setCurrent({ game, level });
      // Mixture Lab starts with a walk to the shelves; the other games are played where you are.
      if (game === 'mixture-lab') setStation(null);
    }
  };

  // Mixture Lab: what's on the list, and where to go next.
  const mixture = run?.game === 'mixture-lab' ? run : null;
  const exp = mixture ? mixture.experiments[Math.min(mixture.at, mixture.experiments.length - 1)] : null;
  const reagents = carry.flatMap((c) => (c.kind === 'reagent' ? [c.reagent] : []));
  const glassware = carry.flatMap((c) => (c.kind === 'glass' ? [c.glass] : []));
  const nameOf = (id: string) => mixture?.shelf.find((r) => r.id === id)?.name ?? id;
  const goal: StationId | null =
    run && run.status === 'playing'
      ? exp
        ? !exp.needs.every((id) => reagents.some((r) => r.id === id))
          ? 'shelves'
          : !glassware.includes(exp.glassware)
            ? 'glassware'
            : 'bench'
        : STATION_OF[run.game]
      : null;

  const inventory: InventoryItem[] =
    run?.game === 'element-quest'
      ? collected.map((s) => ({ key: s, art: 'jar', label: s }))
      : carry.map((c) =>
          c.kind === 'reagent'
            ? { key: c.reagent.id, art: bottleArt(c.reagent), label: c.reagent.formula }
            : { key: c.glass, art: c.glass, label: t(`glassware.${c.glass}`) },
        );
  const showInventory = !!mixture || run?.game === 'element-quest';

  const objective = (() => {
    if (!run || run.status !== 'playing') return null;
    switch (run.game) {
      case 'mixture-lab':
        return exp ? (
          <Objective
            compact={!!station}
            title={t('mixture.objective', { n: run.at + 1, total: run.experiments.length, title: exp.title })}
            items={[
              { label: t(`glassware.${exp.glassware}`), done: glassware.includes(exp.glassware) },
              ...exp.needs.map((id) => ({ label: nameOf(id), done: reagents.some((r) => r.id === id) })),
            ]}
          />
        ) : null;
      case 'element-quest': {
        const m = run.missions[Math.min(run.at, run.missions.length - 1)]!;
        return (
          <Objective
            compact={!!station}
            title={t('elements.objective', { n: run.at + 1, total: run.missions.length, text: m.text })}
          />
        );
      }
      case 'molecule-builder': {
        const m = run.molecules[Math.min(run.at, run.molecules.length - 1)]!;
        return (
          <Objective
            compact={!!station}
            title={t('molecules.objective', {
              name: m.name,
              formula: m.formula,
              n: run.at + 1,
              total: run.molecules.length,
            })}
          />
        );
      }
      case 'reaction-rush':
        // The whiteboard shows the task and the clock itself.
        return null;
      case 'mystery-substance':
        return (
          <Objective compact={!!station} title={t('mystery.objective', { n: run.at + 1, total: run.cases.length })} />
        );
    }
  })();

  const pick = (c: Carried) => {
    g.buzz('tap');
    setCarry((list) => (list.length >= 5 ? list : [...list, c]));
  };
  const tapInventory = (key: string) => {
    if (station === 'bench' && mixture) {
      // At the bench, tapping a reagent pours it in.
      if (reagents.some((r) => r.id === key) && !poured.includes(key) && poured.length < 2) {
        g.buzz('tap');
        setPoured([...poured, key]);
      }
      return;
    }
    if (run?.game === 'element-quest') setCollected(collected.filter((s) => s !== key));
    else setCarry(carry.filter((c) => (c.kind === 'reagent' ? c.reagent.id : c.glass) !== key));
  };

  const busyElsewhere = (s: StationId) =>
    run &&
    run.status === 'playing' &&
    !STATIONS[s].games.includes(run.game) &&
    !(mixture && (s === 'shelves' || s === 'glassware'));
  const stationBadge = (s: StationId) => {
    if (goal === s) return t('hall.goHere');
    const games = STATIONS[s].games;
    if (!games.length) return undefined;
    const stars = games.reduce((n, game) => n + levelsOf(game).reduce((m, l) => m + l.bestStars, 0), 0);
    return t('hall.stars', { count: stars, max: games.length * 15 });
  };

  const stationContent = (s: StationId, map: CoverMap) => {
    if (s === 'shelves')
      return mixture ? (
        <ShelvesStation
          map={map}
          shelf={mixture.shelf}
          carrying={reagents.map((r) => r.id)}
          full={carry.length >= 5}
          onPick={(r) => pick({ kind: 'reagent', reagent: r })}
        />
      ) : (
        <Tip text={t('shelves.idle')} />
      );
    if (s === 'glassware')
      return mixture ? (
        <GlasswareStation
          map={map}
          carrying={glassware}
          full={carry.length >= 5}
          onPick={(gl) => pick({ kind: 'glass', glass: gl })}
        />
      ) : (
        <Tip text={t('glassware.idle')} />
      );
    if (busyElsewhere(s)) return <Tip text={t('station.busy', { game: t(`games.${run!.game}.name`) })} />;
    if (run && run.status === 'playing') {
      switch (run.game) {
        case 'mixture-lab':
          return (
            <MixtureBench
              g={g}
              run={run}
              map={map}
              carrying={{ glassware, reagents: reagents.map((r) => r.id) }}
              poured={poured}
              onPoured={setPoured}
              onNext={() => {
                reset();
                setStation(null);
              }}
            />
          );
        case 'mystery-substance':
          return <MysteryBench g={g} run={run} map={map} />;
        case 'element-quest':
          return <ElementCabinet g={g} run={run} map={map} collected={collected} onCollected={setCollected} />;
        case 'molecule-builder':
          return <MoleculeDesk g={g} run={run} />;
        case 'reaction-rush':
          return <RushBoard g={g} run={run} map={map} />;
      }
    }
    if (offline) return <Tip text={offline} />;
    return (
      <GamePicker
        games={STATIONS[s].games}
        levelsOf={levelsOf}
        busy={g.busy}
        onStart={(game, level) => void start(game, level)}
      />
    );
  };

  const top = (
    <View style={{ gap: Spacing.sm }} pointerEvents="box-none">
      {run && run.status === 'playing' && (
        <View style={styles.runBar} pointerEvents="box-none">
          {run.game !== 'reaction-rush' && <Hearts left={run.hearts} />}
          <View style={{ flex: 1 }} />
          <AskButton onPress={() => setAsking(true)} />
          <RoundButton icon="pause" label={t('pause')} onPress={() => setPaused(true)} />
        </View>
      )}
      {objective}
    </View>
  );

  return (
    <View style={styles.root}>
      <LabHall
        topReserve={run?.status === 'playing' ? 300 : 170}
        onOpen={setStation}
        badges={Object.fromEntries((Object.keys(STATIONS) as StationId[]).map((s) => [s, stationBadge(s)]))}
        goal={goal}
        paused={!!station || paused || asking}
      />

      {!station && (
        <SafeAreaView edges={['top']} style={styles.hallTop} pointerEvents="box-none">
          <View style={styles.bar} pointerEvents="box-none">
            <RoundButton
              icon="arrow-back"
              label={t('leave')}
              onPress={() => (run?.status === 'playing' ? setConfirm('leave') : router.back())}
            />
            <View style={styles.title}>
              <Text style={{ fontFamily: BOLD, fontSize: 14, color: '#fff' }}>{t('title')}</Text>
            </View>
            <Coins />
          </View>
          {top}
          {!run && <KoraTip text={offline ?? t('hall.tip')} />}
        </SafeAreaView>
      )}

      {station && (
        <StationView id={station} onBack={() => setStation(null)} top={top}>
          {(map) => stationContent(station, map)}
        </StationView>
      )}

      {showInventory &&
        !(station === 'bench' && poured.length === 2) &&
        (station === null ||
          station === 'shelves' ||
          station === 'glassware' ||
          station === 'bench' ||
          station === 'cabinet') && (
          <SafeAreaView
            edges={['bottom']}
            style={[styles.inventory, station === null && { bottom: 120 }]}
            pointerEvents="box-none">
            <Inventory items={inventory} onTap={tapInventory} />
            {station === 'bench' && mixture && poured.length < 2 && reagents.length > 0 && (
              <Text style={styles.hint}>{t('mixture.tapToPour')}</Text>
            )}
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
          game={current.game}
          level={current.level}
          summary={g.summary}
          onNext={() => void start(current.game, current.level + 1)}
          onReplay={() => void start(current.game, current.level)}
          onBack={() => {
            g.close();
            reset();
            load();
          }}
        />
      )}

      <AskKora visible={asking} onClose={() => setAsking(false)} onAsk={g.ask} />
      <PauseMenu
        visible={paused && !confirm}
        title={current ? t(`games.${current.game}.name`) : t('title')}
        subtitle={current ? t('pauseSubtitle', { level: current.level }) : ''}
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
        title={t('quitTitle')}
        body={t('quitBody')}
        confirmLabel={t('quit')}
        onConfirm={() => {
          const leaving = confirm === 'leave';
          setConfirm(null);
          setPaused(false);
          reset();
          void g.quit().then(() => (leaving ? router.back() : setStation(null)));
        }}
        onCancel={() => setConfirm(null)}
      />
    </View>
  );
}

function Tip({ text }: { text: string }) {
  return (
    <View style={styles.tip}>
      <KoraTip text={text} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0B0F2A', overflow: 'hidden' },
  hallTop: { position: 'absolute', left: 0, right: 0, top: 0, paddingHorizontal: Spacing.md, gap: Spacing.sm },
  bar: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingTop: Spacing.xs },
  title: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 999, backgroundColor: PANEL },
  runBar: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  inventory: { position: 'absolute', left: 0, right: 0, bottom: 12, alignItems: 'center', gap: 4 },
  hint: {
    color: '#fff',
    fontSize: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: PANEL,
  },
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
