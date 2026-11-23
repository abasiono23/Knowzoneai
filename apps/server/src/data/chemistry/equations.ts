/**
 * Reaction Rush: equations to balance (the server checks atoms on both sides, with the smallest
 * whole numbers) and reactions to complete. Formulas use plain digits; the app shows subscripts.
 */
export type Equation = { reactants: string[]; products: string[]; coefficients: number[]; name?: string };
export type Completion = { reactants: string; answer: string; wrong: string[] };

const eq = (reactants: string[], products: string[], coefficients: number[]): Equation => ({ reactants, products, coefficients });

export const EQUATIONS: Record<number, Equation[]> = {
  1: [
    eq(['H2', 'O2'], ['H2O'], [2, 1, 2]),
    eq(['Na', 'Cl2'], ['NaCl'], [2, 1, 2]),
    eq(['Mg', 'O2'], ['MgO'], [2, 1, 2]),
    eq(['N2', 'H2'], ['NH3'], [1, 3, 2]),
    eq(['H2', 'Cl2'], ['HCl'], [1, 1, 2]),
    eq(['Ca', 'O2'], ['CaO'], [2, 1, 2]),
    eq(['K', 'Br2'], ['KBr'], [2, 1, 2]),
  ],
  2: [
    eq(['CH4', 'O2'], ['CO2', 'H2O'], [1, 2, 1, 2]),
    eq(['Al', 'O2'], ['Al2O3'], [4, 3, 2]),
    eq(['Zn', 'HCl'], ['ZnCl2', 'H2'], [1, 2, 1, 1]),
    eq(['Mg', 'HCl'], ['MgCl2', 'H2'], [1, 2, 1, 1]),
    eq(['Fe', 'O2'], ['Fe2O3'], [4, 3, 2]),
    eq(['H2O2'], ['H2O', 'O2'], [2, 2, 1]),
    eq(['Na', 'H2O'], ['NaOH', 'H2'], [2, 2, 2, 1]),
  ],
  3: [
    eq(['Fe', 'Cl2'], ['FeCl3'], [2, 3, 2]),
    eq(['NaOH', 'H2SO4'], ['Na2SO4', 'H2O'], [2, 1, 1, 2]),
    eq(['C3H8', 'O2'], ['CO2', 'H2O'], [1, 5, 3, 4]),
    eq(['KClO3'], ['KCl', 'O2'], [2, 2, 3]),
    eq(['Al', 'HCl'], ['AlCl3', 'H2'], [2, 6, 2, 3]),
    eq(['CaCO3', 'HCl'], ['CaCl2', 'H2O', 'CO2'], [1, 2, 1, 1, 1]),
    eq(['C2H4', 'O2'], ['CO2', 'H2O'], [1, 3, 2, 2]),
  ],
  4: [
    eq(['Ca(OH)2', 'HNO3'], ['Ca(NO3)2', 'H2O'], [1, 2, 1, 2]),
    eq(['Fe2O3', 'CO'], ['Fe', 'CO2'], [1, 3, 2, 3]),
    eq(['C2H6', 'O2'], ['CO2', 'H2O'], [2, 7, 4, 6]),
    eq(['Al', 'CuSO4'], ['Al2(SO4)3', 'Cu'], [2, 3, 1, 3]),
    eq(['NH3', 'O2'], ['NO', 'H2O'], [4, 5, 4, 6]),
    eq(['Pb(NO3)2'], ['PbO', 'NO2', 'O2'], [2, 2, 4, 1]),
    eq(['C2H5OH', 'O2'], ['CO2', 'H2O'], [1, 3, 2, 3]),
  ],
  5: [
    eq(['C6H12O6', 'O2'], ['CO2', 'H2O'], [1, 6, 6, 6]),
    eq(['Al2(SO4)3', 'Ca(OH)2'], ['Al(OH)3', 'CaSO4'], [1, 3, 2, 3]),
    eq(['KMnO4', 'HCl'], ['KCl', 'MnCl2', 'Cl2', 'H2O'], [2, 16, 2, 2, 5, 8]),
    eq(['Cu', 'HNO3'], ['Cu(NO3)2', 'NO', 'H2O'], [3, 8, 3, 2, 4]),
    eq(['C4H10', 'O2'], ['CO2', 'H2O'], [2, 13, 8, 10]),
    eq(['FeS2', 'O2'], ['Fe2O3', 'SO2'], [4, 11, 2, 8]),
    eq(['NaHCO3'], ['Na2CO3', 'H2O', 'CO2'], [2, 1, 1, 1]),
  ],
};

