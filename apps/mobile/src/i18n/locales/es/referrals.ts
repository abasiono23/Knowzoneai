import type { Translation } from '../../types';
import type en from '../en/referrals';

const referrals: Translation<typeof en> = {
  eyebrow: 'INVITACIONES',
  inviteEyebrow: 'INVITA A AMIGOS',
  errors: {
    load: 'No se pudieron cargar tus invitaciones',
  },
  status: {
    pending: 'Pendiente',
    confirmed: 'Recompensado',
    rejected: 'No válido',
  },
  templates: {
    buddy: {
      label: 'Compañero de estudio',
      text: 'Estoy estudiando con Knowzone AI: convierte apuntes en resúmenes, tarjetas de memoria y quizzes en un minuto. Únete con mi código {{code}} y los dos recibiremos {{credits}} créditos de IA gratis: {{link}}',
    },
    exams: {
      label: 'Preparar exámenes',
      text: 'Preparar WAEC/JAMB es mucho más fácil con Knowzone AI: quizzes de práctica, un tutor de IA y lecciones en video cortas. Usa mi código {{code}} para recibir {{credits}} créditos de IA extra: {{link}}',
    },
    game: {
      label: 'Knowzone World',
      text: '¡Ven a retarme en Knowzone World! 🪐 Batallas de quiz, jefes finales y acertijos, todo con nuestras asignaturas del cole. Regístrate con mi código {{code}} (+{{credits}} créditos de IA para cada uno): {{link}}',
    },
  },
  emailSubject: 'Estudia conmigo en Knowzone AI',
  milestones: {
    firstFriend: { title: 'Primer amigo', reward: 'Insignia de primer amigo' },
    studyCircle: { title: 'Círculo de estudio', reward: 'Insignia de círculo de estudio' },
    classCaptain: { title: 'Delegado de clase', reward: 'Insignia de delegado de clase' },
    ambassador: { title: 'Embajador de Knowzone', reward: 'Insignia de embajador' },
  },
  invalid: {
    notFound: {
      title: 'No encontramos ese código',
      body: 'Comprueba cómo se escribe con tu amigo. Los códigos tienen de 6 a 8 letras y números, como ADA2026.',
    },
    expired: {
      title: 'Esta invitación ha caducado',
      body: 'Ese código era de una campaña que ya terminó. Pídele a tu amigo su código personal; esos nunca caducan.',
    },
    ownCode: {
      title: 'Ese es tu propio código',
      body: 'No puedes invitarte a ti mismo, pero puedes compartirlo con amigos desde la pantalla Invitar amigos.',
    },
    alreadyReferred: {
      title: 'Ya usaste una invitación',
      body: 'Cada cuenta nueva puede usar un código de invitación. El primero que usaste sigue activo.',
    },
    notNew: {
      title: 'Las invitaciones son para estudiantes nuevos',
      body: 'Los códigos de invitación solo funcionan al crear una cuenta nueva. Aun así, puedes invitar a amigos con tu propio código.',
    },
    capReached: {
      title: 'Tu amigo alcanzó el límite de este mes',
      body: 'Cada estudiante puede ganar recompensas por invitar a hasta 10 amigos al mes. Puedes unirte igual; solo que no se aplicará el bono.',
    },
  },
  steps: {
    joined: 'Se unió con tu código',
    verified: 'Verificó su correo',
    qualified: 'Terminó una primera lección, quiz o nivel',
    reward: '+{{credits}} créditos de IA para cada uno',
    waiting: 'En espera',
    paid: 'Pagado',
  },
  dashboard: {
    title: 'Invitaciones',
    headline: 'Regala {{credits}}, recibe {{credits}}',
    body: 'Cuando un amigo se une con tu código y termina su primera lección, quiz o nivel, ambos reciben {{credits}} créditos de IA.',
    codeA11y: 'Tu código {{code}}. Abrir código y enlace',
    yourCode: 'TU CÓDIGO',
    copyCode: 'Copiar código',
    copy: 'COPIAR',
    copied: 'COPIADO',
    invite: 'Invitar amigos',
    shareCode: 'Compartir mi código',
    pendingA11y: 'Tu recompensa de invitación pendiente',
    pendingTitle: 'Tu bono de bienvenida está pendiente',
    pendingBody: 'Termina tu primera lección, quiz o nivel para desbloquear +{{credits}} créditos por la invitación de {{name}}.',
    stats: {
      invited: 'invitados',
      pending: 'pendientes',
      rewarded: 'recompensados',
      credits: 'créditos',
    },
    thisMonth: 'Este mes',
    monthCount: '{{count}} de {{cap}} recompensas',
    monthCap: 'Puedes ganar recompensas por invitar a hasta {{cap}} amigos al mes.',
    friends: 'Tus amigos',
    seeProgress: 'Ver progreso',
    noFriends: 'Aún nadie se ha unido con tu código. Compártelo con un compañero de clase para empezar.',
    friendA11y: '{{name}}, {{status}}',
    joined: 'Se unió el {{date}}',
    links: {
      history: 'Historial de recompensas',
      eligibility: 'Requisitos',
      terms: 'Condiciones',
    },
  },
  code: {
    title: 'Tu código',
    brand: 'KNOWZONE AI · INVITACIÓN',
    codeA11y: 'Código {{code}}',
    credits: '{{credits}} créditos de IA gratis para ti y tu amigo',
    copyLinkA11y: 'Copiar enlace {{link}}',
    codeCopied: 'Código copiado',
    linkCopied: 'Enlace copiado',
    copyCode: 'Copiar código',
    copyLink: 'Copiar enlace',
    moreWays: 'Más formas de invitar',
    howTitle: 'Cómo lo usa tu amigo',
    how: {
      open: 'Abre tu enlace, o descarga Knowzone y toca «¿Tienes un código de invitación?»',
      enter: 'Introduce tu código al crear su cuenta.',
      finish: 'Termina su primera lección, quiz o nivel de Knowzone World.',
      reward: 'Ambos reciben {{credits}} créditos de IA automáticamente.',
    },
    neverExpires: 'Tu código personal nunca caduca.',
  },
  invite: {
    title: 'Invitar amigos',
    intro: 'Elige un mensaje y luego cómo enviarlo. Tu código y tu enlace se añaden automáticamente.',
    preview: 'VISTA PREVIA DEL MENSAJE',
    channels: {
      whatsapp: 'WhatsApp',
      sms: 'SMS',
      email: 'Correo electrónico',
      copy: 'Copiar mensaje',
      more: 'Más apps',
    },
    sendWith: 'Enviar con {{channel}}',
    copied: 'Mensaje copiado. Pégalo donde quieras',
    cantOpen: 'No se pudo abrir {{channel}} en este dispositivo',
    sent_one: 'Has enviado {{count}} invitación desde este teléfono. Tus amigos aparecen en tu panel en cuanto se unen.',
    sent_other:
      'Has enviado {{count}} invitaciones desde este teléfono. Tus amigos aparecen en tu panel en cuanto se unen.',
    sent_many:
      'Has enviado {{count}} invitaciones desde este teléfono. Tus amigos aparecen en tu panel en cuanto se unen.',
    noneSent: 'Aún no has enviado ninguna invitación. Tus amigos aparecen en tu panel en cuanto se unen.',
    privacy: 'Invita solo a personas que conoces. Knowzone nunca lee tus contactos ni envía mensajes a tus amigos por ti.',
  },
  progress: {
    title: 'Progreso',
    milestones: 'Logros',
    rewarded_one: '{{count}} amigo recompensado',
    rewarded_other: '{{count}} amigos recompensados',
    rewarded_many: '{{count}} amigos recompensados',
    next_one: '{{count}} más para <b>{{title}}</b> · {{reward}}',
    next_other: '{{count}} más para <b>{{title}}</b> · {{reward}}',
    next_many: '{{count}} más para <b>{{title}}</b> · {{reward}}',
    allDone: 'Todos los logros desbloqueados. ¡Eres embajador de Knowzone!',
    all: 'Todos',
    filter: '{{label}} ({{count}})',
    empty: 'Aún no hay amigos aquí',
    emptyBody: 'Los amigos que se unan con tu código aparecerán aquí con cada paso hasta la recompensa.',
    invite: 'Invitar amigos',
    remind: 'Recuérdale a {{name}} que termine una primera lección dentro de los 30 días desde que se unió.',
  },
  eligibility: {
    title: 'Requisitos',
    fullTitle: 'Requisitos y pendientes',
    yourInvite: 'TU INVITACIÓN',
    invitedBy: 'Te invitó {{name}}',
    oneStep:
      'Te queda un paso: termina cualquier lección, quiz o nivel de Knowzone World y tú y {{name}} recibirán {{credits}} créditos de IA.',
    verifyFirst: 'Primero verifica tu correo y luego termina cualquier lección, quiz o nivel.',
    play: 'Jugar',
    courses: 'Cursos',
    done: '¡Listo! Tu bono de bienvenida se ha añadido a tus créditos de IA.',
    howQualify: 'Cómo cumplen los requisitos tus amigos',
    rules: {
      new: 'Tus amigos deben ser nuevos en Knowzone y usar tu código al registrarse',
      verified: 'Correo verificado (o inicio de sesión con Google / Apple)',
      activity: 'Una primera lección, quiz o nivel en un plazo de 30 días',
      cap: 'Hasta {{cap}} amigos recompensados al mes ({{count}} por ahora)',
    },
    capped: 'Has alcanzado el límite de este mes. Tus amigos pueden seguir uniéndose; las recompensas se reanudan el mes que viene.',
    pending: 'Recompensas pendientes ({{count}})',
    nothingPending: 'No hay nada pendiente. Cuando un amigo se una, aquí verás lo que le falta por hacer.',
    daysLeft_one: 'Queda {{count}} día para cumplir los requisitos',
    daysLeft_other: 'Quedan {{count}} días para cumplir los requisitos',
    daysLeft_many: 'Quedan {{count}} días para cumplir los requisitos',
    readTerms: 'Leer las condiciones completas',
  },
  history: {
    title: 'Historial de recompensas',
    creditsNow: 'Créditos de IA actuales',
    fromInvites: 'por invitaciones',
    welcome: 'Créditos de bienvenida',
    inviter: '{{name}} se unió con tu código',
    inviterUnknown: 'Un amigo se unió con tu código',
    invitee: 'Bono de invitación de {{name}}',
    inviteeUnknown: 'Bono de invitación de un amigo',
    plan: 'Créditos mensuales del plan',
    used: 'Usado: {{name}}',
    usedAi: 'Usado en generación con IA',
    plusA11y_one: '{{label}}, más {{count}} crédito',
    plusA11y_other: '{{label}}, más {{count}} créditos',
    plusA11y_many: '{{label}}, más {{count}} créditos',
    minusA11y_one: '{{label}}, menos {{count}} crédito',
    minusA11y_other: '{{label}}, menos {{count}} créditos',
    minusA11y_many: '{{label}}, menos {{count}} créditos',
    note: 'Los créditos de IA se usan para generar paquetes de estudio, videos y respuestas del tutor. Son distintos de las monedas y no se pueden cambiar por dinero.',
  },
  terms: {
    title: 'Condiciones de las invitaciones',
    intro: 'En resumen: invita a amigos de verdad, ayúdales a empezar a aprender y ambos recibirán un bono.',
    heading: '{{number}}. {{title}}',
    sections: {
      reward: {
        title: 'La recompensa',
        points: {
          credits: 'Cuando un amigo se une con tu código y cumple los requisitos, cada uno recibe {{credits}} créditos de IA.',
          automatic: 'Los créditos se añaden automáticamente. No hay nada que reclamar.',
          noCash: 'Los créditos de IA no tienen valor monetario y no se pueden transferir, vender ni cambiar por monedas o dinero.',
        },
      },
      qualifies: {
        title: 'Quién cumple los requisitos',
        points: {
          new: 'Tu amigo debe estar creando una cuenta de Knowzone totalmente nueva e introducir tu código durante el registro.',
          verify: 'Debe verificar su correo (o iniciar sesión con Google o Apple).',
          activity:
            'Debe terminar una actividad de aprendizaje real (una lección de curso, un quiz o un nivel de Knowzone World) dentro de los 30 días desde que se unió.',
          oneCode: 'Cada cuenta nueva puede usar un código de invitación.',
        },
      },
      limits: {
        title: 'Límites',
        points: {
          monthly:
            'Puedes ganar recompensas por hasta 10 amigos cada mes natural. Los amigos que superen ese número pueden unirse igual; solo que no se aplicará el bono.',
          campaign: 'Los códigos de campaña (por ejemplo, de un cartel o un evento) pueden caducar. Los códigos personales no.',
        },
      },
      fairUse: {
        title: 'Uso justo',
        points: {
          self: 'No puedes invitarte a ti mismo, usar varias cuentas ni crear cuentas para otras personas.',
          device: 'Las invitaciones desde el mismo dispositivo, o que parezcan automatizadas, se marcan como «no válidas».',
          reverse:
            'Knowzone puede anular las recompensas obtenidas incumpliendo estas normas y puede cambiar este programa avisando en la app.',
        },
      },
      privacy: {
        title: 'Privacidad',
        points: {
          names:
            'Tu amigo ve tu nombre y la inicial de tu apellido. Tú ves los suyos, además de en qué paso de los anteriores está.',
          contacts: 'Knowzone nunca lee tus contactos ni envía mensajes en tu nombre.',
        },
      },
    },
    updated: 'Última actualización: 1 de octubre de 2026. Estas condiciones se suman a los Términos del servicio de Knowzone.',
    fullTerms: 'Términos del servicio completos',
  },
};

export default referrals;
