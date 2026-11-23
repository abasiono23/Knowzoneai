import { AfricaExplorer } from '@/components/history/games/africa';
import { LostCivilization } from '@/components/history/games/dig';
import { TimeMachine } from '@/components/history/games/time-machine';
import { WorldScreen } from '@/components/lab/frame';
import { api, type HistoryGameId, type HistoryRun } from '@/lib/api';
import { useLabRun } from '@/lib/games/use-lab-run';

const GAMES: HistoryGameId[] = ['time-machine', 'lost-civilization', 'africa-explorer'];

/**
 * The Museum of Time (Knowzone World): the hub of the History & Civilisation games, each game's levels,
 * and play. The views and the frame are in components/lab/frame.tsx.
 */
export default function MuseumOfTime() {
  const g = useLabRun<HistoryRun>();
  return (
    <WorldScreen
      world="history"
      games={GAMES}
      g={g}
      load={api.getHistoryGames}
      render={(run, { hold }) => {
        switch (run.game) {
          case 'time-machine':
            return <TimeMachine g={g} run={run} paused={hold} />;
          case 'lost-civilization':
            return <LostCivilization g={g} run={run} paused={hold} />;
          case 'africa-explorer':
            return <AfricaExplorer g={g} run={run} paused={hold} />;
        }
      }}
    />
  );
}
