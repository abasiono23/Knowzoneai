/**
 * Stylised 3D art for the Museum of Time (History & Geography games, 2.5D): the museum, the eras the
 * time machine visits, dig sites and artifacts, African landmarks, and the student as a young
 * explorer (one base picture, edited into other poses so it stays the same person). Run from
 * apps/server:
 *
 *   npx tsx scripts/history-art.ts <output folder> [name or prefix-] [--n 1]
 *
 * Copy the chosen ones (as WebP) to apps/mobile/assets/images/world/history/.
 */
import { runArt, type Art } from './art-runner.js';

const LOOK =
  'Stylised 3D game render like a Pixar film or a premium console game: realistic lighting and materials (stone, wood, brass, cloth, warm sunlight), slightly cartoon proportions, friendly rounded shapes, rich warm colours. No text, letters, numbers, signs, labels or logos anywhere.';
/** A place the student walks in: the bottom half must be open ground. */
const PLACE = (place: string) =>
  `${LOOK} A standing view of ${place}. Portrait composition: the lower half is open, empty, walkable ground in the foreground; anything else is in the middle distance and background. Any people are small, in the background only. Historically accurate clothing, buildings and objects.`;
const CUTOUT = 'A single object, fully transparent background, no floor, no shadow box, no pedestal, centred.';
const EXPLORER =
  'a Nigerian teenage student (about 15) dressed as a young explorer: khaki safari shirt with rolled sleeves, a brown leather satchel across the body, dark trousers, brown boots and a small khaki explorer hat';

