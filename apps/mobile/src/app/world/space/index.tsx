import { WorldScreen } from '@/components/lab/frame';
import { defineGameFrame } from '@/components/lab/contract';
import { Defender } from '@/components/space/games/defender';
import { Explorer } from '@/components/space/games/explorer';
import { GravityBoard } from '@/components/space/games/gravity';
import { RocketWorkshop } from '@/components/space/games/rocket';
import { Survival } from '@/components/space/games/survival';
import { api, type SpaceGameId, type SpaceRun } from '@/lib/api';
import { useLabRun } from '@/lib/games/use-lab-run';

const GAMES: SpaceGameId[] = ['galaxy-defender', 'asteroid-survival', 'rocket-builder', 'gravity-master', 'solar-explorer'];

// Gravity Master has no lives.
defineGameFrame('gravity-master', { hearts: false });

/**
 * The Space Academy (Knowzone World): the hub of the five Space & Physics games, each game's levels, and
 * play. The views and the frame are in components/lab/frame.tsx.
 */
export default function SpaceAcademy() {
  const g = useLabRun<SpaceRun>();
  return (
    <WorldScreen
      world="space"
      games={GAMES}
      g={g}
      load={api.getSpaceGames}
      render={(run, { hold }) => {
        switch (run.game) {
          case 'galaxy-defender':
            return <Defender g={g} run={run} paused={hold} />;
          case 'asteroid-survival':
            return <Survival g={g} run={run} paused={hold} />;
          case 'rocket-builder':
            return <RocketWorkshop g={g} run={run} />;
          case 'gravity-master':
            return <GravityBoard g={g} run={run} />;
          case 'solar-explorer':
            return <Explorer g={g} run={run} paused={hold} />;
        }
      }}
    />
  );
}