/**
 * Levels 6–10: ionic and redox equations (charges written "Fe^3+", electrons "e^-"). Only the species
 * are written here: the coefficients are worked out by formula.ts `balance`, and the tests check that
 * each has exactly one smallest whole-number answer, no bigger than 30.
 */
export const HARD_EQUATIONS: Record<number, [string[], string[]][]> = {
  6: [
    [['Cu', 'HNO3'], ['Cu(NO3)2', 'NO2', 'H2O']],
    [['C8H18', 'O2'], ['CO2', 'H2O']],
    [['Ca3(PO4)2', 'H2SO4'], ['CaSO4', 'H3PO4']],
    [['Fe3O4', 'H2'], ['Fe', 'H2O']],
    [['NaHCO3', 'H2SO4'], ['Na2SO4', 'H2O', 'CO2']],
    [['Fe^3+', 'OH^-'], ['Fe(OH)3']],
    [['CO3^2-', 'H^+'], ['H2O', 'CO2']],
    [['Al^3+', 'OH^-'], ['Al(OH)3']],
    [['NH4NO3'], ['N2O', 'H2O']],
  ],
  7: [
    [['MnO4^-', 'H^+', 'Fe^2+'], ['Mn^2+', 'H2O', 'Fe^3+']],
    [['Cr2O7^2-', 'H^+', 'Fe^2+'], ['Cr^3+', 'H2O', 'Fe^3+']],
    [['MnO4^-', 'H^+', 'C2O4^2-'], ['Mn^2+', 'H2O', 'CO2']],
    [['IO3^-', 'I^-', 'H^+'], ['I2', 'H2O']],
    [['Cu', 'H^+', 'NO3^-'], ['Cu^2+', 'NO', 'H2O']],
    [['H2O2', 'I^-', 'H^+'], ['I2', 'H2O']],
    [['MnO4^-', 'H^+', 'e^-'], ['Mn^2+', 'H2O']],
    [['Cr2O7^2-', 'H^+', 'e^-'], ['Cr^3+', 'H2O']],
  ],
  8: [
    [['Cl2', 'OH^-'], ['Cl^-', 'ClO3^-', 'H2O']],
    [['MnO4^-', 'I^-', 'H2O'], ['MnO2', 'I2', 'OH^-']],
    [['Cr(OH)3', 'ClO^-', 'OH^-'], ['CrO4^2-', 'Cl^-', 'H2O']],
    [['P4', 'OH^-', 'H2O'], ['PH3', 'H2PO2^-']],
    [['S2O3^2-', 'I2'], ['S4O6^2-', 'I^-']],
    [['Al', 'OH^-', 'H2O'], ['[Al(OH)4]^-', 'H2']],
    [['H2O2', 'Fe^2+', 'H^+'], ['Fe^3+', 'H2O']],
    [['Zn', 'NO3^-', 'H^+'], ['Zn^2+', 'NH4^+', 'H2O']],
  ],
  9: [
    [['As2S3', 'HNO3', 'H2O'], ['H3AsO4', 'H2SO4', 'NO']],
    [['FeS2', 'O2'], ['Fe2O3', 'SO2']],
    [['KClO3', 'HCl'], ['KCl', 'Cl2', 'H2O']],
    [['K2Cr2O7', 'HCl'], ['KCl', 'CrCl3', 'Cl2', 'H2O']],
    [['Zn', 'HNO3'], ['Zn(NO3)2', 'NH4NO3', 'H2O']],
    [['NaBH4', 'H2O'], ['NaB(OH)4', 'H2']],
    [['Cu2S', 'HNO3'], ['Cu(NO3)2', 'CuSO4', 'NO2', 'H2O']],
  ],
  10: [
    [['P4', 'HNO3', 'H2O'], ['H3PO4', 'NO']],
    [['Mn^2+', 'BiO3^-', 'H^+'], ['MnO4^-', 'Bi^3+', 'H2O']],
    [['XeF6', 'H2O'], ['XeO3', 'HF']],
    [['Cu2S', 'NO3^-', 'H^+'], ['Cu^2+', 'SO4^2-', 'NO', 'H2O']],
    [['S', 'HNO3'], ['H2SO4', 'NO2', 'H2O']],
    [['PbS', 'H2O2'], ['PbSO4', 'H2O']],
    [['N2H4', 'IO3^-', 'H^+', 'Cl^-'], ['N2', 'ICl2^-', 'H2O']],
    [['Ag', 'CN^-', 'O2', 'H2O'], ['[Ag(CN)2]^-', 'OH^-']],
  ],
};

