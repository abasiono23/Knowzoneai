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
  ];
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
      PAGES.map(([id, name]) => {
        const waiting = counts[id];
        return h(
          'button',
          { type: 'button', class: id === current ? 'on' : '', 'aria-current': id === current ? 'page' : undefined, onClick: () => go(id) },
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

  const stat = (value, label, open) =>
    open
      ? h('button', { type: 'button', class: 'stat', onClick: open }, h('b', null, value), h('span', null, label))
      : h('div', { class: 'stat' }, h('b', null, value), h('span', null, label));

  async function overviewPage() {
    const d = await api('/admin/overview');
    const q = d.queues;
    setCounts(d);
    const plans = [...d.plans].sort((a, b) => b.count - a.count);
    return [
      h('h1', null, 'Overview'),
      h('h2', null, 'Waiting for you'),
      h(
        'div',
        { class: 'stats' },
        stat(number(q.support), 'Support requests', () => go('support')),
        stat(number(q.billing), 'Billing requests', () => go('billing')),
        stat(number(q.videoReports), 'Video reports', () => go('reports')),
        stat(number(q.comments), 'Reported comments', () => go('reports')),
        stat(number(q.copyright), 'Copyright notices', () => go('reports')),
      ),
      h('h2', null, 'People'),
      h(
        'div',
        { class: 'stats' },
        stat(number(d.users.total), 'Accounts'),
        stat(number(d.users.newThisWeek), 'New in 7 days'),
        stat(number(d.users.activeThisWeek), 'Active in 7 days'),
        stat(number(d.users.restricted), 'Restricted or suspended'),
        stat(number(d.waitlist.total), 'On the waitlist'),
        stat(number(d.waitlist.newThisWeek), 'Joined waitlist in 7 days'),
      ),
      h('h2', null, 'Plans and money'),
      h(
        'div',
        { class: 'stats' },
        plans.map((p) => stat(number(p.count), `${p.plan} plan`)),
        stat(number(d.money.activeSubscriptions), 'Active subscriptions'),
        d.money.last30Days.length
          ? d.money.last30Days.map((m) => stat(money(m.amount, m.currency), `Paid in 30 days (${number(m.payments)} ${m.payments === 1 ? 'payment' : 'payments'})`))
          : stat('0', 'Paid in 30 days'),
      ),
      h('h2', null, 'AI use in 30 days'),
      h(
        'div',
        { class: 'stats' },
        stat(number(d.ai.requests), 'AI requests'),
        stat(number(d.ai.inputTokens), 'Tokens read'),
        stat(number(d.ai.outputTokens), 'Tokens written'),
      ),
      h('h2', null, 'In the library'),
      h(
        'div',
        { class: 'stats' },
        stat(number(d.content.subjectVideos), 'Subject videos'),
        stat(number(d.content.summaries), 'Summaries'),
        stat(number(d.content.books), 'Books'),
        stat(number(d.content.futureSkills), 'Future skills'),
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

  const PAGE_LOADERS = {
    overview: overviewPage,
    users: usersPage,
    support: supportPage,
    reports: reportsPage,
    billing: billingPage,
    waitlist: waitlistPage,
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
          h('div', { class: 'brand' }, 'Knowzone staff'),
          nav,
          h('footer', null, h('span', null, me.email), h('div', null, h('button', { type: 'button', onClick: signOut }, 'Sign out'))),
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
