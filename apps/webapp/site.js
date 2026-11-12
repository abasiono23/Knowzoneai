/* Knowzone on the web: the bar and footer on every public page, and the moving parts. */
(() => {
  document.documentElement.classList.add('js');
  const here = location.pathname.split('/').pop().replace('.html', '') || 'index';
  // The study pages are folders (/practice-questions/jamb/biology): their first part names the section.
  const section = location.pathname.split('/')[1];
  const quiet = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const LINKS = [
    ['features', 'Features'],
    ['practice-questions', 'Practice'],
    ['study-notes', 'Learn'],
    ['textbooks', 'Books'],
    ['pricing', 'Pricing'],
    ['about', 'About'],
    ['blog', 'Blog'],
    ['faq', 'FAQ'],
  ];

  document.getElementById('top').innerHTML = `
    <div class="top-in">
      <a class="logo" href="index.html"><img src="assets/logo.png" alt="" />Knowzone</a>
      <nav class="links" aria-label="Main">
        ${LINKS.map(([id, name]) => `<a href="${id}.html"${here === id || section === id || (here === 'post' && id === 'blog') ? ' aria-current="page"' : ''}>${name}</a>`).join('')}
      </nav>
      <div class="actions">
        <a class="btn ghost" href="signup.html?mode=login">Log in</a>
        <a class="btn light" href="signup.html">Sign up free</a>
      </div>
      <button class="menu-btn" type="button" aria-label="Menu" aria-expanded="false">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
      </button>
    </div>`;

  const foot = document.getElementById('foot');
  if (foot)
    foot.innerHTML = `
    <div class="wrap">
      <div class="foot">
        <div><a class="logo" href="index.html"><img src="assets/logo.png" alt="" />Knowzone</a><p>The AI study app for exams and beyond. Made for students everywhere, starting in Africa.</p><p class="foot-soon">Android app coming soon</p></div>
        <div><h4>Product</h4><a href="features.html">Features</a><a href="pricing.html">Pricing</a><a href="signup.html">Sign up</a></div>
        <div><h4>Study free</h4><a href="practice-questions.html">Practice questions</a><a href="study-notes.html">Study notes</a><a href="textbooks.html">Textbooks</a><a href="course-guides.html">Course guides</a></div>
        <div><h4>Company</h4><a href="about.html">About</a><a href="blog.html">Blog</a><a href="faq.html">FAQ</a></div>
        <div><h4>Legal</h4><a href="https://www.knowzoneai.com/privacy">Privacy</a><a href="https://www.knowzoneai.com/terms">Terms</a><a href="mailto:info@knowzoneai.com">info@knowzoneai.com</a></div>
      </div>
      <p class="copy">© ${new Date().getFullYear()} Knowzone AI. All rights reserved.</p>
    </div>`;

  const top = document.getElementById('top');
  // The sign-up page is half white, so its bar always keeps a background.
  const solid = () => top.classList.toggle('solid', here === 'signup' || scrollY > 24);
  addEventListener('scroll', solid, { passive: true });
  solid();
  const menu = top.querySelector('.menu-btn');
  menu.addEventListener('click', () => {
    const open = top.classList.toggle('open');
    menu.setAttribute('aria-expanded', String(open));
  });

  // Things rise into view as you reach them.
  const seen = new IntersectionObserver(
    (entries) => {
      for (const e of entries)
        if (e.isIntersecting) {
          e.target.classList.add('seen');
          seen.unobserve(e.target);
        }
    },
    { threshold: 0.12 },
  );
  document.querySelectorAll('.grid, .steps, .numbers, .plans').forEach((group) => {
    [...group.children].forEach((child, i) => {
      child.classList.add('reveal');
      child.style.setProperty('--delay', `${Math.min(i, 5) * 0.07}s`);
    });
  });
  document.querySelectorAll('.reveal').forEach((el) => seen.observe(el));

  // A soft light follows the pointer across cards.
  document.querySelectorAll('.card').forEach((card) => {
    card.addEventListener('pointermove', (e) => {
      const box = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${e.clientX - box.left}px`);
      card.style.setProperty('--my', `${e.clientY - box.top}px`);
    });
  });

  // Numbers count up the first time they're seen.
  const counted = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      counted.unobserve(e.target);
      const end = Number(e.target.dataset.count);
      const show = (n) => {
        e.target.textContent = Math.round(n).toLocaleString('en');
      };
      if (quiet) {
        show(end);
        continue;
      }
      const start = performance.now();
      const step = (now) => {
        const t = Math.min(1, (now - start) / 1500);
        show(end * (1 - (1 - t) ** 3));
        if (t < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }
  });
  document.querySelectorAll('[data-count]').forEach((el) => counted.observe(el));

  // The word that changes in the headline.
  const swap = document.querySelector('.swap');
  if (swap && !quiet) {
    const words = swap.dataset.words.split('|');
    let i = 0;
    setInterval(() => {
      swap.classList.add('out');
      setTimeout(() => {
        i = (i + 1) % words.length;
        swap.textContent = words[i];
        swap.classList.remove('out');
      }, 300);
    }, 2400);
  }

  // Stars drifting up behind the purple.
  const canvas = document.getElementById('stars');
  if (canvas && !quiet) {
    const ctx = canvas.getContext('2d');
    let width = 0;
    let height = 0;
    const size = () => {
      const scale = Math.min(devicePixelRatio || 1, 2);
      width = canvas.offsetWidth;
      height = canvas.offsetHeight;
      canvas.width = width * scale;
      canvas.height = height * scale;
      ctx.setTransform(scale, 0, 0, scale, 0, 0);
    };
    size();
    addEventListener('resize', size);
    const stars = Array.from({ length: 70 }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: 0.6 + Math.random() * 1.8,
      speed: 0.00012 + Math.random() * 0.00032,
      phase: Math.random() * 6.28,
    }));
    const draw = (now) => {
      ctx.clearRect(0, 0, width, height);
      for (const s of stars) {
        s.y -= s.speed;
        if (s.y < -0.02) s.y = 1.02;
        ctx.globalAlpha = 0.25 + 0.65 * Math.abs(Math.sin(now / 1400 + s.phase));
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(s.x * width, s.y * height, s.r, 0, 6.29);
        ctx.fill();
      }
      requestAnimationFrame(draw);
    };
    requestAnimationFrame(draw);
  }

  // App screens: the hero phones lean toward the pointer.
  const heroPhones = document.getElementById('hero-phones');
  if (heroPhones && !quiet && matchMedia('(pointer: fine)').matches) {
    const layers = [...heroPhones.querySelectorAll('[data-depth]')];
    let frame = 0;
    addEventListener('pointermove', (e) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const x = e.clientX / innerWidth - 0.5;
        const y = e.clientY / innerHeight - 0.5;
        for (const el of layers) {
          const depth = Number(el.dataset.depth);
          el.style.translate = `${x * depth}px ${y * depth}px`;
        }
      });
    });
  }

  // The phone changes to the screen for the part you're reading.
  const steps = [...document.querySelectorAll('.story-step')];
  const shots = [...document.querySelectorAll('#story-phone img')];
  if (steps.length && shots.length) {
    const reading = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const i = steps.indexOf(e.target);
          steps.forEach((s, k) => s.classList.toggle('on', k === i));
          shots.forEach((s, k) => s.classList.toggle('on', k === i));
        }
      },
      { rootMargin: '-45% 0px -45% 0px' },
    );
    steps.forEach((s) => reading.observe(s));
  }

  // The blog: posts written in the staff dashboard, as text, never as HTML.
  const API = window.KNOWZONE?.apiUrl;
  const el = (tag, className, ...children) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    node.append(...children);
    return node;
  };
  const longDate = (d) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  const posts = document.getElementById('posts');
  if (posts && API) {
    fetch(`${API}/blog`)
      .then((r) => (r.ok ? r.json() : { posts: [] }))
      .then((data) => {
        const cards = data.posts.map((p, i) => {
          const art = p.coverImage ? el('div', 'post-art') : el('div', `post-art c${(i % 6) + 1}`, '✍️');
          if (p.coverImage) {
            const img = document.createElement('img');
            img.src = `${API}${p.coverImage}`;
            img.alt = '';
            art.append(img);
          }
          const card = el('a', 'card post-card reveal seen', art, el('span', 'meta', longDate(p.publishedAt)), el('h3', '', p.title), el('p', '', p.excerpt));
          card.href = `post.html?slug=${encodeURIComponent(p.slug)}`;
          return card;
        });
        posts.prepend(...cards);
      })
      .catch(() => {
        /* The articles already on the page still show. */
      });
  }

  function inline(text) {
    const parts = [];
    let at = 0;
    for (const m of text.matchAll(/\*\*([^*]+)\*\*|\[([^\]]+)\]\((https:\/\/[^\s)]+)\)/g)) {
      parts.push(text.slice(at, m.index));
      if (m[1]) parts.push(el('strong', '', m[1]));
      else {
        const link = el('a', '', m[2]);
        link.href = m[3];
        link.rel = 'noopener noreferrer';
        parts.push(link);
      }
      at = m.index + m[0].length;
    }
    parts.push(text.slice(at));
    return parts;
  }
  const postBody = document.getElementById('post-body');
  if (postBody) {
    const slug = new URLSearchParams(location.search).get('slug');
    const missing = () => {
      document.getElementById('post-title').textContent = 'We can’t find that post';
      postBody.replaceChildren(el('p', '', 'It may have moved. '), Object.assign(el('a', '', '← All articles'), { href: 'blog.html' }));
    };
    if (!slug || !API) missing();
    else
      fetch(`${API}/blog/${encodeURIComponent(slug)}`)
        .then((r) => {
          if (!r.ok) throw new Error('missing');
          return r.json();
        })
        .then(({ post }) => {
          document.title = `${post.title}: Knowzone`;
          document.getElementById('post-title').textContent = post.title;
          document.getElementById('post-excerpt').textContent = post.excerpt;
          const blocks = post.body
            .split(/\n\s*\n/)
            .map((b) => b.trim())
            .filter(Boolean)
            .map((b) => {
              if (b.startsWith('## ')) return el('h2', '', b.slice(3));
              const lines = b.split('\n');
              if (lines.every((l) => l.trim().startsWith('- '))) return el('ul', '', ...lines.map((l) => el('li', '', ...inline(l.trim().slice(2)))));
              return el('p', 'post-para', ...inline(b));
            });
          const top = [];
          if (post.coverImage) {
            const img = document.createElement('img');
            img.src = `${API}${post.coverImage}`;
            img.alt = '';
            img.className = 'post-cover';
            top.push(img);
          }
          top.push(el('span', 'meta', `${longDate(post.publishedAt)} · ${post.author}`));
          postBody.replaceChildren(...top, ...blocks, Object.assign(el('a', 'back-link', '← All articles'), { href: 'blog.html' }));
        })
        .catch(missing);
  }

  // Pricing: naira or dollars, by month, school term or year. The same figures the app charges.
  const plans = document.querySelector('[data-pricing]');
  if (plans) {
    const PRICES = {
      NGN: { PLUS: { month: 3500, term: 9000, year: 30000 }, PRO: { month: 7500, term: 19500, year: 66000 } },
      USD: { PLUS: { month: 4.99, term: 12.99, year: 44.99 }, PRO: { month: 9.99, term: 26.99, year: 89.99 } },
    };
    const PER = { month: '/ month', term: '/ term', year: '/ year' };
    const state = { currency: 'NGN', period: 'month' };
    try {
      if (Intl.DateTimeFormat().resolvedOptions().timeZone !== 'Africa/Lagos') state.currency = 'USD';
    } catch {
      /* Naira stays the choice. */
    }
    const draw = () => {
      document.querySelectorAll('[data-plan]').forEach((el) => {
        const value = PRICES[state.currency][el.dataset.plan][state.period];
        const text = state.currency === 'NGN' ? `₦${value.toLocaleString('en')}` : `$${value}`;
        el.innerHTML = `${text} <small>${PER[state.period]}</small>`;
      });
      document.querySelectorAll('[data-set]').forEach((b) => {
        const [key, value] = b.dataset.set.split(':');
        b.setAttribute('aria-pressed', String(state[key] === value));
      });
    };
    plans.addEventListener('click', (e) => {
      const b = e.target.closest('[data-set]');
      if (!b) return;
      const [key, value] = b.dataset.set.split(':');
      state[key] = value;
      draw();
    });
    draw();
  }

  // Sign up and log in share a page.
  const form = document.getElementById('auth-form');
  if (form) {
    const login = new URLSearchParams(location.search).get('mode') === 'login';
    if (login) {
      form.querySelectorAll('[data-signup]').forEach((el) => el.remove());
      form.querySelector('h2').textContent = 'Welcome back';
      form.querySelector('.sub').textContent = 'Log in to carry on learning.';
      form.querySelector('button[type=submit]').textContent = 'Log in';
      form.querySelector('.swap-auth').innerHTML = 'New to Knowzone? <a href="signup.html">Sign up free</a>';
    }
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      // Design preview: nothing is sent or saved yet.
      location.href = 'dashboard.html';
    });
  }
})();
