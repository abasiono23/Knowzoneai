/**
 * Rocket Builder parts and missions. A rocket lifts off when its engine's thrust is more than its
 * weight (mass × 9.8) by the mission's margin (the thrust-to-weight ratio, TWR), and reaches its
 * target when its Δv (change in speed, from the rocket equation: Δv = Isp × 9.8 × ln(full mass ÷
 * empty mass)) is at least what the mission needs. From level 7 a rocket can have two stages: the
 * lower stage lifts everything and is dropped when empty, then the upper stage burns. Δv targets are
 * scaled down for the game (real launchers need about 9.4 km/s to reach low orbit).
 */
export const G0 = 9.8;
export const MAX_TANKS = 5;
/** An upper stage holds fewer tanks. */
export const MAX_UPPER_TANKS = 3;
export const FINS = { mass: 50, cost: 1 };
/** An upper stage must push at least half its own weight (in g), or its burns take too long. */
export const UPPER_TWR = 0.5;
/** From this level, rockets may have an upper stage. */
export const STAGING_LEVEL = 7;

export type EngineId = 'spark' | 'nova' | 'titan' | 'ion' | 'vega' | 'atlas';
export type TankId = 'small' | 'medium' | 'large' | 'xl';

export type Engine = { name: string; mass: number; thrust: number; isp: number; cost: number; level: number; vacuum?: boolean };
export const ENGINES: Record<EngineId, Engine> = {
  spark: { name: 'Spark', mass: 100, thrust: 30_000, isp: 300, cost: 3, level: 1 },
  nova: { name: 'Nova', mass: 250, thrust: 80_000, isp: 330, cost: 6, level: 1 },
  titan: { name: 'Titan', mass: 500, thrust: 200_000, isp: 280, cost: 9, level: 1 },
  ion: { name: 'Ion drive', mass: 80, thrust: 500, isp: 3000, cost: 5, level: 1 },
  /** A vacuum engine (hydrogen and oxygen): very efficient, but its big nozzle only works in space. */
  vega: { name: 'Vega (vacuum)', mass: 300, thrust: 60_000, isp: 450, cost: 7, level: 7, vacuum: true },
  /** A heavy first-stage booster. */
  atlas: { name: 'Atlas booster', mass: 1500, thrust: 600_000, isp: 290, cost: 12, level: 7 },
};

export const TANKS: Record<TankId, { name: string; dry: number; fuel: number; cost: number; level: number }> = {
  small: { name: 'Small tank', dry: 100, fuel: 900, cost: 1, level: 1 },
  medium: { name: 'Medium tank', dry: 200, fuel: 2000, cost: 2, level: 1 },
  large: { name: 'Large tank', dry: 400, fuel: 4500, cost: 4, level: 1 },
  xl: { name: 'Extra-large tank', dry: 900, fuel: 12_000, cost: 7, level: 7 },
};

export type Mission = {
  id: string;
  title: string;
  target: string;
  payload: { name: string; kind: 'nose' | 'capsule'; mass: number };
  dv: number;
  budget: number;
  /** The smallest thrust-to-weight ratio allowed at lift-off (1 means it only has to rise). */
  twr: number;
};

const m = (id: string, title: string, target: string, payload: Mission['payload'], dv: number, budget: number, twr = 1): Mission => ({
  id,
  title,
  target,
  payload,
  dv,
  budget,
  twr,
});
const sat = (name: string, mass: number) => ({ name, kind: 'nose' as const, mass });
const crew = (mass: number) => ({ name: 'Crew capsule', kind: 'capsule' as const, mass });

