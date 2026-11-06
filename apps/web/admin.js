/*
 * Knowzone staff dashboard. Signs in with Supabase and talks to the API's /admin routes, which decide who
 * gets in. Names, messages and reports are written by the public, so they only ever reach the page through
 * h(), which sets them as text: never build HTML from a string here.
 */
(() => {
  const { supabaseUrl, supabaseKey, apiUrl } = window.KNOWZONE;
  const SESSION = 'knowzone.staff';
  const app = document.getElementById('app');

  /* ---------- Small helpers ---------- */

  function h(tag, props, ...children) {
    const el = document.createElement(tag);
    for (const [key, value] of Object.entries(props ?? {})) {
      if (value === undefined || value === null || value === false) continue;
      if (key.startsWith('on')) el.addEventListener(key.slice(2).toLowerCase(), value);
      else if (key === 'class') el.className = value;
      else if (key === 'value' || key === 'checked' || key === 'disabled' || key === 'selected') el[key] = value;
      else el.setAttribute(key, value);
    }
    for (const child of children.flat(Infinity)) {
      if (child === undefined || child === null || child === false) continue;
      el.append(child instanceof Node ? child : document.createTextNode(String(child)));
    }
    return el;
  }

  const fill = (el, ...children) => {
    el.replaceChildren();
    for (const c of children.flat(Infinity)) if (c) el.append(c);
    return el;
  };

  const number = (n) => Number(n ?? 0).toLocaleString('en');
  const money = (amount, currency) => {
    try {
      return new Intl.NumberFormat('en', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount);
    } catch {
      return `${number(amount)} ${currency}`;
    }
  };
  const date = (d) => (d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—');
  const time = (d) =>
    d
      ? new Date(d).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
      : '—';

  const STATUS_LOOK = {
    open: 'warn',
    pending: 'warn',
    waiting: '',
    resolved: 'good',
    paid: 'good',
    active: 'good',
    actioned: 'good',
    reviewed: 'good',
    dismissed: '',
    rejected: 'bad',
    failed: 'bad',
    refunded: 'bad',
    suspended: 'bad',
    restricted: 'warn',
    hidden: 'bad',
    gone: 'bad',
    superadmin: 'good',
    admin: '',
    'set up': 'good',
    'not set up': 'warn',
    free: 'good',
    paid: '',
  };
  const tag = (text) => h('span', { class: `tag ${STATUS_LOOK[text] ?? ''}` }, text);

  const table = (columns, rows) =>
    h(
      'div',
      { class: 'table' },
      h(
        'table',
        null,
        h('thead', null, h('tr', null, columns.map((c) => h('th', { scope: 'col' }, c)))),
        h(
          'tbody',
          null,
          rows.map((cells) => h('tr', null, cells.map((cell, i) => h('td', { 'data-label': columns[i] }, cell)))),
        ),
      ),
    );

  const select = (label, value, options, onChange) =>
    h(
      'select',
      { 'aria-label': label, onChange: (e) => onChange(e.target.value) },
      options.map(([v, text]) => h('option', { value: v, selected: v === value }, text)),
    );

  const STATUS_ALL = (...list) => [...list.map((s) => [s, s[0].toUpperCase() + s.slice(1)]), ['all', 'All']];

  /** Disables the button while a change is saved, and shows what went wrong if it fails. */
  function action(button, note, work) {
    return async () => {
      button.disabled = true;
      note.textContent = '';
      note.className = '';
      try {
        await work();
      } catch (e) {
        note.textContent = e.message;
        note.className = 'error';
      } finally {
        button.disabled = false;
      }
    };
  }

  function button(text, { kind, note, work }) {
    const b = h('button', { type: 'button', class: kind });
    b.textContent = text;
    b.addEventListener('click', action(b, note, work));
    return b;
  }

  /* ---------- Signing in ---------- */

  let session = null;
  try {
    session = JSON.parse(sessionStorage.getItem(SESSION));
  } catch {
    session = null;
  }
  const keep = (s) => {
    session = s;
    try {
      if (s) sessionStorage.setItem(SESSION, JSON.stringify(s));
      else sessionStorage.removeItem(SESSION);
    } catch {
      /* The sign-in then only lasts until the page is reloaded. */
    }
  };

  async function auth(path, body) {
    const res = await fetch(`${supabaseUrl}/auth/v1/${path}`, {
      method: 'POST',
      headers: { apikey: supabaseKey, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.msg || data.error_description || 'Couldn’t sign in. Check your email and password.');
    return { access: data.access_token, refresh: data.refresh_token };
  }

  let refreshing = null;
  function refresh() {
    refreshing ??= auth('token?grant_type=refresh_token', { refresh_token: session.refresh })
      .then(keep)
      .finally(() => {
        refreshing = null;
      });
    return refreshing;
  }

  async function api(path, options = {}) {
    const send = () =>
      fetch(`${apiUrl}${path}`, {
        ...options,
        headers: {
          Authorization: `Bearer ${session?.access}`,
          ...(options.body && { 'Content-Type': 'application/json' }),
        },
      });
    let res = await send();
    if (res.status === 401 && session?.refresh) {
      const renewed = await refresh().then(
        () => true,
        () => false,
      );
      if (renewed) res = await send();
    }
    if (res.status === 401) {
      keep(null);
      showSignIn('Your session ended. Please sign in again.');
      throw new Error('Please sign in again.');
    }
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      const error = new Error(data.error || `Something went wrong (${res.status}).`);
      error.status = res.status;
      throw error;
    }
    return path.endsWith('.csv') ? res.text() : res.json();
  }
  const post = (path, body) => api(path, { method: 'POST', body: JSON.stringify(body ?? {}) });

  function showSignIn(message) {
    const note = h('p', { class: message ? 'error' : '', role: 'alert' }, message);
    const email = h('input', { type: 'email', autocomplete: 'username', required: true });
    const password = h('input', { type: 'password', autocomplete: 'current-password', required: true });
    const submit = h('button', { class: 'primary', type: 'submit' }, 'Sign in');
    const form = h(
      'form',
      {
        onSubmit: async (e) => {
          e.preventDefault();
          submit.disabled = true;
          note.textContent = '';
          note.className = '';
          try {
            keep(await auth('token?grant_type=password', { email: email.value.trim(), password: password.value }));
            await start();
          } catch (err) {
            note.textContent = err.message;
            note.className = 'error';
            submit.disabled = false;
          }
        },
      },
      h('img', { src: '/assets/logo.png', alt: '' }),
      h('h1', null, 'Knowzone staff'),
      h('p', { class: 'muted' }, 'For the Knowzone team only.'),
      note,
      h('label', null, 'Email', email),
      h('label', null, 'Password', password),
      submit,
      h(
        'button',
        {
          type: 'button',
          onClick: () => {
            const back = encodeURIComponent(`${location.origin}/admin`);
            location.href = `${supabaseUrl}/auth/v1/authorize?provider=google&redirect_to=${back}`;
          },
        },
        'Sign in with Google',
      ),
    );
    fill(app, h('main', { class: 'signin' }, form));
  }

  /** Google sends the person back with their session after the # in the address. */
  function sessionFromAddress() {
    if (!location.hash.includes('access_token=')) return;
    const found = new URLSearchParams(location.hash.slice(1));
    keep({ access: found.get('access_token'), refresh: found.get('refresh_token') });
    history.replaceState(null, '', location.pathname);
  }

  /* ---------- The frame around each page ---------- */

  const PAGES = [
    ['overview', 'Overview'],
    ['users', 'People'],
    ['support', 'Support'],
    ['reports', 'Reports'],
    ['billing', 'Billing'],
    ['waitlist', 'Waitlist'],
    ['library', 'Library'],
    ['settings', 'Settings'],
  ];
  /** Only superadmins see Settings; the server enforces it too. */
  const myPages = () => PAGES.filter(([id]) => id !== 'settings' || me?.role === 'superadmin');
  const ICONS = {
    overview: 'M4 4h7v7H4zM13 4h7v4h-7zM13 11h7v9h-7zM4 14h7v6H4z',
    users: 'M16 20v-1a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v1M9.500 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM21 20v-1a4 4 0 0 0-3-3.900M15.500 3.200a4 4 0 0 1 0 7.600',
    people: 'M16 20v-1a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v1M9.500 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM21 20v-1a4 4 0 0 0-3-3.900M15.500 3.200a4 4 0 0 1 0 7.600',
    support: 'M21 12a8 8 0 0 1-11.800 7L4 20.500 5.500 15.500A8 8 0 1 1 21 12z',
    reports: 'M5 21V4M5 4h12l-2 4.500L17 13H5',
    flag: 'M5 21V4M5 4h12l-2 4.500L17 13H5',
    billing: 'M3 6h18v12H3zM3 10h18M7 15h4',
    waitlist: 'M8 6h12M8 12h12M8 18h12M4 6h.010M4 12h.010M4 18h.010',
    library: 'M4 5a2 2 0 0 1 2-2h13v15H6a2 2 0 0 0-2 2V5zM4 20a2 2 0 0 0 2 2h13v-4',
    settings: 'M4 7h10M18 7h2M4 17h2M10 17h10M16 4.500v5M8 14.500v5',
    spark: 'M12 3l1.900 5.600L19.500 10.500l-5.600 1.900L12 18l-1.900-5.600L4.500 10.500l5.600-1.900z',
    pulse: 'M3 12h4l3-7 4 14 3-7h4',
    play: 'M6 4l14 8-14 8z',
  };
  function iconSvg(name) {
    const NS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(NS, 'svg');
    for (const [k, v] of Object.entries({ viewBox: '0 0 24 24', width: 20, height: 20, fill: 'none', stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'aria-hidden': 'true' })) svg.setAttribute(k, v);
    const path = document.createElementNS(NS, 'path');
    path.setAttribute('d', ICONS[name]);
    svg.append(path);
    return svg;
  }
  let me = null;
  let main = null;
  let nav = null;
  let current = 'overview';
  let counts = {};
  /** Ignores a page that finishes loading after someone has moved on to another. */
  let visit = 0;

  function renderNav() {
    fill(
      nav,
      myPages().map(([id, name]) => {
        const waiting = counts[id];
        return h(
          'button',
          { type: 'button', class: id === current ? 'on' : '', 'aria-current': id === current ? 'page' : undefined, onClick: () => go(id) },
          iconSvg(id),
          h('span', null, name),
          waiting ? h('span', { class: 'count', 'aria-label': `${waiting} waiting` }, waiting) : null,
        );
      }),
    );
  }

  async function show(load) {
    const mine = ++visit;
    fill(main, h('p', { class: 'muted', role: 'status' }, 'Loading… the server can take up to a minute to wake.'));
    window.scrollTo(0, 0);
    try {
      const content = await load();
      if (mine === visit) fill(main, content);
    } catch (e) {
      if (mine === visit) fill(main, h('p', { class: 'error', role: 'alert' }, e.message), h('button', { type: 'button', onClick: () => show(load) }, 'Try again'));
    }
  }

  function go(id) {
    current = id;
    renderNav();
    show(PAGE_LOADERS[id]);
    // The overview counts them itself; elsewhere, the numbers catch up with what was just answered.
    if (id !== 'overview') api('/admin/overview').then(setCounts).catch(() => {});
  }

  function setCounts({ queues: q }) {
    counts = { support: q.support, reports: q.videoReports + q.comments + q.copyright, billing: q.billing };
    renderNav();
  }

  /* ---------- Overview ---------- */

  const stat = (value, label, icon, tone, open) =>
    h(
      open ? 'button' : 'div',
      { type: open ? 'button' : undefined, class: 'stat', onClick: open },
      h('div', { class: `chip ${tone ?? ''}` }, iconSvg(icon)),
      h('div', null, h('b', null, value), h('span', null, label)),
    );

  /** New accounts per day for two weeks. Days without any are counted too, so the gaps show. */
  function signupsChart(signups) {
    const counts_ = new Map(signups.map((d) => [d.day, d.count]));
    const days = Array.from({ length: 14 }, (_, i) => {
      const day = new Date(Date.now() - (13 - i) * 86_400_000).toISOString().slice(0, 10);
      return { day, count: counts_.get(day) ?? 0 };
    });
    const label = (day) => new Date(`${day}T12:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    const most = Math.max(1, ...days.map((d) => d.count));
    const total = days.reduce((n, d) => n + d.count, 0);
    return h(
      'section',
      { class: 'card' },
      h('h3', null, 'New accounts, last 14 days'),
      h('div', { class: 'headline' }, number(total)),
      h(
        'div',
        { class: 'bars', role: 'img', 'aria-label': `New accounts per day for 14 days: ${number(total)} in all, at most ${number(most)} in a day.` },
        days.map((d) => {
          const fill = h('div', { class: 'bar-fill' });
          fill.style.height = `${d.count ? Math.max(4, (d.count / most) * 100) : 1}%`;
          return h('div', { class: 'bar-slot', tabindex: 0 }, h('div', { class: 'bar-tip' }, `${label(d.day)}: ${number(d.count)}`), fill);
        }),
      ),
      h('div', { class: 'axis' }, h('span', null, label(days[0].day)), h('span', null, `Most in a day: ${number(most)}`), h('span', null, label(days[13].day))),
      h(
        'details',
        null,
        h('summary', null, 'See the numbers'),
        table(['Day', 'New accounts'], days.map((d) => [label(d.day), number(d.count)])),
      ),
    );
  }

  async function overviewPage() {
    const d = await api('/admin/overview');
    const q = d.queues;
    setCounts(d);
    const plans = [...d.plans].sort((a, b) => b.count - a.count);
    const waiting = q.support + q.billing + q.videoReports + q.comments + q.copyright;
    const hour = new Date().getHours();
    const hello = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
    const first = (me.name ?? '').split(/\s+/)[0];
    const shortcut = (n, text, page) => n > 0 && h('button', { type: 'button', onClick: () => go(page) }, h('b', null, number(n)), text);
    return [
      h(
        'section',
        { class: 'hero' },
        h(
          'div',
          null,
          h('h1', { class: 'wrap' }, `${hello}${first ? `, ${first}` : ''}`),
          h('p', null, waiting ? `${number(waiting)} ${waiting === 1 ? 'thing needs' : 'things need'} you today.` : 'Nothing is waiting for you. All clear.'),
        ),
        waiting > 0 &&
          h(
            'div',
            { class: 'hero-actions' },
            shortcut(q.support, 'support', 'support'),
            shortcut(q.billing, 'billing', 'billing'),
            shortcut(q.videoReports + q.comments + q.copyright, 'reports', 'reports'),
          ),
      ),
      h(
        'div',
        { class: 'stats' },
        stat(number(d.users.total), 'Accounts', 'people'),
        stat(number(d.users.newThisWeek), 'New in 7 days', 'spark', 'teal'),
        stat(number(d.users.activeThisWeek), 'Active in 7 days', 'pulse', 'sky'),
        stat(number(d.waitlist.total), `On the waitlist (${number(d.waitlist.newThisWeek)} this week)`, 'waitlist', 'gold'),
        stat(number(d.users.restricted), 'Restricted or suspended', 'flag', 'coral'),
      ),
      h(
        'div',
        { class: 'columns' },
        signupsChart(d.signups),
        h(
          'section',
          { class: 'card' },
          h('h3', null, 'Plans and money'),
          plans.map((p) => h('div', { class: 'plan-row' }, h('span', null, `${p.plan} plan`), h('b', null, number(p.count)))),
          h('div', { class: 'plan-row' }, h('span', null, 'Active subscriptions'), h('b', null, number(d.money.activeSubscriptions))),
          d.money.last30Days.length
            ? d.money.last30Days.map((m) =>
                h('div', { class: 'plan-row' }, h('span', null, `Paid in 30 days (${number(m.payments)} ${m.payments === 1 ? 'payment' : 'payments'})`), h('b', null, money(m.amount, m.currency))),
              )
            : h('div', { class: 'plan-row' }, h('span', null, 'Paid in 30 days'), h('b', null, '0')),
        ),
      ),
      h('h2', { class: 'section-title' }, 'AI use in 30 days'),
      h(
        'div',
        { class: 'stats' },
        stat(number(d.ai.requests), 'AI requests', 'spark'),
        stat(number(d.ai.inputTokens), 'Tokens read', 'library', 'sky'),
        stat(number(d.ai.outputTokens), 'Tokens written', 'support', 'teal'),
      ),
      h('h2', { class: 'section-title' }, 'In the library'),
      h(
        'div',
        { class: 'stats' },
        stat(number(d.content.subjectVideos), 'Subject videos', 'play', 'coral', () => go('library')),
        stat(number(d.content.summaries), 'Summaries', 'waitlist', 'teal', () => go('library')),
        stat(number(d.content.books), 'Books', 'library', 'sky', () => go('library')),
        stat(number(d.content.futureSkills), 'Future skills', 'spark', 'gold'),
      ),
    ];
  }

  /* ---------- A list that pages and refreshes itself ---------- */

  function pager(page, data, onPage) {
    const pages = Math.max(1, Math.ceil(data.total / data.pageSize));
    return h(
      'div',
      { class: 'row between' },
      h('span', { class: 'muted' }, `${number(data.total)} in all`),
      pages > 1 &&
        h(
          'div',
          { class: 'row' },
          h('button', { type: 'button', disabled: page <= 1, onClick: () => onPage(page - 1) }, 'Newer'),
          h('span', { class: 'muted' }, `Page ${page} of ${pages}`),
          h('button', { type: 'button', disabled: page >= pages, onClick: () => onPage(page + 1) }, 'Older'),
        ),
    );
  }

  const empty = (text) => h('div', { class: 'card muted' }, text);

  /* ---------- People ---------- */

  const usersState = { q: '', page: 1 };

  async function usersPage() {
    const params = new URLSearchParams({ page: usersState.page, ...(usersState.q && { q: usersState.q }) });
    const data = await api(`/admin/users?${params}`);
    const search = h('input', { type: 'search', value: usersState.q, placeholder: 'Email, name, username or account id', 'aria-label': 'Find a person' });
    return [
      h('h1', null, 'People'),
      h(
        'form',
        {
          class: 'bar',
          onSubmit: (e) => {
            e.preventDefault();
            usersState.q = search.value.trim();
            usersState.page = 1;
            show(usersPage);
          },
        },
        search,
        h('button', { class: 'primary', type: 'submit' }, 'Find'),
      ),
      data.items.length
        ? table(
            ['Person', 'Plan', 'Last active', 'Joined', 'Standing'],
            data.items.map((u) => [
              [h('button', { type: 'button', class: 'link', onClick: () => show(() => userPage(u.id)) }, u.name), h('div', { class: 'muted' }, u.email)],
              u.plan,
              date(u.lastActiveDate),
              date(u.createdAt),
              u.restriction ? tag(u.restriction.kind) : tag('active'),
            ]),
          )
        : empty('Nobody matches that.'),
      pager(usersState.page, data, (p) => {
        usersState.page = p;
        show(usersPage);
      }),
    ];
  }

  const details = (pairs) =>
    h(
      'dl',
      { class: 'details' },
      pairs.filter(Boolean).map(([k, v]) => [h('dt', null, k), h('dd', null, v)]),
    );

  async function userPage(id) {
    const u = await api(`/admin/users/${encodeURIComponent(id)}`);
    const r = u.restriction;
    const note = h('p', { role: 'alert' });
    const reload = () => show(() => userPage(id));

    let standing;
    if (r) {
      standing = h(
        'section',
        { class: 'card' },
        h('h2', null, r.kind === 'suspended' ? 'Suspended' : 'Restricted'),
        details([
          ['Reason', r.reason],
          ['Since', time(r.at)],
          ['Until', r.until ? time(r.until) : 'Until reviewed'],
          r.limits && ['Limits', r.limits.join(', ')],
          r.appeal && ['Appeal', r.appeal.status],
        ]),
        note,
        h(
          'div',
          null,
          button('Lift it', {
            kind: 'primary',
            note,
            work: async () => {
              await api(`/admin/users/${encodeURIComponent(id)}/restriction`, { method: 'DELETE' });
              reload();
            },
          }),
        ),
      );
    } else {
      const reason = h('textarea', { required: true, minlength: 3, maxlength: 500 });
      const days = h('input', { type: 'number', min: 1, max: 3650, inputmode: 'numeric' });
      const send = (kind) => async () => {
        if (reason.value.trim().length < 3) throw new Error('Write the reason the learner will see.');
        const n = days.value ? Number(days.value) : undefined;
        const length = n ? `for ${n} days` : 'until reviewed';
        if (!window.confirm(`${kind === 'suspended' ? 'Suspend' : 'Restrict'} ${u.email} ${length}?`)) return;
        await post(`/admin/users/${encodeURIComponent(id)}/restriction`, { kind, reason: reason.value.trim(), ...(n && { days: n }) });
        reload();
      };
      standing = h(
        'section',
        { class: 'card' },
        h('h2', null, 'Restrict or suspend'),
        h('p', { class: 'muted' }, 'Restricted: no leaderboards, battles, invites or sharing. Suspended: they can only see their status, get help, manage their data and appeal.'),
        h('label', null, 'Reason (the learner sees this)', reason),
        h('label', null, 'Days (leave empty for until reviewed)', days),
        note,
        h(
          'div',
          { class: 'row' },
          button('Restrict', { note, work: send('restricted') }),
          button('Suspend', { kind: 'danger', note, work: send('suspended') }),
        ),
      );
    }

    return [
      h('div', null, h('button', { type: 'button', class: 'link', onClick: () => show(usersPage) }, '← People')),
      h('div', { class: 'row' }, h('h1', { class: 'wrap' }, u.name), r ? tag(r.kind) : tag('active'), u.deleteAt && tag('deleting')),
      h(
        'section',
        { class: 'card' },
        details([
          ['Email', u.email],
          ['Account id', u.id],
          ['Username', u.username ?? '—'],
          ['School', [u.school, u.grade].filter(Boolean).join(' · ') || '—'],
          ['Signs in with', u.providers.join(', ') || u.authProvider],
          ['Plan', u.subscription ? `${u.plan} · ${u.subscription.period} · ${u.subscription.status} to ${date(u.subscription.currentPeriodEnd)}` : u.plan],
          ['Progress', `${number(u.xp)} XP · ${number(u.coins)} coins · ${number(u.aiCredits)} AI credits · ${number(u.streak)}-day streak`],
          ['Last active', date(u.lastActiveDate)],
          ['Joined', date(u.createdAt)],
          u.deleteAt && ['Deleting on', date(u.deleteAt)],
        ]),
      ),
      standing,
      h('h2', null, 'Help requests'),
      u.helpTickets.length
        ? table(
            ['Request', 'Kind', 'Status', 'Updated'],
            u.helpTickets.map((t) => [
              h('button', { type: 'button', class: 'link', onClick: () => show(() => ticketPage(t.id)) }, t.subject),
              t.kind,
              tag(t.status),
              date(t.updatedAt),
            ]),
          )
        : empty('None.'),
      h('h2', null, 'Payments'),
      u.payments.length
        ? table(
            ['Reference', 'Plan', 'Amount', 'Status', 'Date'],
            u.payments.map((p) => [p.reference, p.plan, money(p.amount, p.currency), tag(p.status), date(p.createdAt)]),
          )
        : empty('None.'),
    ];
  }

  /* ---------- Support ---------- */

  const supportState = { status: 'open', kind: 'all', page: 1 };

  async function supportPage() {
    const params = new URLSearchParams({ page: supportState.page, status: supportState.status, kind: supportState.kind });
    const data = await api(`/admin/tickets?${params}`);
    const refilter = (key) => (value) => {
      supportState[key] = value;
      supportState.page = 1;
      show(supportPage);
    };
    return [
      h('h1', null, 'Support'),
      h(
        'div',
        { class: 'bar' },
        select('Status', supportState.status, STATUS_ALL('open', 'waiting', 'resolved'), refilter('status')),
        select('Kind', supportState.kind, [['all', 'All kinds'], ...data.kinds.map((k) => [k, k])], refilter('kind')),
      ),
      data.items.length
        ? table(
            ['Request', 'From', 'Kind', 'Status', 'Updated'],
            data.items.map((t) => [
              [h('button', { type: 'button', class: 'link', onClick: () => show(() => ticketPage(t.id)) }, t.subject), h('div', { class: 'muted' }, t.id)],
              t.user.email,
              t.kind,
              tag(t.status),
              time(t.updatedAt),
            ]),
          )
        : empty('Nothing here.'),
      pager(supportState.page, data, (p) => {
        supportState.page = p;
        show(supportPage);
      }),
    ];
  }

  async function ticketPage(id) {
    const t = await api(`/admin/tickets/${encodeURIComponent(id)}`);
    const reload = () => show(() => ticketPage(id));
    const note = h('p', { role: 'alert' });
    const text = h('textarea', { maxlength: 4000, 'aria-label': 'Your reply' });
    const need = () => {
      if (!text.value.trim()) throw new Error('Write your answer first.');
      return text.value.trim();
    };
    const say = (resolve) => async () => {
      await post(`/admin/tickets/${encodeURIComponent(id)}/reply`, { text: need(), resolve });
      reload();
    };
    const decide = (decision) => async () => {
      await post(`/admin/tickets/${encodeURIComponent(id)}/appeal`, { decision, text: need() });
      reload();
    };
    const meta = Object.entries(t.meta ?? {});
    return [
      h('div', null, h('button', { type: 'button', class: 'link', onClick: () => show(supportPage) }, '← Support')),
      h('div', { class: 'row' }, h('h1', { class: 'wrap' }, t.subject), tag(t.status)),
      h(
        'section',
        { class: 'card' },
        details([
          ['Reference', t.id],
          ['Kind', [t.kind, t.topic].filter(Boolean).join(' · ')],
          ['From', h('button', { type: 'button', class: 'link', onClick: () => show(() => userPage(t.user.id)) }, `${t.user.name} (${t.user.email})`)],
          ['Plan', t.user.plan],
          t.user.restriction && ['Standing', `${t.user.restriction.kind}: ${t.user.restriction.reason}`],
          ...meta.map(([k, v]) => [k, typeof v === 'string' ? v : JSON.stringify(v)]),
        ]),
      ),
      h(
        'section',
        { class: 'thread', 'aria-label': 'Messages' },
        t.messages.map((m) =>
          h(
            'div',
            { class: `message ${m.from === 'me' ? '' : 'staff'}` },
            h('span', { class: 'muted' }, `${m.from === 'me' ? t.user.name : m.staff ? `Support (${m.staff})` : 'Support (automatic)'} · ${time(m.createdAt)}`),
            h('p', { class: 'wrap' }, m.text),
          ),
        ),
      ),
      h(
        'section',
        { class: 'card' },
        h('h2', null, t.kind === 'appeal' ? 'Decide this appeal' : 'Reply'),
        h('p', { class: 'muted' }, 'The learner is told in the app and sees this as “Knowzone support”.'),
        text,
        note,
        t.kind === 'appeal'
          ? h(
              'div',
              { class: 'row' },
              button('Accept and lift', { kind: 'primary', note, work: decide('accept') }),
              button('Reject', { kind: 'danger', note, work: decide('reject') }),
            )
          : h(
              'div',
              { class: 'row' },
              button('Reply and resolve', { kind: 'primary', note, work: say(true) }),
              button('Reply', { note, work: say(false) }),
              t.status !== 'resolved' &&
                button('Resolve without replying', {
                  note,
                  work: async () => {
                    await post(`/admin/tickets/${encodeURIComponent(id)}/resolve`);
                    reload();
                  },
                }),
            ),
      ),
    ];
  }

  /* ---------- Reports ---------- */

  const reportsState = { view: 'videos', status: 'open', page: 1 };

  async function reportsPage() {
    const { view, status, page } = reportsState;
    const reload = () => show(reportsPage);
    const note = h('p', { role: 'alert' });
    const setStatus = (path, value) => async () => {
      await post(path, value);
      reload();
    };
    const statuses = view === 'copyright' ? STATUS_ALL('open', 'actioned', 'rejected') : STATUS_ALL('open', 'reviewed', 'dismissed');
    const filters = h(
      'div',
      { class: 'bar' },
      select('Type of report', view, [['videos', 'Video reports'], ['comments', 'Reel comments'], ['copyright', 'Copyright notices']], (v) => {
        reportsState.view = v;
        reportsState.status = 'open';
        reportsState.page = 1;
        reload();
      }),
      view !== 'comments' &&
        select('Status', status, statuses, (v) => {
          reportsState.status = v;
          reportsState.page = 1;
          reload();
        }),
    );
    const params = new URLSearchParams({ page, status });
    const paging = (data) =>
      pager(page, data, (p) => {
        reportsState.page = p;
        reload();
      });

    let list;
    if (view === 'videos') {
      const data = await api(`/admin/video-reports?${params}`);
      list = [
        data.items.length
          ? table(
              ['Video', 'Reason', 'Reported by', 'Status', 'Action'],
              data.items.map((r) => [
                [h('div', null, r.videoTitle ?? r.videoId), h('div', { class: 'muted' }, date(r.createdAt))],
                [h('div', null, r.reason), r.details && h('div', { class: 'muted wrap' }, r.details)],
                r.user.email,
                tag(r.status),
                h(
                  'div',
                  { class: 'row' },
                  r.status !== 'reviewed' && button('Reviewed', { note, work: setStatus(`/admin/video-reports/${encodeURIComponent(r.id)}`, { status: 'reviewed' }) }),
                  r.status !== 'dismissed' && button('Dismiss', { note, work: setStatus(`/admin/video-reports/${encodeURIComponent(r.id)}`, { status: 'dismissed' }) }),
                  r.videoId.startsWith('yt-') && hideControl('video', r.videoId.slice(3), r.videoTitle ?? r.videoId, false, note, reload),
                ),
              ]),
            )
          : empty('Nothing here.'),
        paging(data),
      ];
    } else if (view === 'comments') {
      const data = await api(`/admin/comments?page=${page}`);
      list = [
        h('p', { class: 'muted' }, 'Comments that people reported, and any that are hidden. Several reports hide one automatically.'),
        data.items.length
          ? table(
              ['Comment', 'By', 'Reports', 'Status', 'Action'],
              data.items.map((c) => [
                [h('p', { class: 'wrap' }, c.text), h('div', { class: 'muted' }, `Reel ${c.reelId} · ${date(c.createdAt)}`)],
                h('button', { type: 'button', class: 'link', onClick: () => show(() => userPage(c.user.id)) }, c.user.email),
                c.reports,
                c.hidden ? tag('hidden') : tag('active'),
                button(c.hidden ? 'Restore' : 'Hide', {
                  kind: c.hidden ? undefined : 'danger',
                  note,
                  work: setStatus(`/admin/comments/${encodeURIComponent(c.id)}`, { hidden: !c.hidden }),
                }),
              ]),
            )
          : empty('Nothing here.'),
        paging(data),
      ];
    } else {
      const data = await api(`/admin/copyright?${params}`);
      list = [
        data.items.length
          ? data.items.map((n) =>
              h(
                'section',
                { class: 'card' },
                h('div', { class: 'row between' }, h('h2', null, n.reference), tag(n.status)),
                details([
                  ['From', `${n.name} (${n.email})${n.organisation ? `, ${n.organisation}` : ''}`],
                  ['Work', h('span', { class: 'wrap' }, n.work)],
                  ['Where', h('span', { class: 'wrap' }, n.location)],
                  ['Received', time(n.createdAt)],
                ]),
                h(
                  'div',
                  { class: 'row' },
                  n.status !== 'actioned' && button('Mark actioned', { note, work: setStatus(`/admin/copyright/${encodeURIComponent(n.reference)}`, { status: 'actioned' }) }),
                  n.status !== 'rejected' && button('Reject', { kind: 'danger', note, work: setStatus(`/admin/copyright/${encodeURIComponent(n.reference)}`, { status: 'rejected' }) }),
                ),
              ),
            )
          : empty('Nothing here.'),
        paging(data),
      ];
    }
    return [h('h1', null, 'Reports'), filters, note, list];
  }

  /* ---------- Billing ---------- */

  const billingState = { view: 'requests', status: 'open', q: '', page: 1 };

  async function billingPage() {
    const { view, status, q, page } = billingState;
    const reload = () => show(billingPage);
    const paging = (data) =>
      pager(page, data, (p) => {
        billingState.page = p;
        reload();
      });
    const switcher = select('Show', view, [['requests', 'Billing requests'], ['payments', 'Payments']], (v) => {
      billingState.view = v;
      billingState.status = v === 'requests' ? 'open' : 'all';
      billingState.q = '';
      billingState.page = 1;
      reload();
    });

    if (view === 'payments') {
      const data = await api(`/admin/payments?${new URLSearchParams({ page, status, ...(q && { q }) })}`);
      const search = h('input', { type: 'search', value: q, placeholder: 'Reference or email', 'aria-label': 'Find a payment' });
      return [
        h('h1', null, 'Billing'),
        h('p', { class: 'muted' }, 'To look things up. Refunds and charges are made in Flutterwave, not here.'),
        h(
          'form',
          {
            class: 'bar',
            onSubmit: (e) => {
              e.preventDefault();
              billingState.q = search.value.trim();
              billingState.page = 1;
              reload();
            },
          },
          switcher,
          select('Status', status, STATUS_ALL('paid', 'pending', 'failed', 'refunded'), (v) => {
            billingState.status = v;
            billingState.page = 1;
            reload();
          }),
          search,
          h('button', { type: 'submit' }, 'Find'),
        ),
        data.items.length
          ? table(
              ['Reference', 'Who', 'Plan', 'Amount', 'Status', 'Date'],
              data.items.map((p) => [
                p.reference,
                h('button', { type: 'button', class: 'link', onClick: () => show(() => userPage(p.user.id)) }, p.user.email),
                `${p.plan} · ${p.period}${p.renewal ? ' · renewal' : ''}`,
                money(p.amount, p.currency),
                [tag(p.status), p.failureReason && h('div', { class: 'muted' }, p.failureReason)],
                date(p.paidAt ?? p.createdAt),
              ]),
            )
          : empty('Nothing here.'),
        paging(data),
      ];
    }

    const data = await api(`/admin/billing-tickets?${new URLSearchParams({ page, status })}`);
    return [
      h('h1', null, 'Billing'),
      h('p', { class: 'muted' }, 'Your answer shows in the learner’s billing history. Refunds and charges are made in Flutterwave, not here.'),
      h(
        'div',
        { class: 'bar' },
        switcher,
        select('Status', status, STATUS_ALL('open', 'resolved'), (v) => {
          billingState.status = v;
          billingState.page = 1;
          reload();
        }),
      ),
      data.items.length
        ? data.items.map((t) => {
            const note = h('p', { role: 'alert' });
            const answer = h('textarea', { maxlength: 1000, 'aria-label': 'Your answer' });
            return h(
              'section',
              { class: 'card' },
              h('div', { class: 'row between' }, h('h2', null, `${t.topic} · ${t.id}`), tag(t.status)),
              details([
                ['From', h('button', { type: 'button', class: 'link', onClick: () => show(() => userPage(t.user.id)) }, t.user.email)],
                ['Received', time(t.createdAt)],
                t.paymentId && ['Payment', t.paymentId],
                ['Message', h('span', { class: 'wrap' }, t.message)],
                t.resolution && ['Answer', h('span', { class: 'wrap' }, t.resolution)],
              ]),
              t.status !== 'resolved' && [
                answer,
                note,
                h(
                  'div',
                  null,
                  button('Answer and resolve', {
                    kind: 'primary',
                    note,
                    work: async () => {
                      if (!answer.value.trim()) throw new Error('Write your answer first.');
                      await post(`/admin/billing-tickets/${encodeURIComponent(t.id)}/resolve`, { resolution: answer.value.trim() });
                      reload();
                    },
                  }),
                ),
              ],
            );
          })
        : empty('Nothing here.'),
      paging(data),
    ];
  }

  /* ---------- Waitlist ---------- */

  const waitlistState = { q: '', page: 1 };

  async function waitlistPage() {
    const params = new URLSearchParams({ page: waitlistState.page, ...(waitlistState.q && { q: waitlistState.q }) });
    const data = await api(`/admin/waitlist?${params}`);
    const search = h('input', { type: 'search', value: waitlistState.q, placeholder: 'Name or email', 'aria-label': 'Find someone on the waitlist' });
    const note = h('p', { role: 'alert' });
    return [
      h('h1', null, 'Waitlist'),
      h(
        'form',
        {
          class: 'bar',
          onSubmit: (e) => {
            e.preventDefault();
            waitlistState.q = search.value.trim();
            waitlistState.page = 1;
            show(waitlistPage);
          },
        },
        search,
        h('button', { type: 'submit' }, 'Find'),
        button('Download CSV', {
          note,
          work: async () => {
            const csv = await api('/admin/waitlist.csv');
            const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
            const link = h('a', { href: url, download: 'knowzone-waitlist.csv' });
            link.click();
            URL.revokeObjectURL(url);
          },
        }),
      ),
      note,
      data.items.length
        ? table(
            ['Person', 'Role', 'Country', 'Interested in', 'Joined'],
            data.items.map((w) => [[h('div', null, w.name), h('div', { class: 'muted' }, w.email)], w.role, w.country ?? '—', w.interests.join(', ') || '—', date(w.createdAt)]),
          )
        : empty('Nobody here.'),
      pager(waitlistState.page, data, (p) => {
        waitlistState.page = p;
        show(waitlistPage);
      }),
    ];
  }

  /* ---------- Library ---------- */

  const libraryState = { view: 'videos', q: '', page: 1, source: 'all', set: 'all', country: 'all', price: 'all', cover: 'all', library: 'all', state: 'all' };

  const outLink = (url, text) => (/^https:\/\//.test(url ?? '') ? h('a', { href: url, target: '_blank', rel: 'noopener noreferrer' }, text) : null);
  const minutes = (s) => `${Math.max(1, Math.round(s / 60))} min`;

  /** Takes an item out of the app, or puts it back. Asks why first: the reason stays with the record. */
  function hideControl(kind, id, title, hidden, note, done) {
    if (hidden)
      return button('Show again', {
        note,
        work: async () => {
          await post('/admin/library/unhide', { kind, id });
          done();
        },
      });
    return button('Hide', {
      kind: 'danger',
      note,
      work: async () => {
        const reason = window.prompt(`Hide “${title}” from all learners? Why? (at least 3 letters)`, '');
        if (reason === null) return;
        if (reason.trim().length < 3) throw new Error('Write a reason of at least 3 letters. Nothing was hidden.');
        await post('/admin/library/hide', { kind, id, title, reason: reason.trim() });
        done();
      },
    });
  }
  const hiddenNote = (hidden) => hidden && h('div', { class: 'muted' }, `Hidden by ${hidden.hiddenBy}: ${hidden.reason}`);
  const stateFilter = (value, onChange) => select('State', value, [['all', 'Hidden and showing'], ['live', 'Showing'], ['hidden', 'Hidden only']], onChange);

  async function libraryPage() {
    const s = libraryState;
    const reload = () => show(libraryPage);
    const note = h('p', { role: 'alert' });
    const set = (key) => (value) => {
      s[key] = value;
      s.page = 1;
      reload();
    };
    const switcher = select('Show', s.view, [['videos', 'Videos'], ['books', 'Books'], ['summaries', 'Summaries'], ['gaps', 'What’s missing'], ['hidden', 'Hidden']], (v) => {
      s.view = v;
      s.q = '';
      s.page = 1;
      reload();
    });
    const paging = (data) =>
      pager(s.page, data, (p) => {
        s.page = p;
        reload();
      });
    const search = h('input', { type: 'search', value: s.q, placeholder: 'Search', 'aria-label': 'Search the library' });
    const bar = (...filters) =>
      h(
        'form',
        {
          class: 'bar',
          onSubmit: (e) => {
            e.preventDefault();
            s.q = search.value.trim();
            s.page = 1;
            reload();
          },
        },
        switcher,
        filters,
        search,
        h('button', { type: 'submit' }, 'Find'),
      );
    const intro = h('p', { class: 'muted' }, 'Everything learners can open. New videos and books still arrive through the content sets.');

    if (s.view === 'hidden') {
      const { items } = await api('/admin/library/hidden');
      return [
        h('h1', null, 'Library'),
        h('div', { class: 'bar' }, switcher),
        h('p', { class: 'muted' }, 'Taken out of the app for everyone, and still safe to bring back.'),
        note,
        items.length
          ? table(
              ['Item', 'Kind', 'Why', 'Who', 'Action'],
              items.map((i) => [i.title, i.kind, i.reason, [h('div', null, i.hiddenBy), h('div', { class: 'muted' }, date(i.createdAt))], hideControl(i.kind, i.itemId, i.title, true, note, reload)]),
            )
          : empty('Nothing is hidden.'),
      ];
    }

    if (s.view === 'gaps') {
      const g = await api('/admin/library/gaps');
      const thin = g.videos.filter((v) => v.thinTopics.length);
      return [
        h('h1', null, 'Library'),
        h('div', { class: 'bar' }, switcher),
        h('h2', null, 'Video sets with thin topics'),
        h('p', { class: 'muted' }, 'A thin topic has fewer than two videos.'),
        thin.length
          ? table(
              ['Set', 'Videos', 'Topics', 'Thin topics'],
              thin.map((v) => [v.name, number(v.videos), number(v.topics), `${v.thinTopics.length}: ${v.thinTopics.join(', ')}`]),
            )
          : empty('Every topic has at least two videos.'),
        h('h2', null, 'Books by country'),
        table(
          ['Country', 'Books', 'Free', 'No cover', 'Subjects with no books'],
          [
            ...g.books.countries.map((c) => [c.name, number(c.books), number(c.free), number(c.noCover), c.emptySubjects.join(', ') || '—']),
            ['University and college courses', number(g.books.courses.books), number(g.books.courses.free), number(g.books.courses.noCover), '—'],
          ],
        ),
        h('h2', null, 'Summary translations'),
        table(
          ['Subject', 'Topics', 'Topics still missing a language'],
          g.summaries.map((l) => [l.name, number(l.topics), l.missing.map((m) => `${m.language}: ${m.topics}`).join(', ') || 'All 10 languages done']),
        ),
      ];
    }

    if (s.view === 'books') {
      const params = new URLSearchParams({ page: s.page, country: s.country, price: s.price, cover: s.cover, state: s.state, ...(s.q && { q: s.q }) });
      const data = await api(`/admin/library/books?${params}`);
      return [
        h('h1', null, 'Library'),
        intro,
        bar(
          select('Country', s.country, [['all', 'All countries'], ...data.countries.map((c) => [c.id, c.name]), ['courses', 'University and college']], set('country')),
          select('Price', s.price, [['all', 'Free and paid'], ['free', 'Free'], ['paid', 'Paid']], set('price')),
          select('Cover', s.cover, [['all', 'With or without cover'], ['missing', 'No cover']], set('cover')),
          stateFilter(s.state, set('state')),
        ),
        note,
        data.items.length
          ? table(
              ['Book', 'Price', 'Where', 'Subjects', 'Action'],
              data.items.map((b) => [
                h(
                  'div',
                  { class: 'item' },
                  b.cover ? h('img', { class: 'cover', src: b.cover, alt: '', loading: 'lazy' }) : h('div', { class: 'cover' }),
                  h('div', null, h('div', null, b.title), h('div', { class: 'muted' }, [b.authors.join(', '), b.publisher].filter(Boolean).join(' · ')), outLink(b.readUrl, 'Open'), hiddenNote(b.hidden)),
                ),
                b.free ? tag('free') : tag('paid'),
                b.countries.join(', '),
                b.subjects.join(', '),
                hideControl('book', b.id, b.title, b.hidden, note, reload),
              ]),
            )
          : empty('Nothing matches that.'),
        paging(data),
      ];
    }

    if (s.view === 'summaries') {
      const params = new URLSearchParams({ page: s.page, library: s.library, state: s.state, ...(s.q && { q: s.q }) });
      const data = await api(`/admin/library/summaries?${params}`);
      return [
        h('h1', null, 'Library'),
        intro,
        bar(select('Subject', s.library, [['all', 'All subjects'], ...data.libraries.map((l) => [l.id, l.name])], set('library')), stateFilter(s.state, set('state'))),
        note,
        data.items.length
          ? table(
              ['Summary', 'Subject', 'Languages', 'Action'],
              data.items.map((c) => [
                [h('button', { type: 'button', class: 'link', onClick: () => show(() => summaryPage(c.library, c.id, 'en')) }, c.title), h('div', { class: 'muted' }, c.short), hiddenNote(c.hidden)],
                c.libraryName,
                c.languages.length,
                hideControl('summary', `${c.library}/${c.id}`, c.title, c.hidden, note, reload),
              ]),
            )
          : empty('Nothing matches that.'),
        paging(data),
      ];
    }

    const params = new URLSearchParams({ page: s.page, source: s.source, set: s.set, state: s.state, ...(s.q && { q: s.q }) });
    const data = await api(`/admin/library/videos?${params}`);
    return [
      h('h1', null, 'Library'),
      intro,
      bar(
        select('From', s.source, [['all', 'All videos'], ['subject', 'School subjects'], ['course', 'Courses'], ['skill', 'Future skills']], set('source')),
        select('Set', s.set, [['all', 'All sets'], ...data.sets.map((x) => [x.id, x.name])], set('set')),
        stateFilter(s.state, set('state')),
      ),
      note,
      data.items.length
        ? table(
            ['Video', 'Length', 'Where it appears', 'Status', 'Action'],
            data.items.map((v) => [
              h(
                'div',
                { class: 'item' },
                h('img', { class: 'thumb', src: `https://i.ytimg.com/vi/${encodeURIComponent(v.youtubeId)}/mqdefault.jpg`, alt: '', loading: 'lazy' }),
                h('div', null, h('div', null, v.title), h('div', { class: 'muted' }, v.channel), outLink(`https://www.youtube.com/watch?v=${encodeURIComponent(v.youtubeId)}`, 'Watch on YouTube'), hiddenNote(v.hidden)),
              ),
              minutes(v.seconds),
              v.places.join('; '),
              v.hidden ? tag('hidden') : v.gone ? tag('gone') : tag('active'),
              hideControl('video', v.youtubeId, v.title, v.hidden, note, reload),
            ]),
          )
        : empty('Nothing matches that.'),
      paging(data),
    ];
  }

  const SUMMARY_LANGUAGES = [['en', 'English'], ['pcm', 'Pidgin'], ['yo', 'Yoruba'], ['ig', 'Igbo'], ['ha', 'Hausa'], ['fr', 'French'], ['ar', 'Arabic'], ['sw', 'Swahili'], ['pt', 'Portuguese'], ['es', 'Spanish']];

  async function summaryPage(library, topic, lang) {
    const d = await api(`/admin/library/summaries/${encodeURIComponent(library)}/${encodeURIComponent(topic)}?lang=${lang}`);
    return [
      h('div', null, h('button', { type: 'button', class: 'link', onClick: () => show(libraryPage) }, '← Library')),
      h('h1', { class: 'wrap' }, d.title),
      h('div', { class: 'bar' }, select('Language', lang, SUMMARY_LANGUAGES, (l) => show(() => summaryPage(library, topic, l)))),
      !d.translated && h('p', { class: 'muted' }, 'Not translated into this language yet, so this is the English.'),
      h(
        'section',
        { class: 'card summary-text', dir: d.translated && lang === 'ar' ? 'rtl' : undefined },
        h('p', { class: 'muted' }, d.short),
        d.sections.map((x) => [h('h3', null, x.heading), h('p', { class: 'wrap' }, x.text)]),
        h('h3', null, 'Key points'),
        h('ul', null, d.keyPoints.map((k) => h('li', null, k))),
      ),
    ];
  }

  /* ---------- Settings ---------- */

  const activityState = { page: 1 };

  async function settingsPage() {
    const reload = () => show(settingsPage);
    const [team, s, activity] = await Promise.all([
      api('/admin/settings/team'),
      api('/admin/settings'),
      api(`/admin/settings/activity?page=${activityState.page}`),
    ]);

    const teamNote = h('p', { role: 'alert' });
    const email = h('input', { type: 'email', required: true, placeholder: 'Their Knowzone account email', 'aria-label': 'Email' });
    let role = 'admin';
    const add = h(
      'form',
      {
        class: 'add-form',
        onSubmit: async (e) => {
          e.preventDefault();
          teamNote.textContent = '';
          teamNote.className = '';
          try {
            if (role === 'superadmin' && !window.confirm(`Make ${email.value.trim()} a superadmin? They could add and remove staff and change settings.`)) return;
            await post('/admin/settings/team', { email: email.value.trim(), role });
            reload();
          } catch (err) {
            teamNote.textContent = err.message;
            teamNote.className = 'error';
          }
        },
      },
      email,
      select('Role', role, [['admin', 'Admin'], ['superadmin', 'Superadmin']], (v) => {
        role = v;
      }),
      h('button', { class: 'primary', type: 'submit' }, 'Add to team'),
    );
    const mine = me.email.toLowerCase();

    const aiNote = h('p', { role: 'alert' });
    const aiSwitch = h('input', { type: 'checkbox', checked: s.aiEnabled, 'aria-label': 'AI features' });
    aiSwitch.addEventListener('change', async () => {
      const on = aiSwitch.checked;
      aiNote.textContent = '';
      aiNote.className = '';
      if (!on && !window.confirm('Pause AI for every learner? The tutor, AI Studio and other AI features stop until you turn this back on.')) {
        aiSwitch.checked = true;
        return;
      }
      try {
        await api('/admin/settings', { method: 'PUT', body: JSON.stringify({ aiEnabled: on }) });
        reload();
      } catch (e) {
        aiSwitch.checked = !on;
        aiNote.textContent = e.message;
        aiNote.className = 'error';
      }
    });

    const inboxNote = h('p', { role: 'alert' });
    const inbox = h('input', { type: 'email', value: s.supportEmail ?? '', placeholder: s.supportInbox ? `Server default: ${s.supportInbox}` : 'help@example.com', 'aria-label': 'Support inbox' });

    return [
      h('h1', null, 'Settings'),
      h('h2', { class: 'section-title' }, 'Team'),
      h(
        'section',
        { class: 'card' },
        h('p', { class: 'muted' }, 'Admins can use every section except Settings. Superadmins can also manage the team and settings. People sign in with their normal Knowzone account for that email, so it must be one they can open.'),
        add,
        teamNote,
      ),
      table(
        ['Person', 'Role', 'Added by', 'Action'],
        team.items.map((m) => [
          [h('div', null, m.email), m.email === mine && h('div', { class: 'muted' }, 'You')],
          m.role === 'superadmin' ? tag('superadmin') : tag('admin'),
          m.owner ? 'Set on the server' : `${m.addedBy}, ${date(m.createdAt)}`,
          m.owner || m.email === mine
            ? h('span', { class: 'muted' }, '—')
            : h(
                'div',
                { class: 'row' },
                button(m.role === 'superadmin' ? 'Make admin' : 'Make superadmin', {
                  note: teamNote,
                  work: async () => {
                    await post('/admin/settings/team', { email: m.email, role: m.role === 'superadmin' ? 'admin' : 'superadmin' });
                    reload();
                  },
                }),
                button('Remove', {
                  kind: 'danger',
                  note: teamNote,
                  work: async () => {
                    if (!window.confirm(`Remove ${m.email} from the team? They lose access straight away.`)) return;
                    await api(`/admin/settings/team/${encodeURIComponent(m.email)}`, { method: 'DELETE' });
                    reload();
                  },
                }),
              ),
        ]),
      ),
      h('h2', { class: 'section-title' }, 'App'),
      h(
        'section',
        { class: 'card' },
        h(
          'div',
          { class: 'setting' },
          h('div', null, h('b', null, 'AI features'), h('p', { class: 'muted' }, s.aiEnabled ? 'On for every learner.' : 'Paused for every learner. Safety checks on comments and chat keep running.')),
          h('label', { class: 'switch' }, aiSwitch, h('i')),
        ),
        aiNote,
      ),
      h(
        'section',
        { class: 'card' },
        h('div', null, h('b', null, 'Support inbox'), h('p', { class: 'muted' }, s.supportInbox ? `New help requests are emailed to ${s.supportInbox}. Leave this empty to use the server’s address.` : 'No address yet, so new help requests aren’t emailed to anyone. They still show under Support.')),
        h(
          'div',
          { class: 'add-form' },
          inbox,
          button('Save', {
            kind: 'primary',
            note: inboxNote,
            work: async () => {
              await api('/admin/settings', { method: 'PUT', body: JSON.stringify({ supportEmail: inbox.value.trim() }) });
              reload();
            },
          }),
        ),
        inboxNote,
      ),
      h('h2', { class: 'section-title' }, 'Services'),
      h(
        'section',
        { class: 'card' },
        h('p', { class: 'muted' }, 'Whether each one is set up on the server. Keys never show here; they’re changed on Render.'),
        h('div', null, s.services.map((x) => h('div', { class: 'service' }, h('span', null, x.name), x.ready ? tag('set up') : tag('not set up')))),
        h('div', { class: 'service' }, h('span', null, 'Website address used in links'), h('span', { class: 'muted' }, s.appUrl)),
      ),
      h('h2', { class: 'section-title' }, 'Activity'),
      activity.items.length
        ? table(
            ['When', 'Who', 'What'],
            activity.items.map((a) => [time(a.createdAt), a.actor, `${a.action}: ${a.target}`]),
          )
        : empty('Nothing yet. Changes staff make will show here.'),
      pager(activityState.page, activity, (p) => {
        activityState.page = p;
        reload();
      }),
    ];
  }

  const PAGE_LOADERS = {
    overview: overviewPage,
    users: usersPage,
    support: supportPage,
    reports: reportsPage,
    billing: billingPage,
    waitlist: waitlistPage,
    library: libraryPage,
    settings: settingsPage,
  };

  /* ---------- Starting up ---------- */

  async function signOut() {
    const token = session?.access;
    keep(null);
    showSignIn();
    if (token)
      fetch(`${supabaseUrl}/auth/v1/logout`, { method: 'POST', headers: { apikey: supabaseKey, Authorization: `Bearer ${token}` } }).catch(() => {});
  }

  async function start() {
    try {
      me = await api('/admin/me');
    } catch (e) {
      if (e.status === 403) {
        keep(null);
        return showSignIn(e.message);
      }
      if (!session) return undefined;
      return fill(app, h('main', { class: 'signin' }, h('div', { class: 'card' }, h('p', { class: 'error', role: 'alert' }, e.message), h('button', { type: 'button', onClick: start }, 'Try again'))));
    }
    nav = h('nav', { 'aria-label': 'Sections' });
    main = h('main', { class: 'main' });
    fill(
      app,
      h(
        'div',
        { class: 'shell' },
        h(
          'aside',
          { class: 'side' },
          h('div', { class: 'brand' }, h('img', { src: '/assets/logo.png', alt: '' }), h('div', null, 'Knowzone', h('small', null, 'Staff dashboard'))),
          nav,
          h(
            'footer',
            null,
            h(
              'div',
              { class: 'who' },
              h('div', { class: 'avatar', 'aria-hidden': 'true' }, (me.name || me.email)[0].toUpperCase()),
              h('div', null, me.email, h('small', null, me.role === 'superadmin' ? 'Superadmin' : 'Admin')),
            ),
            h('div', null, h('button', { type: 'button', onClick: signOut }, 'Sign out')),
          ),
        ),
        main,
      ),
    );
    return go('overview');
  }

  sessionFromAddress();
  if (session) {
    fill(app, h('main', { class: 'signin' }, h('p', { class: 'muted', role: 'status' }, 'Loading… the server can take up to a minute to wake.')));
    start();
  } else {
    showSignIn();
  }
})();
