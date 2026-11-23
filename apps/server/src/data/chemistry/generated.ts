/**
 * Chemistry lab content for levels 6–10, written by scripts/chemistry-content.ts: proposed by one model,
 * checked by a second (and a sample by a third), after code checks (formulas parse, equations balance,
 * options distinct). Do not edit by hand; rerun the script. Generated 2026-11-19.
 */
import type { Experiment, Reagent } from './experiments.js';
import type { Completion } from './equations.js';
import type { Substance, TestId } from './substances.js';

export const GEN_REAGENTS: Reagent[] = [
 {
  "id": "co",
  "name": "Cobalt(II) chloride solution",
  "formula": "CoCl2",
  "colour": "#F2A0A0",
  "bottle": "dropper"
 },
 {
  "id": "conc_hcl",
  "name": "Concentrated hydrochloric acid",
  "formula": "HCl",
  "colour": "#F4F7FB",
  "bottle": "dropper"
 },
 {
  "id": "propan1ol",
  "name": "Propan-1-ol",
  "formula": "C3H7OH",
  "colour": "#F4F7FB",
  "bottle": "dropper"
 },
 {
  "id": "propan2ol",
  "name": "Propan-2-ol",
  "formula": "C3H7OH",
  "colour": "#F4F7FB",
  "bottle": "dropper"
 },
 {
  "id": "methylpropan2ol",
  "name": "2-Methylpropan-2-ol",
  "formula": "C4H9OH",
  "colour": "#F4F7FB",
  "bottle": "dropper"
 },
 {
  "id": "phenol",
  "name": "Phenol solution",
  "formula": "C6H5OH",
  "colour": "#F4F7FB",
  "bottle": "dropper"
 },
 {
  "id": "na2s2o3",
  "name": "Sodium thiosulfate solution",
  "formula": "Na2S2O3",
  "colour": "#F4F7FB",
  "bottle": "dropper"
 },
 {
  "id": "k2cr2o7",
  "name": "Acidified potassium dichromate(VI)",
  "formula": "K2Cr2O7",
  "colour": "#F06A1E",
  "bottle": "dropper"
 },
 {
  "id": "br2_water",
  "name": "Bromine water",
  "formula": "Br2",
  "colour": "#C8641E",
  "bottle": "dropper"
 },
 {
  "id": "ethanal_r",
  "name": "Ethanal",
  "formula": "CH3CHO",
  "colour": "#F4F7FB",
  "bottle": "dropper"
 },
 {
  "id": "cubr2",
  "name": "Copper(II) bromide solution",
  "formula": "CuBr2",
  "colour": "#1B4F72",
  "bottle": "dropper"
 },
 {
  "id": "h2o2",
  "name": "Hydrogen peroxide solution",
  "formula": "H2O2",
  "colour": "#F2F6FA",
  "bottle": "dropper"
 },
 {
  "id": "crcl3",
  "name": "Chromium(III) chloride solution",
  "formula": "CrCl3",
  "colour": "#3B6E4F",
  "bottle": "dropper"
 },
 {
  "id": "mnso4",
  "name": "Manganese(II) sulfate solution",
  "formula": "MnSO4",
  "colour": "#F4F7FB",
  "bottle": "dropper"
 },
 {
  "id": "nano2",
  "name": "Sodium nitrite solution",
  "formula": "NaNO2",
  "colour": "#F4F7FB",
  "bottle": "dropper"
 },
 {
  "id": "kscn",
  "name": "Potassium thiocyanate solution",
  "formula": "KSCN",
  "colour": "#F4F7FB",
  "bottle": "dropper"
 },
 {
  "id": "k4fe_cn6",
  "name": "Potassium hexacyanoferrate(II) solution",
  "formula": "K4[Fe(CN)6]",
  "colour": "#F5F0A0",
  "bottle": "dropper"
 },
 {
  "id": "h2o",
  "name": "Distilled water",
  "formula": "H2O",
  "colour": "#F2F4F8",
  "bottle": "dropper"
 }
];
export const GEN_EXPERIMENTS: Record<number, Experiment[]> = {
 "6": [
  {
   "id": "cu-naoh-nh3-sequential",
   "title": "Two-step addition to a blue solution",
   "reagents": [
    "cuso4",
    "naoh"
   ],
   "glassware": "tube",
   "observation": {
    "liquid": "#4B7FBF",
    "precipitate": "#5F9EA0",
    "gas": false,
    "text": "A pale blue precipitate forms, which dissolves on adding excess ammonia to give a deep royal-blue solution."
   },
   "question": "Why does excess ammonia dissolve the pale blue precipitate?",
   "answer": "NH3 replaces water ligands, forming deep blue [Cu(NH3)4(H2O)2]^2+.",
   "wrong": [
    "NH3 reduces Cu(OH)2 to copper metal, giving a blue colloid.",
    "The precipitate is Cu(NH3)4(OH)2, which stays as a blue solid.",
    "NH3 neutralises sulfate, leaving blue Cu^2+ aqua ions."
   ],
   "equation": "Cu^2+ + 2OH^- → Cu(OH)2; Cu(OH)2 + 4NH3 + 2H2O → [Cu(NH3)4(H2O)2]^2+ + 2OH^-"
  },
  {
   "id": "cr-naoh-excess",
   "title": "Grey-green to green solution",
   "reagents": [
    "crcl3",
    "naoh"
   ],
   "glassware": "tube",
   "observation": {
    "liquid": "#2E8B57",
    "precipitate": "#708090",
    "gas": false,
    "text": "A grey-green precipitate forms, which dissolves in excess NaOH to give a green solution."
   },
   "question": "Why does the grey-green precipitate dissolve in excess sodium hydroxide?",
   "answer": "Cr(OH)3 is amphoteric; excess OH^- gives green [Cr(OH)6]^3-.",
   "wrong": [
    "Cr(OH)3 is basic and dissolves in NaOH to give Cr^3+ aqua ions.",
    "The precipitate is Cr(OH)2, dissolving as [Cr(OH)4]^2-.",
    "Excess NaOH oxidises Cr^3+ to green CrO4^2-, which is soluble."
   ],
   "equation": "Cr^3+ + 3OH^- → Cr(OH)3; Cr(OH)3 + 3OH^- → [Cr(OH)6]^3-"
  },
  {
   "id": "zn-naoh-excess",
   "title": "White precipitate that vanishes",
   "reagents": [
    "znso4",
    "naoh"
   ],
   "glassware": "tube",
   "observation": {
    "liquid": "#F0F8FF",
    "precipitate": "#FFFFFF",
    "gas": false,
    "text": "A white precipitate forms, which dissolves in excess NaOH to give a colourless solution."
   },
   "question": "Which statement best explains the colourless solution formed with excess NaOH?",
   "answer": "Zn(OH)2 is amphoteric and dissolves as [Zn(OH)4]^2-.",
   "wrong": [
    "Zn(OH)2 is acidic and reacts with NaOH to give Zn^2+ aqua ions.",
    "The white solid is ZnO, dissolving in alkali as [Zn(NH3)4]^2+.",
    "Excess NaOH reduces Zn^2+ to zinc metal, giving a colourless colloid."
   ],
   "equation": "Zn^2+ + 2OH^- → Zn(OH)2; Zn(OH)2 + 2OH^- → [Zn(OH)4]^2-"
  },
  {
   "id": "bacl2-na2co3",
   "title": "White solid from two clear solutions",
   "reagents": [
    "bacl2",
    "na2co3"
   ],
   "glassware": "tube",
   "observation": {
    "liquid": "#F8F8FF",
    "precipitate": "#FFFFFF",
    "gas": false,
    "text": "A white precipitate forms; it fizzes when dilute hydrochloric acid is added."
   },
   "question": "A white precipitate forms and fizzes with dilute HCl. Which pair of ions is confirmed?",
   "answer": "Ba^2+ and CO3^2-; the fizz is CO2 from BaCO3 reacting with acid.",
   "wrong": [
    "Ba^2+ and SO4^2-; the fizz is SO2 from BaSO3 reacting with acid.",
    "Ag^+ and CO3^2-; the fizz is CO2 from Ag2CO3 reacting with acid.",
    "Ba^2+ and Cl^-; the fizz is Cl2 from BaCl2 reacting with acid."
   ],
   "equation": "Ba^2+ + CO3^2- → BaCO3; BaCO3 + 2H^+ → Ba^2+ + CO2 + H2O"
  },
  {
   "id": "nh4cl-naoh-warm",
   "title": "Gas that turns indicator blue",
   "reagents": [
    "nh4cl",
    "naoh"
   ],
   "glassware": "tube",
   "observation": {
    "liquid": "#F0F8FF",
    "gas": true,
    "text": "On warming, a colourless gas is evolved that turns damp red litmus blue."
   },
   "question": "Which ion is confirmed and what is the gas?",
   "answer": "NH4^+ is confirmed; warming with OH^- releases basic NH3 gas.",
   "wrong": [
    "NH4^+ is confirmed; warming with OH^- releases H2 gas, which is basic.",
    "Cl^- is confirmed; warming with OH^- releases Cl2 gas, which is basic.",
    "NH4^+ is confirmed; warming with OH^- releases N2 gas, which is basic."
   ],
   "equation": "NH4^+ + OH^- → NH3 + H2O"
  },
  {
   "id": "nh3-cu-first",
   "title": "Blue gel from drops of alkali",
   "reagents": [
    "cuso4",
    "nh3"
   ],
   "glassware": "tube",
   "observation": {
    "liquid": "#4A7FB5",
    "precipitate": "#5A9BD4",
    "gas": false,
    "text": "Blue solution turns cloudy; a pale blue gel settles."
   },
   "question": "Which ion is being precipitated here?",
   "answer": "Cu^2+ ions from the copper(II) sulfate",
   "wrong": [
    "Cu^+ ions from the copper(II) sulfate",
    "SO4^2- ions from the copper(II) sulfate",
    "NH4^+ ions from the ammonia solution"
   ],
   "equation": "Cu^2+ + 2NH3 + 2H2O → Cu(OH)2 + 2NH4^+"
  },
  {
   "id": "nh3-cu-excess",
   "title": "Gel that dissolves in more ammonia",
   "reagents": [
    "cuso4",
    "nh3"
   ],
   "glassware": "tube",
   "observation": {
    "liquid": "#2E4E9E",
    "precipitate": "#5A9BD4",
    "gas": false,
    "text": "Pale blue gel forms, then dissolves to a deep blue solution."
   },
   "question": "Why does the pale blue solid dissolve in excess ammonia?",
   "answer": "Ammonia ligands replace water to form a soluble complex",
   "wrong": [
    "Ammonia neutralises the sulfate and dissolves the solid",
    "Ammonia reduces Cu^2+ to soluble Cu^+ ions",
    "Ammonia protonates the hydroxide making it soluble"
   ],
   "equation": "Cu(OH)2 + 4NH3 + 2H2O → [Cu(NH3)4(H2O)2]^2+ + 2OH^-"
  },
  {
   "id": "naoh-fe3",
   "title": "Rust-coloured solid from alkali",
   "reagents": [
    "fecl3",
    "naoh"
   ],
   "glassware": "tube",
   "observation": {
    "liquid": "#8A5A2B",
    "precipitate": "#A0522D",
    "gas": false,
    "text": "Yellow solution gives a thick red-brown gelatinous solid."
   },
   "question": "Which hydroxide is this red-brown solid?",
   "answer": "Iron(III) hydroxide, Fe(OH)3",
   "wrong": [
    "Iron(II) hydroxide, Fe(OH)2",
    "Iron(III) sulfate, Fe2(SO4)3",
    "Iron(II) chloride, FeCl2"
   ],
   "equation": "Fe^3+ + 3OH^- → Fe(OH)3"
  },
  {
   "id": "naoh-fe2",
   "title": "Green solid that browns at the top",
   "reagents": [
    "feso4",
    "naoh"
   ],
   "glassware": "tube",
   "observation": {
    "liquid": "#6E8B3D",
    "precipitate": "#4C7A34",
    "gas": false,
    "text": "Pale green solution gives a green solid; edges turn brown."
   },
   "question": "Why does the green solid darken on standing?",
   "answer": "Air oxidises iron(II) hydroxide to iron(III) hydroxide",
   "wrong": [
    "The solid dehydrates to iron(III) oxide on standing",
    "Ammonia escapes leaving iron(II) oxide behind",
    "The sulfate ions reduce the solid to iron metal"
   ],
   "equation": "4Fe(OH)2 + O2 + 2H2O → 4Fe(OH)3"
  },
  {
   "id": "naoh-zn",
   "title": "White solid that redissolves",
   "reagents": [
    "znso4",
    "naoh"
   ],
   "glassware": "tube",
   "observation": {
    "liquid": "#D9D9D9",
    "precipitate": "#F5F5F5",
    "gas": false,
    "text": "White solid forms, then clears in excess alkali to a colourless solution."
   },
   "question": "What makes the white solid dissolve in excess sodium hydroxide?",
   "answer": "Zinc hydroxide is amphoteric and forms a zincate complex",
   "wrong": [
    "Zinc hydroxide is acidic and gives off hydrogen gas",
    "Sodium hydroxide reduces Zn^2+ to soluble zinc metal",
    "The white solid is sodium zincate and never dissolves"
   ],
   "equation": "Zn(OH)2 + 2OH^- → [Zn(OH)4]^2-"
  },
  {
   "id": "agno3-nacl",
   "title": "Solid from silver and a salt",
   "reagents": [
    "agno3",
    "nacl"
   ],
   "glassware": "tube",
   "observation": {
    "liquid": "#E8E8E8",
    "precipitate": "#FFFFFF",
    "gas": false,
    "text": "Colourless solutions give a white curdy solid."
   },
   "question": "What happens to this white solid when dilute ammonia is added?",
   "answer": "It dissolves to give a colourless solution",
   "wrong": [
    "It turns cream then dissolves in the ammonia",
    "It stays unchanged in dilute ammonia",
    "It turns black and gives off ammonia gas"
   ],
   "equation": "Ag^+ + Cl^- → AgCl"
  },
  {
   "id": "agno3-cubr2",
   "title": "Pale solid from a blue solution",
   "reagents": [
    "agno3",
    "cubr2"
   ],
   "glassware": "tube",
   "observation": {
    "liquid": "#7FA8C9",
    "precipitate": "#F5F0DC",
    "gas": false,
    "text": "Blue-green solution gives a pale cream solid on adding silver nitrate."
   },
   "question": "Which halide ion is confirmed by this pale cream solid?",
   "answer": "Bromide, Br^-, giving cream silver bromide",
   "wrong": [
    "Chloride, Cl^-, giving white silver chloride",
    "Iodide, I^-, giving yellow silver iodide",
    "Fluoride, F^-, giving white silver fluoride"
   ],
   "equation": "Ag^+ + Br^- → AgBr"
  },
  {
   "id": "nh4cl-naoh",
   "title": "Sharp gas from a warm salt",
   "reagents": [
    "nh4cl",
    "naoh"
   ],
   "glassware": "tube",
   "observation": {
    "liquid": "#F0F0F0",
    "gas": true,
    "text": "On warming, a colourless gas with a sharp smell is given off."
   },
   "question": "What does this gas do to damp red litmus paper?",
   "answer": "Turns it blue, showing the gas is ammonia",
   "wrong": [
    "Turns it red, showing the gas is hydrogen chloride",
    "Bleaches it white, showing the gas is chlorine",
    "Leaves it unchanged, showing the gas is hydrogen"
   ],
   "equation": "NH4^+ + OH^- → NH3 + H2O"
  }
 ],
 "7": [
  {
   "id": "cu-nh3-excess",
   "title": "Deep blue with excess ammonia",
   "reagents": [
    "cuso4",
    "nh3"
   ],
   "glassware": "tube",
   "observation": {
    "liquid": "#1F3FBF",
    "text": "Pale blue precipitate first, then dissolves in excess to a deep blue solution."
   },
   "question": "Why does the precipitate dissolve when excess ammonia is added?",
   "answer": "Ammonia ligands replace water, forming a stable soluble complex.",
   "wrong": [
    "Ammonia neutralises the sulfate ions so the solid cannot form.",
    "Excess ammonia reduces copper(II) to soluble copper(I) ions.",
    "The precipitate dissolves because ammonia makes the solution acidic."
   ],
   "equation": "[Cu(H2O)6]^2+ + 4NH3 → [Cu(NH3)4(H2O)2]^2+ + 4H2O"
  },
  {
   "id": "cu-conc-hcl",
   "title": "Green from concentrated chloride",
   "reagents": [
    "cuso4",
    "conc_hcl"
   ],
   "glassware": "tube",
   "observation": {
    "liquid": "#2E8B57",
    "text": "Blue solution turns green as concentrated chloride is added."
   },
   "question": "What causes the colour change on adding concentrated chloride?",
   "answer": "Chloride ligands replace water, giving a green chlorocuprate complex.",
   "wrong": [
    "Chloride ions reduce copper(II) to green copper(I) chloride.",
    "The acid dilutes the blue solution so it looks green.",
    "Chloride ions oxidise the sulfate ions to a green species."
   ],
   "equation": "[Cu(H2O)6]^2+ + 4Cl^- → [CuCl4]^2- + 6H2O"
  },
  {
   "id": "co-conc-hcl",
   "title": "Blue complex from cobalt",
   "reagents": [
    "co",
    "conc_hcl"
   ],
   "glassware": "tube",
   "observation": {
    "liquid": "#2A5FBF",
    "text": "Pink solution turns deep blue when concentrated hydrochloric acid is added."
   },
   "question": "Why does concentrated chloride give a blue colour with cobalt(II)?",
   "answer": "Chloride ligands replace water ligands, forming a blue tetrahedral complex.",
   "wrong": [
    "Chloride ions oxidise cobalt(II) to a blue cobalt(III) species.",
    "The acid protonates the cobalt ion, changing its colour.",
    "Cobalt(II) ions are reduced to blue cobalt metal particles."
   ],
   "equation": "[Co(H2O)6]^2+ + 4Cl^- ⇌ [CoCl4]^2- + 6H2O"
  },
  {
   "id": "fe3-kscn",
   "title": "Blood-red with thiocyanate",
   "reagents": [
    "fecl3",
    "kscn"
   ],
   "glassware": "tube",
   "observation": {
    "liquid": "#8B0000",
    "text": "Yellow iron(III) solution turns blood-red on adding thiocyanate."
   },
   "question": "What is responsible for the intense blood-red colour?",
   "answer": "A red iron(III) thiocyanate complex forms in solution.",
   "wrong": [
    "Iron(III) is reduced to red iron(II) thiocyanate ions.",
    "Thiocyanate is oxidised to a red elemental sulfur species.",
    "Iron(III) chloride precipitates as a red solid with thiocyanate."
   ],
   "equation": "Fe^3+ + SCN^- → [Fe(SCN)]^2+"
  },
  {
   "id": "fe2-mno4",
   "title": "Purple fading with iron(II)",
   "reagents": [
    "feso4",
    "kmno4"
   ],
   "glassware": "flask",
   "observation": {
    "liquid": "#F0D9D9",
    "text": "Purple manganate(VII) colour fades as iron(II) sulfate is swirled in."
   },
   "question": "Why does the purple colour disappear during this reaction?",
   "answer": "Iron(II) reduces manganate(VII) to colourless manganese(II).",
   "wrong": [
    "Manganate(VII) is oxidised to colourless manganese species.",
    "Iron(II) ions absorb the purple colour by complexing with it.",
    "The acid dilutes the manganate(VII) until it looks colourless."
   ],
   "equation": "MnO4^- + 5Fe^2+ + 8H^+ → Mn^2+ + 5Fe^3+ + 4H2O"
  },
  {
   "id": "phenol-fecl3",
   "title": "Purple tint with iron(III)",
   "reagents": [
    "phenol",
    "fecl3"
   ],
   "glassware": "tube",
   "observation": {
    "liquid": "#6A2C9C",
    "text": "A faint purple colour appears when iron(III) chloride is added to phenol."
   },
   "question": "What does the purple colour show about the phenol?",
   "answer": "Its ring is activated, forming a coloured iron(III)–phenoxide complex.",
   "wrong": [
    "Phenol is oxidised to purple benzoquinone by iron(III).",
    "Iron(III) is reduced to purple iron(II) phenoxide.",
    "Phenol precipitates as a purple solid with chloride ions."
   ],
   "equation": "6C6H5OH + Fe^3+ → [Fe(C6H5O)6]^3- + 6H^+"
  },
  {
   "id": "thiosulfate-iodine",
   "title": "Brown iodine disappears",
   "reagents": [
    "na2s2o3",
    "iodine"
   ],
   "glassware": "flask",
   "observation": {
    "liquid": "#F4F7FB",
    "text": "Brown iodine solution turns colourless as thiosulfate is added and swirled."
   },
   "question": "What happens to iodine when thiosulfate is added?",
   "answer": "Iodine is reduced to colourless iodide while thiosulfate is oxidised.",
   "wrong": [
    "Iodine is oxidised to colourless iodate by thiosulfate.",
    "Iodine forms a colourless soluble complex with thiosulfate.",
    "Iodine is displaced by thiosulfate and escapes as a gas."
   ],
   "equation": "I2 + 2S2O3^2- → 2I^- + S4O6^2-"
  },
  {
   "id": "fe3-iodine",
   "title": "Brown colour from iron(III)",
   "reagents": [
    "fecl3",
    "ki"
   ],
   "glassware": "tube",
   "observation": {
    "liquid": "#8B5A2B",
    "text": "Yellow iron(III) solution turns brown when potassium iodide is added."
   },
   "question": "Why does a brown colour appear when iodide meets iron(III)?",
   "answer": "Iodide reduces iron(III) to iron(II), releasing brown iodine.",
   "wrong": [
    "Iron(III) oxidises iodide to colourless iodate ions.",
    "Iron(III) iodide precipitates as a brown solid.",
    "Iodide reduces iron(III) to brown iron metal particles."
   ],
   "equation": "2Fe^3+ + 2I^- → 2Fe^2+ + I2"
  },
  {
   "id": "fe2-mno4-titration",
   "title": "Purple drops fade in a pale green solution",
   "reagents": [
    "feso4",
    "kmno4"
   ],
   "glassware": "flask",
   "observation": {
    "liquid": "#C8A2C8",
    "text": "Purple manganate(VII) is decolourised dropwise until a faint pink persists."
   },
   "question": "Why does the purple colour persist only after all Fe^2+ is used up?",
   "answer": "Manganate(VII) is decolourised by Fe^2+ until Fe^2+ runs out",
   "wrong": [
    "The acid is used up so excess manganate stays purple",
    "Manganate(VII) is pink only in acidic solution",
    "Fe^3+ formed turns manganate(VII) pink at the end point",
    "Manganese(II) formed is pink and appears once excess is added"
   ],
   "equation": "MnO4^- + 5Fe^2+ + 8H^+ → Mn^2+ + 5Fe^3+ + 4H2O"
  },
  {
   "id": "dichromate-primary",
   "title": "Orange solution turns green on warming",
   "reagents": [
    "k2cr2o7",
    "propan1ol"
   ],
   "glassware": "tube",
   "observation": {
    "liquid": "#2E7D32",
    "text": "Orange dichromate turns green when warmed with the alcohol."
   },
   "question": "What does the green colour show about the alcohol?",
   "answer": "It is oxidised to an aldehyde then acid, reducing dichromate(VI)",
   "wrong": [
    "It is dehydrated to an alkene, releasing green chromium",
    "It is reduced to an alkane by the dichromate",
    "It forms a green ester with dichromate ions",
    "It is oxidised only to a ketone, giving green Cr^3+"
   ],
   "equation": "Cr2O7^2- + 3CH3CH2CH2OH + 8H^+ → 2Cr^3+ + 3CH3CH2CHO + 7H2O"
  },
  {
   "id": "phenol-bromine",
   "title": "White cloud from an aromatic solution",
   "reagents": [
    "phenol",
    "br2_water"
   ],
   "glassware": "tube",
   "observation": {
    "liquid": "#F5F0E1",
    "precipitate": "#F8F8F4",
    "text": "Bromine water is decolourised and a white precipitate forms at once."
   },
   "question": "Why does phenol react without a catalyst while benzene needs one?",
   "answer": "The OH group donates electron density into the ring, activating it",
   "wrong": [
    "The OH group is oxidised, releasing bromine radicals",
    "Phenol is an acid and bromine is a base in this reaction",
    "The benzene ring is already saturated so bromine adds",
    "Hydrogen bonding holds bromine to the ring without reaction"
   ],
   "equation": "C6H5OH + 3Br2 → C6H2Br3OH + 3HBr"
  },
  {
   "id": "dichromate-secondary",
   "title": "Orange solution turns green without an aldehyde",
   "reagents": [
    "k2cr2o7",
    "propan2ol"
   ],
   "glassware": "flask",
   "observation": {
    "liquid": "#2E7D32",
    "text": "Orange dichromate turns green on warming, but no aldehyde smell is detected."
   },
   "question": "Why does this alcohol give a ketone rather than an aldehyde?",
   "answer": "Its OH is on a middle carbon, so oxidation gives a ketone",
   "wrong": [
    "It is a tertiary alcohol and cannot be oxidised at all",
    "It dehydrates first, then the alkene is oxidised",
    "Its OH is on the end carbon, giving a ketone directly",
    "It is oxidised to an acid which then turns green"
   ],
   "equation": "Cr2O7^2- + 3CH3CH(OH)CH3 + 8H^+ → 2Cr^3+ + 3CH3COCH3 + 7H2O"
  },
  {
   "id": "dichromate-tertiary",
   "title": "No colour change under oxidising conditions",
   "reagents": [
    "k2cr2o7",
    "methylpropan2ol"
   ],
   "glassware": "tube",
   "observation": {
    "liquid": "#F06A1E",
    "text": "The orange dichromate stays orange even after warming with the alcohol."
   },
   "question": "Why is no green colour seen with this alcohol?",
   "answer": "It is tertiary, with no H on the C-OH carbon to remove",
   "wrong": [
    "It is already oxidised, so dichromate cannot react",
    "It is a primary alcohol that resists oxidation",
    "It forms a stable orange complex with dichromate",
    "It is too volatile and evaporates before reacting"
   ],
   "equation": "No reaction: (CH3)3COH has no H on the C bearing OH"
  },
  {
   "id": "ethanal-mno4",
   "title": "Purple fades with a sharp-smelling liquid",
   "reagents": [
    "ethanal_r",
    "kmno4"
   ],
   "glassware": "tube",
   "observation": {
    "liquid": "#F4F7FB",
    "text": "Purple manganate(VII) is decolourised and a sharp-smelling acid forms."
   },
   "question": "Why does ethanal decolourise manganate(VII) so readily?",
   "answer": "The aldehyde is easily oxidised to ethanoic acid, reducing Mn(VII)",
   "wrong": [
    "The aldehyde is reduced to ethanol, oxidising the manganate",
    "The aldehyde forms a colourless complex with Mn^2+",
    "The aldehyde neutralises the acid so purple cannot form",
    "The aldehyde decomposes to ethene, which bleaches manganate"
   ],
   "equation": "5CH3CHO + 2MnO4^- + 6H^+ → 5CH3COOH + 2Mn^2+ + 3H2O"
  },
  {
   "id": "thiosulfate-agx",
   "title": "Silver halide that needs a stronger ligand",
   "reagents": [
    "agno3",
    "na2s2o3"
   ],
   "glassware": "tube",
   "observation": {
    "liquid": "#F2F2F2",
    "precipitate": "#F7F3E0",
    "gas": false,
    "text": "A pale precipitate appears, then dissolves as thiosulfate is swirled in."
   },
   "question": "Why does thiosulfate dissolve AgCl but dilute ammonia leaves AgI untouched?",
   "answer": "Thiosulfate binds Ag^+ far more strongly (larger formation constant), so it dissolves even AgI.",
   "wrong": [
    "Thiosulfate reduces Ag^+ to silver metal, which is soluble in water.",
    "Thiosulfate raises the pH, converting AgCl into soluble silver hydroxide.",
    "Thiosulfate is a smaller ligand, so it enters the lattice more easily."
   ],
   "equation": "AgCl + 2 S2O3^2- → [Ag(S2O3)2]^3- + Cl^-"
  },
  {
   "id": "kmno4-endpoint",
   "title": "Faint pink that will not leave",
   "reagents": [
    "feso4",
    "kmno4"
   ],
   "glassware": "flask",
   "observation": {
    "liquid": "#F2B6C6",
    "gas": false,
    "text": "Purple manganate is decolourised until a faint pink tinge persists."
   },
   "question": "Why does the first permanent pink tinge mark the end point in this titration?",
   "answer": "All Fe^2+ is oxidised; excess MnO4^- stays pink, so one drop signals the end.",
   "wrong": [
    "The pink tinge shows Mn^2+ has been oxidised further to MnO4^- by air.",
    "The pink tinge means Fe^3+ has been reduced back to Fe^2+ by the acid.",
    "The pink tinge appears when the acid is neutralised by the manganate."
   ],
   "equation": "MnO4^- + 5 Fe^2+ + 8 H^+ → Mn^2+ + 5 Fe^3+ + 4 H2O"
  }
 ],
 "8": [
  {
   "id": "pb-oh-amphoteric",
   "title": "Lead(II) nitrate with hydroxide, then excess",
   "reagents": [
    "pbno3",
    "naoh"
   ],
   "glassware": "tube",
   "observation": {
    "liquid": "#F4F7FB",
    "precipitate": "#FFFFFF",
    "text": "A white precipitate forms, then dissolves in excess hydroxide to a colourless solution."
   },
   "question": "What does the redissolving of the white precipitate show about lead(II) hydroxide?",
   "answer": "It is amphoteric, forming soluble plumbite(II) with excess hydroxide.",
   "wrong": [
    "It is basic only, so excess hydroxide simply neutralises the lead(II) nitrate.",
    "It is acidic only, so excess hydroxide forms soluble lead(II) hydroxide.",
    "It is unstable, so excess hydroxide decomposes it into lead metal."
   ],
   "equation": "Pb^2+ + 2OH^- → Pb(OH)2; Pb(OH)2 + 2OH^- → [Pb(OH)4]^2-"
  },
  {
   "id": "zn-oh-amphoteric",
   "title": "Zinc sulfate with hydroxide, then excess",
   "reagents": [
    "znso4",
    "naoh"
   ],
   "glassware": "tube",
   "observation": {
    "liquid": "#F4F7FB",
    "precipitate": "#FFFFFF",
    "text": "A white gelatinous precipitate forms, then dissolves in excess hydroxide."
   },
   "question": "Which pair of ions best explains why zinc hydroxide dissolves in excess hydroxide?",
   "answer": "Zn^2+ is amphoteric and forms soluble zincate [Zn(OH)4]^2-.",
   "wrong": [
    "Hydroxide reduces Zn^2+ to zinc metal, which is soluble in water.",
    "Zn^2+ forms a soluble sulfate complex with the hydroxide ions.",
    "Hydroxide oxidises Zn^2+ to zincate(VI), which is soluble."
   ],
   "equation": "Zn^2+ + 2OH^- → Zn(OH)2; Zn(OH)2 + 2OH^- → [Zn(OH)4]^2-"
  },
  {
   "id": "cr-oh-amphoteric",
   "title": "Chromium(III) chloride with hydroxide, then excess",
   "reagents": [
    "crcl3",
    "naoh"
   ],
   "glassware": "tube",
   "observation": {
    "liquid": "#3B6E4F",
    "precipitate": "#6B8E6B",
    "text": "A grey-green precipitate forms, then dissolves in excess hydroxide to a green solution."
   },
   "question": "Why does chromium(III) hydroxide dissolve in excess hydroxide but not in excess ammonia?",
   "answer": "Cr(OH)3 is amphoteric and forms [Cr(OH)6]^3-; ammonia is too weak.",
   "wrong": [
    "Cr(OH)3 is basic and dissolves only in strong acid, not in hydroxide.",
    "Ammonia oxidises Cr^3+ to Cr^6+, which is insoluble in water.",
    "Ammonia forms a soluble ammine complex, while hydroxide does not."
   ],
   "equation": "Cr^3+ + 3OH^- → Cr(OH)3; Cr(OH)3 + 3OH^- → [Cr(OH)6]^3-"
  },
  {
   "id": "zn-oh-excess",
   "title": "A white gel that dissolves again",
   "reagents": [
    "znso4",
    "naoh"
   ],
   "glassware": "tube",
   "observation": {
    "liquid": "#F4F7FB",
    "precipitate": "#FFFFFF",
    "gas": false,
    "text": "White gelatinous precipitate with a few drops of NaOH; it dissolves in excess to a clear solution."
   },
   "question": "Which property of zinc hydroxide explains its re-dissolution in excess sodium hydroxide?",
   "answer": "It is amphoteric and forms a soluble zincate complex with excess hydroxide.",
   "wrong": [
    "It is acidic and neutralises excess hydroxide to a soluble salt.",
    "It is basic and dissolves in the water made by neutralisation.",
    "It is a weak base ionised by excess hydroxide into soluble ions."
   ],
   "equation": "Zn(OH)2 + 2OH^- → [Zn(OH)4]^2-"
  },
  {
   "id": "cr-oh-excess",
   "title": "Green gel, then a green solution",
   "reagents": [
    "crcl3",
    "naoh"
   ],
   "glassware": "tube",
   "observation": {
    "liquid": "#2E5B34",
    "precipitate": "#4B6B3A",
    "gas": false,
    "text": "Grey-green precipitate with a few drops of NaOH; it dissolves in excess to a green solution."
   },
   "question": "What is the green solution formed when chromium(III) hydroxide dissolves in excess hydroxide?",
   "answer": "A solution of the tetrahydroxochromate(III) complex, [Cr(OH)4]^-.",
   "wrong": [
    "A solution of the hexaaquachromium(III) ion, [Cr(H2O)6]^3+.",
    "A solution of chromate(VI), CrO4^2-, formed by oxidation.",
    "A solution of dichromate(VI), Cr2O7^2-, formed by dehydration."
   ],
   "equation": "Cr(OH)3 + OH^- → [Cr(OH)4]^-"
  },
  {
   "id": "cr-h2o2-oh",
   "title": "Green to yellow with peroxide",
   "reagents": [
    "crcl3",
    "h2o2"
   ],
   "glassware": "tube",
   "observation": {
    "liquid": "#FFD700",
    "gas": true,
    "text": "Green solution turns yellow with vigorous bubbling after adding peroxide and base."
   },
   "question": "What is the yellow species formed when chromium(III) is oxidised by peroxide in alkali?",
   "answer": "Chromate(VI), CrO4^2-, formed by oxidation of chromium(III) in base.",
   "wrong": [
    "Dichromate(VI), Cr2O7^2-, formed by acidification of the mixture.",
    "Chromium(III) hydroxide, Cr(OH)3, formed by precipitation.",
    "A peroxochromium complex, [Cr(O2)4]^3-, formed by ligand substitution."
   ],
   "equation": "2Cr^3+ + 3H2O2 + 10OH^- → 2CrO4^2- + 8H2O"
  },
  {
   "id": "mn-h2o2-oh",
   "title": "Brown solid from a pale solution",
   "reagents": [
    "mnso4",
    "h2o2"
   ],
   "glassware": "tube",
   "observation": {
    "liquid": "#8B4513",
    "precipitate": "#4E342E",
    "gas": true,
    "text": "Pale pink solution gives a dark brown precipitate with bubbling after adding peroxide and base."
   },
   "question": "What is the dark brown precipitate formed when manganese(II) is oxidised by peroxide in base?",
   "answer": "Manganese(IV) oxide, MnO2, formed by oxidation of manganese(II) in base.",
   "wrong": [
    "Manganese(III) hydroxide, Mn(OH)3, formed by simple precipitation.",
    "Manganate(VI), MnO4^2-, formed by oxidation in strong base.",
    "Permanganate(VII), MnO4^-, formed by further oxidation in base."
   ],
   "equation": "Mn^2+ + H2O2 + 2OH^- → MnO2 + 2H2O"
  },
  {
   "id": "al-zn-ampho",
   "title": "Two hydroxides, one excess",
   "reagents": [
    "znso4",
    "naoh"
   ],
   "glassware": "tube",
   "observation": {
    "liquid": "#F4F7FB",
    "precipitate": "#FFFFFF",
    "gas": false,
    "text": "White gelatinous precipitate forms; with more NaOH it redissolves to a clear solution."
   },
   "question": "Which statement best explains why the white solid dissolves in excess NaOH?",
   "answer": "The amphoteric hydroxide reacts with OH^- to form a soluble zincate complex.",
   "wrong": [
    "The precipitate is basic and simply dissolves in any strong alkali.",
    "The zinc ions are reduced by hydroxide to soluble zinc metal.",
    "The white solid is sodium zincate and excess NaOH only dilutes it."
   ],
   "equation": "Zn(OH)2 + 2OH^- → [Zn(OH)4]^2-"
  },
  {
   "id": "pb-ampho",
   "title": "Lead hydroxide that comes back",
   "reagents": [
    "pbno3",
    "naoh"
   ],
   "glassware": "tube",
   "observation": {
    "liquid": "#F4F7FB",
    "precipitate": "#FFFFFF",
    "gas": false,
    "text": "White precipitate appears; adding excess NaOH gives a clear solution again."
   },
   "question": "What is the main species in the clear solution after excess NaOH?",
   "answer": "A soluble plumbate(II) complex, [Pb(OH)4]^2-.",
   "wrong": [
    "A soluble lead(II) nitrate complex with hydroxide ligands.",
    "Lead metal formed by reduction of Pb^2+ by hydroxide.",
    "A soluble lead sulfate complex with hydroxide ligands."
   ],
   "equation": "Pb(OH)2 + 2OH^- → [Pb(OH)4]^2-"
  },
  {
   "id": "cr-ampho-ox",
   "title": "Green gel under alkali",
   "reagents": [
    "crcl3",
    "naoh"
   ],
   "glassware": "tube",
   "observation": {
    "liquid": "#6B8E6B",
    "precipitate": "#6B8E6B",
    "gas": false,
    "text": "Grey-green gelatinous precipitate forms; excess NaOH dissolves it to a green solution."
   },
   "question": "Why does the chromium(III) hydroxide dissolve in excess NaOH?",
   "answer": "It is amphoteric and forms a soluble hydroxo complex, [Cr(OH)6]^3-.",
   "wrong": [
    "It is reduced to soluble chromium(II) by the hydroxide ions.",
    "It forms soluble sodium chromate by oxidation with hydroxide.",
    "It is acidic and neutralises the NaOH to chromium sulfate."
   ],
   "equation": "Cr(OH)3 + 3OH^- → [Cr(OH)6]^3-"
  },
  {
   "id": "mn2-ox",
   "title": "Pale pink to brown in base",
   "reagents": [
    "mnso4",
    "h2o2"
   ],
   "glassware": "tube",
   "observation": {
    "liquid": "#8B5A2B",
    "precipitate": "#5C4033",
    "gas": true,
    "text": "Pale pink solution gives a brown precipitate with NaOH; O2 bubbles form."
   },
   "question": "What is the brown solid formed?",
   "answer": "Manganese(IV) oxide, MnO2, from oxidation of Mn(II) in alkaline peroxide.",
   "wrong": [
    "Manganese(II) hydroxide, which is brown in excess alkali.",
    "Manganese(III) sulfate, a brown soluble oxidation product.",
    "Manganese metal, formed by reduction of Mn^2+ by peroxide."
   ],
   "equation": "Mn^2+ + H2O2 + 2OH^- → MnO2 + 2H2O"
  },
  {
   "id": "no2-test",
   "title": "Brown gas from a nitrite",
   "reagents": [
    "nano2",
    "h2so4"
   ],
   "glassware": "tube",
   "observation": {
    "liquid": "#F4F7FB",
    "gas": true,
    "text": "Colourless solution gives brown fumes; a pale blue solution forms on standing."
   },
   "question": "Which gas gives the brown fumes and why?",
   "answer": "Nitrogen dioxide, from disproportionation of nitrous acid formed by the acid.",
   "wrong": [
    "Nitric oxide, which is brown and forms from nitrite and acid.",
    "Hydrogen, released when acid reacts with sodium nitrite.",
    "Chlorine, released by oxidation of chloride by nitrite."
   ],
   "equation": "2HNO2 → NO + NO2 + H2O"
  },
  {
   "id": "cu-nh3-excess",
   "title": "Blue precipitate redissolves in excess reagent",
   "reagents": [
    "cuso4",
    "nh3"
   ],
   "glassware": "tube",
   "observation": {
    "liquid": "#1E3A8A",
    "precipitate": "#1E90FF",
    "gas": false,
    "text": "Blue precipitate first forms, then dissolves in excess to a deep blue solution."
   },
   "question": "Which complex ion gives the deep blue solution?",
   "answer": "[Cu(NH3)4(H2O)2]^2+",
   "wrong": [
    "[Cu(NH3)2(H2O)4]^2+",
    "[Cu(H2O)6]^2+",
    "[Cu(NH3)4]^+ formed by reduction"
   ],
   "equation": "Cu^2+ + 4NH3 + 2H2O → [Cu(NH3)4(H2O)2]^2+"
  },
  {
   "id": "cr-oh-excess",
   "title": "Green precipitate dissolves to a green solution",
   "reagents": [
    "crcl3",
    "naoh"
   ],
   "glassware": "tube",
   "observation": {
    "liquid": "#2E8B57",
    "precipitate": "#3CB371",
    "gas": false,
    "text": "Green precipitate forms, then dissolves in excess to a green solution."
   },
   "question": "Which species explains the redissolving?",
   "answer": "The tetrahydroxochromate(III) ion [Cr(OH)4]^-",
   "wrong": [
    "The chromate(VI) ion CrO4^2- formed by oxidation",
    "The ammine complex [Cr(NH3)6]^3+",
    "Chromium metal colloid from reduction"
   ],
   "equation": "Cr(OH)3 + OH^- → [Cr(OH)4]^-"
  }
 ],
 "9": [
  {
   "id": "prussian-blue",
   "title": "Blue ink from two pale solutions",
   "reagents": [
    "fecl3",
    "k4fe_cn6"
   ],
   "glassware": "tube",
   "observation": {
    "liquid": "#E8E8E8",
    "precipitate": "#1A237E",
    "text": "A deep Prussian-blue precipitate appears at once."
   },
   "question": "What is the oxidation state of iron in the blue solid?",
   "answer": "Both Fe^2+ and Fe^3+, mixed-valence",
   "wrong": [
    "Only Fe^3+",
    "Only Fe^2+",
    "Only Fe^0"
   ],
   "equation": "4Fe^3+ + 3[Fe(CN)6]^4- → Fe4[Fe(CN)6]3"
  },
  {
   "id": "agcl-nh3",
   "title": "White solid that dissolves in ammonia",
   "reagents": [
    "agno3",
    "nacl"
   ],
   "glassware": "tube",
   "observation": {
    "liquid": "#FFFFFF",
    "precipitate": "#FFFFFF",
    "text": "A curdy white precipitate forms; it dissolves on adding excess ammonia."
   },
   "question": "Why does the white solid dissolve in excess ammonia?",
   "answer": "A soluble diamminesilver(I) complex forms",
   "wrong": [
    "Ammonia neutralises the silver ions",
    "The solid is amphoteric and dissolves in base",
    "Ammonia reduces silver(I) to silver metal"
   ],
   "equation": "AgCl + 2NH3 → [Ag(NH3)2]^+ + Cl^-"
  },
  {
   "id": "redox-endpoint",
   "title": "Pink persists at the end point",
   "reagents": [
    "kmno4",
    "feso4"
   ],
   "glassware": "flask",
   "observation": {
    "liquid": "#F48FB1",
    "text": "Purple drops decolourise until a faint pink colour persists."
   },
   "question": "Why is the pink colour itself the end point indicator here?",
   "answer": "Excess MnO4^- is the first species with visible colour",
   "wrong": [
    "Fe^3+ turns pink when oxidised",
    "The acid changes colour at neutrality",
    "MnO2 forms a pink precipitate"
   ],
   "equation": "MnO4^- + 5Fe^2+ + 8H^+ → Mn^2+ + 5Fe^3+ + 4H2O"
  }
 ],
 "10": [
  {
   "id": "cubr2-water-colour",
   "title": "Green solution turns blue on dilution",
   "reagents": [
    "cubr2",
    "h2o"
   ],
   "glassware": "tube",
   "observation": {
    "liquid": "#1E90FF",
    "gas": false,
    "text": "The green solution turns blue on adding water; adding concentrated HCl restores green."
   },
   "question": "Which equilibrium explains the green-to-blue change on dilution?",
   "answer": "Bromide ligands are replaced by water: [CuBr4]^2- (green) ⇌ [Cu(H2O)6]^2+ (blue).",
   "wrong": [
    "Cu(II) is reduced to Cu(I) by water, and Cu(I) aqua ions are blue in solution.",
    "Bromide is oxidised to bromine by water, leaving a blue copper sulfate complex.",
    "The green colour is a pH indicator effect; dilution raises pH and turns it blue."
   ],
   "equation": "[CuBr4]^2- + 6H2O ⇌ [Cu(H2O)6]^2+ + 4Br^-"
  },
  {
   "id": "crcl3-hcl-green",
   "title": "Green solution deepens with concentrated acid",
   "reagents": [
    "crcl3",
    "conc_hcl"
   ],
   "glassware": "tube",
   "observation": {
    "liquid": "#0B6623",
    "gas": false,
    "text": "The pale green solution turns deep green on adding concentrated HCl; dilution restores pale green."
   },
   "question": "Why does concentrated chloride deepen the colour of chromium(III)?",
   "answer": "Chloride replaces water ligands, forming [CrCl2(H2O)4]^+ whose d-d absorption differs.",
   "wrong": [
    "Cr(III) is oxidised to green chromate by chloride in concentrated acid.",
    "Cr(III) is reduced to Cr(II), which is deep green in concentrated chloride.",
    "The colour deepens because HCl protonates the aqua complex, changing its charge."
   ],
   "equation": "[Cr(H2O)6]^3+ + 2Cl^- ⇌ [CrCl2(H2O)4]^+ + 2H2O"
  },
  {
   "id": "cu-nh3-complex",
   "title": "Blue precipitate dissolves to deep blue",
   "reagents": [
    "cuso4",
    "nh3"
   ],
   "glassware": "beaker",
   "observation": {
    "liquid": "#1E3A8A",
    "precipitate": "#87CEEB",
    "gas": false,
    "text": "A pale blue precipitate forms, then dissolves in excess ammonia to a deep blue solution."
   },
   "question": "Which complex ion is responsible for the deep blue solution?",
   "answer": "[Cu(NH3)4(H2O)2]^2+; ammonia replaces water ligands, giving a stronger d-d absorption.",
   "wrong": [
    "[Cu(NH3)6]^2+; six ammonia ligands give the deep blue colour of the complex.",
    "[Cu(OH)4]^2-; excess ammonia generates hydroxide that forms a blue cuprate ion.",
    "[Cu(NH3)2]^+; ammonia reduces Cu(II) to a blue copper(I) diammine complex."
   ],
   "equation": "[Cu(H2O)6]^2+ + 4NH3 ⇌ [Cu(NH3)4(H2O)2]^2+ + 4H2O"
  },
  {
   "id": "zn-ammonia-dissolve",
   "title": "White gel disappears in excess reagent",
   "reagents": [
    "znso4",
    "nh3"
   ],
   "glassware": "tube",
   "observation": {
    "liquid": "#F2F4F8",
    "precipitate": "#FFFFFF",
    "gas": false,
    "text": "A white gelatinous precipitate forms, then dissolves in excess ammonia."
   },
   "question": "Which species explains why the white precipitate dissolves in excess ammonia?",
   "answer": "[Zn(NH3)4]^2+ forms; ammonia replaces hydroxide ligands, giving a soluble tetraammine.",
   "wrong": [
    "[Zn(NH3)6]^2+ forms; six ammonia ligands are needed to dissolve zinc hydroxide.",
    "[Zn(OH)4]^2- forms; excess ammonia supplies hydroxide that makes a zincate.",
    "ZnO forms; ammonia dehydrates the hydroxide to soluble zinc oxide."
   ],
   "equation": "Zn(OH)2 + 4NH3 → [Zn(NH3)4]^2+ + 2OH^-"
  },
  {
   "id": "fe2-thiocyanate-pale",
   "title": "Pale solution stays faintly coloured",
   "reagents": [
    "feso4",
    "kscn"
   ],
   "glassware": "tube",
   "observation": {
    "liquid": "#F5DEB3",
    "gas": false,
    "text": "No red colour appears; only a faint pink tinge forms that fades on standing."
   },
   "question": "Why does iron(II) give only a faint colour with thiocyanate?",
   "answer": "Fe^2+ binds SCN^- weakly; air oxidises traces to Fe^3+, giving a faint [Fe(SCN)]^2+.",
   "wrong": [
    "Fe^2+ forms [Fe(SCN)]^+ strongly, but its colour is pale pink and fades.",
    "Thiocyanate reduces Fe^2+ to iron metal, leaving a faint pink sulfate colour.",
    "Fe^2+ precipitates Fe(SCN)2, which is pale and redissolves slowly."
   ],
   "equation": "4Fe^2+ + O2 + 4H^+ → 4Fe^3+ + 2H2O"
  },
  {
   "id": "mno4-h2o2-fade",
   "title": "Purple colour fades with a colourless liquid",
   "reagents": [
    "kmno4",
    "h2o2"
   ],
   "glassware": "flask",
   "observation": {
    "liquid": "#F2F4F8",
    "gas": true,
    "text": "The purple colour fades and bubbles of gas evolve; the solution becomes colourless."
   },
   "question": "Which species is oxidised, and what gas is evolved?",
   "answer": "H2O2 is oxidised to O2 while MnO4^- is reduced to Mn^2+; oxygen gas evolves.",
   "wrong": [
    "H2O2 is reduced to water while MnO4^- is oxidised to MnO2; hydrogen evolves.",
    "MnO4^- decomposes to MnO2 and O2 without redox, so the purple colour fades.",
    "H2O2 reduces Mn^2+ to manganese metal, releasing oxygen gas."
   ],
   "equation": "2MnO4^- + 5H2O2 + 6H^+ → 2Mn^2+ + 5O2 + 8H2O"
  },
  {
   "id": "cr2o7-h2o2",
   "title": "Orange solution turns deep blue on adding a colourless liquid",
   "reagents": [
    "k2cr2o7",
    "h2o2"
   ],
   "glassware": "tube",
   "observation": {
    "liquid": "#00008B",
    "gas": true,
    "text": "Orange solution turns deep blue with fizzing; blue colour fades on standing."
   },
   "question": "Which species is the transient blue colour due to?",
   "answer": "The peroxochromium(VI) species CrO5",
   "wrong": [
    "The chromium(III) aqua ion [Cr(H2O)6]^3+",
    "The dichromate ion Cr2O7^2- unchanged",
    "Chromium metal nanoparticles from reduction"
   ],
   "equation": "Cr2O7^2- + 4H2O2 + 2H^+ → 2CrO5 + 5H2O"
  }
 ]
} as unknown as Record<number, Experiment[]>;
export const GEN_COMPLETIONS: Record<number, Completion[]> = {
 "6": [
  {
   "reactants": "CH3CH=CH2 + HBr →",
   "answer": "CH3CHBrCH3",
   "wrong": [
    "CH3CH2CH2Br",
    "CH3CH=CH2 + H2",
    "CH3CHBrCH2Br"
   ]
  },
  {
   "reactants": "CH3CH=CH2 + H2O (H2SO4 catalyst) →",
   "answer": "CH3CH(OH)CH3",
   "wrong": [
    "CH3CH2CH2OH",
    "CH3CH2CH3",
    "CH3COCH3"
   ]
  },
  {
   "reactants": "CH3CH2OH + K2Cr2O7/H2SO4 (distil) →",
   "answer": "CH3CHO",
   "wrong": [
    "CH3COOH",
    "CH3CH2OCH2CH3",
    "CO2 + H2O"
   ]
  },
  {
   "reactants": "CH3CH(OH)CH3 + K2Cr2O7/H2SO4 (reflux) →",
   "answer": "CH3COCH3",
   "wrong": [
    "CH3CH2CHO",
    "CH3CH2COOH",
    "CH3CH=CH2"
   ]
  },
  {
   "reactants": "(CH3)3COH + K2Cr2O7/H2SO4 →",
   "answer": "no reaction",
   "wrong": [
    "(CH3)2C=CH2",
    "(CH3)3COH + Cr^3+",
    "CH3COCH3 + CH4"
   ]
  },
  {
   "reactants": "CH3COOH + CH3CH2OH (H2SO4, heat) →",
   "answer": "CH3COOCH2CH3 + H2O",
   "wrong": [
    "CH3CH2COOCH3 + H2O",
    "CH3COOCH3 + CH3OH",
    "CH3COCH2CH3 + H2O"
   ]
  },
  {
   "reactants": "CH3COOCH2CH3 + NaOH (aq, heat) →",
   "answer": "CH3COO^- + CH3CH2OH",
   "wrong": [
    "CH3COOH + CH3CH2OH",
    "CH3COO^- + CH3CH2O^-",
    "CH3CHO + CH3CH2OH"
   ]
  },
  {
   "reactants": "CH3CH2Br + OH^- (aq, warm) →",
   "answer": "CH3CH2OH + Br^-",
   "wrong": [
    "CH3CH2O^- + HBr",
    "CH2=CH2 + H2O + Br^-",
    "CH3CH2OH + H^+ + Br^-"
   ]
  },
  {
   "reactants": "Ag^+ + Cl^- →",
   "answer": "AgCl",
   "wrong": [
    "AgCl2^-",
    "Ag + Cl",
    "Ag2Cl"
   ]
  },
  {
   "reactants": "Ba^2+ + SO4^2- →",
   "answer": "BaSO4",
   "wrong": [
    "BaSO3",
    "Ba(SO4)2^2-",
    "BaO + SO3"
   ]
  },
  {
   "reactants": "2H^+ + CO3^2- →",
   "answer": "CO2 + H2O",
   "wrong": [
    "H2CO3",
    "CO + H2O",
    "HCO3^- + H^+"
   ]
  },
  {
   "reactants": "Fe^3+ + 3OH^- →",
   "answer": "Fe(OH)3",
   "wrong": [
    "Fe(OH)2",
    "FeO + H2O",
    "Fe(OH)4^-"
   ]
  }
 ],
 "7": [
  {
   "reactants": "MnO4^- + Fe^2+ + H^+ →",
   "answer": "Mn^2+ + Fe^3+ + H2O",
   "wrong": [
    "MnO2 + Fe^3+ + H2O",
    "Mn^2+ + Fe^2+ + H2O",
    "MnO4^- + Fe^3+ + H^+ (no reaction)"
   ]
  },
  {
   "reactants": "MnO4^- + C2O4^2- + OH^- →",
   "answer": "MnO2 + CO3^2- + H2O",
   "wrong": [
    "Mn^2+ + CO2 + H2O",
    "MnO4^2- + CO2 + H2O",
    "Mn(OH)2 + CO2 + H2O"
   ]
  },
  {
   "reactants": "Cu^2+ + NH3 (excess) →",
   "answer": "[Cu(NH3)4(H2O)2]^2+",
   "wrong": [
    "Cu(OH)2",
    "[CuCl4]^2-",
    "Cu + NH4^+"
   ]
  },
  {
   "reactants": "Co^2+ + Cl^- (excess, conc.) →",
   "answer": "[CoCl4]^2-",
   "wrong": [
    "[Co(H2O)6]^2+",
    "[CoCl6]^4-",
    "CoCl2 (s)"
   ]
  },
  {
   "reactants": "Fe^3+ + SCN^- →",
   "answer": "[Fe(SCN)(H2O)5]^2+",
   "wrong": [
    "Fe(SCN)3 (s)",
    "[Fe(CN)6]^3-",
    "Fe^2+ + SCN (radical)"
   ]
  },
  {
   "reactants": "Ag^+ + NH3 (excess) →",
   "answer": "[Ag(NH3)2]^+",
   "wrong": [
    "AgOH",
    "Ag(NH3)4^2+",
    "Ag2O + NH4^+"
   ]
  },
  {
   "reactants": "CH3CHO + NaBH4 →",
   "answer": "CH3CH2OH",
   "wrong": [
    "CH3COOH",
    "CH3CH(OH)CH2CHO",
    "CH3COO^- + CH3CH2OH"
   ]
  },
  {
   "reactants": "CH3COCH3 + HCN →",
   "answer": "(CH3)2C(OH)CN",
   "wrong": [
    "CH3CH(OH)CH2CN",
    "(CH3)2CHCN",
    "(CH3)2C=NH"
   ]
  },
  {
   "reactants": "CH3CHO + [Ag(NH3)2]^+ + OH^- →",
   "answer": "CH3COO^- + Ag + NH3 + H2O",
   "wrong": [
    "CH3COOH + Ag + NH3",
    "CH3CH2OH + Ag(NH3)2^+",
    "HCOOH + Ag + NH3"
   ]
  },
  {
   "reactants": "C6H6 + CH3Cl + AlCl3 →",
   "answer": "C6H5CH3 + HCl",
   "wrong": [
    "C6H5CH2Cl + HCl",
    "C6H5Cl + CH4",
    "C6H5C2H5 + HCl"
   ]
  },
  {
   "reactants": "C6H6 + HNO3 (conc. H2SO4) →",
   "answer": "C6H5NO2 + H2O",
   "wrong": [
    "C6H5NH2 + H2O",
    "C6H5ONO2 + H2O",
    "C6H5NO + H2O"
   ]
  },
  {
   "reactants": "CH3CONH2 + NaOH (aq, heat) →",
   "answer": "CH3COO^- + NH3",
   "wrong": [
    "CH3COOH + NH3",
    "CH3NH2 + HCOO^-",
    "CH3CONHNa + H2O"
   ]
  }
 ],
 "8": [
  {
   "reactants": "(CH3)3COH + HBr (dilute, warm) →",
   "answer": "(CH3)3CBr + H2O",
   "wrong": [
    "(CH3)2C=CH2 + H2O + HBr",
    "CH3CH2CH2CH2Br + H2O",
    "(CH3)3COBr + H2"
   ]
  },
  {
   "reactants": "(CH3)3CCH2Br + H2O (warm) →",
   "answer": "(CH3)2C(OH)CH2CH3 + HBr",
   "wrong": [
    "(CH3)3CCH2OH + HBr",
    "(CH3)2C=CHCH3 + H2O + HBr",
    "(CH3)3COH + CH3Br"
   ]
  },
  {
   "reactants": "CH3CH2COOCH3 + CH3MgBr (excess, then H3O+) →",
   "answer": "(CH3CH2)(CH3)2COH",
   "wrong": [
    "CH3CH2COCH3",
    "CH3CH2CH(OH)CH3",
    "CH3CH2COOCH2CH3"
   ]
  },
  {
   "reactants": "C6H5MgBr + CO2 (then H3O+) →",
   "answer": "C6H5COOH",
   "wrong": [
    "C6H5CHO",
    "C6H5CH2OH",
    "C6H6 + MgCO3"
   ]
  },
  {
   "reactants": "2 CH3CHO + NaOH (dilute, warm) →",
   "answer": "CH3CH=CHCHO + H2O",
   "wrong": [
    "CH3CH(OH)CH2CHO",
    "CH3COCH3 + CH3OH",
    "CH3CH2CH2CHO + H2O"
   ]
  },
  {
   "reactants": "C6H5CHO + CH3CHO + NaOH (dilute) →",
   "answer": "C6H5CH=CHCHO + H2O",
   "wrong": [
    "C6H5CH(OH)CH2CHO",
    "C6H5CH2CH2CHO",
    "C6H5COCH3 + H2O"
   ]
  },
  {
   "reactants": "CH2=CH-CH=CH2 + CH2=CHCHO (heat) →",
   "answer": "cyclohex-3-ene-1-carbaldehyde",
   "wrong": [
    "cyclohex-1-ene-1-carbaldehyde",
    "2-ethylcyclohex-3-enone",
    "cyclohex-2-ene-1-carbaldehyde"
   ]
  },
  {
   "reactants": "Fe^3+ + I^- (excess) →",
   "answer": "Fe^2+ + I2",
   "wrong": [
    "FeI3",
    "Fe^2+ + I^- (no reaction)",
    "Fe + I2"
   ]
  },
  {
   "reactants": "Cu^+ (aqueous) →",
   "answer": "Cu^2+ + Cu",
   "wrong": [
    "Cu^3+ + Cu^-",
    "Cu + H2O",
    "Cu^2+ + H2"
   ]
  },
  {
   "reactants": "MnO4^- + I^- + H^+ →",
   "answer": "Mn^2+ + I2 + H2O",
   "wrong": [
    "Mn^2+ + IO3^- + H2O",
    "MnO2 + I2 + H2O",
    "Mn^2+ + I^- + H2O"
   ]
  },
  {
   "reactants": "Cr2O7^2- + Fe^2+ + H^+ →",
   "answer": "Cr^3+ + Fe^3+ + H2O",
   "wrong": [
    "Cr^3+ + Fe^2+ + H2O",
    "CrO4^2- + Fe^3+ + H2O",
    "Cr + Fe^3+ + H2O"
   ]
  },
  {
   "reactants": "(CH3)2C(OH)C(OH)(CH3)2 + H2SO4 (conc., heat) →",
   "answer": "(CH3)3CCOCH3",
   "wrong": [
    "(CH3)2C=CHC(OH)(CH3)2",
    "(CH3)2CHCOCH(CH3)2",
    "(CH3)2C(OH)CH(CH3)CHO"
   ]
  },
  {
   "reactants": "(CH3)2C=CHCH2CH3 + O3 then Zn/H2O →",
   "answer": "(CH3)2C=O + OHCCH2CH3",
   "wrong": [
    "(CH3)2C=O + HOOCCH2CH3",
    "(CH3)2CHCHO + CH3CHO",
    "(CH3)2C=O + CH3CH2CH2OH"
   ]
  },
  {
   "reactants": "Cl2 + NaOH (cold, dilute) →",
   "answer": "NaCl + NaClO + H2O",
   "wrong": [
    "NaCl + NaClO3 + H2O",
    "NaClO2 + NaCl",
    "NaClO4 + NaCl"
   ]
  },
  {
   "reactants": "Br2 + NaOH (hot, conc.) →",
   "answer": "NaBr + NaBrO3 + H2O",
   "wrong": [
    "NaBr + NaBrO + H2O",
    "NaBrO2 + NaBr",
    "NaBrO4 + NaBr"
   ]
  },
  {
   "reactants": "Cu2O + H2SO4 (dilute) →",
   "answer": "Cu + CuSO4 + H2O",
   "wrong": [
    "2CuSO4 + H2O",
    "CuO + CuSO3 + H2O",
    "2Cu + H2SO4"
   ]
  },
  {
   "reactants": "HNO2 (cold, dilute, aqueous) →",
   "answer": "HNO3 + NO + H2O",
   "wrong": [
    "NO2 + NO + H2O",
    "N2O + H2O",
    "NH4NO3 + H2O"
   ]
  },
  {
   "reactants": "Fe^3+ + I^- →",
   "answer": "Fe^2+ + I2",
   "wrong": [
    "Fe + I2",
    "FeI3",
    "Fe^2+ + IO3^-"
   ]
  },
  {
   "reactants": "KMnO4 + KOH (conc., heat) →",
   "answer": "K2MnO4 + O2 + H2O",
   "wrong": [
    "MnO2 + KOH + O2",
    "K3MnO4 + H2O",
    "Mn2O7 + K2O"
   ]
  },
  {
   "reactants": "Na2S2O3 + I2 →",
   "answer": "Na2S4O6 + NaI",
   "wrong": [
    "Na2SO4 + NaI",
    "Na2S2O6 + NaI",
    "Na2S + NaIO3"
   ]
  }
 ],
 "9": [
  {
   "reactants": "2 C6H5CHO + NaOH (conc, heat) →",
   "answer": "C6H5CH2OH + C6H5COO^-Na^+",
   "wrong": [
    "C6H5COOH + C6H5CH3",
    "C6H5CH2OH + C6H5CH3",
    "C6H5COO^-Na^+ + H2"
   ]
  },
  {
   "reactants": "HCHO + C6H5CHO (excess NaOH) →",
   "answer": "HCOO^-Na^+ + C6H5CH2OH",
   "wrong": [
    "CH3OH + C6H5COO^-Na^+",
    "C6H5CH2OH + C6H5COO^-Na^+",
    "HCOOH + C6H5CH2OH"
   ]
  },
  {
   "reactants": "C6H5CHO + Ph3P=CHCOOCH2CH3 →",
   "answer": "C6H5CH=CHCOOCH2CH3 (E major)",
   "wrong": [
    "C6H5CH2CH2COOCH2CH3",
    "C6H5CH=C(CH3)COOCH2CH3",
    "C6H5CH=CHCOOCH2CH3 (Z major)"
   ]
  },
  {
   "reactants": "C6H5CHO + Ph3P=CH2 →",
   "answer": "C6H5CH=CH2 + Ph3P=O",
   "wrong": [
    "C6H5CH3 + Ph3P=CH2",
    "C6H5CH2CH3 + Ph3P=O",
    "C6H5CH=CH2 + Ph3P"
   ]
  },
  {
   "reactants": "2 CH3COOCH2CH3 + NaOCH2CH3 →",
   "answer": "CH3COCH2COOCH2CH3",
   "wrong": [
    "CH3CH2COCH2COOCH2CH3",
    "CH3COCH2CH2COOCH2CH3",
    "CH3COOCH2CH3 + CH3CH2OH"
   ]
  },
  {
   "reactants": "C6H5CONH2 + Br2 + 4NaOH →",
   "answer": "C6H5NH2",
   "wrong": [
    "C6H5COOH",
    "C6H5CH2NH2",
    "C6H5NHC6H5"
   ]
  },
  {
   "reactants": "CH3CH2CONH2 + Br2 + 4NaOH →",
   "answer": "CH3CH2NH2",
   "wrong": [
    "CH3CH2COOH",
    "CH3NH2",
    "CH3CH2CH2NH2"
   ]
  },
  {
   "reactants": "C6H5C(CH3)=NOH (H2SO4, heat) →",
   "answer": "CH3CONHC6H5",
   "wrong": [
    "C6H5CONHC6H5",
    "C6H5CONHCH3",
    "C6H5NHCOCH2CH3"
   ]
  },
  {
   "reactants": "XeF6 + H2O (1 equiv, controlled) →",
   "answer": "XeOF4 + 2HF",
   "wrong": [
    "XeO3 + 3HF",
    "XeO2F2 + 2HF",
    "Xe + O2 + HF"
   ]
  },
  {
   "reactants": "XeF6 + 3H2O (excess) →",
   "answer": "XeO3 + 6HF",
   "wrong": [
    "XeOF4 + 2HF",
    "XeO2F2 + 2HF",
    "H2XeO4 + 4HF"
   ]
  }
 ],
 "10": [
  {
   "reactants": "K2Cr2O7 + H2SO4 + H2O2 (ether layer) →",
   "answer": "CrO5 + K2SO4 + H2O",
   "wrong": [
    "Cr2(SO4)3 + O2",
    "K2CrO4 + H2O2",
    "CrO3 + K2SO4"
   ]
  }
 ]
} as unknown as Record<number, Completion[]>;
export const GEN_SUBSTANCES: Substance[] = [
 {
  "id": "aluminium-sulfate",
  "name": "Aluminium sulfate solution",
  "appearance": "Colourless solution",
  "level": 8,
  "results": {
   "litmus": "Blue litmus turns red",
   "ph": "pH about 3",
   "mg": "Slow bubbles of gas",
   "flame": "No colour, orange-yellow only",
   "agno3": "No visible change",
   "naoh": "White gelatinous precipitate, dissolves in excess",
   "bacl2": "White precipitate, acid-insoluble",
   "nh3": "White gelatinous precipitate, insoluble in excess",
   "kscn": "No visible change",
   "kmno4": "No visible change",
   "nahco3": "Effervescence, precipitate forms",
   "brwater": "No visible change",
   "dnph": "No visible change",
   "tollens": "No visible change",
   "fehling": "No visible change",
   "iodoform": "No visible change",
   "fecl3": "No visible change"
  }
 },
 {
  "id": "iron-ii-sulfate",
  "name": "Iron(II) sulfate solution",
  "appearance": "Pale green solution",
  "level": 8,
  "results": {
   "litmus": "Blue litmus turns red",
   "ph": "pH about 3",
   "mg": "Slow bubbles of gas",
   "flame": "No colour, orange-yellow only",
   "agno3": "No visible change",
   "naoh": "Dirty-green precipitate, insoluble in excess",
   "bacl2": "White precipitate, acid-insoluble",
   "nh3": "Dirty-green precipitate, insoluble in excess",
   "kscn": "No visible change",
   "kmno4": "Purple colour fades on warming",
   "nahco3": "Effervescence, precipitate forms",
   "brwater": "Bromine water decolourised, yellow solution",
   "dnph": "No visible change",
   "tollens": "No visible change",
   "fehling": "No visible change",
   "iodoform": "No visible change",
   "fecl3": "No visible change"
  }
 },
 {
  "id": "propanal",
  "name": "Propanal",
  "appearance": "Colourless liquid, pungent fruity smell",
  "level": 6,
  "results": {
   "litmus": "No visible change",
   "ph": "pH about 6",
   "mg": "No visible change",
   "flame": "No visible change",
   "agno3": "No visible change",
   "naoh": "No visible change",
   "bacl2": "No visible change",
   "nh3": "No visible change",
   "kscn": "No visible change",
   "kmno4": "Decolourised on warming",
   "nahco3": "No visible change",
   "brwater": "Decolourised slowly",
   "dnph": "Orange precipitate",
   "tollens": "Silver mirror",
   "fehling": "Brick-red precipitate",
   "iodoform": "No visible change",
   "fecl3": "No visible change"
  }
 },
 {
  "id": "methyl-ethanoate",
  "name": "Methyl ethanoate",
  "appearance": "Colourless liquid, sweet fruity smell",
  "level": 7,
  "results": {
   "litmus": "No visible change",
   "ph": "pH about 6",
   "mg": "No visible change",
   "flame": "No visible change",
   "agno3": "No visible change",
   "naoh": "No visible change",
   "bacl2": "No visible change",
   "nh3": "No visible change",
   "kscn": "No visible change",
   "kmno4": "No visible change",
   "nahco3": "No visible change",
   "brwater": "No visible change",
   "dnph": "No visible change",
   "tollens": "No visible change",
   "fehling": "No visible change",
   "iodoform": "No visible change",
   "fecl3": "No visible change"
  }
 },
 {
  "id": "butan-2-one",
  "name": "Butan-2-one",
  "appearance": "Colourless liquid, acetone-like smell",
  "level": 7,
  "results": {
   "litmus": "No visible change",
   "ph": "pH about 6",
   "mg": "No visible change",
   "flame": "No visible change",
   "agno3": "No visible change",
   "naoh": "No visible change",
   "bacl2": "No visible change",
   "nh3": "No visible change",
   "kscn": "No visible change",
   "kmno4": "No visible change on warming",
   "nahco3": "No visible change",
   "brwater": "No visible change",
   "dnph": "Orange precipitate",
   "tollens": "No visible change",
   "fehling": "No visible change",
   "iodoform": "Yellow precipitate",
   "fecl3": "No visible change"
  }
 },
 {
  "id": "nitrobenzene",
  "name": "Nitrobenzene",
  "appearance": "Pale yellow oily liquid, almond smell",
  "level": 8,
  "results": {
   "litmus": "No visible change",
   "ph": "pH about 6",
   "mg": "No visible change",
   "flame": "No visible change",
   "agno3": "No visible change",
   "naoh": "No visible change",
   "bacl2": "No visible change",
   "nh3": "No visible change",
   "kscn": "No visible change",
   "kmno4": "No visible change",
   "nahco3": "No visible change",
   "brwater": "No visible change",
   "dnph": "No visible change",
   "tollens": "No visible change",
   "fehling": "No visible change",
   "iodoform": "No visible change",
   "fecl3": "No visible change"
  }
 },
 {
  "id": "benzyl-alcohol",
  "name": "Benzyl alcohol",
  "appearance": "Colourless liquid, faint aromatic smell",
  "level": 8,
  "results": {
   "litmus": "No visible change",
   "ph": "pH about 7",
   "mg": "No visible change",
   "flame": "No visible change",
   "agno3": "No visible change",
   "naoh": "No visible change",
   "bacl2": "No visible change",
   "nh3": "No visible change",
   "kscn": "No visible change",
   "kmno4": "Decolourised on warming",
   "nahco3": "No visible change",
   "brwater": "No visible change",
   "dnph": "No visible change",
   "tollens": "No visible change",
   "fehling": "No visible change",
   "iodoform": "No visible change",
   "fecl3": "No visible change"
  }
 },
 {
  "id": "iron-alum",
  "name": "Ammonium iron(III) sulfate (iron alum) solution",
  "appearance": "Yellow-brown solution",
  "level": 7,
  "results": {
   "litmus": "Blue litmus turns red",
   "ph": "pH about 2-3",
   "mg": "Effervescence; gas evolved",
   "flame": "No visible change",
   "agno3": "No visible change",
   "naoh": "Red-brown ppt; persists in excess",
   "bacl2": "White ppt, insoluble in acid",
   "nh3": "Red-brown ppt; persists in excess",
   "kscn": "Deep blood-red colour",
   "kmno4": "No visible change",
   "nahco3": "Effervescence (CO2)",
   "brwater": "No visible change",
   "dnph": "No visible change",
   "tollens": "No visible change",
   "fehling": "No visible change",
   "iodoform": "No visible change",
   "fecl3": "No visible change"
  }
 },
 {
  "id": "potassium-hso4",
  "name": "Potassium hydrogen sulfate solution",
  "appearance": "Colourless solution",
  "level": 6,
  "results": {
   "litmus": "Blue litmus turns red strongly",
   "ph": "pH about 1-2",
   "mg": "Effervescence; hydrogen evolved",
   "flame": "Lilac flame",
   "agno3": "No visible change",
   "naoh": "No visible change",
   "bacl2": "White ppt, insoluble in acid",
   "nh3": "No visible change",
   "kscn": "No visible change",
   "kmno4": "No visible change",
   "nahco3": "Effervescence (CO2)",
   "brwater": "No visible change",
   "dnph": "No visible change",
   "tollens": "No visible change",
   "fehling": "No visible change",
   "iodoform": "No visible change",
   "fecl3": "No visible change"
  }
 },
 {
  "id": "sodium-bisulfite",
  "name": "Sodium hydrogensulfite solution",
  "appearance": "Colourless solution; pungent SO2 smell",
  "level": 7,
  "results": {
   "litmus": "Blue litmus turns red",
   "ph": "pH about 3-4",
   "mg": "Effervescence; gas evolved",
   "flame": "Golden yellow flame",
   "agno3": "No visible change",
   "naoh": "No visible change",
   "bacl2": "White ppt; SO2 evolved with acid",
   "nh3": "No visible change",
   "kscn": "No visible change",
   "kmno4": "Decolourised rapidly",
   "nahco3": "Effervescence (CO2)",
   "brwater": "Decolourised",
   "dnph": "No visible change",
   "tollens": "No visible change",
   "fehling": "No visible change",
   "iodoform": "No visible change",
   "fecl3": "No visible change"
  }
 },
 {
  "id": "sodium-metabisulfite",
  "name": "Sodium metabisulfite solution",
  "appearance": "Colourless solution; pungent SO2 smell",
  "level": 8,
  "results": {
   "litmus": "Blue litmus turns red",
   "ph": "pH about 3-4",
   "mg": "Effervescence; gas evolved",
   "flame": "Golden yellow flame",
   "agno3": "No visible change",
   "naoh": "No visible change",
   "bacl2": "White ppt; SO2 evolved with acid",
   "nh3": "No visible change",
   "kscn": "No visible change",
   "kmno4": "Decolourised rapidly",
   "nahco3": "Effervescence (CO2)",
   "brwater": "Decolourised",
   "dnph": "No visible change",
   "tollens": "No visible change",
   "fehling": "No visible change",
   "iodoform": "No visible change",
   "fecl3": "No visible change"
  }
 },
 {
  "id": "sodium-dihydrogen-phosphate",
  "name": "Sodium dihydrogenphosphate solution",
  "appearance": "Colourless solution",
  "level": 7,
  "results": {
   "litmus": "Blue litmus turns red weakly",
   "ph": "pH about 4-5",
   "mg": "Effervescence slowly; hydrogen",
   "flame": "Golden yellow flame",
   "agno3": "No visible change",
   "naoh": "No visible change",
   "bacl2": "No visible change",
   "nh3": "No visible change",
   "kscn": "No visible change",
   "kmno4": "No visible change",
   "nahco3": "No visible change",
   "brwater": "No visible change",
   "dnph": "No visible change",
   "tollens": "No visible change",
   "fehling": "No visible change",
   "iodoform": "No visible change",
   "fecl3": "No visible change"
  }
 },
 {
  "id": "copperii-chloride",
  "name": "Copper(II) chloride solution",
  "appearance": "Green-blue solution",
  "level": 7,
  "results": {
   "litmus": "Blue litmus turns red",
   "ph": "pH ~3–4, green",
   "mg": "Effervescence, Mg dissolves",
   "flame": "Green-blue flame",
   "agno3": "White precipitate, soluble in excess NH3",
   "naoh": "Blue ppt, insoluble in excess",
   "bacl2": "No visible change",
   "nh3": "Blue ppt, dissolves to deep blue",
   "kscn": "No visible change",
   "kmno4": "No visible change",
   "nahco3": "Effervescence",
   "brwater": "No visible change",
   "dnph": "No visible change",
   "tollens": "No visible change",
   "fehling": "No visible change",
   "iodoform": "No visible change",
   "fecl3": "No visible change"
  }
 },
 {
  "id": "copperii-sulfate",
  "name": "Copper(II) sulfate solution",
  "appearance": "Blue solution",
  "level": 7,
  "results": {
   "litmus": "Blue litmus turns red",
   "ph": "pH ~4, blue",
   "mg": "Effervescence, Mg dissolves",
   "flame": "Green-blue flame",
   "agno3": "No visible change",
   "naoh": "Blue ppt, insoluble in excess",
   "bacl2": "White precipitate, insoluble in acid",
   "nh3": "Blue ppt, dissolves to deep blue",
   "kscn": "No visible change",
   "kmno4": "No visible change",
   "nahco3": "Effervescence",
   "brwater": "No visible change",
   "dnph": "No visible change",
   "tollens": "No visible change",
   "fehling": "No visible change",
   "iodoform": "No visible change",
   "fecl3": "No visible change"
  }
 },
 {
  "id": "ammonium-chloride",
  "name": "Ammonium chloride solution",
  "appearance": "Colourless solution",
  "level": 7,
  "results": {
   "litmus": "Blue litmus turns red",
   "ph": "pH ~5, colourless",
   "mg": "Effervescence, Mg dissolves",
   "flame": "No visible change",
   "agno3": "White precipitate, dissolves in excess NH3",
   "naoh": "Ammonia evolved on warming",
   "bacl2": "No visible change",
   "nh3": "No visible change",
   "kscn": "No visible change",
   "kmno4": "No visible change",
   "nahco3": "Effervescence",
   "brwater": "No visible change",
   "dnph": "No visible change",
   "tollens": "No visible change",
   "fehling": "No visible change",
   "iodoform": "No visible change",
   "fecl3": "No visible change"
  }
 }
];
/** Results of the newer tests for the original unknowns. */
export const GEN_RESULTS: Record<string, Partial<Record<TestId, string>>> = {
 "water": {
  "nh3": "No visible change",
  "kscn": "No visible change",
  "kmno4": "No visible change",
  "nahco3": "No visible change",
  "brwater": "No visible change",
  "dnph": "No visible change",
  "tollens": "No visible change",
  "fehling": "No visible change",
  "iodoform": "No visible change",
  "fecl3": "No visible change"
 },
 "nacl": {
  "nh3": "No visible change",
  "kscn": "No visible change",
  "kmno4": "No visible change",
  "nahco3": "No visible change",
  "brwater": "No visible change",
  "dnph": "No visible change",
  "tollens": "No visible change",
  "fehling": "No visible change",
  "iodoform": "No visible change",
  "fecl3": "No visible change"
 },
 "kcl": {
  "nh3": "No visible change",
  "kscn": "No visible change",
  "kmno4": "No visible change",
  "nahco3": "No visible change",
  "brwater": "No visible change",
  "dnph": "No visible change",
  "tollens": "No visible change",
  "fehling": "No visible change",
  "iodoform": "No visible change",
  "fecl3": "No visible change"
 },
 "ethanol": {
  "nh3": "No visible change",
  "kscn": "No visible change",
  "kmno4": "Purple colour fades; no gas",
  "nahco3": "No visible change",
  "brwater": "No visible change",
  "dnph": "No visible change",
  "tollens": "No visible change",
  "fehling": "No visible change",
  "iodoform": "Yellow precipitate forms",
  "fecl3": "No visible change"
 },
 "h2so4": {
  "nh3": "No visible change",
  "kscn": "No visible change",
  "kmno4": "No visible change",
  "nahco3": "Fizzes; gas turns limewater milky",
  "brwater": "No visible change",
  "dnph": "No visible change",
  "tollens": "No visible change",
  "fehling": "No visible change",
  "iodoform": "No visible change",
  "fecl3": "No visible change"
 }
};
