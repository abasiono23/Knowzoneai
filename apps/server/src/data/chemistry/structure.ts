/**
 * Molecule structures for Molecule Builder: a small SMILES reader (the organic subset: B C N O P S F
 * Cl Br I, = and # bonds, branches, ring closures; hydrogens implied by valency), the formula of a
 * structure, and a check that a molecule the learner built is the same structure as the target
 * (graph isomorphism on atoms, bonds and bond orders), so isomers are told apart.
 */
export const VALENCY: Record<string, number> = { H: 1, C: 4, N: 3, O: 2, S: 2, P: 3, F: 1, Cl: 1, Br: 1, I: 1, B: 3 };

export type Graph = { atoms: string[]; bonds: [number, number, number][] };

/** Reads SMILES into a graph with every hydrogen written out. Throws on anything it doesn't know. */
export function fromSmiles(smiles: string): Graph {
  const atoms: string[] = [];
  const bonds: [number, number, number][] = [];
  const stack: number[] = [];
  const rings = new Map<number, [number, number]>();
  let prev = -1;
  let order = 1;
  let i = 0;
  while (i < smiles.length) {
    const ch = smiles[i]!;
    if (ch === '(') {
      stack.push(prev);
      i++;
    } else if (ch === ')') {
      prev = stack.pop()!;
      i++;
    } else if (ch === '=' || ch === '#' || ch === '-') {
      order = ch === '=' ? 2 : ch === '#' ? 3 : 1;
      i++;
    } else if (/\d/.test(ch)) {
      const n = Number(ch);
      const open = rings.get(n);
      if (open) {
        bonds.push([open[0], prev, Math.max(open[1], order)]);
        rings.delete(n);
      } else rings.set(n, [prev, order]);
      order = 1;
      i++;
    } else {
      const m = /^(Cl|Br|[BCNOPSFIH])/.exec(smiles.slice(i));
      if (!m) throw new Error(`Unknown SMILES ${smiles} at ${i}`);
      atoms.push(m[1]!);
      const k = atoms.length - 1;
      if (prev >= 0) bonds.push([prev, k, order]);
      order = 1;
      prev = k;
      i += m[1]!.length;
    }
  }
  if (rings.size || stack.length) throw new Error(`Unclosed ring or branch in ${smiles}`);
  const heavy = atoms.length;
  for (let k = 0; k < heavy; k++) {
    const used = bonds.reduce((s, [a, b, o]) => s + (a === k || b === k ? o : 0), 0);
    const free = VALENCY[atoms[k]!]! - used;
    if (free < 0) throw new Error(`Too many bonds on ${atoms[k]} in ${smiles}`);
    for (let h = 0; h < free; h++) {
      atoms.push('H');
      bonds.push([k, atoms.length - 1, 1]);
    }
  }
  return { atoms, bonds };
}

/** Atom counts. */
export function countsOf(g: Pick<Graph, 'atoms'>) {
  const out: Record<string, number> = {};
  for (const a of g.atoms) out[a] = (out[a] ?? 0) + 1;
  return out;
}

/** Hill order formula: C first, then H, then the rest alphabetically ("C2H6O"). */
export function hillFormula(counts: Record<string, number>) {
  const keys = Object.keys(counts).sort();
  const order = counts.C ? ['C', ...(counts.H ? ['H'] : []), ...keys.filter((k) => k !== 'C' && k !== 'H')] : keys;
  return order.map((k) => `${k}${counts[k] === 1 ? '' : counts[k]}`).join('');
}

/** Why a built molecule isn't a valid one: wrong atoms, a bad bond count, or pieces not joined. Null if fine. */
export function structureProblem(target: Record<string, number>, m: Graph): 'count' | 'valency' | 'disconnected' | null {
  const counts = countsOf(m);
  const keys = new Set([...Object.keys(counts), ...Object.keys(target)]);
  if ([...keys].some((k) => (counts[k] ?? 0) !== (target[k] ?? 0))) return 'count';
  const used = m.atoms.map(() => 0);
  const seen = new Set<string>();
  for (const [a, b, order] of m.bonds) {
    if (a === b || a < 0 || b < 0 || a >= m.atoms.length || b >= m.atoms.length || order < 1 || order > 3) return 'valency';
    const key = `${Math.min(a, b)}-${Math.max(a, b)}`;
    if (seen.has(key)) return 'valency';
    seen.add(key);
    used[a]! += order;
    used[b]! += order;
  }
  if (m.atoms.some((el, k) => used[k] !== VALENCY[el])) return 'valency';
  const parent = m.atoms.map((_, k) => k);
  const find = (k: number): number => (parent[k] === k ? k : (parent[k] = find(parent[k]!)));
  for (const [a, b] of m.bonds) parent[find(a)] = find(b);
  return new Set(m.atoms.map((_, k) => find(k))).size === 1 ? null : 'disconnected';
}

/** The heavy-atom skeleton: element, hydrogens on it, and neighbours with bond orders. */
function skeleton(g: Graph) {
  const heavy = g.atoms.map((a, k) => (a === 'H' ? -1 : k)).filter((k) => k >= 0);
  const index = new Map(heavy.map((k, i) => [k, i]));
  const hs = heavy.map(() => 0);
  const adj: Map<number, number>[] = heavy.map(() => new Map());
  let hh = 0;
  for (const [a, b, o] of g.bonds) {
    const ia = index.get(a);
    const ib = index.get(b);
    if (ia !== undefined && ib !== undefined) {
      adj[ia]!.set(ib, o);
      adj[ib]!.set(ia, o);
    } else if (ia !== undefined) hs[ia]!++;
    else if (ib !== undefined) hs[ib]!++;
    else hh++;
  }
  const labels = heavy.map((k, i) => `${g.atoms[k]}${hs[i]}`);
  return { labels, adj, hh };
}

/** Whether two valid molecules are the same structure (same atoms joined the same way). */
export function sameStructure(a: Graph, b: Graph): boolean {
  if (a.atoms.length !== b.atoms.length) return false;
  const A = skeleton(a);
  const B = skeleton(b);
  if (A.labels.length !== B.labels.length || A.hh !== B.hh) return false;
  // H2 and similar: no heavy atoms.
  if (!A.labels.length) return true;
  // Refine labels by neighbourhoods (colour refinement), then backtrack within classes.
  const refine = (S: typeof A) => {
    let lab = S.labels.slice();
    for (let round = 0; round < 4; round++)
      lab = lab.map((l, i) => `${l}(${[...S.adj[i]!].map(([j, o]) => `${o}${lab[j]}`).sort().join(',')})`);
    return lab;
  };
  const la = refine(A);
  const lb = refine(B);
  if ([...la].sort().join('|') !== [...lb].sort().join('|')) return false;
  const n = la.length;
  const map: number[] = Array(n).fill(-1);
  const used = Array(n).fill(false);
  const go = (i: number): boolean => {
    if (i === n) return true;
    for (let j = 0; j < n; j++) {
      if (used[j] || lb[j] !== la[i]) continue;
      // Every earlier mapped neighbour must match with the same bond order.
      let ok = true;
      for (let k = 0; k < i && ok; k++) {
        const oa = A.adj[i]!.get(k) ?? 0;
        const ob = B.adj[j]!.get(map[k]!) ?? 0;
        if (oa !== ob) ok = false;
      }
      if (!ok) continue;
      map[i] = j;
      used[j] = true;
      if (go(i + 1)) return true;
      used[j] = false;
      map[i] = -1;
    }
    return false;
  };
  return go(0);
}
