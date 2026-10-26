import type { Translation } from '../../types';
import type en from '../en/referrals';

const referrals: Translation<typeof en> = {
  eyebrow: 'REFERRALS',
  inviteEyebrow: 'INVITE FRIENDS',
  errors: {
    load: 'We no fit load your referrals',
  },
  status: {
    pending: 'E dey wait',
    confirmed: 'Reward don land',
    rejected: 'E no qualify',
  },
  templates: {
    buddy: {
      label: 'Study partner',
      text: 'I don dey study with Knowzone AI: e dey turn notes to summaries, flashcards and quizzes for one minute. Join with my code {{code}} and both of us go get {{credits}} free AI credits: {{link}}',
    },
    exams: {
      label: 'Exam prep',
      text: 'WAEC/JAMB prep don easy well-well with Knowzone AI: practice quizzes, AI tutor and short video lessons. Use my code {{code}} make you get {{credits}} bonus AI credits: {{link}}',
    },
    game: {
      label: 'Knowzone World',
      text: 'Come fight me for Knowzone World! 🪐 Quiz battles, bosses and puzzles, all from our school subjects. Sign up with my code {{code}} (+{{credits}} AI credits for each person): {{link}}',
    },
  },
  emailSubject: 'Come study with me for Knowzone AI',
  milestones: {
    firstFriend: { title: 'First friend', reward: 'First-friend badge' },
    studyCircle: { title: 'Study circle', reward: 'Study circle badge' },
    classCaptain: { title: 'Class captain', reward: 'Class captain badge' },
    ambassador: { title: 'Knowzone ambassador', reward: 'Ambassador badge' },
  },
  invalid: {
    notFound: {
      title: 'We no fit find that code',
      body: 'Check the spelling with your friend. Codes na 6–8 letters and numbers, like ADA2026.',
    },
    expired: {
      title: 'This invite don expire',
      body: 'That code na part of campaign wey don end. Ask your friend for im personal code instead; those ones no dey ever expire.',
    },
    ownCode: {
      title: 'Na your own code be that',
      body: 'You no fit invite yourself, but you fit share am with your friends from the Invite friends screen.',
    },
    alreadyReferred: {
      title: 'You don already use invite',
      body: 'Each new account fit use only one invite code. Your first one still dey work.',
    },
    notNew: {
      title: 'Invites na for new students',
      body: 'Invite codes dey work only when you dey create new account. You fit still invite friends with your own code.',
    },
    capReached: {
      title: 'Your friend don reach this month limit',
      body: 'Each student fit collect invite rewards for up to 10 friends every month. You fit still join; na only the bonus no go work.',
    },
  },
  steps: {
    joined: 'E join with your code',
    verified: 'E don verify im email',
    qualified: 'E don finish first lesson, quiz or level',
    reward: '+{{credits}} AI credits for each person',
    waiting: 'E dey wait',
    paid: 'E don pay',
  },
  dashboard: {
    title: 'Referrals',
    headline: 'Give {{credits}}, collect {{credits}}',
    body: 'When friend join with your code and finish im first lesson, quiz or level, both of una go get {{credits}} AI credits.',
    codeA11y: 'Your code {{code}}. Open code and link',
    yourCode: 'YOUR CODE',
    copyCode: 'Copy code',
    copy: 'COPY',
    copied: 'E DON COPY',
    invite: 'Invite friends',
    shareCode: 'Share my code',
    pendingA11y: 'Your invite reward wey dey wait',
    pendingTitle: 'Your welcome bonus dey wait',
    pendingBody: 'Finish your first lesson, quiz or level to open +{{credits}} credits from {{name}} invite.',
    stats: {
      invited: 'wey you invite',
      pending: 'dey wait',
      rewarded: 'don get reward',
      credits: 'credits',
    },
    thisMonth: 'This month',
    monthCount: '{{count}} out of {{cap}} rewards',
    monthCap: 'You fit collect invite rewards for up to {{cap}} friends every month.',
    friends: 'Your friends',
    seeProgress: 'See progress',
    noFriends: 'Nobody never join with your code yet. Share am with your classmate make you start.',
    friendA11y: '{{name}}, {{status}}',
    joined: 'E join {{date}}',
    links: {
      history: 'Reward history',
      eligibility: 'Who qualify',
      terms: 'Terms',
    },
  },
  code: {
    title: 'Your code',
    brand: 'KNOWZONE AI · INVITE',
    codeA11y: 'Code {{code}}',
    credits: '{{credits}} free AI credits for you and your friend',
    copyLinkA11y: 'Copy link {{link}}',
    codeCopied: 'Code don copy',
    linkCopied: 'Link don copy',
    copyCode: 'Copy code',
    copyLink: 'Copy link',
    moreWays: 'More ways to invite',
    howTitle: 'How your friend go use am',
    how: {
      open: 'E go open your link, or download Knowzone and tap “Got an invite code?”',
      enter: 'E go put your code when e dey create im account.',
      finish: 'E go finish im first lesson, quiz or Knowzone World level.',
      reward: 'Both of una go get {{credits}} AI credits, by itself.',
    },
    neverExpires: 'Your personal code no dey ever expire.',
  },
  invite: {
    title: 'Invite friends',
    intro: 'Pick message, then choose how you go send am. We go add your code and link by ourselves.',
    preview: 'MESSAGE PREVIEW',
    channels: {
      whatsapp: 'WhatsApp',
      sms: 'Text message',
      email: 'Email',
      copy: 'Copy message',
      more: 'More apps',
    },
    sendWith: 'Send with {{channel}}',
    copied: 'Message don copy. Paste am anywhere',
    cantOpen: 'We no fit open {{channel}} for this device',
    sent_one: 'You don send {{count}} invite from this phone. Friends go show for your dashboard as dem join.',
    sent_other:
      'You don send {{count}} invites from this phone. Friends go show for your dashboard as dem join.',
    noneSent: 'You never send any invite yet. Friends go show for your dashboard as dem join.',
    privacy: 'Invite only people wey you know. Knowzone no dey ever read your contacts or message friends for you.',
  },
  progress: {
    title: 'Progress',
    milestones: 'Milestones',
    rewarded_one: '{{count}} friend don get reward',
    rewarded_other: '{{count}} friends don get reward',
    next_one: '{{count}} more to reach <b>{{title}}</b> · {{reward}}',
    next_other: '{{count}} more to reach <b>{{title}}</b> · {{reward}}',
    allDone: 'Every milestone don open. You be Knowzone ambassador!',
    all: 'All',
    filter: '{{label}} ({{count}})',
    empty: 'No friends here yet',
    emptyBody: 'Friends wey join with your code go show here with every step till the reward.',
    invite: 'Invite friends',
    remind: 'Remind {{name}} make e finish first lesson inside 30 days after e join.',
  },
  eligibility: {
    title: 'Who qualify',
    fullTitle: 'Who qualify & wetin dey wait',
    yourInvite: 'YOUR INVITE',
    invitedBy: 'Na {{name}} invite you',
    oneStep:
      'Na one step remain: finish any lesson, quiz or Knowzone World level and both you and {{name}} go get {{credits}} AI credits.',
    verifyFirst: 'Verify your email first, then finish any lesson, quiz or level wey you like.',
    play: 'Play',
    courses: 'Courses',
    done: 'E don do! We don add your welcome bonus to your AI credits.',
    howQualify: 'How friends go qualify',
    rules: {
      new: 'Friends must be new for Knowzone and use your code when dem dey sign up',
      verified: 'Email don verify (or Google / Apple sign-in)',
      activity: 'First lesson, quiz or level inside 30 days',
      cap: 'Up to {{cap}} friends wey go get reward every month ({{count}} so far)',
    },
    capped: 'You don reach this month limit. New friends fit still join; rewards go start again next month.',
    pending: 'Rewards wey dey wait ({{count}})',
    nothingPending: 'Nothing dey wait. When friend join, you go see wetin e still need to do here.',
    daysLeft_one: '{{count}} day remain to qualify',
    daysLeft_other: '{{count}} days remain to qualify',
    readTerms: 'Read the full terms',
  },
  history: {
    title: 'Reward history',
    creditsNow: 'AI credits wey you get now',
    fromInvites: 'from invites',
    welcome: 'Welcome credits',
    inviter: '{{name}} join with your code',
    inviterUnknown: 'One friend join with your code',
    invitee: 'Invite bonus from {{name}}',
    inviteeUnknown: 'Invite bonus from one friend',
    plan: 'Monthly plan credits',
    used: 'You use am: {{name}}',
    usedAi: 'You use am for AI generation',
    plusA11y_one: '{{label}}, plus {{count}} credit',
    plusA11y_other: '{{label}}, plus {{count}} credits',
    minusA11y_one: '{{label}}, minus {{count}} credit',
    minusA11y_other: '{{label}}, minus {{count}} credits',
    note: 'We dey use AI credits to generate study packs, videos and tutor answers. Dem no be the same as coins and you no fit change dem to money.',
  },
  terms: {
    title: 'Referral terms',
    intro: 'The short version: invite real friends, help dem start to learn, and both of una go get bonus.',
    heading: '{{number}}. {{title}}',
    sections: {
      reward: {
        title: 'The reward',
        points: {
          credits: 'When friend join with your code and qualify, each of una go get {{credits}} AI credits.',
          automatic: 'We go add the credits by ourselves. You no need collect anything.',
          noCash: 'AI credits no get cash value and you no fit transfer, sell or change dem to coins or money.',
        },
      },
      qualifies: {
        title: 'Who qualify',
        points: {
          new: 'Your friend must dey create brand-new Knowzone account and put your code during sign-up.',
          verify: 'E must verify im email (or sign in with Google or Apple).',
          activity:
            'E must finish real learning activity (course lesson, quiz or Knowzone World level) inside 30 days after e join.',
          oneCode: 'Each new account fit use only one invite code.',
        },
      },
      limits: {
        title: 'Limits',
        points: {
          monthly:
            'You fit collect rewards for up to 10 friends every calendar month. Friends wey pass that number fit still join; na only the bonus no go work.',
          campaign: 'Campaign codes (for example from poster or event) fit expire. Personal codes no dey expire.',
        },
      },
      fairUse: {
        title: 'Fair use',
        points: {
          self: 'You no fit refer yourself, use many accounts or create accounts for other people.',
          device: 'Referrals from the same device, or wey be like say na machine do am, go dey marked “not eligible”.',
          reverse:
            'Knowzone fit collect back rewards wey person get by breaking these rules, and fit change this programme after we give notice inside the app.',
        },
      },
      privacy: {
        title: 'Privacy',
        points: {
          names:
            'Your friend go see your first name and initial. You go see their own, plus where dem reach for the steps wey dey up.',
          contacts: 'Knowzone no dey ever read your contacts or send messages for your name.',
        },
      },
    },
    updated: 'Last update na 1 October 2026. These terms dey work together with the Knowzone Terms of Service.',
    fullTerms: 'Full Terms of Service',
  },
};

export default referrals;
