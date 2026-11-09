/*
 * Knowzone's web dashboard, as a design preview. Nothing here reaches the server yet: Kora's answers are samples,
 * and the recent chats are examples. Whatever a person types only ever reaches the page as text.
 */
(() => {
  const TOOLS = [
    ['d5', '📝', 'Past questions', 'JAMB, WAEC and NECO practice papers.', ['JAMB', 'WAEC', 'NECO']],
    ['d1', '📚', 'Books', 'Textbooks for your class or course.', ['Free to read', 'My class', 'University and college']],
    ['d2', '📄', 'Summaries', 'Every topic explained, in your language.', ['Mathematics', 'Biology', 'Economics', 'English Language']],
    ['d3', '▶️', 'Videos', 'Lessons by topic, mixed with flashcards.', ['Chemistry', 'Physics', 'History', 'Geography']],
    ['d4', '⚡', 'Study packs', 'Turn notes, a photo or a PDF into a study pack.', ['Upload a PDF', 'Paste notes', 'Snap a page']],
    ['d6', '🎮', 'Knowzone World', 'Learning games in seven worlds.', ['Chemistry lab', 'Space', 'History museum']],
    ['d7', '👥', 'Study Rooms', 'Focus timers and quiz battles with friends.', ['Start a room', 'Join with a code']],
  ];
  const STARTERS = [
    ['d3', '🌱', 'Explain photosynthesis', 'simply, with an example', 'Explain photosynthesis simply, with an example.'],
    ['d5', '🧮', 'Solve an equation', 'step by step, like 2x + 6 = 14', 'Solve 2x + 6 = 14 step by step.'],
    ['d4', '📝', 'Quiz me for WAEC', 'on supply and demand', 'Give me a WAEC-style question on supply and demand.'],
    ['d1', '📖', 'Plan my revision', 'for the next two weeks', 'Help me plan my revision for the next two weeks.'],
  ];
  const RECENT = ['Newton’s laws of motion', 'Things Fall Apart: themes', 'Quadratic equations', 'Causes of inflation', 'Parts of a cell'];
  const SAMPLES = [
    [/photosynthesis/i, () => [
      p('Photosynthesis is how plants make their own food. They use sunlight, water and carbon dioxide to make glucose, a sugar, and they give out oxygen.'),
      p('Think of a leaf as a small kitchen:'),
      list(['Sunlight is the energy, trapped by the green pigment chlorophyll.', 'Water comes up from the roots.', 'Carbon dioxide enters through tiny holes in the leaf.']),
      points('Remember: carbon dioxide + water → glucose + oxygen, with light energy and chlorophyll.'),
    ]],
    [/2x/i, () => [
      p('Let’s solve 2x + 6 = 14, one step at a time.'),
      list(['Take 6 from both sides: 2x = 8.', 'Divide both sides by 2: x = 4.', 'Check it: 2 × 4 + 6 = 14. It’s correct.']),
      points('Whatever you do to one side of an equation, do to the other side too.'),
    ]],
    [/waec|supply/i, () => [
      p('Here’s a question in the style of a WAEC paper:'),
      p('When the price of a good rises, and nothing else changes, the quantity supplied will usually:'),
      list(['fall', 'rise', 'stay the same', 'fall, then stay the same']),
      p('Reply with your answer, and I’ll explain it.'),
    ]],
    [/revision|plan/i, () => [
      p('Happy to help. Here’s a simple way to use two weeks:'),
      list(['Week 1: go through your weakest topics, a little each day, and test yourself as you go.', 'Week 2: sit timed papers, then review every mistake.', 'Each day: spend the last 10 minutes on what you got wrong yesterday.']),
      p('Which subjects and exam are you preparing for? I’ll make it specific.'),
    ]],
  ];

  const h = (tag, className, ...children) => {
    const el = document.createElement(tag);
    if (className) el.className = className;
    el.append(...children);
    return el;
  };
  const p = (text) => h('p', '', text);
  const list = (items) => h('ol', '', ...items.map((x) => h('li', '', x)));
  const points = (text) => h('p', 'points', text);
  const $ = (id) => document.getElementById(id);
  const app = document.querySelector('.app');
  const view = $('view');
  const prompt = $('prompt');
  const send = $('send');

  const close = () => app.classList.remove('open');
  $('open-side').addEventListener('click', () => app.classList.add('open'));
  $('close-side').addEventListener('click', close);
  $('scrim').addEventListener('click', close);

  function mark(el) {
    document.querySelectorAll('.tool, .chat-link').forEach((x) => x.classList.toggle('on', x === el));
  }

  function welcome() {
    mark(null);
    view.replaceChildren(
      h(
        'div',
        'column welcome',
        h('h1', '', 'What do you want to learn today?'),
        h('p', '', 'Ask Kora anything, or start with one of these.'),
        h(
          'div',
          'starters',
          ...STARTERS.map(([tone, icon, title, sub, ask], i) => {
            const b = h('button', 'starter', h('span', `dot ${tone}`, icon), h('span', '', h('b', '', title), h('small', '', sub)));
            b.type = 'button';
            b.style.animationDelay = `${i * 0.06}s`;
            b.addEventListener('click', () => chat(ask));
            return b;
          }),
        ),
      ),
    );
    prompt.focus({ preventScroll: true });
  }

  /** A sample answer for the starters; anything else says plainly that Kora isn't connected yet. */
  function answer(question) {
    const found = SAMPLES.find(([match]) => match.test(question));
    return found
      ? found[1]()
      : [p('In the real dashboard, Kora would answer this here. It isn’t connected in this design preview yet.')];
  }

  function chat(question) {
    mark(null);
    const talk = h('div', 'talk', h('div', 'msg-me', question));
    view.replaceChildren(h('div', 'column', talk));
    const typing = h('div', 'typing', h('span'), h('span'), h('span'));
    const body = h('div', '', typing);
    const kora = h('span', 'kora', 'K');
    kora.setAttribute('aria-hidden', 'true');
    talk.append(h('div', 'msg-ai', kora, body));
    setTimeout(() => {
      body.replaceChildren(h('span', 'sample', 'Sample answer'), ...answer(question));
      view.scrollTop = view.scrollHeight;
    }, 800);
  }

  function tool([tone, icon, name, about, tiles], button) {
    mark(button);
    close();
    view.replaceChildren(
      h(
        'div',
        'column tool-page',
        h('h1', '', name),
        h('p', '', about),
        h('div', 'tiles', ...tiles.map((t) => h('div', 'tile', h('span', `dot ${tone}`, icon), t))),
        h('p', 'soon', 'Design preview: this section connects to your real content next.'),
      ),
    );
  }

  TOOLS.forEach((t) => {
    const b = h('button', 'tool', h('span', `dot ${t[0]}`, t[1]), t[2]);
    b.type = 'button';
    b.addEventListener('click', () => tool(t, b));
    $('tools').append(b);
  });
  RECENT.forEach((title) => {
    const b = h('button', 'chat-link', title);
    b.type = 'button';
    b.addEventListener('click', () => {
      close();
      chat(`Help me with ${title}.`);
      mark(b);
    });
    $('recent').append(b);
  });

  const grow = () => {
    prompt.style.height = 'auto';
    prompt.style.height = `${prompt.scrollHeight}px`;
    send.disabled = !prompt.value.trim();
  };
  prompt.addEventListener('input', grow);
  prompt.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      $('composer').requestSubmit();
    }
  });
  $('composer').addEventListener('submit', (e) => {
    e.preventDefault();
    const q = prompt.value.trim();
    if (!q) return;
    prompt.value = '';
    grow();
    chat(q);
  });
  $('new-chat').addEventListener('click', () => {
    close();
    welcome();
  });

  welcome();
})();
