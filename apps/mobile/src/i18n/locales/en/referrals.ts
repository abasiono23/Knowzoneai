/** Invite friends: dashboard, code, invite messages, progress, eligibility, reward history and terms. */
const referrals = {
  eyebrow: 'REFERRALS',
  inviteEyebrow: 'INVITE FRIENDS',
  errors: {
    load: 'Couldn’t load your referrals',
  },
  status: {
    pending: 'Pending',
    confirmed: 'Rewarded',
    rejected: 'Not eligible',
  },
  /** Ready-made invite messages people send to friends. Keep {{code}} and {{link}} in each one. */
  templates: {
    buddy: {
      label: 'Study buddy',
      text: 'I’ve been studying with Knowzone AI: it turns notes into summaries, flashcards and quizzes in a minute. Join with my code {{code}} and we both get {{credits}} free AI credits: {{link}}',
    },
    exams: {
      label: 'Exam prep',
      text: 'WAEC/JAMB prep is so much easier with Knowzone AI: practice quizzes, an AI tutor and short video lessons. Use my code {{code}} for {{credits}} bonus AI credits: {{link}}',
    },
    game: {
      label: 'Knowzone World',
      text: 'Come battle me in Knowzone World! 🪐 Quiz battles, bosses and puzzles, all from our school subjects. Sign up with my code {{code}} (+{{credits}} AI credits each): {{link}}',
    },
  },
  emailSubject: 'Study with me on Knowzone AI',
  milestones: {
    firstFriend: { title: 'First friend', reward: 'First-friend badge' },
    studyCircle: { title: 'Study circle', reward: 'Study circle badge' },
    classCaptain: { title: 'Class captain', reward: 'Class captain badge' },
    ambassador: { title: 'Knowzone ambassador', reward: 'Ambassador badge' },
  },
  /** Why an invite code can't be used (shown on the sign-up flow's invalid-code screen). */
  invalid: {
    notFound: {
      title: 'We couldn’t find that code',
      body: 'Check the spelling with your friend. Codes are 6–8 letters and numbers, like ADA2026.',
    },
    expired: {
      title: 'This invite has expired',
      body: 'That code was part of a campaign that has ended. Ask your friend for their personal code instead; those never expire.',
    },
    ownCode: {
      title: 'That’s your own code',
      body: 'You can’t invite yourself, but you can share it with friends from the Invite friends screen.',
    },
    alreadyReferred: {
      title: 'You’ve already used an invite',
      body: 'Each new account can use one invite code. Your first one is still active.',
    },
    notNew: {
      title: 'Invites are for new students',
      body: 'Invite codes only work while creating a new account. You can still invite friends with your own code.',
    },
    capReached: {
      title: 'Your friend has reached this month’s limit',
      body: 'Each student can earn invite rewards for up to 10 friends a month. You can still join; the bonus just won’t apply.',
    },
  },
  steps: {
    joined: 'Joined with your code',
    verified: 'Verified their email',
    qualified: 'Finished a first lesson, quiz or level',
    reward: '+{{credits}} AI credits each',
    waiting: 'Waiting',
    paid: 'Paid',
  },
  dashboard: {
    title: 'Referrals',
    headline: 'Give {{credits}}, get {{credits}}',
    body: 'When a friend joins with your code and finishes their first lesson, quiz or level, you both get {{credits}} AI credits.',
    codeA11y: 'Your code {{code}}. Open code and link',
    yourCode: 'YOUR CODE',
    copyCode: 'Copy code',
    copy: 'COPY',
    copied: 'COPIED',
    invite: 'Invite friends',
    shareCode: 'Share my code',
    pendingA11y: 'Your pending invite reward',
    pendingTitle: 'Your welcome bonus is pending',
    pendingBody: 'Finish your first lesson, quiz or level to unlock +{{credits}} credits from {{name}}’s invite.',
    stats: {
      invited: 'invited',
      pending: 'pending',
      rewarded: 'rewarded',
      credits: 'credits',
    },
    thisMonth: 'This month',
    monthCount: '{{count}} of {{cap}} rewards',
    monthCap: 'You can earn invite rewards for up to {{cap}} friends a month.',
    friends: 'Your friends',
    seeProgress: 'See progress',
    noFriends: 'No one has joined with your code yet. Share it with a classmate to get started.',
    friendA11y: '{{name}}, {{status}}',
    joined: 'Joined {{date}}',
    links: {
      history: 'Reward history',
      eligibility: 'Eligibility',
      terms: 'Terms',
    },
  },
  code: {
    title: 'Your code',
    brand: 'KNOWZONE AI · INVITE',
    codeA11y: 'Code {{code}}',
    credits: '{{credits}} free AI credits for you and your friend',
    copyLinkA11y: 'Copy link {{link}}',
    codeCopied: 'Code copied',
    linkCopied: 'Link copied',
    copyCode: 'Copy code',
    copyLink: 'Copy link',
    moreWays: 'More ways to invite',
    howTitle: 'How your friend uses it',
    how: {
      open: 'They open your link, or download Knowzone and tap “Got an invite code?”',
      enter: 'They enter your code while creating their account.',
      finish: 'They finish their first lesson, quiz or Knowzone World level.',
      reward: 'You both get {{credits}} AI credits, automatically.',
    },
    neverExpires: 'Your personal code never expires.',
  },
  invite: {
    title: 'Invite friends',
    intro: 'Pick a message, then choose how to send it. Your code and link are added automatically.',
    preview: 'MESSAGE PREVIEW',
    channels: {
      whatsapp: 'WhatsApp',
      sms: 'Text message',
      email: 'Email',
      copy: 'Copy message',
      more: 'More apps',
    },
    sendWith: 'Send with {{channel}}',
    copied: 'Message copied. Paste it anywhere',
    cantOpen: 'Couldn’t open {{channel}} on this device',
    sent_one: 'You’ve sent {{count}} invite from this phone. Friends show up on your dashboard as soon as they join.',
    sent_other:
      'You’ve sent {{count}} invites from this phone. Friends show up on your dashboard as soon as they join.',
    noneSent: 'You haven’t sent any invites yet. Friends show up on your dashboard as soon as they join.',
    privacy: 'Only invite people you know. Knowzone never reads your contacts or messages friends for you.',
  },
  progress: {
    title: 'Progress',
    milestones: 'Milestones',
    rewarded_one: '{{count}} friend rewarded',
    rewarded_other: '{{count}} friends rewarded',
    /** <b> wraps the milestone title. */
    next_one: '{{count}} more to <b>{{title}}</b> · {{reward}}',
    next_other: '{{count}} more to <b>{{title}}</b> · {{reward}}',
    allDone: 'Every milestone unlocked. You’re a Knowzone ambassador!',
    all: 'All',
    filter: '{{label}} ({{count}})',
    empty: 'No friends here yet',
    emptyBody: 'Friends who join with your code appear here with every step until the reward.',
    invite: 'Invite friends',
    remind: 'Remind {{name}} to finish a first lesson within 30 days of joining.',
  },
  eligibility: {
    title: 'Eligibility',
    fullTitle: 'Eligibility & pending',
    yourInvite: 'YOUR INVITE',
    invitedBy: 'Invited by {{name}}',
    oneStep:
      'One step left: finish any lesson, quiz or Knowzone World level and you and {{name}} both get {{credits}} AI credits.',
    verifyFirst: 'Verify your email first, then finish any lesson, quiz or level.',
    play: 'Play',
    courses: 'Courses',
    done: 'Done! Your welcome bonus has been added to your AI credits.',
    howQualify: 'How friends qualify',
    rules: {
      new: 'Friends must be new to Knowzone and use your code at sign-up',
      verified: 'Email verified (or Google / Apple sign-in)',
      activity: 'A first lesson, quiz or level within 30 days',
      cap: 'Up to {{cap}} rewarded friends a month ({{count}} so far)',
    },
    capped: 'You’ve reached this month’s limit. New friends can still join; rewards resume next month.',
    pending: 'Pending rewards ({{count}})',
    nothingPending: 'Nothing pending. When a friend joins, you’ll see what they still need to do here.',
    daysLeft_one: '{{count}} day left to qualify',
    daysLeft_other: '{{count}} days left to qualify',
    readTerms: 'Read the full terms',
  },
  history: {
    title: 'Reward history',
    creditsNow: 'AI credits now',
    fromInvites: 'from invites',
    welcome: 'Welcome credits',
    inviter: '{{name}} joined with your code',
    inviterUnknown: 'A friend joined with your code',
    invitee: 'Invite bonus from {{name}}',
    inviteeUnknown: 'Invite bonus from a friend',
    plan: 'Monthly plan credits',
    used: 'Used: {{name}}',
    usedAi: 'Used for AI generation',
    plusA11y_one: '{{label}}, plus {{count}} credit',
    plusA11y_other: '{{label}}, plus {{count}} credits',
    minusA11y_one: '{{label}}, minus {{count}} credit',
    minusA11y_other: '{{label}}, minus {{count}} credits',
    note: 'AI credits are used to generate study packs, videos and tutor answers. They’re separate from coins and can’t be exchanged for money.',
  },
  terms: {
    title: 'Referral terms',
    intro: 'The short version: invite real friends, help them start learning, and you both get a bonus.',
    heading: '{{number}}. {{title}}',
    sections: {
      reward: {
        title: 'The reward',
        points: {
          credits: 'When a friend joins with your code and qualifies, you each get {{credits}} AI credits.',
          automatic: 'Credits are added automatically. There’s nothing to claim.',
          noCash: 'AI credits have no cash value and can’t be transferred, sold or exchanged for coins or money.',
        },
      },
      qualifies: {
        title: 'Who qualifies',
        points: {
          new: 'Your friend must be creating a brand-new Knowzone account and enter your code during sign-up.',
          verify: 'They must verify their email (or sign in with Google or Apple).',
          activity:
            'They must finish a real learning activity (a course lesson, a quiz or a Knowzone World level) within 30 days of joining.',
          oneCode: 'Each new account can use one invite code.',
        },
      },
      limits: {
        title: 'Limits',
        points: {
          monthly:
            'You can earn rewards for up to 10 friends each calendar month. Friends beyond that can still join; the bonus just won’t apply.',
          campaign: 'Campaign codes (for example from a poster or event) may expire. Personal codes don’t.',
        },
      },
      fairUse: {
        title: 'Fair use',
        points: {
          self: 'You can’t refer yourself, use multiple accounts or create accounts for other people.',
          device: 'Referrals from the same device, or that look automated, are marked “not eligible”.',
          reverse:
            'Knowzone may reverse rewards gained by breaking these rules, and may change this programme with notice in the app.',
        },
      },
      privacy: {
        title: 'Privacy',
        points: {
          names:
            'Your friend sees your first name and initial. You see theirs, plus where they are in the steps above.',
          contacts: 'Knowzone never reads your contacts or sends messages on your behalf.',
        },
      },
    },
    updated: 'Last updated 1 October 2026. These terms sit alongside the Knowzone Terms of Service.',
    fullTerms: 'Full Terms of Service',
  },
};

export default referrals;
