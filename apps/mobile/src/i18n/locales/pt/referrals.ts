import type { Translation } from '../../types';
import type en from '../en/referrals';

const referrals: Translation<typeof en> = {
  eyebrow: 'CONVITES',
  inviteEyebrow: 'CONVIDAR AMIGOS',
  errors: {
    load: 'Não foi possível carregar os teus convites',
  },
  status: {
    pending: 'Pendente',
    confirmed: 'Recompensado',
    rejected: 'Não elegível',
  },
  templates: {
    buddy: {
      label: 'Colega de estudo',
      text: 'Tenho estudado com o Knowzone AI: transforma apontamentos em resumos, flashcards e quizzes num minuto. Entra com o meu código {{code}} e ambos recebemos {{credits}} créditos de IA grátis: {{link}}',
    },
    exams: {
      label: 'Preparação para exames',
      text: 'Preparar o WAEC/JAMB é muito mais fácil com o Knowzone AI: quizzes de treino, um tutor de IA e vídeos curtos. Usa o meu código {{code}} para {{credits}} créditos de IA bónus: {{link}}',
    },
    game: {
      label: 'Knowzone World',
      text: 'Vem desafiar-me no Knowzone World! 🪐 Batalhas de quiz, chefes e puzzles, tudo das nossas disciplinas da escola. Cria conta com o meu código {{code}} (+{{credits}} créditos de IA para cada um): {{link}}',
    },
  },
  emailSubject: 'Estuda comigo no Knowzone AI',
  milestones: {
    firstFriend: { title: 'Primeiro amigo', reward: 'Medalha Primeiro amigo' },
    studyCircle: { title: 'Grupo de estudo', reward: 'Medalha Grupo de estudo' },
    classCaptain: { title: 'Chefe de turma', reward: 'Medalha Chefe de turma' },
    ambassador: { title: 'Embaixador Knowzone', reward: 'Medalha Embaixador' },
  },
  invalid: {
    notFound: {
      title: 'Não encontrámos esse código',
      body: 'Confirma a ortografia com o teu amigo. Os códigos têm 6–8 letras e números, como ADA2026.',
    },
    expired: {
      title: 'Este convite expirou',
      body: 'Esse código fazia parte de uma campanha que já terminou. Pede antes ao teu amigo o código pessoal dele; esses nunca expiram.',
    },
    ownCode: {
      title: 'Esse é o teu próprio código',
      body: 'Não te podes convidar a ti mesmo, mas podes partilhá-lo com amigos no ecrã Convidar amigos.',
    },
    alreadyReferred: {
      title: 'Já usaste um convite',
      body: 'Cada conta nova pode usar um código de convite. O teu primeiro continua ativo.',
    },
    notNew: {
      title: 'Os convites são para estudantes novos',
      body: 'Os códigos de convite só funcionam ao criar uma conta nova. Mesmo assim, podes convidar amigos com o teu próprio código.',
    },
    capReached: {
      title: 'O teu amigo atingiu o limite deste mês',
      body: 'Cada estudante pode ganhar recompensas de convite por até 10 amigos por mês. Podes entrar na mesma; só o bónus é que não se aplica.',
    },
  },
  steps: {
    joined: 'Entrou com o teu código',
    verified: 'Verificou o email',
    qualified: 'Terminou uma primeira lição, quiz ou nível',
    reward: '+{{credits}} créditos de IA para cada um',
    waiting: 'À espera',
    paid: 'Pago',
  },
  dashboard: {
    title: 'Convites',
    headline: 'Dá {{credits}}, recebe {{credits}}',
    body: 'Quando um amigo entra com o teu código e termina a primeira lição, quiz ou nível, ambos recebem {{credits}} créditos de IA.',
    codeA11y: 'O teu código {{code}}. Abrir código e link',
    yourCode: 'O TEU CÓDIGO',
    copyCode: 'Copiar código',
    copy: 'COPIAR',
    copied: 'COPIADO',
    invite: 'Convidar amigos',
    shareCode: 'Partilhar o meu código',
    pendingA11y: 'A tua recompensa de convite pendente',
    pendingTitle: 'O teu bónus de boas-vindas está pendente',
    pendingBody: 'Termina a tua primeira lição, quiz ou nível para desbloqueares +{{credits}} créditos do convite de {{name}}.',
    stats: {
      invited: 'convidados',
      pending: 'pendentes',
      rewarded: 'recompensados',
      credits: 'créditos',
    },
    thisMonth: 'Este mês',
    monthCount: '{{count}} de {{cap}} recompensas',
    monthCap: 'Podes ganhar recompensas de convite por até {{cap}} amigos por mês.',
    friends: 'Os teus amigos',
    seeProgress: 'Ver progresso',
    noFriends: 'Ainda ninguém entrou com o teu código. Partilha-o com um colega para começares.',
    friendA11y: '{{name}}, {{status}}',
    joined: 'Entrou a {{date}}',
    links: {
      history: 'Histórico de recompensas',
      eligibility: 'Elegibilidade',
      terms: 'Termos',
    },
  },
  code: {
    title: 'O teu código',
    brand: 'KNOWZONE AI · CONVITE',
    codeA11y: 'Código {{code}}',
    credits: '{{credits}} créditos de IA grátis para ti e para o teu amigo',
    copyLinkA11y: 'Copiar link {{link}}',
    codeCopied: 'Código copiado',
    linkCopied: 'Link copiado',
    copyCode: 'Copiar código',
    copyLink: 'Copiar link',
    moreWays: 'Mais formas de convidar',
    howTitle: 'Como o teu amigo o usa',
    how: {
      open: 'Abre o teu link, ou descarrega o Knowzone e toca em “Tens um código de convite?”',
      enter: 'Introduz o teu código ao criar a conta.',
      finish: 'Termina a primeira lição, quiz ou nível do Knowzone World.',
      reward: 'Ambos recebem {{credits}} créditos de IA, automaticamente.',
    },
    neverExpires: 'O teu código pessoal nunca expira.',
  },
  invite: {
    title: 'Convidar amigos',
    intro: 'Escolhe uma mensagem e depois como a queres enviar. O teu código e link são adicionados automaticamente.',
    preview: 'PRÉ-VISUALIZAÇÃO DA MENSAGEM',
    channels: {
      whatsapp: 'WhatsApp',
      sms: 'SMS',
      email: 'Email',
      copy: 'Copiar mensagem',
      more: 'Mais apps',
    },
    sendWith: 'Enviar por {{channel}}',
    copied: 'Mensagem copiada. Cola-a onde quiseres',
    cantOpen: 'Não foi possível abrir {{channel}} neste dispositivo',
    sent_one: 'Enviaste {{count}} convite a partir deste telemóvel. Os amigos aparecem no teu painel assim que entrarem.',
    sent_other:
      'Enviaste {{count}} convites a partir deste telemóvel. Os amigos aparecem no teu painel assim que entrarem.',
    sent_many:
      'Enviaste {{count}} convites a partir deste telemóvel. Os amigos aparecem no teu painel assim que entrarem.',
    noneSent: 'Ainda não enviaste nenhum convite. Os amigos aparecem no teu painel assim que entrarem.',
    privacy: 'Convida só pessoas que conheces. O Knowzone nunca lê os teus contactos nem envia mensagens a amigos por ti.',
  },
  progress: {
    title: 'Progresso',
    milestones: 'Metas',
    rewarded_one: '{{count}} amigo recompensado',
    rewarded_other: '{{count}} amigos recompensados',
    rewarded_many: '{{count}} amigos recompensados',
    next_one: 'Falta {{count}} para <b>{{title}}</b> · {{reward}}',
    next_other: 'Faltam {{count}} para <b>{{title}}</b> · {{reward}}',
    next_many: 'Faltam {{count}} para <b>{{title}}</b> · {{reward}}',
    allDone: 'Todas as metas desbloqueadas. És um embaixador Knowzone!',
    all: 'Todos',
    filter: '{{label}} ({{count}})',
    empty: 'Ainda não há amigos aqui',
    emptyBody: 'Os amigos que entrarem com o teu código aparecem aqui, com cada passo até à recompensa.',
    invite: 'Convidar amigos',
    remind: 'Lembra {{name}} de terminar uma primeira lição até 30 dias depois de entrar.',
  },
  eligibility: {
    title: 'Elegibilidade',
    fullTitle: 'Elegibilidade e pendentes',
    yourInvite: 'O TEU CONVITE',
    invitedBy: 'Convidado por {{name}}',
    oneStep:
      'Falta um passo: termina qualquer lição, quiz ou nível do Knowzone World e tu e {{name}} recebem {{credits}} créditos de IA.',
    verifyFirst: 'Verifica primeiro o teu email e depois termina qualquer lição, quiz ou nível.',
    play: 'Jogar',
    courses: 'Cursos',
    done: 'Feito! O teu bónus de boas-vindas foi adicionado aos teus créditos de IA.',
    howQualify: 'Como os amigos se qualificam',
    rules: {
      new: 'Os amigos têm de ser novos no Knowzone e usar o teu código ao criar conta',
      verified: 'Email verificado (ou entrada com Google / Apple)',
      activity: 'Uma primeira lição, quiz ou nível em 30 dias',
      cap: 'Até {{cap}} amigos recompensados por mês ({{count}} até agora)',
    },
    capped: 'Atingiste o limite deste mês. Novos amigos podem continuar a entrar; as recompensas voltam no próximo mês.',
    pending: 'Recompensas pendentes ({{count}})',
    nothingPending: 'Nada pendente. Quando um amigo entrar, vais ver aqui o que ainda lhe falta fazer.',
    daysLeft_one: 'Falta {{count}} dia para se qualificar',
    daysLeft_other: 'Faltam {{count}} dias para se qualificar',
    daysLeft_many: 'Faltam {{count}} dias para se qualificar',
    readTerms: 'Ler os termos completos',
  },
  history: {
    title: 'Histórico de recompensas',
    creditsNow: 'Créditos de IA agora',
    fromInvites: 'de convites',
    welcome: 'Créditos de boas-vindas',
    inviter: '{{name}} entrou com o teu código',
    inviterUnknown: 'Um amigo entrou com o teu código',
    invitee: 'Bónus de convite de {{name}}',
    inviteeUnknown: 'Bónus de convite de um amigo',
    plan: 'Créditos mensais do plano',
    used: 'Usado: {{name}}',
    usedAi: 'Usado em geração com IA',
    plusA11y_one: '{{label}}, mais {{count}} crédito',
    plusA11y_other: '{{label}}, mais {{count}} créditos',
    plusA11y_many: '{{label}}, mais {{count}} créditos',
    minusA11y_one: '{{label}}, menos {{count}} crédito',
    minusA11y_other: '{{label}}, menos {{count}} créditos',
    minusA11y_many: '{{label}}, menos {{count}} créditos',
    note: 'Os créditos de IA servem para gerar pacotes de estudo, vídeos e respostas do tutor. São diferentes das moedas e não podem ser trocados por dinheiro.',
  },
  terms: {
    title: 'Termos dos convites',
    intro: 'Em resumo: convida amigos reais, ajuda-os a começar a aprender e ambos recebem um bónus.',
    heading: '{{number}}. {{title}}',
    sections: {
      reward: {
        title: 'A recompensa',
        points: {
          credits: 'Quando um amigo entra com o teu código e se qualifica, cada um recebe {{credits}} créditos de IA.',
          automatic: 'Os créditos são adicionados automaticamente. Não tens de fazer nada.',
          noCash: 'Os créditos de IA não têm valor em dinheiro e não podem ser transferidos, vendidos nem trocados por moedas ou dinheiro.',
        },
      },
      qualifies: {
        title: 'Quem se qualifica',
        points: {
          new: 'O teu amigo tem de estar a criar uma conta Knowzone totalmente nova e introduzir o teu código ao criar a conta.',
          verify: 'Tem de verificar o email (ou entrar com Google ou Apple).',
          activity:
            'Tem de terminar uma atividade de aprendizagem real (uma lição de curso, um quiz ou um nível do Knowzone World) até 30 dias depois de entrar.',
          oneCode: 'Cada conta nova pode usar um código de convite.',
        },
      },
      limits: {
        title: 'Limites',
        points: {
          monthly:
            'Podes ganhar recompensas por até 10 amigos em cada mês do calendário. Amigos além disso podem entrar na mesma; só o bónus é que não se aplica.',
          campaign: 'Os códigos de campanha (por exemplo, de um cartaz ou evento) podem expirar. Os códigos pessoais não.',
        },
      },
      fairUse: {
        title: 'Uso justo',
        points: {
          self: 'Não te podes convidar a ti mesmo, usar várias contas nem criar contas para outras pessoas.',
          device: 'Convites feitos a partir do mesmo dispositivo, ou que pareçam automáticos, são marcados como “não elegível”.',
          reverse:
            'O Knowzone pode anular recompensas obtidas quebrando estas regras e pode alterar este programa com aviso na app.',
        },
      },
      privacy: {
        title: 'Privacidade',
        points: {
          names:
            'O teu amigo vê o teu nome próprio e a inicial do apelido. Tu vês os dele, e em que passo dos acima ele está.',
          contacts: 'O Knowzone nunca lê os teus contactos nem envia mensagens em teu nome.',
        },
      },
    },
    updated: 'Última atualização: 1 de outubro de 2026. Estes termos complementam os Termos de Serviço do Knowzone.',
    fullTerms: 'Termos de Serviço completos',
  },
};

export default referrals;
