// Knowzone website: navigation, scroll animations and the waitlist form. No libraries.

// The Knowzone API (the waitlist is saved there). Local copies of the site talk to a local API.
const API = /^(localhost|127\.0\.0\.1)$/.test(location.hostname) ? 'http://localhost:4000' : 'https://knowzone-api.onrender.com';

const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];

// ─── Navigation ───────────────────────────────────────────────────────────────

const nav = $('.nav');
const progress = $('.progress');
const onScroll = () => {
  nav?.classList.toggle('scrolled', scrollY > 10);
  if (progress) {
    const max = document.documentElement.scrollHeight - innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
  }
};
addEventListener('scroll', onScroll, { passive: true });
onScroll();

$('.menu-btn')?.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  $('.menu-btn').setAttribute('aria-expanded', String(open));
});
$$('.nav-links a').forEach((a) => a.addEventListener('click', () => nav.classList.remove('open')));

$$('[data-year]').forEach((el) => (el.textContent = new Date().getFullYear()));

// ─── Reveal on scroll ─────────────────────────────────────────────────────────

const revealer = new IntersectionObserver(
  (entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      e.target.classList.add('in');
      revealer.unobserve(e.target);
    }
  },
  { threshold: 0.15, rootMargin: '0px 0px -40px 0px' },
);
$$('.reveal, .timeline').forEach((el) => revealer.observe(el));
// Children of a [data-stagger] list come in one after another.
$$('[data-stagger]').forEach((list) => [...list.children].forEach((c, i) => c.style.setProperty('--i', i)));

// ─── The changing word in the headline ────────────────────────────────────────

$$('.swap').forEach((swap) => {
  const words = $$('span', swap);
  let i = 0;
  words[0].classList.add('on');
  if (reduceMotion || words.length < 2) return;
  setInterval(() => {
    const prev = words[i];
    i = (i + 1) % words.length;
    prev.classList.remove('on');
    prev.classList.add('off');
    setTimeout(() => prev.classList.remove('off'), 600);
    words[i].classList.add('on');
  }, 2300);
});

// ─── Numbers that count up ────────────────────────────────────────────────────

const counter = new IntersectionObserver(
  (entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      counter.unobserve(e.target);
      const el = e.target;
      const to = Number(el.dataset.count);
      const suffix = el.dataset.suffix ?? '';
      if (reduceMotion) {
        el.textContent = to.toLocaleString() + suffix;
        continue;
      }
      const start = performance.now();
      const tick = (now) => {
        const t = Math.min(1, (now - start) / 1600);
        const eased = 1 - Math.pow(1 - t, 3);
        el.textContent = Math.round(to * eased).toLocaleString() + suffix;
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }
  },
  { threshold: 0.6 },
);
$$('[data-count]').forEach((el) => counter.observe(el));

// ─── Pointer effects: card tilt and glow, button light, hero parallax ─────────

const finePointer = matchMedia('(pointer: fine)').matches;
if (finePointer && !reduceMotion) {
  $$('.card').forEach((card) => {
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      card.style.setProperty('--mx', `${x * 100}%`);
      card.style.setProperty('--my', `${y * 100}%`);
      card.style.transform = `perspective(800px) rotateX(${(0.5 - y) * 8}deg) rotateY(${(x - 0.5) * 10}deg) translateY(-4px)`;
    });
    card.addEventListener('pointerleave', () => (card.style.transform = ''));
  });

  $$('.btn-primary').forEach((btn) =>
    btn.addEventListener('pointermove', (e) => {
      const r = btn.getBoundingClientRect();
      btn.style.setProperty('--x', `${e.clientX - r.left}px`);
      btn.style.setProperty('--y', `${e.clientY - r.top}px`);
    }),
  );

  const visual = $('.hero-visual');
  if (visual) {
    const layers = $$('[data-depth]', visual);
    addEventListener('pointermove', (e) => {
      const x = e.clientX / innerWidth - 0.5;
      const y = e.clientY / innerHeight - 0.5;
      for (const l of layers) {
        const d = Number(l.dataset.depth);
        l.style.translate = `${x * d}px ${y * d}px`;
      }
    });
  }
}

// ─── Scroll story: the phone shows the screen for the step you're reading ─────

$$('.story').forEach((story) => {
  const steps = $$('.step', story);
  const shots = $$('.story-stage .phone img', story);
  const dots = $$('.story-dots i', story);
  const show = (i) => {
    steps.forEach((s, k) => s.classList.toggle('active', k === i));
    shots.forEach((s, k) => s.classList.toggle('on', k === i));
    dots.forEach((d, k) => d.classList.toggle('on', k === i));
  };
  show(0);
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) if (e.isIntersecting) show(steps.indexOf(e.target));
    },
    { rootMargin: '-45% 0px -45% 0px' },
  );
  steps.forEach((s) => io.observe(s));
});

