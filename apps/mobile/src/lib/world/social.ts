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
  league('bronze', '#A86A35'),
  league('silver', '#8E96A8'),
  league('gold', '#C99A1E'),
  league('diamond', '#2F7FC0'),
];
