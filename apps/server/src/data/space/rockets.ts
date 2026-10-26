/**
 * Rocket Builder parts and missions. A rocket lifts off when its engine's thrust is more than its
 * weight (mass × 9.8), and reaches its target when its Δv (change in speed, from the rocket
 * equation: Δv = Isp × 9.8 × ln(full mass ÷ empty mass)) is at least what the mission needs.
 * Δv targets are scaled down for the game: real rockets use several stages.
 */
export const G0 = 9.8;
export const MAX_TANKS = 5;
export const FINS = { mass: 50, cost: 1 };

export type EngineId = 'spark' | 'nova' | 'titan' | 'ion';
export type TankId = 'small' | 'medium' | 'large';

export const ENGINES: Record<EngineId, { name: string; mass: number; thrust: number; isp: number; cost: number }> = {
  spark: { name: 'Spark', mass: 100, thrust: 30_000, isp: 300, cost: 3 },
  nova: { name: 'Nova', mass: 250, thrust: 80_000, isp: 330, cost: 6 },
  titan: { name: 'Titan', mass: 500, thrust: 200_000, isp: 280, cost: 9 },
  ion: { name: 'Ion drive', mass: 80, thrust: 500, isp: 3000, cost: 5 },
};

export const TANKS: Record<TankId, { name: string; dry: number; fuel: number; cost: number }> = {
  small: { name: 'Small tank', dry: 100, fuel: 900, cost: 1 },
  medium: { name: 'Medium tank', dry: 200, fuel: 2000, cost: 2 },
  large: { name: 'Large tank', dry: 400, fuel: 4500, cost: 4 },
};

export type Mission = {
  id: string;
  title: string;
  target: string;
  payload: { name: string; kind: 'nose' | 'capsule'; mass: number };
  dv: number;
  budget: number;
};

const m = (id: string, title: string, target: string, payload: Mission['payload'], dv: number, budget: number): Mission => ({
  id,
  title,
  target,
  payload,
  dv,
  budget,
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
};

export type Design = { engine: EngineId; tanks: TankId[] };

/** Everything the readouts show for a design. */
export function rocketStats(mission: Pick<Mission, 'payload'>, d: Design) {
  const e = ENGINES[d.engine];
  const tankDry = d.tanks.reduce((s, t) => s + TANKS[t].dry, 0);
  const fuel = d.tanks.reduce((s, t) => s + TANKS[t].fuel, 0);
  const dry = mission.payload.mass + FINS.mass + e.mass + tankDry;
  const mass = dry + fuel;
  const weight = mass * G0;
  return {
    mass,
    dry,
    fuel,
    weight,
    thrust: e.thrust,
    dv: fuel > 0 ? e.isp * G0 * Math.log(mass / dry) : 0,
    cost: e.cost + FINS.cost + d.tanks.reduce((s, t) => s + TANKS[t].cost, 0),
  };
}

/** Why a design fails a mission, or null when it flies. */
export function rocketProblem(mission: Mission, d: Design): 'no-fuel' | 'budget' | 'no-liftoff' | 'not-enough' | null {
  if (!d.tanks.length) return 'no-fuel';
  const s = rocketStats(mission, d);
  if (s.cost > mission.budget) return 'budget';
  if (s.thrust <= s.weight) return 'no-liftoff';
  if (s.dv < mission.dv) return 'not-enough';
  return null;
}