const ART: Record<string, Art> = {
  // The museum and its stations
  'scene-museum': {
    size: '1024x1536',
    prompt: `${LOOK} A grand, sunlit museum of history seen from the entrance at standing eye level, portrait composition: tall arched windows, warm golden light, a polished marble floor filling the lower half, open and empty to walk on. Left: a large glowing brass and wood time machine with a swirling golden portal. Back centre: a roped-off excavation pit with ancient stone ruins and a bronze head on a pedestal. Right: a round wooden table with a big glowing 3D map of Africa floating above it. No people.`,
  },
  'scene-timemachine': {
    size: '1024x1536',
    prompt: `${LOOK} Close view of a magnificent brass, copper and polished wood time machine in a museum: a round doorway with a swirling golden-violet glowing portal, dials and gears, a lever. No people.`,
  },
  'scene-dig': {
    size: '1024x1536',
    prompt: `${LOOK} A museum gallery of ancient African civilizations: glass cases with bronze heads, terracotta sculptures and pottery, an excavation pit with sand and tools in the middle, warm spotlights. No people.`,
  },
  'scene-maptable': {
    size: '1024x1536',
    prompt: `${LOOK} A round polished wooden table in a museum with a large glowing holographic 3D map of the African continent floating above it, tiny mountains, rivers and landmarks on the map, warm and teal light. No people.`,
  },
  'map-sea': {
    size: '1024x1536',
    prompt: `${LOOK} An old explorer's chart background, portrait: deep teal ocean with soft waves pattern and a faint compass rose in the corner, parchment-coloured edges, nothing in the middle. No land, no text.`,
  },

  // The explorer (one base picture; the poses are edits of it)
  'student-back': {
    size: '1024x1536',
    transparent: true,
    prompt: `${LOOK} Full body, seen from directly behind: ${EXPLORER}. Standing relaxed, arms by the sides. Fully transparent background, no floor, no shadow.`,
  },
  'student-walk': {
    size: '1024x1536',
    transparent: true,
    ref: 'student-back-1.png',
    prompt:
      'The exact same student, same clothes and proportions, seen from directly behind, now walking away mid-stride (left foot forward, arms swinging a little). Fully transparent background, no floor, no shadow.',
  },
  'student-side': {
    size: '1024x1536',
    transparent: true,
    ref: 'student-back-1.png',
    prompt:
      'The exact same Nigerian student with the same dark brown skin, same clothes, hat and satchel, now seen from the side walking to the LEFT, mid-stride, friendly face in profile. Black African features, dark brown skin tone matching the hands and neck in the picture. Fully transparent background, no floor, no shadow.',
  },
  'student-front': {
    size: '1024x1536',
    transparent: true,
    ref: 'student-back-1.png',
    prompt:
      'The exact same Nigerian student with the same dark brown skin, same clothes, hat and satchel, now seen from the front, standing and smiling, holding a small explorer notebook. Black African features, dark brown skin tone matching the hands and neck in the picture, short black hair. Fully transparent background, no floor, no shadow.',
  },

  // Eras the time machine visits
  'era-nok': {
    size: '1024x1536',
    prompt: PLACE(
      'a Nok culture village on a hillside in central Nigeria around 500 BC: round mud huts with thatched roofs, a clay iron-smelting furnace with smoke, terracotta sculptures drying in the sun, savanna and rocky hills',
    ),
  },
  'era-egypt': {
    size: '1024x1536',
    prompt: PLACE(
      'Giza in ancient Egypt around 2500 BC: the great pyramid being built with mud-brick ramps and stone blocks, the river Nile with reed boats, palm trees, desert sand',
    ),
  },
  'era-ife': {
    size: '1024x1536',
    prompt: PLACE(
      'the royal city of Ile-Ife around 1300 AD: a palace courtyard with red earth walls and a decorated potsherd pavement, bronze and terracotta heads displayed on clay platforms, people in fine robes in the background',
    ),
  },
  'era-mali': {
    size: '1024x1536',
    prompt: PLACE(
      'Timbuktu in the Mali Empire around 1330 AD: the great mud-brick Djinguereber mosque with wooden beams sticking out, a camel caravan carrying salt slabs, scholars with books in the background, golden sand',
    ),
  },
  'era-benin': {
    size: '1024x1536',
    prompt: PLACE(
      "Benin City around 1500 AD: the Oba's palace with bronze plaques fixed to wooden pillars, a tall red earth city wall, guards in coral beads in the background",
    ),
  },
  'era-oyo': {
    size: '1024x1536',
    prompt: PLACE(
      'the Oyo Empire around 1700 AD: the royal city of Oyo-Ile with a palace of red earth walls and thatched roofs, horsemen of the Oyo cavalry with colourful saddle cloths in the background, savanna',
    ),
  },
  'era-sokoto': {
    size: '1024x1536',
    prompt: PLACE(
      'Sokoto around 1810 AD in the Sokoto Caliphate: mud-brick buildings with decorated walls, a Quranic school under a large tree with wooden writing boards, horses, dry savanna',
    ),
  },
  'era-colonial': {
    size: '1024x1536',
    prompt: PLACE(
      'Lagos, Nigeria in 1914: colonial-era two-storey buildings with balconies, a railway line with a steam train, a harbour with steamships, people in 1910s clothing in the background',
    ),
  },
  'era-independence': {
    size: '1024x1536',
    prompt: PLACE(
      'Lagos on 1 October 1960, Nigeria’s Independence Day: a big celebrating crowd in the background at a parade ground as the green-white-green Nigerian flag is raised on a tall flagpole, sunrise light',
    ),
  },
  'era-abuja': {
    size: '1024x1536',
    prompt: PLACE(
      'modern Abuja, Nigeria’s capital: the huge granite Aso Rock rising behind wide avenues, the National Mosque with golden dome, green trees, bright day',
    ),
  },

  // Dig sites and artifacts
  'dig-savanna': {
    size: '1024x1536',
    prompt: PLACE(
      'an archaeological dig in West Africa: red earth, the low ruined earthen walls of an ancient city, a string grid over shallow dig pits, tools, a canvas tent, savanna trees',
    ),
  },
  'dig-desert': {
    size: '1024x1536',
    prompt: PLACE(
      'an archaeological dig in the desert: golden sand, half-buried sandstone ruins and broken columns, a small pyramid in the far distance, a string grid over shallow dig pits, a canvas tent',
    ),
  },
  'dig-stone': {
    size: '1024x1536',
    prompt: PLACE(
      'an archaeological dig beside ancient dry-stone granite walls (like Great Zimbabwe), a stone tower in the distance, green hills, a string grid over shallow dig pits, a canvas tent',
    ),
  },
  'artifact-nok': {
    size: '1024x1024',
    transparent: true,
    prompt: `${LOOK} ${CUTOUT} A Nok culture terracotta head sculpture from Nigeria: reddish-brown clay, triangular eyes with pierced pupils, elaborate hairstyle.`,
  },
  'artifact-ife': {
    size: '1024x1024',
    transparent: true,
    prompt: `${LOOK} ${CUTOUT} An Ife bronze head from Nigeria: a naturalistic, serene royal face with fine vertical lines on the face and a crown, dark copper-brown metal with green patina.`,
  },
  'artifact-benin': {
    size: '1024x1024',
    transparent: true,
    prompt: `${LOOK} ${CUTOUT} A Benin bronze plaque: a rectangular brass relief showing a warrior chief with a shield and spear, decorated background with rosettes.`,
  },
  'artifact-igboukwu': {
    size: '1024x1024',
    transparent: true,
    prompt: `${LOOK} ${CUTOUT} An Igbo-Ukwu bronze ritual vessel: a delicate pot with a bronze rope-like cage around it, very fine detailed decoration.`,
  },
  'artifact-zimbabwe': {
    size: '1024x1024',
    transparent: true,
    prompt: `${LOOK} ${CUTOUT} A Great Zimbabwe soapstone bird: a carved grey-green stone bird sitting on top of a tall stone column.`,
  },
  'artifact-egypt': {
    size: '1024x1024',
    transparent: true,
    prompt: `${LOOK} ${CUTOUT} An ancient Egyptian golden funerary mask of a pharaoh with blue stripes on the headdress.`,
  },
  'artifact-mali': {
    size: '1024x1024',
    transparent: true,
    prompt: `${LOOK} ${CUTOUT} An old Timbuktu manuscript: open leather-bound book with hand-written brown and red ink lines of script (unreadable), aged paper.`,
  },
  'artifact-aksum': {
    size: '1024x1024',
    transparent: true,
    prompt: `${LOOK} ${CUTOUT} An ancient gold coin of the Kingdom of Aksum with a crowned king's portrait and wheat ears.`,
  },
  'artifact-kush': {
    size: '1024x1024',
    transparent: true,
    prompt: `${LOOK} ${CUTOUT} Gold jewellery of the Kingdom of Kush: a broad gold armband with coloured glass inlay and a ram's head.`,
  },
  'artifact-pottery': {
    size: '1024x1024',
    transparent: true,
    prompt: `${LOOK} ${CUTOUT} Broken pieces of an ancient clay pot with carved patterns, fitted together.`,
  },
  'artifact-beads': { size: '1024x1024', transparent: true, prompt: `${LOOK} ${CUTOUT} A string of ancient glass and stone beads in red, blue and yellow.` },
  'artifact-tool': {
    size: '1024x1024',
    transparent: true,
    prompt: `${LOOK} ${CUTOUT} An ancient hand-forged iron hoe blade and a small iron knife, slightly rusted.`,
  },

  // African landmarks (Africa Explorer)
  'land-zuma': {
    size: '1024x1536',
    prompt: PLACE('Zuma Rock in Niger State, Nigeria: the huge smooth granite monolith rising above green savanna, a road in the foreground'),
  },
  'land-pyramids': { size: '1024x1536', prompt: PLACE('the pyramids of Giza and the Great Sphinx in Egypt today, desert sand, clear blue sky') },
  'land-maasaimara': {
    size: '1024x1536',
    prompt: PLACE(
      'the Maasai Mara in Kenya: golden grassland, acacia trees, zebras and wildebeest grazing in the distance, a few Maasai herders in red shukas far away',
    ),
  },
  'land-tablemountain': {
    size: '1024x1536',
    prompt: PLACE(
      'Table Mountain above Cape Town, South Africa: the flat-topped mountain with a tablecloth of cloud, the city and the sea below, seen from a lookout',
    ),
  },
  'land-kakum': {
    size: '1024x1536',
    prompt: PLACE(
      'the canopy walkway of Kakum National Park in Ghana: rope bridges high among giant rainforest trees, misty green forest, seen from a wooden viewing platform',
    ),
  },
  'land-kilimanjaro': {
    size: '1024x1536',
    prompt: PLACE('Mount Kilimanjaro in Tanzania: the snow-capped volcano rising above savanna, elephants walking far away, acacia trees'),
  },
  'land-lalibela': {
    size: '1024x1536',
    prompt: PLACE(
      'the rock-hewn church of Saint George in Lalibela, Ethiopia: a cross-shaped church carved down into the red rock, seen from the edge of the pit',
    ),
  },
  'land-sahara': {
    size: '1024x1536',
    prompt: PLACE('the Sahara desert at Erg Chebbi near Merzouga, Morocco: tall orange sand dunes at sunset, a camel caravan far away'),
  },
  'land-djenne': {
    size: '1024x1536',
    prompt: PLACE(
      'the Great Mosque of Djenné in Mali: the largest mud-brick building in the world with wooden beams and three towers, an open square in front',
    ),
  },
  'land-victoriafalls': {
    size: '1024x1536',
    prompt: PLACE(
      'Victoria Falls on the Zambezi river between Zambia and Zimbabwe: the thundering wide waterfall with clouds of mist and a rainbow, seen from a viewpoint',
    ),
  },
  'land-lacrose': {
    size: '1024x1536',
    prompt: PLACE('Lac Rose (the Pink Lake) in Senegal: a bright pink lake, salt collectors’ boats and white salt piles on the shore'),
  },
  'land-okavango': {
    size: '1024x1536',
    prompt: PLACE('the Okavango Delta in Botswana: clear water channels among green reeds and islands, a mokoro dugout canoe, elephants far away'),
  },
  'land-baobabs': { size: '1024x1536', prompt: PLACE('the Avenue of the Baobabs in Madagascar at sunset: giant baobab trees along a red dirt road') },
  'land-namib': {
    size: '1024x1536',
    prompt: PLACE('Sossusvlei in the Namib desert, Namibia: huge red sand dunes, a white clay pan with dead camel-thorn trees'),
  },
  'land-congo': {
    size: '1024x1536',
    prompt: PLACE('the Congo rainforest in the Democratic Republic of the Congo: a wide brown river through dense green rainforest, a wooden boat, mist'),
  },
  'land-murchison': {
    size: '1024x1536',
    prompt: PLACE('Murchison Falls in Uganda: the river Nile forcing through a narrow rock gorge in a powerful waterfall, green hills, seen from a viewpoint'),
  },
};

await runArt(ART, 'npx tsx scripts/history-art.ts');
