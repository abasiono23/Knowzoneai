import { Ionicons } from '@expo/vector-icons';
import { useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { FONT, W } from '@/components/games/ui';
import { defineGameFrame } from '@/components/lab/contract';
import { WorldScreen } from '@/components/lab/frame';
import { ElementCabinet } from '@/components/lab/games/elements';
import { MixtureBench } from '@/components/lab/games/mixture';
import { MoleculeDesk } from '@/components/lab/games/molecules';
import { MysteryBench } from '@/components/lab/games/mystery';
import { RushBoard } from '@/components/lab/games/rush';
import { GlasswareStation, ShelvesStation } from '@/components/lab/games/shelves';
import { Text } from '@/components/ui';
import { Fonts } from '@/constants/theme';
import {
  api,
  type ChemGameId,
  type ElementQuestRun,
  type Glassware,
  type LabReagent,
  type LabRun,
  type MixtureLabRun,
} from '@/lib/api';
import { coverMap } from '@/lib/games/lab';
import { useLabRun, type LabGame } from '@/lib/games/use-lab-run';

const GAMES: ChemGameId[] = ['mixture-lab', 'element-quest', 'molecule-builder', 'reaction-rush', 'mystery-substance'];

// Reaction Rush is against the clock and has no lives.
defineGameFrame('reaction-rush', { hearts: false });

/**
 * The chemistry lab (Knowzone World): the hub of the five lab games, each game's levels, and play. The
 * views and the frame are in components/lab/frame.tsx; this file mounts each game on its stage.
 */
export default function ChemistryLab() {
  const g = useLabRun<LabRun>();
  return (
    <WorldScreen
      world="chemistry"
      games={GAMES}
      g={g}
      load={api.getLabGames}
      render={(run, { hold }) => <ChemStage key={run.id} g={g} run={run} hold={hold} />}
    />
  );
}

/** The play area: measures itself so the games can place things on it (`map`), then mounts the game. */
function Stage({ children }: { children: (map: ReturnType<typeof coverMap>) => ReactNode }) {
  const [size, setSize] = useState({ w: 0, h: 0 });
  return (
    <View style={{ flex: 1 }} onLayout={(e) => setSize({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}>
      {size.w > 0 && children(coverMap(size.w, size.h))}
    </View>
  );
}

function ChemStage({ g, run, hold }: { g: LabGame; run: LabRun; hold: boolean }) {
  switch (run.game) {
    case 'mixture-lab':
      return <MixtureStage g={g} run={run} />;
    case 'element-quest':
      return <ElementStage g={g} run={run} />;
    case 'molecule-builder':
      return <MoleculeDesk g={g} run={run} />;
    case 'mystery-substance':
      return <Stage>{(map) => <MysteryBench g={g} run={run} map={map} />}</Stage>;
    case 'reaction-rush':
      // The clock stops while the pause menu, rules or Ask Kora are open.
      return <Stage>{(map) => <RushBoard g={g} run={run} map={map} paused={hold} />}</Stage>;
  }
}

type Carried = { kind: 'reagent'; reagent: LabReagent } | { kind: 'glass'; glass: Glassware };
type Place = 'shelves' | 'glassware' | 'bench';

/**
 * Mixture Lab: fetch the reagents and the glassware on the list, then mix them at the bench. The three
 * places are plain tabs (no walking), with the list and what you're carrying above them.
 */
function MixtureStage({ g, run }: { g: LabGame; run: MixtureLabRun }) {
  const { t } = useTranslation('lab');
  const [place, setPlace] = useState<Place>('shelves');
  const [carry, setCarry] = useState<Carried[]>([]);
  const [poured, setPoured] = useState<string[]>([]);
  const exp = run.experiments[Math.min(run.at, run.experiments.length - 1)];
  const reagents = carry.flatMap((c) => (c.kind === 'reagent' ? [c.reagent] : []));
  const glassware = carry.flatMap((c) => (c.kind === 'glass' ? [c.glass] : []));
  const nameOf = (id: string) => run.shelf.find((r) => r.id === id)?.name ?? id;
  const goal: Place | null = exp
    ? !exp.needs.every((id) => reagents.some((r) => r.id === id))
      ? 'shelves'
      : !glassware.includes(exp.glassware)
        ? 'glassware'
        : 'bench'
    : null;
  const full = carry.length >= 5;
  const pick = (c: Carried) => {
    g.buzz('tap');
    setCarry((list) => (list.length >= 5 ? list : [...list, c]));
  };
  const tapItem = (key: string) => {
    if (place === 'bench') {
      // At the bench, tapping a reagent pours it in.
      if (reagents.some((r) => r.id === key) && !poured.includes(key) && poured.length < 2) {
        g.buzz('tap');
        setPoured([...poured, key]);
      }
      return;
    }
    setCarry(carry.filter((c) => (c.kind === 'reagent' ? c.reagent.id : c.glass) !== key));
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.top}>
        {exp && (
          <Objective
            title={t('mixture.objective', { n: run.at + 1, total: run.experiments.length, title: exp.title })}
            items={[
              { label: t(`glassware.${exp.glassware}`), done: glassware.includes(exp.glassware) },
              ...exp.needs.map((id) => ({ label: nameOf(id), done: reagents.some((r) => r.id === id) })),
            ]}
          />
        )}
        <Tabs
          value={place}
          goal={goal}
          options={(['shelves', 'glassware', 'bench'] as const).map((p) => ({ id: p, label: t(`stations.${p}`) }))}
          onChange={setPlace}
          goHere={t('hall.goHere')}
        />
        {!(place === 'bench' && poured.length === 2) && (
          <Carrying
            items={carry.map((c) =>
              c.kind === 'reagent'
                ? { key: c.reagent.id, label: c.reagent.formula, used: poured.includes(c.reagent.id) }
                : { key: c.glass, label: t(`glassware.${c.glass}`) },
            )}
            hint={place === 'bench' && poured.length < 2 && reagents.length > 0 ? t('mixture.tapToPour') : null}
            onTap={tapItem}
          />
        )}
      </View>
      <Stage>
        {(map) =>
          place === 'shelves' ? (
            <ShelvesStation
              map={map}
              shelf={run.shelf}
              carrying={reagents.map((r) => r.id)}
              full={full}
              onPick={(r) => pick({ kind: 'reagent', reagent: r })}
            />
          ) : place === 'glassware' ? (
            <GlasswareStation map={map} carrying={glassware} full={full} onPick={(gl) => pick({ kind: 'glass', glass: gl })} />
          ) : (
            <MixtureBench
              g={g}
              run={run}
              map={map}
              carrying={{ glassware, reagents: reagents.map((r) => r.id) }}
              poured={poured}
              onPoured={setPoured}
              onNext={() => {
                setCarry([]);
                setPoured([]);
                setPlace('shelves');
              }}
            />
          )
        }
      </Stage>
    </View>
  );
}

/** Element Quest: the mission, the elements collected so far, and the cabinet. */
function ElementStage({ g, run }: { g: LabGame; run: ElementQuestRun }) {
  const { t } = useTranslation('lab');
  const [collected, setCollected] = useState<string[]>([]);
  const m = run.missions[Math.min(run.at, run.missions.length - 1)]!;
  return (
    <View style={{ flex: 1 }}>
      <View style={styles.top}>
        <Objective title={t('elements.objective', { n: run.at + 1, total: run.missions.length, text: m.text })} />
        <Carrying
          items={collected.map((s) => ({ key: s, label: s }))}
          onTap={(s) => setCollected(collected.filter((x) => x !== s))}
        />
      </View>
      <Stage>{(map) => <ElementCabinet g={g} run={run} map={map} collected={collected} onCollected={setCollected} />}</Stage>
    </View>
  );
}

/** The task, with a checklist: a tick or an open circle, and the words, for each thing needed. */
function Objective({ title, items }: { title: string; items?: { label: string; done: boolean }[] }) {
  const { t } = useTranslation('games');
  return (
    <View style={styles.objective}>
      <Text style={styles.objectiveTitle}>{title}</Text>
      {!!items?.length && (
        <View style={styles.checks}>
          {items.map((it) => (
            <View
              key={it.label}
              style={styles.check}
              accessible
              accessibilityLabel={`${it.label}: ${it.done ? t('ui.correct') : '—'}`}>
              <Ionicons
                name={it.done ? 'checkmark-circle' : 'ellipse-outline'}
                size={16}
                color={it.done ? W.correct : W.muted}
              />
              <Text style={[styles.checkText, it.done && { color: W.correct }]}>{it.label}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

/** Plain buttons for the three places at the lab, with a marker on where to go next. */
function Tabs<T extends string>({
  value,
  goal,
  options,
  onChange,
  goHere,
}: {
  value: T;
  goal: T | null;
  options: { id: T; label: string }[];
  onChange: (v: T) => void;
  goHere: string;
}) {
  return (
    <View style={styles.tabs} accessibilityRole="tablist">
      {options.map((o) => {
        const on = o.id === value;
        return (
          <Pressable
            key={o.id}
            onPress={() => onChange(o.id)}
            accessibilityRole="tab"
            accessibilityState={{ selected: on }}
            accessibilityLabel={goal === o.id && !on ? `${o.label}. ${goHere}` : o.label}
            style={[styles.tab, on && styles.tabOn]}>
            <Text style={[styles.tabText, on && { color: '#fff' }]} numberOfLines={2}>
              {o.label}
            </Text>
            {goal === o.id && !on && <View style={styles.goal} />}
          </Pressable>
        );
      })}
    </View>
  );
}

/** What you're carrying, as chips; tap one to put it back (or, at the bench, to pour it). */
function Carrying({
  items,
  hint,
  onTap,
}: {
  items: { key: string; label: string; used?: boolean }[];
  hint?: string | null;
  onTap: (key: string) => void;
}) {
  if (!items.length) return null;
  return (
    <View style={{ gap: 6 }}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
        {items.map((it) => (
          <Pressable
            key={it.key}
            onPress={() => onTap(it.key)}
            accessibilityRole="button"
            accessibilityLabel={it.label}
            style={({ pressed }) => [styles.chip, it.used && { opacity: 0.4 }, pressed && { backgroundColor: W.key }]}>
            <Text style={styles.chipText}>{it.label}</Text>
          </Pressable>
        ))}
      </ScrollView>
      {!!hint && <Text style={styles.hint}>{hint}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  top: { width: '100%', maxWidth: 520, alignSelf: 'center', paddingHorizontal: 16, paddingTop: 10, gap: 10 },
  objective: { padding: 12, borderRadius: 14, backgroundColor: W.surface, borderWidth: 1, borderColor: W.line, gap: 8 },
  objectiveTitle: { fontFamily: Fonts.bold, fontSize: 15, lineHeight: 21, color: W.ink },
  checks: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, rowGap: 6 },
  check: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  checkText: { fontFamily: Fonts.semibold, fontSize: 13, color: W.inkSoft },
  tabs: { flexDirection: 'row', padding: 4, borderRadius: 12, backgroundColor: W.key, gap: 4 },
  tab: { flex: 1, minHeight: 44, borderRadius: 9, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  tabOn: { backgroundColor: W.ink },
  tabText: { fontFamily: Fonts.bold, fontSize: 13, lineHeight: 16, color: W.ink, textAlign: 'center' },
  goal: { position: 'absolute', top: 6, right: 8, width: 8, height: 8, borderRadius: 4, backgroundColor: W.focus },
  chip: {
    minHeight: 40,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: W.ink,
    backgroundColor: W.surface,
    justifyContent: 'center',
  },
  chipText: { fontFamily: FONT, fontSize: 14, color: W.ink },
  hint: { fontFamily: Fonts.semibold, fontSize: 13, color: W.inkSoft },
});