export const COMPLETIONS: Record<number, Completion[]> = {
  1: [
    { reactants: 'Mg + O2 →', answer: 'MgO', wrong: ['MgO2', 'Mg2O'] },
    { reactants: 'Na + Cl2 →', answer: 'NaCl', wrong: ['NaCl2', 'Na2Cl'] },
    { reactants: 'H2 + O2 →', answer: 'H2O', wrong: ['HO', 'H2O3'] },
    { reactants: 'C + O2 →', answer: 'CO2', wrong: ['CO3', 'C2O'] },
  ],
  2: [
    { reactants: 'Zn + HCl →', answer: 'ZnCl2 + H2', wrong: ['ZnCl + H2', 'ZnH2 + Cl2'] },
    { reactants: 'CaCO3 (heated) →', answer: 'CaO + CO2', wrong: ['Ca + CO3', 'CaO2 + CO'] },
    { reactants: 'Al + O2 →', answer: 'Al2O3', wrong: ['AlO', 'AlO2'] },
    { reactants: 'Mg + HCl →', answer: 'MgCl2 + H2', wrong: ['MgCl + H2', 'MgH2 + Cl2'] },
  ],
  3: [
    { reactants: 'NaOH + HCl →', answer: 'NaCl + H2O', wrong: ['NaH + ClOH', 'NaClO + H2'] },
    { reactants: 'CuO + H2SO4 →', answer: 'CuSO4 + H2O', wrong: ['CuS + H2O4', 'Cu + H2SO4O'] },
    { reactants: 'CH4 + O2 →', answer: 'CO2 + H2O', wrong: ['CH2 + O2H2', 'C + H2O2'] },
    { reactants: 'Fe + CuSO4 →', answer: 'FeSO4 + Cu', wrong: ['FeCu + SO4', 'No reaction'] },
  ],
  4: [
    { reactants: 'Cu + AgNO3 →', answer: 'Cu(NO3)2 + Ag', wrong: ['CuAg + NO3', 'No reaction'] },
    { reactants: 'Ca(OH)2 + CO2 →', answer: 'CaCO3 + H2O', wrong: ['CaO + H2CO3', 'Ca(CO2)2 + H2'] },
    { reactants: 'NH3 + HCl →', answer: 'NH4Cl', wrong: ['NH2Cl + H2', 'NCl3 + H2'] },
    { reactants: 'Zn + CuSO4 →', answer: 'ZnSO4 + Cu', wrong: ['ZnCu + SO4', 'No reaction'] },
  ],
  5: [
    { reactants: 'Cu + HCl (dilute) →', answer: 'No reaction', wrong: ['CuCl2 + H2', 'CuH + Cl2'] },
    { reactants: 'Cl2 + KBr →', answer: 'KCl + Br2', wrong: ['KClBr', 'No reaction'] },
    { reactants: 'I2 + KCl →', answer: 'No reaction', wrong: ['KI + Cl2', 'KICl'] },
    { reactants: 'C2H4 + Br2 →', answer: 'C2H4Br2', wrong: ['C2H3Br + HBr', 'No reaction'] },
  ],
};