export const MISSIONS: Record<number, Mission[]> = {
  1: [
    m('hop', 'Test flight', 'High up in the sky', sat('Science payload', 300), 1500, 12),
    m('weather', 'Weather satellite', 'Earth orbit', sat('Weather satellite', 300), 2500, 12),
    m('nigsat', 'Communications satellite', 'Earth orbit', sat('Communications satellite', 500), 2500, 12),
  ],
  2: [
    m('light-sat', 'Small satellite', 'Earth orbit', sat('Small satellite', 300), 3000, 10),
    m('tv-sat', 'TV satellite', 'High Earth orbit', sat('TV satellite', 600), 3000, 12),
    m('cargo', 'Space station cargo', 'Space station', sat('Cargo pod', 1000), 2500, 12),
  ],
  3: [
    m('moon-probe', 'Moon probe', 'The Moon', sat('Moon probe', 500), 4000, 12),
    m('crew-orbit', 'Crewed flight', 'Earth orbit', crew(2000), 3000, 16),
    m('moon-sat', 'Moon mapper', 'Orbit round the Moon', sat('Mapping satellite', 300), 4300, 12),
  ],
  4: [
    m('mars-rover', 'Mars rover', 'Mars', sat('Mars rover', 900), 4500, 16),
    m('moon-lander', 'Moon lander', 'The Moon', sat('Moon lander', 1200), 4200, 16),
    m('venus-probe', 'Venus probe', 'Venus', sat('Venus probe', 600), 4700, 14),
  ],
  5: [
    m('jupiter', 'Jupiter explorer', 'Jupiter', sat('Jupiter probe', 500), 5200, 16),
    m('saturn', 'Saturn explorer', 'Saturn', sat('Saturn probe', 300), 5600, 16),
    m('crew-moon', 'Crew to the Moon', 'The Moon', crew(2000), 3800, 22),
  ],
  // Level 6 on: the lift-off thrust must beat the weight by a margin (TWR), as real launchers need.
  // (Missions were chosen by counting every design that flies: fewer work at each level.)
  6: [
    m('mars-orbiter', 'Mars orbiter', 'Orbit round Mars', sat('Mars orbiter', 300), 5000, 14, 1.3),
    m('lunar-relay', 'Lunar relay satellite', 'Orbit round the Moon', sat('Relay satellite', 500), 4800, 15, 1.25),
    m('crew-lab', 'Crew to the space lab', 'Space station', crew(1500), 3800, 20, 1.3),
    m('crew-gateway', 'Crew to lunar orbit', 'Orbit round the Moon', crew(2000), 3600, 22, 1.25),
  ],
  7: [
    m('asteroid-sample', 'Asteroid sample return', 'Near-Earth asteroid', sat('Sample-return probe', 600), 6000, 22, 1.3),
    m('mars-lander', 'Mars lander', 'Mars surface', sat('Mars lander', 1500), 5800, 26, 1.3),
    m('crew-moon-2', 'Crewed lunar landing', 'The Moon', crew(2000), 5600, 26, 1.4),
  ],
  8: [
    m('jupiter-orbiter', 'Jupiter orbiter', 'Orbit round Jupiter', sat('Jupiter orbiter', 800), 7000, 26, 1.4),
    m('venus-balloon', 'Venus atmosphere probe', 'Venus', sat('Balloon probe', 1000), 7200, 28, 1.4),
    m('heavy-geo', 'Heavy geostationary satellite', 'Geostationary orbit', sat('Broadband satellite', 2500), 6200, 32, 1.4),
  ],
  9: [
    m('saturn-orbiter', 'Saturn orbiter', 'Orbit round Saturn', sat('Saturn orbiter', 600), 8500, 30, 1.4),
    m('europa-lander', 'Europa lander', 'Europa', sat('Europa lander', 1200), 8000, 33, 1.5),
    m('mercury-orbiter', 'Mercury orbiter', 'Orbit round Mercury', sat('Mercury orbiter', 800), 8400, 32, 1.45),
  ],
  10: [
    m('solar-probe', 'Close solar probe', 'Near the Sun', sat('Solar probe', 600), 9500, 34, 1.5),
    m('pluto-flyby', 'Pluto fly-by', 'Pluto', sat('Pluto probe', 500), 9700, 35, 1.5),
    m('titan-lander', 'Titan lander', 'Titan', sat('Titan lander', 1000), 9000, 38, 1.5),
  ],
};

export type Stage = { engine: EngineId; tanks: TankId[] };
export type Design = Stage & { upper?: Stage };

