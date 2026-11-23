import { WorldScreen } from '@/components/lab/frame';
import { BinaryBreaker } from '@/components/tech/games/binary-breaker';
import { CircuitMaster } from '@/components/tech/games/circuit-master';
import { CodeRunner } from '@/components/tech/games/code-runner';
import { CyberDefender } from '@/components/tech/games/cyber-defender';
import { RobotRescue } from '@/components/tech/games/robot-rescue';
import { api, type TechGameId, type TechRun } from '@/lib/api';
import { useLabRun } from '@/lib/games/use-lab-run';

const GAMES: TechGameId[] = ['code-runner', 'cyber-defender', 'robot-rescue', 'binary-breaker', 'circuit-master'];

/**
 * The Tech Hub (Knowzone World): the hub of the five Technology & Computer Science games, each game's
 * levels, and play. The views and the frame are in components/lab/frame.tsx.
 */
export default function TechHub() {
  const g = useLabRun<TechRun>();
  return (
    <WorldScreen
      world="tech"
      games={GAMES}
      g={g}
      load={api.getTechGames}
      render={(run, { hold }) => {
        switch (run.game) {
          case 'code-runner':
            return <CodeRunner g={g} run={run} />;
          case 'cyber-defender':
            return <CyberDefender g={g} run={run} paused={hold} />;
          case 'robot-rescue':
            return <RobotRescue g={g} run={run} />;
          case 'binary-breaker':
            return <BinaryBreaker g={g} run={run} />;
          case 'circuit-master':
            return <CircuitMaster g={g} run={run} />;
        }
      }}
    />
  );
}
