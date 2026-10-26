/**
 * Molecule Builder targets. The server checks a built molecule by its atoms and bonds: the right
 * number of each element, every atom using exactly its usual number of bonds (valency), and all
 * atoms joined up. Isomers count (any correct structure with the formula is accepted).
 */
export const VALENCY: Record<string, number> = { H: 1, C: 4, N: 3, O: 2, Cl: 1, F: 1, S: 2, Br: 1 };

export type Molecule = { name: string; formula: string; atoms: Record<string, number> };

const m = (name: string, formula: string, atoms: Record<string, number>): Molecule => ({ name, formula, atoms });

export const MOLECULES: Record<number, Molecule[]> = {
  1: [
    m('Hydrogen', 'H2', { H: 2 }),
    m('Hydrogen chloride', 'HCl', { H: 1, Cl: 1 }),
    m('Water', 'H2O', { H: 2, O: 1 }),
    m('Methane', 'CH4', { C: 1, H: 4 }),
    m('Chlorine', 'Cl2', { Cl: 2 }),
  ],
  2: [
    m('Ammonia', 'NH3', { N: 1, H: 3 }),
    m('Carbon dioxide', 'CO2', { C: 1, O: 2 }),
    m('Oxygen', 'O2', { O: 2 }),
    m('Nitrogen', 'N2', { N: 2 }),
    m('Hydrogen sulfide', 'H2S', { H: 2, S: 1 }),
  ],
  3: [
    m('Ethane', 'C2H6', { C: 2, H: 6 }),
    m('Ethene', 'C2H4', { C: 2, H: 4 }),
    m('Hydrogen cyanide', 'HCN', { H: 1, C: 1, N: 1 }),
    m('Methanol', 'CH3OH', { C: 1, H: 4, O: 1 }),
    m('Chloromethane', 'CH3Cl', { C: 1, H: 3, Cl: 1 }),
  ],
  4: [
    m('Ethyne', 'C2H2', { C: 2, H: 2 }),
    m('Ethanol', 'C2H5OH', { C: 2, H: 6, O: 1 }),
    m('Methanal', 'HCHO', { C: 1, H: 2, O: 1 }),
    m('Propane', 'C3H8', { C: 3, H: 8 }),
    m('Hydrogen peroxide', 'H2O2', { H: 2, O: 2 }),
  ],
  5: [
    m('Ethanoic acid', 'CH3COOH', { C: 2, H: 4, O: 2 }),
    m('Propene', 'C3H6', { C: 3, H: 6 }),
    m('Urea', 'CO(NH2)2', { C: 1, O: 1, N: 2, H: 4 }),
    m('Methanoic acid', 'HCOOH', { C: 1, H: 2, O: 2 }),
    m('Chloroethane', 'C2H5Cl', { C: 2, H: 5, Cl: 1 }),
  ],
};
