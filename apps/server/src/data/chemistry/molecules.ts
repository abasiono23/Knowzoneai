/**
 * Molecule Builder targets, as SMILES (structure.ts reads them, works out the formula and checks the
 * learner's molecule is this exact structure, so isomers count as different). Levels 1–4 are named
 * molecules; 5–7 named isomers and functional groups; 8–10 ask for the product of a reaction, from one
 * step (Markovnikov addition) to olympiad mechanisms (pinacol, Claisen, Diels–Alder). Checked by a second
 * model (scripts/chemistry-content.ts, stage `molecules`) and by test/chemistry.test.ts.
 */
export { VALENCY } from './structure.js';

export type Molecule = {
  name: string;
  smiles: string;
  /** For reaction levels: what to build, instead of just the name. */
  task?: string;
};

const m = (name: string, smiles: string, task?: string): Molecule => ({ name, smiles, ...(task && { task }) });

export const MOLECULES: Record<number, Molecule[]> = {
  1: [m('Hydrogen', 'HH'), m('Hydrogen chloride', 'HCl'), m('Water', 'O'), m('Methane', 'C'), m('Chlorine', 'ClCl'), m('Ammonia', 'N'), m('Fluorine', 'FF')],
  2: [m('Oxygen', 'O=O'), m('Nitrogen', 'N#N'), m('Carbon dioxide', 'O=C=O'), m('Hydrogen cyanide', 'C#N'), m('Hydrogen sulfide', 'S'), m('Chloromethane', 'CCl'), m('Hydrogen bromide', 'HBr')],
  3: [m('Ethane', 'CC'), m('Ethene', 'C=C'), m('Methanol', 'CO'), m('Ethyne', 'C#C'), m('Methanal', 'C=O'), m('Hydrogen peroxide', 'OO'), m('Dichloromethane', 'ClCCl')],
  4: [
    m('Ethanol', 'CCO'),
    m('Propane', 'CCC'),
    m('Propene', 'CC=C'),
    m('Ethanoic acid', 'CC(=O)O'),
    m('Chloroethane', 'CCCl'),
    m('Urea', 'NC(N)=O'),
    m('Methylamine', 'CN'),
    m('Methanoic acid', 'OC=O'),
  ],
  5: [
    m('Propan-1-ol', 'CCCO'),
    m('Propan-2-ol', 'CC(C)O'),
    m('Butane', 'CCCC'),
    m('2-Methylpropane', 'CC(C)C'),
    m('But-1-ene', 'C=CCC'),
    m('But-2-ene', 'CC=CC'),
    m('Propanone', 'CC(C)=O'),
    m('Propanal', 'CCC=O'),
    m('Methoxymethane', 'COC'),
    m('Methyl methanoate', 'COC=O'),
  ],
  6: [
    m('Ethyl ethanoate', 'CCOC(C)=O'),
    m('2-Methylpropan-2-ol', 'CC(C)(C)O'),
    m('Ethanamide', 'CC(N)=O'),
    m('Ethylamine', 'CCN'),
    m('Propanenitrile', 'CCC#N'),
    m('Ethanoyl chloride', 'CC(=O)Cl'),
    m('Butanone', 'CCC(C)=O'),
    m('Cyclohexane', 'C1CCCCC1'),
    m('2-Hydroxypropanoic acid (lactic acid)', 'CC(O)C(=O)O'),
  ],
  7: [
    m('Benzene (Kekulé structure)', 'C1=CC=CC=C1'),
    m('Phenol', 'OC1=CC=CC=C1'),
    m('Methylbenzene', 'CC1=CC=CC=C1'),
    m('Glycine (aminoethanoic acid)', 'NCC(=O)O'),
    m('3-Methylbutan-2-one', 'CC(C)C(C)=O'),
    m('Pent-2-ene', 'CCC=CC'),
    m('Ethane-1,2-diol', 'OCCO'),
    m('Trichloromethane', 'ClC(Cl)Cl'),
    m('Alanine (2-aminopropanoic acid)', 'CC(N)C(=O)O'),
  ],
  8: [
    m('2-Bromopropane', 'CC(C)Br', 'Build the major product of HBr adding to propene'),
    m('Propanone', 'CC(C)=O', 'Build the product of heating propan-2-ol with acidified potassium dichromate(VI)'),
    m('Ethyl propanoate', 'CCC(=O)OCC', 'Build the ester made from ethanol and propanoic acid (acid catalyst)'),
    m('But-2-ene', 'CC=CC', 'Build the major alkene from dehydrating butan-2-ol with hot concentrated H₂SO₄'),
    m('2-Hydroxypropanenitrile', 'CC(O)C#N', 'Build the product of ethanal with HCN (cyanide catalyst)'),
    m('Ethanoic acid', 'CC(=O)O', 'Build the product of refluxing ethanol with excess acidified dichromate(VI)'),
    m('Propan-2-ol', 'CC(C)O', 'Build the product of reducing propanone with NaBH₄'),
    m('Ethylamine', 'CCN', 'Build the main organic product of bromoethane with excess ammonia'),
    m('1,2-Dibromopropane', 'CC(Br)CBr', 'Build the product of bromine adding to propene'),
  ],
  9: [
    m('Propanoic acid', 'CCC(=O)O', 'Ethene → HBr → KCN in ethanol → hot dilute acid. Build the final product'),
    m('Propanone', 'CC(C)=O', 'Propyne + water (H₂SO₄, HgSO₄). The enol formed first tautomerises. Build the product'),
    m('3-Hydroxybutanal', 'CC(O)CC=O', 'Build the aldol addition product of two ethanal molecules (dilute NaOH, cold)'),
    m('2-Methylpropan-2-ol', 'CC(C)(C)O', 'CH₃MgBr is added to propanone, then dilute acid. Build the product'),
    m('Phenylethanone', 'CC(=O)C1=CC=CC=C1', 'Build the product of benzene with ethanoyl chloride and AlCl₃'),
    m('N-Methylethanamide', 'CNC(C)=O', 'Build the organic product of ethanoyl chloride with methylamine'),
    m('Propan-1-ol', 'CCCO', 'Methyl propanoate is reduced with LiAlH₄. Build the alcohol with three carbons'),
    m('2-Methylpropene', 'C=C(C)C', 'Build the product of 2-bromo-2-methylpropane with hot ethanolic KOH'),
  ],
  10: [
    m('Propanone', 'CC(C)=O', 'Ozonolysis of 2-methylbut-2-ene (then Zn/H₂O) gives two carbonyl compounds. Build the ketone'),
    m('Cyclohexene', 'C1=CCCCC1', 'Build the Diels–Alder product of buta-1,3-diene and ethene'),
    m('3,3-Dimethylbutan-2-one (pinacolone)', 'CC(=O)C(C)(C)C', 'Build the product of the pinacol rearrangement of 2,3-dimethylbutane-2,3-diol (acid)'),
    m('Propanoic acid', 'CCC(=O)O', 'Butanone + I₂ / NaOH (iodoform reaction), then acidify. Build the carboxylic acid'),
    m('Methanol', 'CO', 'Methanal + concentrated NaOH (Cannizzaro). Build the alcohol formed'),
    m('Ethylamine', 'CCN', 'Propanamide + Br₂ / NaOH (Hofmann rearrangement). Build the amine'),
    m('Ethyl 3-oxobutanoate', 'CCOC(=O)CC(C)=O', 'Claisen condensation of ethyl ethanoate (NaOEt), then dilute acid. Build the product'),
    m('2-Methylpropene', 'C=C(C)C', 'Propanone + Ph₃P=CH₂ (Wittig). Build the alkene'),
    m('1-Methylcyclohexan-1-ol', 'CC1(O)CCCCC1', 'Build the Markovnikov product of acid-catalysed hydration of 1-methylcyclohexene'),
    m('Propan-1-ol', 'CCCO', 'Propene + BH₃ in THF, then H₂O₂ / NaOH (hydroboration–oxidation). Build the alcohol'),
  ],
};
