/**
 * Finds more candidates for topics the first pass left short of videos, with a search written for each
 * (100 quota units each). Writes gaps.json to review, and adds the details to videos.json.
 *
 *   npx tsx scripts/videos-gapfill.ts <videos folder>
 */
import 'dotenv/config';

import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const dir = process.argv[2];
if (!dir) throw new Error('Usage: videos-gapfill <videos folder>');
const key = process.env.YOUTUBE_API_KEY;
if (!key) throw new Error('YOUTUBE_API_KEY is not set');

const QUERIES: Record<string, string> = {
  'agricultural-science/tree-crops-vegetables':
    'cocoa oil palm tree crops vegetable production agricultural science lesson',
  'agricultural-science/sustainable-farming':
    'sustainable agriculture explained crop rotation soil conservation lesson',
  'business-studies/business-sectors': 'primary secondary tertiary sectors chain of production business lesson',
  'business-studies/aids-to-trade': 'aids to trade commerce banking insurance transport warehousing lesson',
  'business-studies/insurance-and-risk': 'principles of insurance commerce business studies lesson',
  'business-studies/starting-a-small-business': 'how to start a small business for students entrepreneurship lesson',
  'business-studies/business-location': 'factors affecting business location lesson',
  'computer-studies/what-is-a-computer': 'what is a computer computer basics for beginners lesson',
  'computer-studies/word-processing': 'word processing basics microsoft word tutorial for students',
  'computer-studies/spreadsheet-basics': 'spreadsheet basics rows columns cells beginners excel lesson',
  'computer-studies/spreadsheet-functions': 'excel functions SUM AVERAGE IF for beginners students',
  'computer-studies/internet-and-online-safety': 'internet safety for students staying safe online lesson',
  'economics/goods-services-and-the-economy': 'goods and services for kids economics lesson',
  'economics/population': 'population growth age structure dependency economics geography lesson',
  'english/summary-writing': 'how to write a summary English lesson students',
  'english/parts-of-speech': 'eight parts of speech English grammar lesson',
  'english/subject-verb-agreement': 'subject verb agreement rules English grammar lesson',
  'geography/contours-relief-gradient': 'contour lines map reading geography lesson',
  'geography/earth-movements-latitude-longitude-time':
    'latitude longitude earth rotation revolution seasons time zones lesson',
  'geography/world-climate-zones': 'world climate zones Koppen geography lesson',
  'geography/fieldwork-data-and-gis': 'geography fieldwork enquiry GIS explained lesson',
  'geography/weather-elements-instruments': 'weather instruments rain gauge thermometer barometer lesson',
  'geography/settlement-types-site-function': 'settlement site situation function hierarchy geography lesson',
  'geography/weathering-and-mass-movement': 'weathering and mass movement geography lesson',
  'geography/rivers-drainage-basin-processes':
    'drainage basin river processes erosion transportation deposition geography',
  'geography/river-landforms': 'river landforms waterfall meander oxbow lake floodplain geography lesson',
  'geography/coastal-processes-and-landforms': 'coastal processes landforms waves cliffs spits geography lesson',
  'geography/factors-affecting-climate': 'factors affecting climate latitude altitude ocean currents lesson',
  'geography/measuring-development': 'measuring development HDI GNI indicators geography lesson',
  'physics/gas-laws': 'gas laws Boyle Charles pressure law physics lesson high school',
  'physics/measuring-length-mass-time': 'measuring length mass time instruments physics lesson',
};

type Raw = {
  id: string;
  title: string;
  channel: string;
  description: string;
  seconds: number;
  views: number;
  language?: string;
  subjects: string[];
};

const api = async <T>(path: string, params: Record<string, string>) => {
  const res = await fetch(`https://www.googleapis.com/youtube/v3/${path}?${new URLSearchParams({ ...params, key })}`);
  if (!res.ok) throw new Error(`YouTube ${path} ${res.status}`);
  return (await res.json()) as T;
};
const isoSeconds = (iso: string) => {
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  return m ? Number(m[1] ?? 0) * 3600 + Number(m[2] ?? 0) * 60 + Number(m[3] ?? 0) : 0;
};

const file = join(dir, 'videos.json');
const known = new Map((JSON.parse(readFileSync(file, 'utf8')) as Raw[]).map((v) => [v.id, v]));
const found: Record<string, string[]> = {};

for (const [topic, q] of Object.entries(QUERIES)) {
  const r = await api<{ items?: { id: { videoId: string } }[] }>('search', {
    part: 'id',
    q,
    type: 'video',
    videoEmbeddable: 'true',
    safeSearch: 'strict',
    relevanceLanguage: 'en',
    maxResults: '15',
  });
  found[topic] = r.items?.map((x) => x.id.videoId) ?? [];
}

const todo = [...new Set(Object.values(found).flat())].filter((id) => !known.has(id));
for (let i = 0; i < todo.length; i += 50) {
  const r = await api<{
    items?: {
      id: string;
      snippet: {
        title: string;
        channelTitle: string;
        description: string;
        defaultAudioLanguage?: string;
        defaultLanguage?: string;
      };
      contentDetails: { duration: string };
      statistics: { viewCount?: string };
      status: { embeddable: boolean; privacyStatus: string };
    }[];
  }>('videos', {
    part: 'snippet,contentDetails,statistics,status',
    id: todo.slice(i, i + 50).join(','),
    maxResults: '50',
  });
  for (const v of r.items ?? []) {
    const seconds = isoSeconds(v.contentDetails.duration);
    const language = v.snippet.defaultAudioLanguage ?? v.snippet.defaultLanguage;
    if (!v.status.embeddable || v.status.privacyStatus !== 'public' || seconds < 90 || seconds > 45 * 60) continue;
    if (language && !language.toLowerCase().startsWith('en')) continue;
    known.set(v.id, {
      id: v.id,
      title: v.snippet.title,
      channel: v.snippet.channelTitle,
      description: v.snippet.description.slice(0, 220).replace(/\s+/g, ' '),
      seconds,
      views: Number(v.statistics.viewCount ?? 0),
      language,
      subjects: [],
    });
  }
}
writeFileSync(file, JSON.stringify([...known.values()]));

const gaps = Object.entries(found).map(([topic, ids]) => ({
  topic,
  candidates: ids.flatMap((id) => {
    const v = known.get(id);
    return v
      ? [
          {
            id,
            title: v.title,
            channel: v.channel,
            minutes: Math.round(v.seconds / 60),
            views: v.views,
            description: v.description,
          },
        ]
      : [];
  }),
}));
writeFileSync(join(dir, 'gaps.json'), JSON.stringify(gaps, null, 1));
for (const g of gaps) console.log(`${g.topic}: ${g.candidates.length}`);