const stageMass = (s: Stage) => {
  const e = ENGINES[s.engine];
  const dry = e.mass + s.tanks.reduce((n, t) => n + TANKS[t].dry, 0);
  const fuel = s.tanks.reduce((n, t) => n + TANKS[t].fuel, 0);
  return { dry, fuel, cost: e.cost + s.tanks.reduce((n, t) => n + TANKS[t].cost, 0) };
};
const deltaV = (isp: number, full: number, empty: number) => (full > empty ? isp * G0 * Math.log(full / empty) : 0);

/** Everything the readouts show for a design (masses in kg, forces in N, Δv in m/s). */
export function rocketStats(mission: Pick<Mission, 'payload'>, d: Design) {
  const lower = stageMass(d);
  const upper = d.upper ? stageMass(d.upper) : null;
  // What sits on top of the lower stage: the payload and fins, and the full upper stage.
  const top = mission.payload.mass + FINS.mass + (upper ? upper.dry + upper.fuel : 0);
  const mass = top + lower.dry + lower.fuel;
  const dry = top + lower.dry;
  const lowerDv = deltaV(ENGINES[d.engine].isp, mass, dry);
  const upperFull = upper ? mission.payload.mass + FINS.mass + upper.dry + upper.fuel : 0;
  const upperDv = upper && d.upper ? deltaV(ENGINES[d.upper.engine].isp, upperFull, upperFull - upper.fuel) : 0;
  const weight = mass * G0;
  return {
    mass,
    dry,
    fuel: lower.fuel + (upper?.fuel ?? 0),
    weight,
    thrust: ENGINES[d.engine].thrust,
    /** Lift-off thrust ÷ weight. */
    twr: ENGINES[d.engine].thrust / weight,
    dv: lowerDv + upperDv,
    stages: upper && d.upper ? [{ dv: lowerDv }, { dv: upperDv, mass: upperFull, twr: ENGINES[d.upper.engine].thrust / (upperFull * G0) }] : [{ dv: lowerDv }],
    cost: lower.cost + FINS.cost + (upper?.cost ?? 0),
  };
}

export type RocketProblem = 'no-fuel' | 'budget' | 'no-liftoff' | 'low-twr' | 'not-enough' | 'vacuum' | 'upper-thrust';

/** Why a design fails a mission, or null when it flies. */
export function rocketProblem(mission: Mission, d: Design): RocketProblem | null {
  if (!d.tanks.length || (d.upper && !d.upper.tanks.length)) return 'no-fuel';
  if (ENGINES[d.engine].vacuum) return 'vacuum';
  const s = rocketStats(mission, d);
  if (s.cost > mission.budget) return 'budget';
  if (s.thrust <= s.weight) return 'no-liftoff';
  if (s.twr < mission.twr) return 'low-twr';
  if (d.upper && s.stages[1]!.twr! < UPPER_TWR) return 'upper-thrust';
  if (s.dv < mission.dv) return 'not-enough';
  return null;
}

/** Parts a level can use. */
export const enginesAt = (level: number) => (Object.keys(ENGINES) as EngineId[]).filter((e) => ENGINES[e].level <= level);
export const tanksAt = (level: number) => (Object.keys(TANKS) as TankId[]).filter((t) => TANKS[t].level <= level);

/** Every design that can be built at a level (to check missions and to test). */
export function allDesigns(level: number): Design[] {
  const tanks = tanksAt(level);
  const sets = (max: number) => {
    const out: TankId[][] = [];
    const rec = (from: number, acc: TankId[]) => {
      if (acc.length) out.push(acc);
      if (acc.length === max) return;
      for (let i = from; i < tanks.length; i++) rec(i, [...acc, tanks[i]!]);
    };
    rec(0, []);
    return out;
  };
  const singles: Design[] = enginesAt(level).flatMap((engine) => sets(MAX_TANKS).map((t) => ({ engine, tanks: t })));
  if (level < STAGING_LEVEL) return singles;
  const uppers: Stage[] = enginesAt(level).flatMap((engine) => sets(MAX_UPPER_TANKS).map((t) => ({ engine, tanks: t })));
  return [...singles, ...singles.flatMap((lower) => uppers.map((upper) => ({ ...lower, upper })))];
}
