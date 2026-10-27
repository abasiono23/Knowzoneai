/** Knowzone World Business District (French): walking around the square, its five places and the five business games. */
import type { Translation } from '../../types';
import type en from '../en/business';

const business: Translation<typeof en> = {
  title: 'Quartier des affaires',
  entryEyebrow: 'ÉCONOMIE & FINANCE · NOUVEAU',
  entryTitle: 'Quartier des affaires',
  entryBody:
    'Dirige une start-up, maîtrise un budget, fixe les prix d’un stand, rends une usine rentable et investis de l’argent fictif',
  leave: 'Quitter le Quartier des affaires',
  offline:
    'Le Quartier des affaires a besoin d’une connexion Internet, car chaque décision est calculée sur notre serveur.',
  result: {
    back: 'Retour au Quartier des affaires',
  },
  hall: {
    walkTo: 'Aller vers : {{station}}',
    you: 'Toi, avec ton blazer Knowzone',
    open: 'Entrer : {{station}}',
    goHere: 'Aller ici',
    stars: '{{count}} étoiles sur {{max}}',
    tip: 'Marche vers un bâtiment pour lancer un jeu. Touche un nom pour y aller.',
  },
  stations: {
    startup: 'QG des start-up',
    budget: 'Banque du budget',
    market: 'Place du marché',
    factory: 'Usine à profits',
    exchange: 'Bourse',
  },
  games: {
    'startup-tycoon': {
      name: 'Magnat de la start-up',
      how: 'Dirige ta propre entreprise mois après mois : embauche des fabricants, des vendeurs et du personnel de soutien, investis dans le marketing et prends des décisions de gestion difficiles. Fais grandir sa valeur sans tomber à court de trésorerie.',
    },
    'budget-master': {
      name: 'Maître du budget',
      how: 'Planifie un salaire mensuel : paie les factures, mange bien, épargne pour un objectif, constitue un fonds d’urgence et gère les imprévus sans t’endetter.',
    },
    'market-master': {
      name: 'Maître du marché',
      how: 'Tiens un stand au marché : choisis ton prix et la quantité de stock à acheter chaque jour, alors que la météo, la foule et un concurrent font varier la demande.',
    },
    'profit-quest': {
      name: 'Quête du profit',
      how: 'Maîtrise les maths d’une entreprise (marges, seuil de rentabilité, bénéfice), puis dirige une usine semaine après semaine : fixe le prix, la quantité à produire et le moment d’investir.',
    },
    'market-simulator': {
      name: 'Simulateur boursier',
      how: 'Investis de l’argent fictif dans des entreprises inventées, des obligations et un fonds indiciel. L’actualité fait bouger le marché : répartis ton risque et découvre comment fonctionne l’investissement. Pas d’argent réel.',
    },
  },

  ui: {
    money: '${{amount}}',
    minus: '−${{amount}}',
    perMonth: '${{amount}}/mois',
    next: 'Suivant',
    finish: 'Voir les résultats',
    best: 'Meilleur choix',
    good: 'Bon choix',
    fair: 'Choix correct',
    poor: 'Mauvais choix',
    bestWas: 'Le meilleur choix était : {{choice}}',
    lesson: 'LEÇON D’ÉCONOMIE',
    left: 'Reste à planifier : ${{amount}}',
    over: 'Dépassement de ${{amount}}',
    points: '+{{points}} points',
    more: 'Plus',
    less: 'Moins',
    pick: 'Choisis d’abord une option.',
    unbalanced: 'Planifie chaque dollar : le total doit correspondre exactement.',
    invalid: 'Ce plan n’est pas autorisé. Vérifie les chiffres.',
  },

  // ─── Startup Tycoon ────────────────────────────────────────────────────────
  startup: {
    companies: {
      bakery: 'Boulangerie-Café Soleil Levant',
      repair: 'FixIt Réparation de téléphones',
      apps: 'Pixel Studio d’applis',
      fashion: 'Thread, marque de mode',
      solar: 'BrightSun Installateurs solaires',
    },
    sale: {
      bakery: 'gâteaux et cafés',
      repair: 'réparations',
      apps: 'projets d’applis',
      fashion: 'vêtements',
      solar: 'installations',
    },
    month: 'Mois {{n}} sur {{total}}',
    goal: 'Objectif : ta part vaut ${{goal}}',
    value: 'Valeur de l’entreprise',
    cash: 'Trésorerie',
    morale: 'Moral',
    rep: 'Réputation',
    owned: 'Tu possèdes {{pct}} %',
    decision: 'DÉCISION DU MOIS',
    team: 'TON ÉQUIPE',
    roles: {
      maker: 'Fabricants',
      seller: 'Vendeurs',
      support: 'Soutien',
    },
    roleHint: {
      maker: 'Chacun produit environ {{n}} {{sale}} par mois',
      seller: 'Chacun amène environ {{n}} clients de plus par mois',
      support: 'Gère l’administratif et les clients ; chacun s’occupe de 4 collègues',
    },
    salary: '${{amount}}/mois chacun',
    hireCost: 'Coût d’embauche : ${{amount}} (recrutement et formation)',
    payroll: 'Masse salariale : ${{amount}}/mois',
    marketing: 'MARKETING CE MOIS-CI',
    none: 'Aucun',
    run: 'Lancer le mois',
    report: 'BILAN DU MOIS {{n}}',
    statement: {
      revenue: 'Chiffre d’affaires (ventes)',
      cogs: 'Coût des ventes',
      gross: 'Marge brute ({{pct}} % de marge)',
      payroll: 'Salaires',
      rent: 'Loyer',
      marketing: 'Marketing',
      other: 'Coûts et revenus ponctuels',
      loan: 'Remboursement du prêt',
      net: 'Bénéfice net',
      cash: 'Trésorerie en banque',
      runway: 'À ce rythme, la trésorerie tient encore {{count}} mois',
    },
    ops: {
      line: '{{demand}} clients voulaient acheter · ton équipe pouvait en servir {{capacity}} · tu as vendu {{sold}}',
      order: 'Plus une commande spéciale de {{count}}',
      turnedAway: 'Tu as dû refuser {{count}} clients. Plus de fabricants t’auraient fait gagner plus.',
      idle: 'Tes fabricants avaient du temps libre. Plus de vendeurs ou de marketing amèneraient des clients.',
      balanced: 'La production de ton équipe correspondait bien à la demande.',
      overload: 'Ton équipe est trop grande pour son personnel de soutien : tout le monde a ralenti.',
      saturated: 'Ton marché se sature : chaque vendeur en plus amène moins de nouveaux clients.',
    },
    bankrupt:
      'Plus de trésorerie ! Une entreprise peut être rentable sur le papier et quand même échouer si elle manque d’argent.',
    dilemmas: {
      poach: {
        title: 'Ton meilleur fabricant s’en va ?',
        body: 'Une entreprise concurrente propose à ton fabricant le plus doué un poste mieux payé. Il préférerait rester, mais il a besoin d’une augmentation.',
        options: {
          match: 'Augmenter chaque fabricant de 120 $/mois',
          letGo: 'Lui souhaiter bonne chance et le laisser partir',
          threaten: 'Lui dire qu’il regrettera de partir',
        },
        lesson:
          'Remplacer un bon employé coûte généralement bien plus cher que de le garder : recrutement, formation et production perdue pendant que le nouveau apprend. Un salaire juste garde tes meilleurs éléments et le moral au beau fixe.',
      },
      bigOrder: {
        title: 'Une énorme commande, avec une grosse remise',
        body: 'Un gros client veut une grande commande ce mois-ci, mais seulement à 40 % de moins que ton prix normal.',
        options: {
          negotiate: 'Négocier : une commande plus petite à −15 %',
          accept: 'Accepter la remise de 40 %',
          decline: 'Refuser poliment',
        },
        lesson:
          'Une remise se prend directement sur ta marge bénéficiaire. Avant de dire oui, vérifie que le prix couvre encore le coût de fabrication de chaque article et que tu as de la capacité libre. Négocier, c’est normal en affaires.',
      },
      review: {
        title: 'Un avis en ligne furieux',
        body: 'Un client écrit que ton service était lent et impoli. D’autres personnes le lisent.',
        options: {
          fix: 'S’excuser publiquement, régler le problème et le rembourser',
          ignore: 'L’ignorer, ça sera vite oublié',
          argue: 'Répondre que le client ment',
        },
        lesson:
          'Ta réputation fait revenir les clients et les pousse à te recommander. Une réponse publique et honnête à une plainte inspire souvent plus confiance que l’absence de plaintes.',
      },
      burnout: {
        title: 'L’équipe est épuisée',
        body: 'Après des semaines d’heures supplémentaires, ton personnel est fatigué et fait des erreurs.',
        options: {
          rest: 'Donner à tous un jour de congé payé et prendre de l’aide temporaire',
          pizza: 'Offrir des pizzas à l’équipe',
          push: 'Demander encore plus d’heures sup ce mois-ci',
        },
        lesson:
          'Les gens fatigués produisent moins et démissionnent plus. Pousser plus fort donne un petit regain de production, mais te coûte ensuite en moral et en départs. Les bons managers protègent l’énergie de leur équipe.',
      },
      agency: {
        title: 'Une promesse de marketing « viral »',
        body: 'Une agence promet qu’une campagne à 2 000 $ te rendra célèbre du jour au lendemain.',
        options: {
          test: 'Faire un petit test à 300 $ et mesurer les résultats',
          pay: 'Payer les 2 000 $',
          skip: 'Laisser tomber',
        },
        lesson:
          'Teste avant de dépenser gros. Un petit essai mesuré montre si le marketing amène vraiment des clients, pour n’amplifier que ce qui marche. Les grandes promesses ne sont pas des preuves.',
      },
      fancyOffice: {
        title: 'Un nouveau bureau chic ?',
        body: 'Tu pourrais déménager dans un bureau stylé avec une salle de jeux. Le déménagement coûte 2 500 $ et le loyer est 30 % plus cher.',
        options: {
          stay: 'Rester, et dépenser pour ce que les clients remarquent',
          move: 'Emménager, l’équipe va adorer',
        },
        lesson:
          'Les coûts fixes comme le loyer se paient chaque mois, que tu vendes ou non. Garde-les bas, surtout au début, pour que ton entreprise survive aux mois creux.',
      },
      sponsor: {
        title: 'Sponsoriser la journée sportive de l’école ?',
        body: 'Une école du quartier te demande de sponsoriser sa journée sportive pour 300 $. Ton nom serait sur les T-shirts.',
        options: {
          sponsor: 'La sponsoriser',
          decline: 'Refuser poliment',
        },
        lesson:
          'Soutenir ta communauté crée de la sympathie et fait connaître ta marque localement. C’est une forme de marketing qui fait aussi du bien.',
      },
      supplier: {
        title: 'Ton fournisseur augmente ses prix',
        body: 'Les matériaux que tu achètes coûtent maintenant 20 % de plus.',
        options: {
          shop: 'Comparer d’autres fournisseurs et négocier',
          raise: 'Répercuter le coût : augmenter ton prix de 8 %',
          cheap: 'Passer à des matériaux bien moins chers et de moindre qualité',
        },
        lesson:
          'Quand les coûts montent, compare et négocie d’abord. Baisser la qualité protège ta marge un mois, mais abîme ta réputation bien plus longtemps.',
      },
      latePayer: {
        title: 'Un client n’a pas payé',
        body: 'Un gros client te doit encore 1 500 $ depuis 60 jours, et la trésorerie se resserre.',
        options: {
          remind: 'Envoyer un rappel poli et offrir une petite remise pour un paiement immédiat',
          wait: 'Attendre en espérant qu’il paie',
          threaten: 'Le menacer d’avocats',
        },
        lesson:
          'Le bénéfice, ce n’est pas la trésorerie. L’argent que les clients te doivent (les créances) ne paie pas tes factures tant qu’il n’est pas arrivé. Relancer poliment et vite garde le flux de trésorerie en mouvement.',
      },
      newLine: {
        title: 'Une idée de nouveau produit',
        body: 'Quelqu’un de l’équipe a une idée de nouvelle gamme de produits.',
        options: {
          pilot: 'Faire d’abord un petit test avec quelques clients',
          bigLaunch: 'La lancer en grand avec beaucoup de stock et de pubs',
          later: 'Pas maintenant',
        },
        lesson:
          'L’innovation fait grandir une entreprise, mais lancer petit te permet d’apprendre ce que veulent vraiment les clients avant de risquer beaucoup d’argent. On appelle ça un pilote ou un produit minimum viable.',
      },
      training: {
        title: 'Former l’équipe ?',
        body: 'Une formation à 500 $ rendrait ton personnel plus rapide et plus compétent.',
        options: {
          train: 'Payer la formation',
          free: 'Partager plutôt des vidéos gratuites en ligne',
          skip: 'Pas de formation',
        },
        lesson:
          'La formation est un investissement dans les gens : un personnel compétent produit plus et se sent valorisé, ce qui rembourse le coût dans les mois qui suivent.',
      },
      loan: {
        title: 'Un prêt bancaire',
        body: 'La banque propose 4 000 $, remboursés à 190 $ par mois (environ 12 % d’intérêts par an).',
        options: {
          machine: 'Emprunter pour acheter une machine qui produit 25 % de plus',
          party: 'Emprunter pour une fête d’équipe et de nouveaux meubles',
          no: 'Ne pas emprunter',
        },
        lesson:
          'Une bonne dette finance ce qui rapporte plus que les intérêts, comme un équipement qui augmente la production. Emprunter pour ce qui ne rapporte rien te laisse juste des remboursements.',
      },
      rent: {
        title: 'Le propriétaire augmente le loyer',
        body: 'Ton propriétaire veut 25 % de loyer en plus dès le mois prochain.',
        options: {
          lease: 'Proposer un bail plus long contre une hausse plus faible',
          accept: 'Accepter la hausse',
          moveFar: 'Déménager dans un local moins cher, loin de tes clients',
        },
        lesson:
          'Presque tout se négocie en affaires. Offrir quelque chose que l’autre partie apprécie (un bail long et sûr) peut t’obtenir un meilleur accord. L’emplacement compte aussi : s’éloigner des clients fait perdre des ventes.',
      },
      competitor: {
        title: 'Un concurrent ouvre à côté',
        body: 'Une nouvelle entreprise ouvre plus bas dans la rue, avec des prix plus bas.',
        options: {
          quality: 'Miser sur la qualité et le service, avec une carte de fidélité',
          priceWar: 'Baisser tes prix de 25 % pour les battre',
          nothing: 'Ne rien faire',
        },
        lesson:
          'Une guerre des prix peut détruire les bénéfices des deux entreprises. Il est souvent plus malin de miser sur ce qui te distingue : qualité, service et clients fidèles.',
      },
      safety: {
        title: 'Une inspection de sécurité',
        body: 'Un inspecteur trouve un problème de sécurité sur ton lieu de travail.',
        options: {
          fixNow: 'Le réparer correctement tout de suite',
          later: 'Bricoler une solution pas chère et réparer plus tard',
        },
        lesson:
          'Les entreprises doivent protéger leurs employés et leurs clients. Régler les problèmes tôt coûte moins cher que les amendes, les accidents et une réputation abîmée.',
      },
      remote: {
        title: 'Télétravail ?',
        body: 'Ton personnel demande à travailler de chez soi certains jours.',
        options: {
          trial: 'Essayer un mois et mesurer les résultats',
          refuse: 'Refuser',
          always: 'L’autoriser pour tous, tous les jours, sans contrôle',
        },
        lesson:
          'La flexibilité peut remonter le moral, mais les bons managers testent les changements et mesurent l’effet sur la production avant de décider pour de bon.',
      },
      investor: {
        title: 'Un investisseur veut entrer',
        body: 'Un investisseur propose 10 000 $ en échange de 40 % de ton entreprise.',
        options: {
          counter: 'Contre-proposer : 8 000 $ pour 20 %',
          accept: 'Accepter 10 000 $ pour 40 %',
          refuse: 'Refuser et grandir avec ton propre argent',
        },
        lesson:
          'Vendre des parts (des fonds propres) apporte de l’argent sans dette, mais tu cèdes une partie de chaque bénéfice futur et de la valeur de l’entreprise. On appelle ça la dilution. Négocie le prix de tes parts.',
      },
      tax: {
        title: 'L’impôt est à payer',
        body: 'Tu dois 700 $ d’impôts sur ton entreprise ce mois-ci.',
        options: {
          pay: 'Le payer à temps',
          plan: 'Demander un échéancier officiel',
          ignore: 'L’ignorer pour l’instant',
        },
        lesson:
          'Les impôts financent les routes, les écoles et les hôpitaux, et chaque entreprise doit les payer. Les retards entraînent des pénalités : les entreprises avisées mettent de côté pour l’impôt au fur et à mesure.',
      },
      bigClient: {
        title: 'Un client géant',
        body: 'Un très gros client propose d’acheter la moitié de ta production, mais seulement si tu laisses tomber tes autres clients.',
        options: {
          balance: 'Accepter un accord plus petit et garder tes autres clients',
          allIn: 'Laisser tomber tous les autres et signer',
          decline: 'Refuser',
        },
        lesson:
          'Dépendre d’un seul client est risqué : s’il part, l’essentiel de ton activité part avec lui. Répartir les ventes sur beaucoup de clients rend une entreprise plus solide.',
      },
      ethics: {
        title: 'Un « cadeau » secret',
        body: 'Un fournisseur t’offre un cadeau personnel secret si tu continues à lui acheter à des prix plus élevés.',
        options: {
          refuse: 'Refuser et le signaler',
          accept: 'Accepter le cadeau',
        },
        lesson:
          'Ce cadeau est un pot-de-vin. Il coûte de l’argent à ton entreprise, il est souvent illégal et il détruit la confiance. Les entreprises éthiques durent plus longtemps.',
      },
    },
  },

  // ─── Budget Master ─────────────────────────────────────────────────────────
  budget: {
    month: 'Mois {{n}} sur {{total}}',
    income: 'Revenu ce mois-ci',
    bills: 'FACTURES (À PAYER)',
    afterBills: 'Reste après les factures',
    plan: 'TON PLAN',
    billNames: {
      rent: 'Loyer',
      utilities: 'Électricité et eau',
      phone: 'Téléphone et données',
      transport: 'Transport',
      minimum: 'Paiement minimum de la carte',
      subscription: 'Abonnement streaming',
      bankFees: 'Frais bancaires',
      carDeal: 'Mensualité de voiture',
    },
    keys: {
      food: 'Nourriture',
      fun: 'Loisirs',
      clothes: 'Vêtements',
      emergency: 'Fonds d’urgence',
      goal: 'Objectif d’épargne',
      debt: 'Remboursement carte en plus',
    },
    keyHint: {
      food: 'Il te faut au moins ${{min}}',
      fun: 'Sorties, jeux, petits plaisirs',
      clothes: 'Nouveaux vêtements et chaussures',
      emergency: '${{have}} épargnés · objectif ${{target}}',
      goal: '{{goal}} : ${{have}} sur ${{target}}',
      debt: 'Dette de carte ${{have}} · {{rate}} % d’intérêts par mois',
    },
    goals: {
      laptop: 'Nouvel ordinateur portable',
      bike: 'Vélo',
      course: 'Cours de programmation',
      travel: 'Voyage',
      deposit: 'Caution d’appartement',
    },
    rule: 'Besoins {{needs}} % · Envies {{wants}} % · Épargne {{savings}} %',
    ruleHint: 'Un bon repère : besoins environ 50 %, envies jusqu’à 30 %, épargne au moins 20 %.',
    restToGoal: 'Mettre le reste en épargne',
    event: 'CE MOIS-CI',
    costFrom: {
      fun: '−${{amount}} sur l’argent des loisirs',
      emergency: '−${{amount}} sur le fonds d’urgence',
      goal: '−${{amount}} sur l’épargne',
      card: '−${{amount}} sur la carte de crédit',
    },
    gain: '+${{amount}} à l’épargne',
    newBill: '+${{amount}} chaque mois',
    run: 'Vivre le mois',
    report: 'BILAN DU MOIS {{n}}',
    check: {
      food: 'Bien mangé',
      noFood: 'Pas assez pour manger',
      saved: '{{pct}} % du revenu épargné',
      wants: '{{pct}} % dépensé en envies',
      card: '${{amount}} mis sur la carte de crédit',
      interest: 'Intérêts de la carte ce mois-ci : ${{amount}}',
      debt: 'Dette de carte actuelle : ${{amount}}',
      emergency: 'Fonds d’urgence : ${{amount}}',
      goal: 'Objectif d’épargne : ${{amount}} sur ${{target}}',
    },
    events: {
      concert: {
        title: 'Invitation à un concert',
        body: 'Un ami t’invite à un concert. Les billets coûtent 80 $.',
        options: {
          funMoney: 'Y aller, en payant avec l’argent des loisirs',
          freePlan: 'Proposer plutôt un pique-nique gratuit',
          card: 'Y aller, et payer avec la carte de crédit',
        },
        lesson:
          'Se faire plaisir fait partie d’un budget sain : c’est à ça que sert l’argent des loisirs. Payer tes envies à crédit, c’est payer des intérêts sur une soirée pendant des mois.',
      },
      phone: {
        title: 'Écran de téléphone fissuré',
        body: 'Tu fais tomber ton téléphone. La réparation de l’écran coûte 150 $.',
        options: {
          emergency: 'Payer avec ton fonds d’urgence',
          card: 'Payer avec la carte de crédit',
          newPhone: 'Acheter un téléphone neuf à 700 $ à crédit',
        },
        lesson:
          'C’est exactement à ça que sert un fonds d’urgence : les imprévus qu’on ne peut pas éviter. Réparer coûte généralement bien moins cher que remplacer.',
      },
      sale: {
        title: '« −50 %, aujourd’hui seulement ! »',
        body: 'Une boutique fait une vente flash sur des baskets dont tu n’as pas vraiment besoin : 120 $.',
        options: {
          skip: 'Laisser passer',
          funMoney: 'Les acheter avec l’argent des loisirs',
          card: 'Les acheter avec la carte de crédit',
        },
        lesson:
          'Une remise sur un truc dont tu n’as pas besoin n’est pas une économie, c’est une dépense. « Aujourd’hui seulement » est fait pour te presser. Attends un jour avant d’acheter une envie.',
      },
      gift: {
        title: 'L’anniversaire de maman',
        body: 'C’est l’anniversaire de ta mère ce mois-ci.',
        options: {
          funMoney: 'Un cadeau à 40 $ avec l’argent des loisirs',
          handmade: 'Une carte faite main et lui préparer le dîner',
          card: 'Un cadeau cher à 150 $ sur la carte de crédit',
        },
        lesson:
          'Attentionné ne veut pas dire cher. Les cadeaux font partie de tes dépenses prévues, pas de ta carte de crédit.',
      },
      bonus: {
        title: 'Une prime de 300 $ !',
        body: 'Ton responsable te donne une prime de 300 $ pour ton excellent travail.',
        options: {
          save: 'Tout épargner',
          split: 'Épargner 240 $ et profiter de 60 $',
          spend: 'Tout dépenser ce week-end',
        },
        lesson:
          'L’argent en plus est le plus facile à épargner, car tu vivais déjà sans. Épargner l’essentiel d’une rentrée inattendue et en profiter un peu, c’est une excellente habitude.',
      },
      scam: {
        title: '« Double ton argent en une semaine ! »',
        body: 'Un groupe de discussion promet de doubler tout l’argent que tu leur envoies en une semaine.',
        options: {
          ignore: 'L’ignorer et prévenir tes amis',
          invest: 'Leur envoyer 200 $ de ton épargne',
        },
        lesson:
          'Personne ne peut doubler de l’argent en une semaine sans risque. Des rendements élevés garantis, c’est le signe d’une arnaque : ton argent disparaît.',
      },
      bike: {
        title: 'Réparation du vélo',
        body: 'Le vélo que tu prends pour aller au travail a besoin d’une réparation à 220 $.',
        options: {
          emergency: 'Payer avec ton fonds d’urgence',
          card: 'Payer avec la carte de crédit',
          taxis: 'Ne pas réparer et prendre des taxis tout le mois (380 $)',
        },
        lesson:
          'Repousser une réparation nécessaire coûte souvent plus cher. Ton fonds d’urgence te permet de régler les problèmes vite, sans emprunter.',
      },
      subscription: {
        title: 'Fin de l’essai gratuit',
        body: 'Ton essai gratuit de streaming se termine. Désormais, il coûte 15 $ par mois.',
        options: { cancel: 'L’annuler', keep: 'Le garder' },
        lesson:
          'Les petits abonnements mensuels s’additionnent : 15 $ par mois, c’est 180 $ par an. Vérifie régulièrement tes abonnements et annule ceux que tu n’utilises pas.',
      },
      sideHustle: {
        title: 'Cours particuliers le week-end',
        body: 'Un voisin propose de te payer 150 $ pour donner des cours à son enfant le week-end.',
        options: {
          takeSave: 'Accepter et épargner ce que tu gagnes',
          decline: 'Refuser et garder tes week-ends',
        },
        lesson:
          'Un revenu d’appoint accélère tes objectifs. Épargner ce revenu en plus, au lieu de le dépenser, t’y mène bien plus vite.',
      },
      dentist: {
        title: 'Mal de dents',
        body: 'Tu as mal aux dents. Le dentiste coûte 180 $.',
        options: {
          emergency: 'Y aller maintenant, avec ton fonds d’urgence',
          card: 'Y aller maintenant, avec la carte de crédit',
          wait: 'Attendre que ça empire (450 $ plus tard)',
        },
        lesson:
          'Prendre soin de ta santé tôt coûte moins cher que soigner un plus gros problème plus tard. Ne renonce jamais à des soins nécessaires pour économiser.',
      },
      loanApp: {
        title: 'Appli de prêt instantané',
        body: 'Une appli te propose 500 $ tout de suite. Tu rembourserais 650 $ en deux semaines seulement.',
        options: { decline: 'Refuser', take: 'Accepter' },
        lesson:
          'Rembourser 650 $ pour 500 $ en deux semaines, c’est un taux d’intérêt énorme, bien plus élevé qu’une carte de crédit. Ce genre de prêt rapide piège les gens dans la dette.',
      },
      foodPrices: {
        title: 'Hausse des prix alimentaires',
        body: 'Les prix en magasin augmentent de 10 % ce mois-ci : la nourriture te coûte 30 $ de plus.',
        options: {
          cutWants: 'Dépenser moins en envies ce mois-ci',
          card: 'Mettre le surplus sur la carte de crédit',
        },
        lesson:
          'Quand les prix augmentent (l’inflation), ajuste ton budget en réduisant les envies, pas en empruntant pour les besoins.',
      },
      bankFees: {
        title: 'Frais bancaires',
        body: 'Ta banque te prélève 12 $ chaque mois, juste pour avoir un compte.',
        options: { switch: 'Passer à un compte gratuit', stay: 'Rester dans cette banque' },
        lesson:
          'Les frais grignotent ton argent en silence chaque mois. Comparer les banques et passer à un compte gratuit, c’est un gain facile.',
      },
      friendLoan: {
        title: 'Un ami a besoin d’argent',
        body: 'Un ami te demande de lui prêter 100 $ jusqu’au mois prochain.',
        options: {
          afford: 'Prêter 100 $ de l’argent des loisirs, dont tu peux te passer',
          kindNo: 'Lui expliquer gentiment que tu ne peux pas ce mois-ci',
          savings: 'Le prêter depuis ton fonds d’urgence',
        },
        lesson:
          'Ne prête que ce que tu peux te permettre de ne jamais revoir, et jamais depuis ton fonds d’urgence. Dire non gentiment, c’est bien aussi.',
      },
      matching: {
        title: 'De l’argent gratuit au travail',
        body: 'Ton employeur ajoute 1 $ à ton épargne retraite pour chaque 1 $ que tu y verses, jusqu’à 100 $ par mois.',
        options: { join: 'Adhérer : épargner 100 $ et recevoir 100 $ en plus', later: 'Peut-être plus tard' },
        lesson:
          'L’abondement de l’employeur, c’est un rendement immédiat de 100 % sur ton argent. C’est l’une des meilleures affaires en finances personnelles : prends-le toujours si tu peux.',
      },
      carDeal: {
        title: '« Seulement 250 $ par mois ! »',
        body: 'Un concessionnaire te propose une voiture rutilante pour « seulement 250 $ par mois » pendant six ans.',
        options: {
          decline: 'Refuser : tu n’as pas besoin de voiture',
          sign: 'Signer le contrat',
        },
        lesson:
          'Regarde le total, pas la mensualité : 250 $ × 72 mois, ça fait 18 000 $. Un long plan de paiement est un gros engagement.',
      },
    },
  },

  // ─── Market Master ─────────────────────────────────────────────────────────
  market: {
    products: {
      lemonade: 'Limonade',
      fruit: 'Coupes de fruits',
      icePops: 'Glaces à l’eau',
      sandwiches: 'Sandwichs',
    },
    day: 'Jour {{n}} sur {{total}}',
    costEach: 'Le stock coûte ${{cost}} l’unité',
    fee: 'Emplacement ${{fee}} par jour · le stock invendu est jeté',
    rival: 'Prix du stand concurrent : ${{price}}',
    research: 'ÉTUDE DE MARCHÉ',
    researchRow: 'À ${{price}} : environ {{count}} clients',
    noResearch: 'Pas d’étude aujourd’hui : utilise la météo et ce que tu as appris.',
    yesterday: 'Hier : prix ${{price}}, {{wanted}} clients voulaient acheter',
    price: 'Ton prix',
    stock: 'Stock à acheter',
    preview: 'Si tu vends tout : ${{revenue}} de ventes, ${{profit}} de bénéfice',
    open: 'Ouvrir le stand',
    report: 'BILAN DU JOUR {{n}}',
    line: {
      wanted: '{{count}} clients voulaient acheter',
      sold: 'Tu en as vendu {{count}}',
      wasted: '{{count}} jetés invendus',
      missed: '{{count}} clients repartis les mains vides',
      revenue: 'Ventes',
      stock: 'Stock acheté',
      fee: 'Emplacement',
      profit: 'Bénéfice',
      best: 'Meilleur choix du jour : ${{price}} avec {{count}} en stock, pour ${{profit}} de bénéfice',
    },
    days: {
      sunny: { title: 'Une journée ensoleillée normale', body: 'Une foule régulière au marché aujourd’hui.' },
      hot: { title: 'Canicule !', body: 'Il fait une chaleur écrasante : tout le monde veut quelque chose de frais.' },
      cloudy: { title: 'Gris et frais', body: 'Les nuages et un vent froid gardent beaucoup d’acheteurs chez eux.' },
      rainy: {
        title: 'Pluie toute la journée',
        body: 'Forte pluie : seulement la moitié des acheteurs habituels sortent.',
      },
      festival: { title: 'Jour de festival !', body: 'Un festival de musique remplit les rues de monde.' },
      rival: { title: 'Un stand concurrent ouvre', body: 'Un nouveau stand en face vend la même chose.' },
      rivalSale: {
        title: 'Les grosses soldes du concurrent',
        body: 'Le stand concurrent casse ses prix pour gagner des clients.',
      },
      shortage: { title: 'Pénurie', body: 'Mauvaise récolte : tes fournitures coûtent 60 % de plus aujourd’hui.' },
      tourists: {
        title: 'Un car de touristes arrive',
        body: 'Les touristes remplissent le marché. Le prix compte moins pour eux.',
      },
      payday: { title: 'Jour de paie', body: 'L’usine d’à côté vient de payer ses ouvriers.' },
      cold: { title: 'Coup de froid', body: 'Il gèle : moins d’acheteurs, et ils cherchent les bonnes affaires.' },
      bulk: {
        title: 'Récolte record',
        body: 'Les fournisseurs ont trop de stock : le tien coûte 25 % de moins aujourd’hui.',
      },
    },
    ideas: {
      demand:
        'La loi de la demande : quand le prix monte, les gens achètent moins ; quand il baisse, ils achètent plus. Le meilleur prix équilibre la quantité vendue et ce que tu gagnes sur chaque vente.',
      shiftRight:
        'La demande a augmenté : à chaque prix, plus de gens veulent acheter. Quand la demande monte, tu peux vendre plus et souvent un peu plus cher.',
      shiftLeft:
        'La demande a baissé : à chaque prix, moins de gens veulent acheter. Achète moins de stock pour ne pas gaspiller, et ne compte pas sur des prix élevés.',
      peak: 'Pic de demande : c’est les jours d’affluence que les entreprises gagnent le plus. Aie assez de stock : une rupture, c’est refuser des clients prêts à payer.',
      competition:
        'La concurrence : quand un concurrent vend la même chose, les clients comparent les prix. Si tu es beaucoup plus cher, ils traversent la rue.',
      substitutes:
        'Les produits de substitution : quand un produit similaire devient moins cher, la demande pour le tien baisse. Tu peux t’aligner un peu, mais une guerre des prix peut effacer ton bénéfice.',
      supplyShock:
        'Un choc d’offre : quand les coûts montent, chaque vente rapporte moins. Les entreprises augmentent généralement leurs prix et vendent un peu moins.',
      inelastic:
        'Demande inélastique : certains clients réagissent à peine au prix. Quand les acheteurs se soucient moins du prix, un prix plus élevé rapporte plus.',
      income:
        'L’effet revenu : quand les gens ont plus d’argent, ils achètent plus et se soucient un peu moins du prix.',
      elastic:
        'Demande élastique : les clients sensibles au prix achètent beaucoup moins quand les prix montent. Garde des prix bas les jours comme celui-ci.',
      supplyGlut:
        'Coûts plus bas : quand les fournitures sont bon marché, chaque vente rapporte plus, et un prix un peu plus bas peut attirer des clients en plus.',
    },
  },

  // ─── Profit Quest ──────────────────────────────────────────────────────────
  profit: {
    products: {
      backpacks: 'sacs à dos',
      bikes: 'vélos',
      phoneCases: 'coques de téléphone',
      shoes: 'chaussures d’école',
    },
    factory: 'Ton usine fabrique des {{product}}',
    step: 'Défi {{n}} sur {{total}}',
    calcTitle: 'MATHS DE L’ENTREPRISE',
    calc: {
      contribution:
        'Tu vends des {{product}} à ${{price}} l’unité. Fabriquer une unité coûte ${{unit}} en matériaux et main-d’œuvre. Combien chaque vente apporte-t-elle pour couvrir tes coûts fixes ?',
      breakeven:
        'Une unité de {{product}} se vend ${{price}} et coûte ${{unit}} à fabriquer. Les coûts fixes (loyer, machines, managers) sont de ${{fixed}} par semaine. Combien d’unités dois-tu vendre chaque semaine pour atteindre le seuil de rentabilité ?',
      profit:
        'Tu vends {{units}} {{product}} à ${{price}}. Chaque unité coûte ${{unit}} à fabriquer et les coûts fixes sont de ${{fixed}}. Quel est ton bénéfice ?',
      margin:
        'Tu vends {{units}} {{product}} à ${{price}}. Chaque unité coûte ${{unit}} à fabriquer et les coûts fixes sont de ${{fixed}}. Quelle est ta marge bénéficiaire (bénéfice en % du chiffre d’affaires) ?',
      priceForTarget:
        'Tu prévois de vendre {{units}} {{product}}. Chaque unité coûte ${{unit}} à fabriquer et les coûts fixes sont de ${{fixed}}. Quel prix te donne un bénéfice de ${{target}} ?',
      machine:
        'Une unité de {{product}} se vend ${{price}} et coûte ${{unit}} à fabriquer ; les coûts fixes sont de ${{fixed}}. Une nouvelle machine ajoute ${{extra}} aux coûts fixes mais fait économiser ${{saving}} sur chaque unité. Quel est le nouveau seuil de rentabilité ?',
    },
    formula: {
      contribution:
        'Marge sur coût variable par unité = prix − coût variable. C’est ce que chaque vente apporte pour payer les coûts fixes, puis pour le bénéfice.',
      breakeven:
        'Seuil de rentabilité = coûts fixes ÷ marge par unité (arrondi au-dessus). Vends plus que ça et tu fais un bénéfice.',
      profit: 'Bénéfice = unités × (prix − coût variable) − coûts fixes.',
      margin:
        'Marge bénéficiaire = bénéfice ÷ chiffre d’affaires × 100. Elle montre combien tu gardes sur chaque dollar de ventes.',
      priceForTarget: 'Prix = coût variable + (coûts fixes + bénéfice visé) ÷ unités.',
      machine:
        'Nouveau seuil = (coûts fixes + coût fixe en plus) ÷ (prix − nouveau coût variable). Les machines augmentent les coûts fixes mais baissent le coût de chaque unité.',
    },
    percent: '{{n}} %',
    right: 'Correct ! +{{points}}',
    wrong: 'Pas tout à fait : la réponse est {{answer}}.',
    week: 'SEMAINE À L’USINE',
    numbers: 'Fabriquer une unité coûte ${{unit}} · coûts fixes ${{fixed}} par semaine · {{stock}} en entrepôt',
    research: 'ÉTUDE DE MARCHÉ',
    researchRow: 'À ${{price}} : {{count}} clients par semaine',
    researchAbout: 'À ${{price}} : environ {{count}} clients par semaine',
    price: 'Prix',
    make: 'À produire cette semaine',
    breakEven: 'À ce prix, tu atteins le seuil de rentabilité après {{count}} ventes',
    noBreakEven: 'À ce prix, tu perds de l’argent sur chaque vente !',
    upgrades: 'INVESTIR CETTE SEMAINE ?',
    upgrade: {
      none: { title: 'Pas d’investissement', body: 'Garder les choses telles quelles.' },
      machine: {
        title: 'Nouvelle machine',
        body: 'Coûts fixes +25 %, mais chaque unité coûte 25 % de moins à fabriquer.',
      },
      ads: { title: 'Publicité', body: 'Coûts fixes +15 %, et 20 % de clients en plus à chaque prix.' },
    },
    owned: 'Déjà acheté',
    run: 'Lancer la semaine',
    report: 'BILAN DE LA SEMAINE',
    line: {
      demand: '{{wanted}} clients voulaient acheter · tu en as vendu {{sold}} · il en reste {{stock}} en entrepôt',
      revenue: 'Chiffre d’affaires',
      cogs: 'Coût des unités vendues',
      fixed: 'Coûts fixes',
      storage: 'Stockage des invendus',
      profit: 'Bénéfice',
      best: 'Meilleur prix cette semaine : ${{price}}, pour ${{profit}} de bénéfice',
      over: 'Tu as produit plus que tu ne pouvais vendre : stocker les invendus coûte de l’argent.',
      under: 'Rupture de stock : d’autres clients voulaient acheter.',
    },
  },

  // ─── Market Simulator ──────────────────────────────────────────────────────
  invest: {
    practice: 'Argent fictif uniquement · entreprises inventées',
    quarter: 'Trimestre {{n}} sur {{total}}',
    portfolio: 'Ton portefeuille',
    indexCompare: 'Tout le marché (fonds indiciel) : ${{value}}',
    news: 'ACTUALITÉS',
    quizTitle: 'QUESTION D’INVESTISSEUR',
    allocate: 'RÉPARTIS TES ${{value}}',
    total: 'Total : {{pct}} %',
    totalHint: 'Tes choix doivent faire 100 % au total.',
    limit: 'Garde chaque entreprise à {{pct}} % maximum pour répartir ton risque.',
    feesNote: 'Frais par trimestre : fonds indiciel 0,05 %, obligations 0,1 %, actions de chaque entreprise 0,3 %.',
    run: 'Trimestre suivant',
    report: 'RÉSULTATS DU TRIMESTRE {{n}}',
    yourReturn: 'Ton rendement : {{pct}}',
    indexReturn: 'Tout le marché : {{pct}}',
    fees: 'Frais : {{pct}}',
    value: 'Portefeuille actuel : ${{value}}',
    concentrated: 'Trop dans une seule entreprise ! Si elle chute, tout ton portefeuille chute avec elle.',
    risk: {
      low: 'Risque faible',
      medium: 'Risque moyen',
      high: 'Risque élevé',
    },
    assets: {
      cash: { name: 'Épargne en liquide', body: 'Sûre, mais grandit très lentement' },
      bonds: { name: 'Fonds obligataire', body: 'Prêts aux États et aux entreprises : rendements stables et modestes' },
      index: { name: 'Fonds indiciel', body: 'Un peu de chaque entreprise : répartit ton risque' },
      sunpower: { name: 'SunPower Energy', body: 'Solaire et électricité' },
      greenleaf: { name: 'GreenLeaf Foods', body: 'Alimentation et épicerie' },
      roboworks: { name: 'RoboWorks', body: 'Robots et technologie' },
      citybank: { name: 'City Bank', body: 'Banque et prêts' },
      vitahealth: { name: 'VitaHealth', body: 'Médicaments et santé' },
      shopstream: { name: 'ShopStream', body: 'Boutiques en ligne et en centre-ville' },
    },
    newsItems: {
      heatwave: 'Canicule ! La demande d’électricité s’envole.',
      robotOrder: 'RoboWorks décroche une énorme commande de robots industriels.',
      harvest: 'Une récolte record fait baisser les coûts des entreprises alimentaires.',
      recall: 'RoboWorks rappelle des milliers de robots défectueux.',
      shopping: 'Les achats des fêtes battent des records.',
      medicine: 'Le nouveau médicament de VitaHealth est autorisé.',
      rateRise: 'La banque centrale relève ses taux d’intérêt.',
      oilDrop: 'Les prix de l’énergie chutent fortement.',
      recession: 'Peur de la récession : les consommateurs se serrent la ceinture.',
      boom: 'L’économie croît plus vite que prévu.',
      bankScandal: 'City Bank condamnée à une amende pour avoir caché des pertes.',
      hype: 'Tout le monde en ligne dit que RoboWorks va « décoller vers la Lune » !',
      rumour: 'Message anonyme : « ShopStream va être racheté ! » (non confirmé)',
      quietQuarter: 'Un trimestre calme : pas de grande nouvelle.',
      crash: 'Krach boursier ! Les prix chutent partout.',
      rebound: 'Les marchés rebondissent après le krach.',
    },
    quiz: {
      share: {
        q: 'Que possèdes-tu quand tu achètes une action ?',
        options: [
          'Un prêt à l’entreprise',
          'Une petite part de l’entreprise',
          'Un bénéfice garanti',
          'Un emploi dans l’entreprise',
        ],
        why: 'Une action est une petite part de propriété d’une entreprise. Si l’entreprise réussit, ton action peut prendre de la valeur et verser des dividendes.',
      },
      diversify: {
        q: 'Que veut dire diversifier ?',
        options: [
          'N’acheter que la meilleure entreprise',
          'Garder tout ton argent en liquide',
          'Répartir ton argent sur beaucoup d’investissements différents',
          'Vendre dès que les prix baissent',
        ],
        why: 'Diversifier, c’est ne pas mettre tous ses œufs dans le même panier. Si un investissement chute, les autres peuvent stabiliser ton portefeuille.',
      },
      riskReturn: {
        q: 'Les investissements qui peuvent rapporter plus…',
        options: [
          'Comportent plus de risque',
          'Sont totalement sûrs',
          'Ne perdent jamais d’argent',
          'Sont réservés aux banques',
        ],
        why: 'Des rendements potentiels plus élevés vont généralement avec plus de risque : le prix peut beaucoup varier dans les deux sens.',
      },
      index: {
        q: 'Qu’est-ce qu’un fonds indiciel ?',
        options: [
          'Un compte d’épargne',
          'Une seule entreprise tech',
          'Un prêt à l’État',
          'Un fonds qui détient beaucoup d’entreprises d’un marché',
        ],
        why: 'Un fonds indiciel achète un peu de chaque entreprise d’un marché : tu obtiens le rendement moyen du marché, avec peu de frais et moins de risque qu’avec des entreprises isolées.',
      },
      bond: {
        q: 'Quand tu achètes une obligation, tu…',
        options: [
          'Achètes une part d’entreprise',
          'Prêtes de l’argent remboursé avec intérêts',
          'Achètes de l’or',
          'Paies un impôt',
        ],
        why: 'Une obligation est un prêt à un État ou à une entreprise. Ils te versent des intérêts et te rendent ton argent plus tard : les obligations sont donc souvent plus stables que les actions.',
      },
      dividend: {
        q: 'Qu’est-ce qu’un dividende ?',
        options: [
          'Une part du bénéfice versée aux actionnaires',
          'Des frais pour acheter des actions',
          'Un type de prêt',
          'Une baisse du cours de l’action',
        ],
        why: 'Certaines entreprises partagent une partie de leurs bénéfices avec leurs propriétaires (les actionnaires) sous forme de dividendes.',
      },
      compound: {
        q: 'Pourquoi commencer à investir tôt aide-t-il autant ?',
        options: [
          'Les prix sont toujours plus bas',
          'Les banques donnent des primes aux jeunes',
          'Les gains rapportent à leur tour des gains (intérêts composés)',
          'Tu ne paies pas de frais',
        ],
        why: 'Avec les intérêts composés, tes gains se mettent à rapporter leurs propres gains. Plus ton argent fructifie longtemps, plus il grandit vite.',
      },
      emergencyFirst: {
        q: 'Que faut-il généralement avoir avant d’investir ?',
        options: ['Une voiture', 'Une carte de crédit', 'Un tuyau boursier d’un ami', 'Un fonds d’urgence'],
        why: 'Les investissements peuvent baisser à court terme. Un fonds d’urgence t’évite de devoir vendre au mauvais moment pour payer un imprévu.',
      },
      pastPerformance: {
        q: 'Le cours d’une action a doublé l’an dernier. Cela veut dire…',
        options: [
          'Qu’il va encore doubler',
          'Rien de certain pour l’an prochain',
          'Qu’elle est maintenant sans risque',
          'Que tu dois l’acheter maintenant',
        ],
        why: 'Les performances passées ne garantissent pas les résultats futurs. Les prix dépendent de ce qui va se passer, pas de ce qui s’est passé.',
      },
      inflation: {
        q: 'Pourquoi garder tout ton argent en liquide peut-il lui faire perdre de la valeur ?',
        options: [
          'L’inflation fait monter les prix plus vite que ton argent',
          'Les banques le prennent',
          'Les billets expirent',
          'Les actions remplacent l’argent liquide',
        ],
        why: 'L’inflation, c’est la hausse des prix chaque année. Si ton argent grandit moins vite que les prix, il achète moins avec le temps.',
      },
      longTerm: {
        q: 'Quelle approche marche généralement le mieux pour les investisseurs ordinaires ?',
        options: [
          'Acheter et vendre chaque jour',
          'Suivre les conseils trouvés en ligne',
          'Investir régulièrement sur le long terme',
          'Tout mettre dans une seule entreprise',
        ],
        why: 'Investir régulièrement et sur le long terme dans un portefeuille diversifié a historiquement fait mieux que deviner les mouvements à court terme.',
      },
      fees: {
        q: 'Pourquoi les frais d’investissement comptent-ils ?',
        options: [
          'Ils ne comptent pas, ils sont minuscules',
          'Ils augmentent les rendements',
          'Seules les banques les paient',
          'Ils sont prélevés chaque année et réduisent tes rendements',
        ],
        why: 'Les frais sont prélevés chaque année quoi qu’il arrive. Sur de nombreuses années, même de petits frais font une grosse différence.',
      },
      hype: {
        q: 'Tout le monde en ligne dit qu’une action va « décoller vers la Lune ». Que faire de sage ?',
        options: [
          'En acheter le plus possible',
          'Être prudent : l’engouement est souvent déjà dans le prix',
          'Emprunter pour en acheter',
          'Dire à tout le monde d’en acheter',
        ],
        why: 'Quand tout le monde s’emballe pour quelque chose, son prix a généralement déjà monté. L’engouement finit souvent par de fortes chutes.',
      },
      bearMarket: {
        q: 'Qu’est-ce qu’un marché baissier ?',
        options: [
          'Une longue période de baisse des prix',
          'Un marché aux animaux',
          'Une période où les prix montent vite',
          'Un marché fermé',
        ],
        why: 'Un marché baissier est une longue baisse des prix ; un marché haussier, une longue hausse. Les deux font normalement partie de l’investissement.',
      },
      pricedIn: {
        q: 'Une bonne nouvelle que tout le monde connaît déjà est souvent…',
        options: ['Un bénéfice garanti', 'Interdite à utiliser', 'Déjà intégrée dans le prix', 'Ignorée par le marché'],
        why: 'Les marchés réagissent vite. Quand une nouvelle est largement connue, les acheteurs ont généralement déjà fait monter le prix.',
      },
      rates: {
        q: 'Quand les taux d’intérêt montent, que se passe-t-il souvent ?',
        options: [
          'Toutes les actions montent',
          'L’épargne rapporte moins',
          'Rien ne change',
          'Emprunter coûte plus cher, et certaines actions baissent',
        ],
        why: 'Des taux d’intérêt plus élevés rendent l’emprunt plus cher, ce qui peut freiner les entreprises qui dépendent des prêts, tandis que les banques peuvent gagner plus.',
      },
      panicSell: {
        q: 'Le marché chute de 12 %. Que font généralement les investisseurs patients ?',
        options: [
          'Tout vendre d’un coup',
          'Rester calmes et s’en tenir à leur plan',
          'Emprunter pour acheter une seule action',
          'Arrêter d’épargner pour toujours',
        ],
        why: 'Vendre dans la panique fige les pertes. Historiquement, les marchés se sont redressés avec le temps, et les investisseurs qui ont tenu bon ont été récompensés.',
      },
      rebalance: {
        q: 'Que veut dire rééquilibrer un portefeuille ?',
        options: [
          'Le ramener à la répartition d’investissements prévue',
          'Tout vendre',
          'Acheter plus de ce qui a le plus monté',
          'Changer de banque',
        ],
        why: 'Quand les prix bougent, ta répartition dérive. Rééquilibrer la ramène au niveau de risque que tu avais prévu.',
      },
    },
  },
};

export default business;
