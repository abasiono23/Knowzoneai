/**
 * Which study notes go with which exam topic. The exam syllabuses and the summaries name topics
 * differently ("Diffusion, osmosis and active transport" / "Movement in and out of cells"), so topics
 * are paired by the words they share: the exam topic's words against each summary's title and keywords.
 */
const STOP = new Set(
  'and the of in for to a an their its with from by on at or as is are how what why basic general simple other types type forms form theory structure systems system control nigeria nigerian introduction principles'.split(' '),
);
const stem = (w) =>
  w
    .replace(/ies$/, 'y')
    .replace(/sses$/, 'ss')
    .replace(/([^s])s$/, '$1')
    .replace(/(ation|ing)$/, '');
const words = (s) =>
  new Set(
    String(s)
      .toLowerCase()
      .replace(/[’']/g, '')
      .split(/[^a-z0-9]+/)
      .filter((w) => w.length > 2 && !STOP.has(w))
      .map(stem),
  );

/** Up to three summaries for an exam topic, best first. A summary must share at least half of the topic's words. */
export function notesFor(library, topicName) {
  const want = words(topicName);
  if (!want.size) return [];
  return library.topics
    .map((t) => {
      const title = words(t.title);
      const keys = words((t.keywords ?? []).join(' '));
      let score = 0;
      for (const w of want) score += title.has(w) ? 1 : keys.has(w) ? 0.75 : 0;
      return { t, score: score / want.size, upper: t.stage === 'upper' ? 1 : 0 };
    })
    .filter((x) => x.score >= 0.5)
    .sort((a, b) => b.score - a.score || b.upper - a.upper)
    .slice(0, 3)
    .map((x) => x.t);
}