// ─── Waitlist ─────────────────────────────────────────────────────────────────

const form = $('#waitlist-form');
if (form) {
  const card = form.closest('.form-card');
  const msg = $('.form-msg', form);
  const button = $('button[type=submit]', form);
  const label = button.innerHTML;
  const ref = new URLSearchParams(location.search).get('ref');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const body = {
      name: String(data.get('name') ?? '').trim(),
      email: String(data.get('email') ?? '').trim(),
      role: data.get('role'),
      country: String(data.get('country') ?? '') || undefined,
      interests: data.getAll('interests'),
      website: String(data.get('website') ?? '') || undefined,
      source: ref ? `ref:${ref}`.slice(0, 80) : document.referrer ? new URL(document.referrer).hostname.slice(0, 80) : undefined,
    };
    if (!body.name) return say('Please tell us your name.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) return say('Please enter a valid email address.');
    if (!body.role) return say('Please choose who you are.');

    button.disabled = true;
    button.innerHTML = '<span class="spinner" aria-hidden="true"></span> Joining…';
    say('');
    // The server sleeps when nobody has used it for a while; waking it up can take up to a minute.
    const slow = setTimeout(() => say('Waking up our server, this can take up to a minute…', true), 5000);
    try {
      const res = await fetch(`${API}/waitlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const out = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(out.error || 'Something went wrong. Please try again.');
      success(body.name.split(/\s+/)[0], out.position, out.already);
    } catch (err) {
      say(err instanceof TypeError ? 'We couldn’t reach Knowzone. Check your connection and try again.' : err.message);
    } finally {
      clearTimeout(slow);
      button.disabled = false;
      button.innerHTML = label;
    }
  });

  function say(text, wait = false) {
    msg.textContent = text;
    msg.classList.toggle('wait', wait);
  }

  function success(first, position, already) {
    $('.done h2', card).textContent = already ? `You’re already on the list, ${first}!` : `You’re in, ${first}!`;
    $('.done .place', card).textContent = position ? `#${position.toLocaleString()}` : '🎉';
    card.classList.add('success');
    card.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
    if (!reduceMotion) confetti();
  }

  const shareText = 'I just joined the waitlist for Knowzone, an AI study app for JAMB, WAEC, NECO and more. Join me:';
  const shareUrl = location.origin + location.pathname;
  $('#share-whatsapp')?.setAttribute('href', `https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`);
  $('#share-x')?.setAttribute('href', `https://x.com/intent/post?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`);
  $('#share-copy')?.addEventListener('click', async (e) => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      e.currentTarget.textContent = 'Link copied!';
    } catch {
      e.currentTarget.textContent = shareUrl;
    }
  });
}

/** A short burst of confetti in the app's colours. */
function confetti() {
  const canvas = document.createElement('canvas');
  canvas.id = 'confetti';
  document.body.append(canvas);
  const ctx = canvas.getContext('2d');
  const dpr = devicePixelRatio || 1;
  canvas.width = innerWidth * dpr;
  canvas.height = innerHeight * dpr;
  ctx.scale(dpr, dpr);
  const colors = ['#7c5cff', '#b04cff', '#14c8b4', '#ffb627', '#ff5a7a', '#4cc9ff'];
  const bits = Array.from({ length: 160 }, () => ({
    x: innerWidth / 2 + (Math.random() - 0.5) * 200,
    y: innerHeight / 2,
    vx: (Math.random() - 0.5) * 14,
    vy: Math.random() * -16 - 4,
    r: Math.random() * Math.PI,
    vr: (Math.random() - 0.5) * 0.3,
    w: 6 + Math.random() * 6,
    h: 8 + Math.random() * 8,
    c: colors[Math.floor(Math.random() * colors.length)],
  }));
  const start = performance.now();
  const frame = (now) => {
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    for (const b of bits) {
      b.vy += 0.45;
      b.vx *= 0.99;
      b.x += b.vx;
      b.y += b.vy;
      b.r += b.vr;
      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.rotate(b.r);
      ctx.fillStyle = b.c;
      ctx.fillRect(-b.w / 2, -b.h / 2, b.w, b.h);
      ctx.restore();
    }
    if (now - start < 3500) requestAnimationFrame(frame);
    else canvas.remove();
  };
  requestAnimationFrame(frame);
}
