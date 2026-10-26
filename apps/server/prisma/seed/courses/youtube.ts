/**
 * Finds a YouTube video for a chapter with the YouTube Data API (search: 100 quota units; details: 1).
 * Only public, embeddable videos of 3–25 minutes are used; well-known education channels rank higher.
 * Videos are embedded and played by YouTube's own player, never downloaded.
 */
/** `checkedAt`: when it was last fetched from YouTube (the server rechecks within 30 days). */
export type FoundVideo = { youtubeId: string; title: string; channel: string; seconds: number; checkedAt?: number };

export class QuotaExceeded extends Error {}

const TRUSTED = /khan academy|crashcourse|crash course|amoeba sisters|the organic chemistry tutor|professor dave|bozeman|freecodecamp|ted-ed|fuseschool|cognito|mit opencourseware|socratica|corey schafer|marginal revolution|economics explained|kurzgesagt|veritasium|3blue1brown|math antics|primrose kitten|free science lessons|harvard|stanford/i;

const seconds = (iso: string) => {
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  return m ? Number(m[1] ?? 0) * 3600 + Number(m[2] ?? 0) * 60 + Number(m[3] ?? 0) : 0;
};

async function api(path: string, params: Record<string, string>, key: string) {
  const url = `https://www.googleapis.com/youtube/v3/${path}?${new URLSearchParams({ ...params, key })}`;
  const res = await fetch(url);
  const body = (await res.json()) as { error?: { errors?: { reason?: string }[]; message?: string } } & Record<string, unknown>;
  // YouTube reports a used-up daily quota as 403 (quotaExceeded) or 429 (search queries per day).
  const quota = body.error?.errors?.some((e) => /quota/i.test(e.reason ?? '')) || /quota/i.test(body.error?.message ?? '');
  if ((res.status === 403 || res.status === 429) && quota) throw new QuotaExceeded('YouTube quota used up for today');
  if (!res.ok) throw new Error(`YouTube ${res.status}: ${body.error?.message ?? 'error'}`);
  return body;
}

export async function findVideo(query: string, key: string): Promise<FoundVideo | null> {
  const search = (await api(
    'search',
    {
      part: 'snippet',
      q: query,
      type: 'video',
      videoEmbeddable: 'true',
      safeSearch: 'strict',
      relevanceLanguage: 'en',
      maxResults: '10',
    },
    key,
  )) as { items?: { id: { videoId: string } }[] };
  const ids = (search.items ?? []).map((i) => i.id.videoId).filter(Boolean);
  if (!ids.length) return null;
  const details = (await api('videos', { part: 'snippet,contentDetails,status,statistics', id: ids.join(',') }, key)) as {
    items?: {
      id: string;
      snippet: { title: string; channelTitle: string; defaultAudioLanguage?: string };
      contentDetails: { duration: string };
      status: { embeddable: boolean; privacyStatus: string; madeForKids?: boolean };
      statistics: { viewCount?: string };
    }[];
  };
  const ranked = (details.items ?? [])
    .map((v, rank) => ({ v, s: seconds(v.contentDetails.duration), rank }))
    .filter(({ v, s }) => v.status.embeddable && v.status.privacyStatus === 'public' && s >= 180 && s <= 1500)
    .map((x) => ({
      ...x,
      score:
        (TRUSTED.test(x.v.snippet.channelTitle) ? 3 : 0) +
        Math.log10(Number(x.v.statistics.viewCount ?? 0) + 10) -
        x.rank * 0.3,
    }))
    .sort((a, b) => b.score - a.score);
  const best = ranked[0];
  return best
    ? { youtubeId: best.v.id, title: best.v.snippet.title, channel: best.v.snippet.channelTitle, seconds: best.s }
    : null;
}
