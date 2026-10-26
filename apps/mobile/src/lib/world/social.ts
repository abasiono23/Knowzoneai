import i18n from '../../i18n';

/**
 * League tiers (names and colours). Leagues, school boards and friends are kept on the server
 * (/me/leagues, /me/friends); there are no made-up players any more.
 */
const league = (id: 'bronze' | 'silver' | 'gold' | 'diamond', color: string) => ({
  id,
  color,
  /** Translated each time it's read. */
  get name() {
    return i18n.t(`world:leagues.${id}`);
  },
});

export const LEAGUES = [
  league('bronze', '#CD7F32'),
  league('silver', '#C0C7D6'),
  league('gold', '#FFC857'),
  league('diamond', '#4CC9FF'),
];
