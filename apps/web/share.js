// The page behind the links the app shares. The address says what to show:
//   /verify/<id>    a course certificate, checked against Knowzone's records
//   /v/<id>         a Knowzone video
//   /m/<key>        study notes someone chose to share (view-only)
//   /invite/<code>  an invite from a friend
// Everything comes from the Knowzone API (config.js). Text from the API is only ever set as text,
// never as HTML.

(() => {
  const API = (window.KNOWZONE?.apiUrl ?? 'https://knowzone-api.onrender.com').replace(/\/$/, '');
  const [kind, raw] = location.pathname.split('/').filter(Boolean);
  const key = decodeURIComponent(raw ?? '');

  const $ = (s) => document.querySelector(s);
  const body = $('#share-body');

  /** Builds an element: el('p', { class: 'x' }, 'text', child, …). Strings become text, never HTML. */
  function el(tag, attrs = {}, ...children) {
    const node = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (v == null || v === false) continue;
      if (k.startsWith('on')) node.addEventListener(k.slice(2), v);
      else node.setAttribute(k, v);
    }
    for (const c of children.flat()) if (c != null && c !== false) node.append(c instanceof Node ? c : String(c));
    return node;
  }

  function hero(eyebrow, title, intro = '') {
    $('#share-eyebrow').textContent = eyebrow;
    $('#share-title').textContent = title;
    $('#share-intro').textContent = intro;
    document.title = `${title} · Knowzone`;
  }

  function show(...nodes) {
    body.replaceChildren(...nodes.flat().filter(Boolean));
  }

  /** A friendly dead end: what happened, and somewhere useful to go. */
  function missing(eyebrow, title, text) {
    hero(eyebrow, title);
    show(
      el('div', { class: 'share-card share-center' },
        el('div', { class: 'share-status bad', 'aria-hidden': 'true' }, '!'),
        el('p', {}, text),
        el('div', { class: 'share-actions' },
          el('a', { class: 'btn btn-primary', href: '/' }, 'Discover Knowzone'),
          el('a', { class: 'btn btn-ghost', href: '/waitlist' }, 'Join the waitlist'),
        ),
      ),
    );
  }

  /** The API sends picture paths ("/materials/files/…"): they live on the API's server. */
  const media = (src) => (src && src.startsWith('/') ? API + src : src);

  async function api(path, init) {
    // The API sleeps when nobody has used it for a while; say so if waking it takes a moment.
    const slow = setTimeout(() => {
      const wait = $('.share-wait');
      if (wait) wait.textContent = 'Waking up Knowzone… this can take up to a minute.';
    }, 4000);
    try {
      const res = await fetch(API + path, { ...init, headers: { 'Content-Type': 'application/json', ...init?.headers } });
      return { status: res.status, data: await res.json().catch(() => ({})) };
    } finally {
      clearTimeout(slow);
    }
  }

  const date = (ms) => new Date(ms).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  const minutes = (s) => Math.max(1, Math.round(s / 60));

  // ─── Certificates ───────────────────────────────────────────────────────────

  async function certificate() {
    hero('Certificate check', 'Checking this certificate…');
    const { status, data } = await api(`/certificates/${encodeURIComponent(key)}`);
    if (status !== 200) return missing('Certificate check', 'Certificate not found', 'We couldn’t find a Knowzone certificate with this ID. Check the link or the ID printed on the certificate.');
    const c = data.certificate;
    hero('Certificate check', 'This certificate is real', `Issued by Knowzone AI to ${c.name}.`);
    show(
      el('div', { class: 'share-card share-cert' },
        el('div', { class: 'share-status ok', 'aria-hidden': 'true' }, '✓'),
        el('p', { class: 'share-label' }, 'VERIFIED CERTIFICATE'),
        el('h2', {}, c.course),
        el('dl', { class: 'share-facts' },
          el('div', {}, el('dt', {}, 'Awarded to'), el('dd', {}, c.name)),
          el('div', {}, el('dt', {}, 'Final score'), el('dd', {}, `${Math.round(c.score * 100)}%`)),
          el('div', {}, el('dt', {}, 'Date issued'), el('dd', {}, date(c.issuedAt))),
          el('div', {}, el('dt', {}, 'Certificate ID'), el('dd', {}, c.id)),
        ),
        el('p', { class: 'small' }, 'This page checks the certificate against Knowzone’s own records.'),
      ),
    );
  }

  // ─── Videos ─────────────────────────────────────────────────────────────────

  async function video() {
    hero('Knowzone video', 'Opening the video…');
    const { status, data } = await api(`/videos/${encodeURIComponent(key)}`);
    if (status !== 200)
      return missing('Knowzone video', 'Video not available', 'This video is private or no longer exists. Videos people make for themselves can only be watched in their own Knowzone app.');
    const v = data.video;
    const scenes = v.scenes ?? [];
    const picture = scenes.map((s) => s.image).find(Boolean);
    const at = Number(new URLSearchParams(location.search).get('t')) || 0;
    hero(`${v.subject} · Knowzone video`, v.title, v.description ?? '');
    show(
      el('div', { class: 'share-card share-video' },
        picture && el('img', { class: 'share-picture', src: media(picture), alt: '' }),
        el('div', { class: 'share-meta' },
          el('span', { class: 'chip' }, `${minutes(scenes.reduce((n, s) => n + (s.seconds ?? 0), 0))} min`),
          el('span', { class: 'chip' }, `${scenes.length} scenes`),
          v.creator && el('span', { class: 'chip' }, v.creator),
        ),
        scenes.length > 0 &&
          el('div', {},
            el('h2', {}, 'In this video'),
            el('ol', { class: 'share-scenes' }, scenes.map((s) => el('li', {}, s.heading))),
          ),
        el('div', { class: 'share-actions' },
          el('a', { class: 'btn btn-primary', href: `knowzone://videos/${encodeURIComponent(v.id)}${at ? `?t=${at}` : ''}` }, 'Watch in the Knowzone app'),
          el('a', { class: 'btn btn-ghost', href: '/waitlist?ref=video' }, 'Don’t have Knowzone yet?'),
        ),
      ),
    );
  }

  // ─── Shared notes ───────────────────────────────────────────────────────────

  /** One block of notes, as the app shows it. */
  function block(b) {
    switch (b.type) {
      case 'h':
        return el('h4', {}, b.text);
      case 'list':
        return el('ul', {}, (b.items ?? []).map((i) => el('li', {}, i)));
      case 'formula':
        return el('p', { class: 'note-formula' }, b.text);
      case 'tip':
        return el('p', { class: 'note-box tip' }, el('strong', {}, 'Tip: '), b.text);
      case 'warning':
        return el('p', { class: 'note-box warn' }, el('strong', {}, 'Watch out: '), b.text);
      case 'note':
        return el('div', { class: 'note-box' }, b.title && el('strong', {}, b.title), el('p', {}, b.text));
      case 'code':
        return el('pre', { class: 'note-code' }, el('code', {}, b.text));
      case 'image':
        return el('figure', {}, el('img', { src: media(b.src), alt: b.alt ?? '' }), b.caption && el('figcaption', {}, b.caption));
      default:
        return el('p', {}, b.text ?? '');
    }
  }

  function flashcard(c) {
    const card = el('button', { class: 'flashcard', type: 'button', 'aria-pressed': 'false' },
      el('span', { class: 'front' }, c.front),
      el('span', { class: 'back' }, c.back),
    );
    card.addEventListener('click', () => {
      const flipped = card.classList.toggle('flipped');
      card.setAttribute('aria-pressed', String(flipped));
    });
    return card;
  }

  async function notes() {
    hero('Shared study notes', 'Opening the notes…');
    const { status, data } = await api(`/shared/materials/${encodeURIComponent(key)}`);
    if (status !== 200)
      return missing('Shared study notes', 'These notes aren’t shared any more', 'The person who shared them may have stopped sharing, or the link is incomplete. Ask them to copy the link again.');
    const m = data.material;
    const c = m.content ?? {};
    hero(`${m.subject} · Shared study notes`, m.title, `Shared by ${m.sharedBy} from Knowzone. View-only.`);
    const section = (title, ...children) => el('section', { class: 'share-card notes-part' }, el('h2', {}, title), ...children);
    show(
      el('div', { class: 'share-notes' },
        c.summary &&
          section('Summary',
            el('p', { class: 'notes-tldr' }, c.summary.tldr),
            (c.summary.overview ?? []).length > 0 && el('ul', {}, c.summary.overview.map((o) => el('li', {}, o))),
          ),
        (c.keyPoints ?? []).length > 0 &&
          section('Key points', el('ul', { class: 'notes-points' }, c.keyPoints.map((k) => el('li', { class: k.importance === 'high' ? 'high' : '' }, k.text)))),
        (c.notes ?? []).length > 0 &&
          section('Notes', c.notes.map((n) => el('div', { class: 'notes-section' }, el('h3', {}, n.heading), (n.blocks ?? []).map(block)))),
        m.image && section('Diagram', el('img', { class: 'share-picture', src: media(m.image), alt: `Diagram: ${m.title}` })),
        (c.concepts ?? []).length > 0 &&
          section('Concepts',
            el('dl', { class: 'notes-concepts' },
              c.concepts.map((k) => el('div', {}, el('dt', {}, k.term), el('dd', {}, k.definition, k.example && el('em', {}, ` e.g. ${k.example}`)))),
            ),
          ),
        (c.flashcards ?? []).length > 0 &&
          section('Flashcards', el('p', { class: 'small' }, 'Tap a card to see the answer.'), el('div', { class: 'flashcards' }, c.flashcards.map(flashcard))),
        el('div', { class: 'share-card share-center' },
          el('p', {}, 'Make notes, flashcards and quizzes like these from your own material with Knowzone.'),
          el('a', { class: 'btn btn-primary', href: '/waitlist?ref=notes' }, 'Join the waitlist'),
        ),
      ),
    );
  }

  // ─── Invites ────────────────────────────────────────────────────────────────

  async function invite() {
    const code = key.trim().toUpperCase().slice(0, 20);
    hero('Invite', 'Opening your invite…');
    const { status, data } = await api('/referrals/validate', { method: 'POST', body: JSON.stringify({ code }) });
    if (status !== 200 || data.reason === 'not-found')
      return missing('Invite', 'This invite code isn’t valid', 'Check the link with the friend who sent it. You can still join the Knowzone waitlist.');
    const from = data.valid && data.inviterName ? data.inviterName : 'A friend';
    hero('You’re invited', `${from} invited you to Knowzone`, 'The AI study app for exams and beyond: an AI tutor, exam practice, courses, study rooms and learning games.');
    const copy = el('button', { class: 'btn btn-ghost btn-sm', type: 'button' }, 'Copy code');
    copy.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(code);
        copy.textContent = 'Copied';
      } catch {
        copy.textContent = code;
      }
    });
    show(
      el('div', { class: 'share-card share-center' },
        el('p', { class: 'share-label' }, 'YOUR INVITE CODE'),
        el('div', { class: 'invite-code' }, code),
        copy,
        el('p', {}, data.valid
          ? 'When you sign up for Knowzone, enter this code. Once you finish your first lesson or quiz, you both get bonus AI credits.'
          : 'This code has reached its limit for now, but you can still join Knowzone.'),
        el('div', { class: 'share-actions' },
          el('a', { class: 'btn btn-primary', href: `/waitlist?ref=${encodeURIComponent(code)}` }, 'Join the waitlist'),
          el('a', { class: 'btn btn-ghost', href: '/' }, 'See what Knowzone does'),
        ),
      ),
    );
  }

  const pages = { verify: certificate, v: video, m: notes, invite };
  const page = pages[kind];
  if (!page || !key) return missing('Knowzone', 'Link not found', 'This link isn’t complete. Check that you copied all of it.');
  page().catch(() =>
    missing('Knowzone', 'We couldn’t open this link', 'Knowzone didn’t answer. Check your connection and try again in a minute.'),
  );
})();
