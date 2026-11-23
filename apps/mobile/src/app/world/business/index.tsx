import { BudgetMaster } from '@/components/business/games/budget-master';
import { MarketMaster } from '@/components/business/games/market-master';
import { MarketSimulator } from '@/components/business/games/market-simulator';
import { ProfitQuest } from '@/components/business/games/profit-quest';
import { StartupTycoon } from '@/components/business/games/startup-tycoon';
import { WorldScreen } from '@/components/lab/frame';
import { api, type BusinessGameId, type BusinessRun } from '@/lib/api';
import { useLabRun } from '@/lib/games/use-lab-run';

const GAMES: BusinessGameId[] = ['startup-tycoon', 'budget-master', 'market-master', 'profit-quest', 'market-simulator'];

/**
 * The Business District (Knowzone World): the hub of the five Business, Finance & Economics games, each
 * game's levels, and play. The views and the frame are in components/lab/frame.tsx.
 */
export default function BusinessDistrict() {
  const g = useLabRun<BusinessRun>();
  return (
    <WorldScreen
      world="business"
      games={GAMES}
      g={g}
      load={api.getBusinessGames}
      render={(run, { hold }) => {
        switch (run.game) {
          case 'startup-tycoon':
            return <StartupTycoon g={g} run={run} paused={hold} />;
          case 'budget-master':
            return <BudgetMaster g={g} run={run} paused={hold} />;
          case 'market-master':
            return <MarketMaster g={g} run={run} paused={hold} />;
          case 'profit-quest':
            return <ProfitQuest g={g} run={run} paused={hold} />;
          case 'market-simulator':
            return <MarketSimulator g={g} run={run} paused={hold} />;
        }
      }}
    />
  );
}
