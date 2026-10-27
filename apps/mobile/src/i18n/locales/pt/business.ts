/** Knowzone World Business District (Portuguese): walking around the square, its five places and the five business games. */
import type { Translation } from '../../types';
import type en from '../en/business';

const business: Translation<typeof en> = {
  title: 'Bairro dos Negócios',
  entryEyebrow: 'NEGÓCIOS E FINANÇAS · NOVO',
  entryTitle: 'Bairro dos Negócios',
  entryBody:
    'Gere uma startup, domina um orçamento, define preços numa banca, torna uma fábrica lucrativa e investe dinheiro de treino',
  leave: 'Sair do Bairro dos Negócios',
  offline: 'O Bairro dos Negócios precisa de ligação à internet, porque cada decisão é calculada no nosso servidor.',
  result: {
    back: 'Voltar ao Bairro dos Negócios',
  },
  hall: {
    walkTo: 'Caminhar até: {{station}}',
    you: 'Tu, com o teu blazer Knowzone',
    open: 'Entrar: {{station}}',
    goHere: 'Ir para aqui',
    stars: '{{count}} de {{max}} estrelas',
    tip: 'Caminha até um edifício para começar um jogo. Toca num nome para ir até lá.',
  },
  stations: {
    startup: 'Sede das Startups',
    budget: 'Banco do Orçamento',
    market: 'Praça do Mercado',
    factory: 'Fábrica do Lucro',
    exchange: 'Bolsa de Valores',
  },
  games: {
    'startup-tycoon': {
      name: 'Magnata das Startups',
      how: 'Gere a tua própria empresa mês a mês: contrata produtores, vendedores e pessoal de apoio, investe em marketing e toma decisões de gestão difíceis. Faz crescer o seu valor sem ficar sem dinheiro em caixa.',
    },
    'budget-master': {
      name: 'Mestre do Orçamento',
      how: 'Planeia um salário mensal: paga as contas, come bem, poupa para um objetivo, cria um fundo de emergência e enfrenta imprevistos sem cair em dívidas.',
    },
    'market-master': {
      name: 'Mestre do Mercado',
      how: 'Gere uma banca no mercado: escolhe o teu preço e quanto stock comprar cada dia, enquanto o tempo, as multidões e um rival mudam a procura.',
    },
    'profit-quest': {
      name: 'Missão Lucro',
      how: 'Domina a matemática de um negócio (margens, ponto de equilíbrio, lucro) e depois gere uma fábrica semana a semana: define o preço, quanto produzir e quando investir.',
    },
    'market-simulator': {
      name: 'Simulador da Bolsa',
      how: 'Investe dinheiro de treino em empresas inventadas, obrigações e um fundo de índice. As notícias mexem com o mercado: diversifica o teu risco e aprende como funciona investir. Sem dinheiro real.',
    },
  },

  ui: {
    money: '${{amount}}',
    minus: '−${{amount}}',
    perMonth: '${{amount}}/mês',
    next: 'Seguinte',
    finish: 'Ver resultados',
    best: 'Melhor escolha',
    good: 'Boa escolha',
    fair: 'Escolha razoável',
    poor: 'Má escolha',
    bestWas: 'A melhor escolha era: {{choice}}',
    lesson: 'LIÇÃO DE NEGÓCIOS',
    left: 'Por planear: ${{amount}}',
    over: 'Excedido em ${{amount}}',
    points: '+{{points}} pontos',
    more: 'Mais',
    less: 'Menos',
    pick: 'Escolhe primeiro uma opção.',
    unbalanced: 'Planeia cada dólar: o total tem de bater certo.',
    invalid: 'Esse plano não é permitido. Verifica os números.',
  },

  // ─── Startup Tycoon ────────────────────────────────────────────────────────
  startup: {
    companies: {
      bakery: 'Padaria e Café Nascer do Sol',
      repair: 'FixIt Reparação de Telemóveis',
      apps: 'Pixel Estúdio de Apps',
      fashion: 'Thread Marca de Moda',
      solar: 'BrightSun Instalações Solares',
    },
    sale: {
      bakery: 'bolos e cafés',
      repair: 'reparações',
      apps: 'projetos de apps',
      fashion: 'peças de roupa',
      solar: 'instalações',
    },
    month: 'Mês {{n}} de {{total}}',
    goal: 'Objetivo: a tua parte valer ${{goal}}',
    value: 'Valor da empresa',
    cash: 'Dinheiro em caixa',
    morale: 'Moral',
    rep: 'Reputação',
    owned: 'Tens {{pct}}%',
    decision: 'DECISÃO DO MÊS',
    team: 'A TUA EQUIPA',
    roles: {
      maker: 'Produtores',
      seller: 'Vendedores',
      support: 'Apoio',
    },
    roleHint: {
      maker: 'Cada um faz cerca de {{n}} {{sale}} por mês',
      seller: 'Cada um traz cerca de {{n}} clientes a mais por mês',
      support: 'Trata da administração e dos clientes; cada um apoia 4 colegas',
    },
    salary: '${{amount}}/mês cada',
    hireCost: 'Custo de contratar: ${{amount}} (recrutamento e formação)',
    payroll: 'Salários: ${{amount}}/mês',
    marketing: 'MARKETING ESTE MÊS',
    none: 'Nenhum',
    run: 'Jogar o mês',
    report: 'RELATÓRIO DO MÊS {{n}}',
    statement: {
      revenue: 'Receitas (vendas)',
      cogs: 'Custo das vendas',
      gross: 'Lucro bruto ({{pct}}% de margem)',
      payroll: 'Salários',
      rent: 'Renda',
      marketing: 'Marketing',
      other: 'Custos e receitas pontuais',
      loan: 'Prestação do empréstimo',
      net: 'Lucro líquido',
      cash: 'Dinheiro no banco',
      runway: 'A este ritmo, o dinheiro dura mais {{count}} meses',
    },
    ops: {
      line: '{{demand}} clientes queriam comprar · a tua equipa podia servir {{capacity}} · vendeste {{sold}}',
      order: 'Mais uma encomenda especial de {{count}}',
      turnedAway: 'Recusaste {{count}} clientes. Mais produtores teriam rendido mais.',
      idle: 'Os teus produtores tiveram tempo livre. Mais vendedores ou marketing trariam clientes.',
      balanced: 'A produção da tua equipa acompanhou bem a procura.',
      overload: 'A tua equipa é grande demais para o pessoal de apoio: todos abrandaram.',
      saturated: 'O teu mercado está a ficar cheio: cada vendedor extra traz menos clientes novos.',
    },
    bankrupt:
      'Sem dinheiro em caixa! Uma empresa pode ser lucrativa no papel e mesmo assim falir se ficar sem dinheiro.',
    dilemmas: {
      poach: {
        title: 'O teu melhor produtor vai sair?',
        body: 'Uma empresa rival oferece ao teu produtor mais habilidoso um emprego mais bem pago. Ele prefere ficar, mas precisa de um aumento.',
        options: {
          match: 'Dar a cada produtor um aumento de $120/mês',
          letGo: 'Desejar-lhe sorte e deixá-lo ir',
          threaten: 'Dizer-lhe que se vai arrepender de sair',
        },
        lesson:
          'Substituir um bom funcionário costuma custar muito mais do que mantê-lo: recrutamento, formação e produção perdida enquanto o novo aprende. Um salário justo mantém as tuas melhores pessoas e a moral em alta.',
      },
      bigOrder: {
        title: 'Uma encomenda enorme, com um grande desconto',
        body: 'Um grande cliente quer uma encomenda enorme este mês, mas só com 40% de desconto sobre o teu preço normal.',
        options: {
          negotiate: 'Negociar: uma encomenda menor com 15% de desconto',
          accept: 'Aceitar o desconto de 40%',
          decline: 'Recusar com educação',
        },
        lesson:
          'Um desconto sai diretamente da tua margem de lucro. Antes de aceitar, confirma que o preço ainda cobre o custo de fazer cada unidade e que tens capacidade livre. Negociar é normal nos negócios.',
      },
      review: {
        title: 'Uma crítica furiosa na internet',
        body: 'Um cliente publica que o teu serviço foi lento e mal-educado. Outras pessoas estão a ler.',
        options: {
          fix: 'Pedir desculpa em público, resolver o problema e devolver o dinheiro',
          ignore: 'Ignorar, vai ser esquecido',
          argue: 'Responder que o cliente está a mentir',
        },
        lesson:
          'A tua reputação faz os clientes voltarem e recomendarem-te. Uma resposta pública e honesta a uma reclamação muitas vezes ganha mais confiança do que não ter reclamações nenhumas.',
      },
      burnout: {
        title: 'A equipa está exausta',
        body: 'Depois de semanas de horas extra, o teu pessoal está cansado e a cometer erros.',
        options: {
          rest: 'Dar a todos um dia de folga pago e trazer ajuda temporária',
          pizza: 'Pagar pizza à equipa',
          push: 'Pedir ainda mais horas extra este mês',
        },
        lesson:
          'Pessoas cansadas produzem menos e despedem-se mais. Forçar mais dá um pequeno impulso na produção, mas depois custa-te moral e rotatividade. Os bons gestores protegem a energia da equipa.',
      },
      agency: {
        title: 'Uma promessa de marketing "viral"',
        body: 'Uma agência promete que uma campanha de $2.000 te vai tornar famoso de um dia para o outro.',
        options: {
          test: 'Fazer um pequeno teste de $300 e medir os resultados',
          pay: 'Pagar os $2.000',
          skip: 'Passar',
        },
        lesson:
          'Testa antes de gastar muito. Um teste pequeno e medido mostra se o marketing traz mesmo clientes, para só ampliares o que funciona. Grandes promessas não são provas.',
      },
      fancyOffice: {
        title: 'Um escritório novo e chique?',
        body: 'Podias mudar-te para um escritório estiloso com sala de jogos. A mudança custa $2.500 e a renda é 30% mais cara.',
        options: {
          stay: 'Ficar, e gastar no que os clientes notam',
          move: 'Mudar, a equipa vai adorar',
        },
        lesson:
          'Custos fixos como a renda pagam-se todos os meses, vendas ou não. Mantém-nos baixos, sobretudo no início, para que o teu negócio sobreviva aos meses fracos.',
      },
      sponsor: {
        title: 'Patrocinar o dia desportivo da escola?',
        body: 'Uma escola local pede-te para patrocinar o dia desportivo por $300. O teu nome estaria nas t-shirts.',
        options: {
          sponsor: 'Patrocinar',
          decline: 'Recusar com educação',
        },
        lesson:
          'Apoiar a tua comunidade cria boa vontade e dá a conhecer a tua marca localmente. É uma forma de marketing que também faz bem.',
      },
      supplier: {
        title: 'O teu fornecedor sobe os preços',
        body: 'Os materiais que compras custam agora mais 20%.',
        options: {
          shop: 'Comparar outros fornecedores e negociar',
          raise: 'Passar o custo: subir o teu preço 8%',
          cheap: 'Mudar para materiais muito mais baratos e de pior qualidade',
        },
        lesson:
          'Quando os custos sobem, compara e negocia primeiro. Baixar a qualidade protege a tua margem durante um mês, mas prejudica a tua reputação durante muito mais tempo.',
      },
      latePayer: {
        title: 'Um cliente não pagou',
        body: 'Um grande cliente ainda te deve $1.500 de há 60 dias, e o dinheiro está a ficar apertado.',
        options: {
          remind: 'Enviar um lembrete educado e oferecer um pequeno desconto por pagar já',
          wait: 'Esperar e torcer para que pague',
          threaten: 'Ameaçá-lo com advogados',
        },
        lesson:
          'Lucro não é o mesmo que dinheiro em caixa. O dinheiro que os clientes te devem (contas a receber) não paga as tuas contas até chegar. Cobrar pagamentos com educação e rapidez mantém o fluxo de caixa a andar.',
      },
      newLine: {
        title: 'Uma ideia de produto novo',
        body: 'Alguém da equipa tem uma ideia para uma nova linha de produtos.',
        options: {
          pilot: 'Fazer primeiro um pequeno piloto com alguns clientes',
          bigLaunch: 'Lançar em grande com muito stock e anúncios',
          later: 'Agora não',
        },
        lesson:
          'A inovação faz um negócio crescer, mas lançar em pequeno permite-te aprender o que os clientes querem mesmo antes de arriscar muito dinheiro. Chama-se piloto ou produto mínimo viável.',
      },
      training: {
        title: 'Formar a equipa?',
        body: 'Um curso de $500 tornaria o teu pessoal mais rápido e mais competente.',
        options: {
          train: 'Pagar o curso',
          free: 'Partilhar antes vídeos grátis da internet',
          skip: 'Sem formação',
        },
        lesson:
          'A formação é um investimento nas pessoas: pessoal competente produz mais e sente-se valorizado, o que recupera o custo nos meses seguintes.',
      },
      loan: {
        title: 'Um empréstimo bancário',
        body: 'O banco oferece $4.000, a pagar com $190 por mês (cerca de 12% de juros por ano).',
        options: {
          machine: 'Pedir para comprar uma máquina que produz mais 25%',
          party: 'Pedir para uma festa da equipa e mobília nova',
          no: 'Não pedir emprestado',
        },
        lesson:
          'Dívida boa paga coisas que rendem mais do que os juros, como equipamento que aumenta a produção. Pedir emprestado para coisas que não rendem só te deixa prestações para pagar.',
      },
      rent: {
        title: 'O senhorio sobe a renda',
        body: 'O teu senhorio quer mais 25% de renda a partir do próximo mês.',
        options: {
          lease: 'Propor um contrato mais longo em troca de um aumento menor',
          accept: 'Aceitar o aumento',
          moveFar: 'Mudar para um sítio mais barato longe dos teus clientes',
        },
        lesson:
          'Quase tudo nos negócios se pode negociar. Oferecer algo que a outra parte valoriza (um contrato longo e fiável) pode dar-te um melhor acordo. A localização também conta: afastares-te dos clientes faz perder vendas.',
      },
      competitor: {
        title: 'Um concorrente abre perto',
        body: 'Um negócio novo abre mais abaixo na rua, com preços mais baixos.',
        options: {
          quality: 'Competir em qualidade e serviço, com um cartão de fidelização',
          priceWar: 'Baixar os teus preços 25% para os vencer',
          nothing: 'Não fazer nada',
        },
        lesson:
          'Uma guerra de preços pode destruir os lucros dos dois negócios. Muitas vezes é mais inteligente competir no que te torna diferente: qualidade, serviço e clientes fiéis.',
      },
      safety: {
        title: 'Uma inspeção de segurança',
        body: 'Um inspetor encontra um problema de segurança no teu local de trabalho.',
        options: {
          fixNow: 'Resolver como deve ser, já',
          later: 'Remendar barato e resolver mais tarde',
        },
        lesson:
          'As empresas têm de manter trabalhadores e clientes em segurança. Resolver problemas cedo sai mais barato do que multas, acidentes e uma reputação manchada.',
      },
      remote: {
        title: 'Teletrabalho?',
        body: 'O teu pessoal pede para trabalhar a partir de casa alguns dias.',
        options: {
          trial: 'Experimentar durante um mês e medir os resultados',
          refuse: 'Recusar',
          always: 'Permitir a todos, todos os dias, sem controlo',
        },
        lesson:
          'A flexibilidade pode subir a moral, mas os bons gestores testam as mudanças e medem o efeito na produção antes de decidir de vez.',
      },
      investor: {
        title: 'Um investidor quer entrar',
        body: 'Um investidor oferece $10.000 em troca de 40% da tua empresa.',
        options: {
          counter: 'Contraproposta: $8.000 por 20%',
          accept: 'Aceitar $10.000 por 40%',
          refuse: 'Recusar e crescer com o teu próprio dinheiro',
        },
        lesson:
          'Vender participações (capital próprio) traz dinheiro sem dívida, mas abdicas de parte de cada lucro futuro e do valor da empresa. Chama-se diluição. Negocia o preço das tuas participações.',
      },
      tax: {
        title: 'Os impostos estão a vencer',
        body: 'Deves $700 em impostos da empresa este mês.',
        options: {
          pay: 'Pagar a tempo',
          plan: 'Pedir um plano de pagamento oficial',
          ignore: 'Ignorar por agora',
        },
        lesson:
          'Os impostos pagam estradas, escolas e hospitais, e todas as empresas têm de os pagar. Atrasos trazem coimas, por isso as empresas espertas vão pondo dinheiro de lado para impostos à medida que ganham.',
      },
      bigClient: {
        title: 'Um cliente gigante',
        body: 'Um cliente enorme oferece-se para comprar metade de tudo o que fazes, mas só se largares os teus outros clientes.',
        options: {
          balance: 'Aceitar um acordo menor e manter os outros clientes',
          allIn: 'Largar todos os outros e assinar',
          decline: 'Recusar',
        },
        lesson:
          'Depender de um só cliente é arriscado: se ele sair, a maior parte do teu negócio vai com ele. Distribuir as vendas por muitos clientes torna uma empresa mais forte.',
      },
      ethics: {
        title: 'Um "presente" secreto',
        body: 'Um fornecedor oferece-te um presente pessoal secreto se continuares a comprar-lhe a preços mais altos.',
        options: {
          refuse: 'Recusar e denunciar',
          accept: 'Aceitar o presente',
        },
        lesson:
          'Esse presente é um suborno. Custa dinheiro à tua empresa, é muitas vezes ilegal e destrói a confiança. As empresas éticas duram mais.',
      },
    },
  },

  // ─── Budget Master ─────────────────────────────────────────────────────────
  budget: {
    month: 'Mês {{n}} de {{total}}',
    income: 'Rendimento este mês',
    bills: 'CONTAS (OBRIGATÓRIAS)',
    afterBills: 'Sobra depois das contas',
    plan: 'O TEU PLANO',
    billNames: {
      rent: 'Renda',
      utilities: 'Eletricidade e água',
      phone: 'Telemóvel e dados',
      transport: 'Transportes',
      minimum: 'Pagamento mínimo do cartão',
      subscription: 'Subscrição de streaming',
      bankFees: 'Comissões bancárias',
      carDeal: 'Prestação do carro',
    },
    keys: {
      food: 'Comida',
      fun: 'Lazer',
      clothes: 'Roupa',
      emergency: 'Fundo de emergência',
      goal: 'Objetivo de poupança',
      debt: 'Pagamento extra do cartão',
    },
    keyHint: {
      food: 'Precisas de pelo menos ${{min}}',
      fun: 'Sair, jogos, mimos',
      clothes: 'Roupa e sapatos novos',
      emergency: '${{have}} poupados · meta ${{target}}',
      goal: '{{goal}}: ${{have}} de ${{target}}',
      debt: 'Dívida do cartão ${{have}} · {{rate}}% de juros por mês',
    },
    goals: {
      laptop: 'Portátil novo',
      bike: 'Bicicleta',
      course: 'Curso de programação',
      travel: 'Viagem',
      deposit: 'Caução de um apartamento',
    },
    rule: 'Necessidades {{needs}}% · Desejos {{wants}}% · Poupança {{savings}}%',
    ruleHint: 'Uma boa regra: necessidades cerca de 50%, desejos até 30%, poupa pelo menos 20%.',
    restToGoal: 'Pôr o resto na poupança',
    event: 'ESTE MÊS',
    costFrom: {
      fun: '−${{amount}} do dinheiro de lazer',
      emergency: '−${{amount}} do fundo de emergência',
      goal: '−${{amount}} da poupança',
      card: '−${{amount}} no cartão de crédito',
    },
    gain: '+${{amount}} para a poupança',
    newBill: '+${{amount}} todos os meses',
    run: 'Viver o mês',
    report: 'RELATÓRIO DO MÊS {{n}}',
    check: {
      food: 'Comeste bem',
      noFood: 'Não chegou para a comida',
      saved: 'Poupaste {{pct}}% do rendimento',
      wants: 'Gastaste {{pct}}% em desejos',
      card: '${{amount}} foram para o cartão de crédito',
      interest: 'Juros do cartão este mês: ${{amount}}',
      debt: 'Dívida do cartão agora: ${{amount}}',
      emergency: 'Fundo de emergência: ${{amount}}',
      goal: 'Objetivo de poupança: ${{amount}} de ${{target}}',
    },
    events: {
      concert: {
        title: 'Convite para um concerto',
        body: 'Um amigo convida-te para um concerto. Os bilhetes custam $80.',
        options: {
          funMoney: 'Ir, pagando com o dinheiro de lazer',
          freePlan: 'Sugerir antes um piquenique grátis',
          card: 'Ir, e pagar com o cartão de crédito',
        },
        lesson:
          'Divertir-se faz parte de um orçamento saudável: é para isso que serve o dinheiro de lazer. Pagar desejos a crédito significa pagar juros por uma noite fora durante meses.',
      },
      phone: {
        title: 'Ecrã do telemóvel partido',
        body: 'Deixas cair o telemóvel. Reparar o ecrã custa $150.',
        options: {
          emergency: 'Pagar com o fundo de emergência',
          card: 'Pagar com o cartão de crédito',
          newPhone: 'Comprar um telemóvel novo de $700 a crédito',
        },
        lesson:
          'É mesmo para isto que serve um fundo de emergência: imprevistos que não podes evitar. Reparar costuma ser muito mais barato do que substituir.',
      },
      sale: {
        title: '"50% de desconto, só hoje!"',
        body: 'Uma loja tem uma promoção relâmpago em sapatilhas de que não precisas mesmo: $120.',
        options: {
          skip: 'Passar',
          funMoney: 'Comprá-las com o dinheiro de lazer',
          card: 'Comprá-las com o cartão de crédito',
        },
        lesson:
          'Um desconto em algo de que não precisas não é poupança, é gasto. "Só hoje" serve para te apressar. Espera um dia antes de comprar um desejo.',
      },
      gift: {
        title: 'Aniversário da mãe',
        body: 'Este mês é o aniversário da tua mãe.',
        options: {
          funMoney: 'Um presente de $40 com o dinheiro de lazer',
          handmade: 'Um postal feito à mão e cozinhar-lhe o jantar',
          card: 'Um presente caro de $150 no cartão de crédito',
        },
        lesson:
          'Atencioso não tem de ser caro. Os presentes pertencem aos teus gastos planeados, não ao cartão de crédito.',
      },
      bonus: {
        title: 'Um prémio de $300!',
        body: 'O teu chefe dá-te um prémio de $300 pelo ótimo trabalho.',
        options: {
          save: 'Poupar tudo',
          split: 'Poupar $240 e aproveitar $60',
          spend: 'Gastar tudo este fim de semana',
        },
        lesson:
          'Dinheiro extra é o mais fácil de poupar, porque já vivias sem ele. Poupar a maior parte de um dinheiro inesperado e aproveitar um pouco é um ótimo hábito.',
      },
      scam: {
        title: '"Duplica o teu dinheiro numa semana!"',
        body: 'Um chat de grupo promete duplicar todo o dinheiro que lhes enviares numa semana.',
        options: {
          ignore: 'Ignorar e avisar os teus amigos',
          invest: 'Enviar-lhes $200 da tua poupança',
        },
        lesson:
          'Ninguém consegue duplicar dinheiro numa semana com segurança. Retornos altos garantidos são sinal de burla: o teu dinheiro desaparece.',
      },
      bike: {
        title: 'Reparação da bicicleta',
        body: 'A bicicleta em que vais para o trabalho precisa de uma reparação de $220.',
        options: {
          emergency: 'Pagar com o fundo de emergência',
          card: 'Pagar com o cartão de crédito',
          taxis: 'Não reparar e andar de táxi o mês todo ($380)',
        },
        lesson:
          'Adiar uma reparação necessária costuma sair mais caro. O teu fundo de emergência deixa-te resolver problemas depressa sem pedir emprestado.',
      },
      subscription: {
        title: 'Fim do período experimental',
        body: 'O teu período grátis de streaming acaba. A partir de agora custa $15 por mês.',
        options: { cancel: 'Cancelar', keep: 'Manter' },
        lesson:
          'Pequenas subscrições mensais vão-se somando: $15 por mês são $180 por ano. Revê as tuas subscrições com regularidade e cancela as que não usas.',
      },
      sideHustle: {
        title: 'Explicações ao fim de semana',
        body: 'Um vizinho oferece-te $150 para dares explicações ao filho aos fins de semana.',
        options: {
          takeSave: 'Aceitar e poupar o que ganhas',
          decline: 'Recusar e manter os teus fins de semana',
        },
        lesson:
          'Um rendimento extra acelera os teus objetivos. Poupar esse rendimento extra, em vez de o gastar, leva-te lá muito mais depressa.',
      },
      dentist: {
        title: 'Dor de dentes',
        body: 'Tens dor de dentes. O dentista custa $180.',
        options: {
          emergency: 'Ir já, pagando com o fundo de emergência',
          card: 'Ir já, pagando com o cartão de crédito',
          wait: 'Esperar até piorar ($450 mais tarde)',
        },
        lesson:
          'Cuidar da tua saúde cedo é mais barato do que tratar um problema maior depois. Nunca deixes de ter os cuidados de que precisas para poupar dinheiro.',
      },
      loanApp: {
        title: 'App de empréstimos instantâneos',
        body: 'Uma app oferece-te $500 na hora. Pagarias $650 em apenas duas semanas.',
        options: { decline: 'Recusar', take: 'Aceitar' },
        lesson:
          'Pagar $650 por $500 em duas semanas é uma taxa de juro enorme, muitas vezes maior do que a de um cartão de crédito. Este tipo de empréstimo rápido prende as pessoas em dívidas.',
      },
      foodPrices: {
        title: 'Os preços da comida sobem',
        body: 'Os preços nas lojas sobem 10% este mês: a comida custa-te mais $30.',
        options: {
          cutWants: 'Gastar menos em desejos este mês',
          card: 'Pôr a diferença no cartão de crédito',
        },
        lesson:
          'Quando os preços sobem (inflação), ajusta o orçamento cortando nos desejos, não pedindo emprestado para as necessidades.',
      },
      bankFees: {
        title: 'Comissões bancárias',
        body: 'O teu banco cobra-te $12 todos os meses só por teres uma conta.',
        options: { switch: 'Mudar para uma conta grátis', stay: 'Ficar neste banco' },
        lesson:
          'As comissões comem o teu dinheiro em silêncio todos os meses. Comparar bancos e mudar para uma conta grátis é uma vitória fácil.',
      },
      friendLoan: {
        title: 'Um amigo precisa de dinheiro',
        body: 'Um amigo pede-te $100 emprestados até ao próximo mês.',
        options: {
          afford: 'Emprestar $100 do dinheiro de lazer, dinheiro de que podes prescindir',
          kindNo: 'Explicar com simpatia que este mês não podes',
          savings: 'Emprestar do fundo de emergência',
        },
        lesson:
          'Empresta só o que podes dar-te ao luxo de nunca reaver, e nunca do fundo de emergência. Dizer que não com simpatia também está bem.',
      },
      matching: {
        title: 'Dinheiro grátis do trabalho',
        body: 'O teu empregador junta $1 à tua poupança para a reforma por cada $1 que lá pões, até $100 por mês.',
        options: { join: 'Aderir: poupar $100 e receber $100 extra', later: 'Talvez mais tarde' },
        lesson:
          'A contribuição do empregador é um retorno imediato de 100% sobre o teu dinheiro. É um dos melhores negócios das finanças pessoais: aproveita sempre que puderes.',
      },
      carDeal: {
        title: '"Só $250 por mês!"',
        body: 'Um stand oferece-te um carro reluzente por "só $250 por mês" durante seis anos.',
        options: {
          decline: 'Recusar: não precisas de carro',
          sign: 'Assinar o contrato',
        },
        lesson:
          'Olha para o total, não para a prestação: $250 × 72 meses são $18.000. Um plano de pagamento longo é um grande compromisso.',
      },
    },
  },

  // ─── Market Master ─────────────────────────────────────────────────────────
  market: {
    products: {
      lemonade: 'Limonada',
      fruit: 'Copos de fruta',
      icePops: 'Gelados de gelo',
      sandwiches: 'Sandes',
    },
    day: 'Dia {{n}} de {{total}}',
    costEach: 'O stock custa ${{cost}} cada',
    fee: 'Banca ${{fee}} por dia · o stock não vendido vai para o lixo',
    rival: 'Preço da banca rival: ${{price}}',
    research: 'ESTUDO DE MERCADO',
    researchRow: 'A ${{price}}: cerca de {{count}} clientes',
    noResearch: 'Sem estudo hoje: usa a previsão e o que já aprendeste.',
    yesterday: 'Ontem: preço ${{price}}, {{wanted}} clientes queriam comprar',
    price: 'O teu preço',
    stock: 'Stock a comprar',
    preview: 'Se venderes tudo: ${{revenue}} em vendas, ${{profit}} de lucro',
    open: 'Abrir a banca',
    report: 'RELATÓRIO DO DIA {{n}}',
    line: {
      wanted: '{{count}} clientes queriam comprar',
      sold: 'Vendeste {{count}}',
      wasted: '{{count}} deitados fora por vender',
      missed: '{{count}} clientes foram embora de mãos vazias',
      revenue: 'Vendas',
      stock: 'Stock comprado',
      fee: 'Banca',
      profit: 'Lucro',
      best: 'Melhor hoje: ${{price}} com {{count}} em stock, para ${{profit}} de lucro',
    },
    days: {
      sunny: { title: 'Um dia de sol normal', body: 'Movimento constante no mercado hoje.' },
      hot: { title: 'Onda de calor!', body: 'Está um calor abrasador: toda a gente quer algo fresco.' },
      cloudy: { title: 'Cinzento e fresco', body: 'Nuvens e um vento frio deixam muitos compradores em casa.' },
      rainy: { title: 'Chuva o dia todo', body: 'Chuva forte: só metade dos compradores habituais sai à rua.' },
      festival: { title: 'Dia de festival!', body: 'Um festival de música enche as ruas de gente.' },
      rival: { title: 'Abre uma banca rival', body: 'Uma banca nova do outro lado da rua vende o mesmo.' },
      rivalSale: {
        title: 'A grande promoção do rival',
        body: 'A banca rival corta o preço a fundo para ganhar clientes.',
      },
      shortage: { title: 'Falta de fornecimento', body: 'Má colheita: os teus fornecimentos custam mais 60% hoje.' },
      tourists: {
        title: 'Chega um autocarro de turistas',
        body: 'Os turistas enchem o mercado. Ligam menos ao preço.',
      },
      payday: { title: 'Dia de pagamento', body: 'A fábrica ao lado acabou de pagar aos trabalhadores.' },
      cold: { title: 'Vaga de frio', body: 'Está um gelo: menos compradores, e andam à procura de pechinchas.' },
      bulk: { title: 'Colheita farta', body: 'Os fornecedores têm demasiado: o teu stock está 25% mais barato hoje.' },
    },
    ideas: {
      demand:
        'A lei da procura: quando o preço sobe, as pessoas compram menos; quando desce, compram mais. O melhor preço equilibra quanto vendes com quanto ganhas em cada venda.',
      shiftRight:
        'A procura aumentou: a qualquer preço, mais pessoas querem comprar. Quando a procura sobe, podes vender mais e muitas vezes cobrar um pouco mais.',
      shiftLeft:
        'A procura caiu: a qualquer preço, menos pessoas querem comprar. Compra menos stock para não desperdiçar e não contes com preços altos.',
      peak: 'Pico de procura: é nos dias movimentados que os negócios ganham mais. Tem stock suficiente: esgotar significa mandar embora clientes que iam pagar.',
      competition:
        'Concorrência: quando um rival vende o mesmo, os clientes comparam preços. Cobra muito mais do que ele e os clientes atravessam a rua.',
      substitutes:
        'Substitutos: quando um produto parecido fica mais barato, a procura pelo teu cai. Podes acompanhá-lo um pouco, mas uma guerra de preços pode acabar com o lucro.',
      supplyShock:
        'Um choque de oferta: quando os custos sobem, cada venda rende menos. Os negócios costumam subir os preços e vender um pouco menos.',
      inelastic:
        'Procura inelástica: alguns clientes quase não reagem ao preço. Quando os compradores ligam menos ao preço, um preço mais alto rende mais.',
      income: 'Efeito rendimento: quando as pessoas têm mais dinheiro, compram mais e ligam um pouco menos ao preço.',
      elastic:
        'Procura elástica: clientes sensíveis ao preço compram muito menos quando os preços sobem. Mantém os preços baixos em dias assim.',
      supplyGlut:
        'Custos mais baixos: quando os fornecimentos são baratos, cada venda rende mais, e um preço um pouco mais baixo pode atrair clientes extra.',
    },
  },

  // ─── Profit Quest ──────────────────────────────────────────────────────────
  profit: {
    products: {
      backpacks: 'mochilas',
      bikes: 'bicicletas',
      phoneCases: 'capas de telemóvel',
      shoes: 'sapatos escolares',
    },
    factory: 'A tua fábrica faz {{product}}',
    step: 'Desafio {{n}} de {{total}}',
    calcTitle: 'MATEMÁTICA DO NEGÓCIO',
    calc: {
      contribution:
        'Vendes {{product}} a ${{price}} a unidade. Fazer uma unidade custa ${{unit}} em materiais e mão de obra. Quanto contribui cada venda para os teus custos fixos?',
      breakeven:
        'Cada unidade de {{product}} vende-se a ${{price}} e custa ${{unit}} a fazer. Os custos fixos (renda, máquinas, gestores) são ${{fixed}} por semana. Quantas unidades tens de vender por semana para atingir o ponto de equilíbrio?',
      profit:
        'Vendes {{units}} {{product}} a ${{price}}. Cada unidade custa ${{unit}} a fazer e os custos fixos são ${{fixed}}. Qual é o teu lucro?',
      margin:
        'Vendes {{units}} {{product}} a ${{price}}. Cada unidade custa ${{unit}} a fazer e os custos fixos são ${{fixed}}. Qual é a tua margem de lucro (lucro em % das receitas)?',
      priceForTarget:
        'Esperas vender {{units}} {{product}}. Cada unidade custa ${{unit}} a fazer e os custos fixos são ${{fixed}}. Que preço te dá um lucro de ${{target}}?',
      machine:
        'Cada unidade de {{product}} vende-se a ${{price}} e custa ${{unit}} a fazer; os custos fixos são ${{fixed}}. Uma máquina nova acrescenta ${{extra}} aos custos fixos mas poupa ${{saving}} em cada unidade. Qual é a nova quantidade de equilíbrio?',
    },
    formula: {
      contribution:
        'Margem de contribuição por unidade = preço − custo variável. É o que cada venda acrescenta para pagar os custos fixos e, depois, para o lucro.',
      breakeven:
        'Ponto de equilíbrio = custos fixos ÷ margem de contribuição por unidade (arredonda para cima). Vende mais do que isso e tens lucro.',
      profit: 'Lucro = unidades × (preço − custo variável) − custos fixos.',
      margin: 'Margem de lucro = lucro ÷ receitas × 100. Mostra quanto ficas de cada dólar de vendas.',
      priceForTarget: 'Preço = custo variável + (custos fixos + lucro pretendido) ÷ unidades.',
      machine:
        'Novo equilíbrio = (custos fixos + custo fixo extra) ÷ (preço − novo custo variável). As máquinas sobem os custos fixos mas baixam o custo de cada unidade.',
    },
    percent: '{{n}}%',
    right: 'Certo! +{{points}}',
    wrong: 'Quase: a resposta é {{answer}}.',
    week: 'SEMANA NA FÁBRICA',
    numbers: 'Fazer uma unidade custa ${{unit}} · custos fixos ${{fixed}} por semana · {{stock}} no armazém',
    research: 'ESTUDO DE MERCADO',
    researchRow: 'A ${{price}}: {{count}} clientes por semana',
    researchAbout: 'A ${{price}}: cerca de {{count}} clientes por semana',
    price: 'Preço',
    make: 'Produzir esta semana',
    breakEven: 'A este preço atinges o equilíbrio após {{count}} vendas',
    noBreakEven: 'A este preço perdes dinheiro em cada venda!',
    upgrades: 'INVESTIR ESTA SEMANA?',
    upgrade: {
      none: { title: 'Sem investimento', body: 'Deixar tudo como está.' },
      machine: { title: 'Máquina nova', body: 'Custos fixos +25%, mas cada unidade custa menos 25% a fazer.' },
      ads: { title: 'Publicidade', body: 'Custos fixos +15%, e mais 20% de clientes a qualquer preço.' },
    },
    owned: 'Já comprado',
    run: 'Jogar a semana',
    report: 'RELATÓRIO DA SEMANA',
    line: {
      demand: '{{wanted}} clientes queriam comprar · vendeste {{sold}} · restam {{stock}} no armazém',
      revenue: 'Receitas',
      cogs: 'Custo das unidades vendidas',
      fixed: 'Custos fixos',
      storage: 'Armazenamento do stock por vender',
      profit: 'Lucro',
      best: 'Melhor preço esta semana: ${{price}}, para ${{profit}} de lucro',
      over: 'Fizeste mais do que conseguias vender: guardar o stock por vender custa dinheiro.',
      under: 'Esgotaste: havia mais clientes a querer comprar.',
    },
  },

  // ─── Market Simulator ──────────────────────────────────────────────────────
  invest: {
    practice: 'Só dinheiro de treino · empresas inventadas',
    quarter: 'Trimestre {{n}} de {{total}}',
    portfolio: 'A tua carteira',
    indexCompare: 'O mercado inteiro (fundo de índice): ${{value}}',
    news: 'NOTÍCIAS',
    quizTitle: 'PERGUNTA DE INVESTIDOR',
    allocate: 'DISTRIBUI OS TEUS ${{value}}',
    total: 'Total: {{pct}}%',
    totalHint: 'As tuas escolhas têm de somar 100%.',
    limit: 'Mantém cada empresa em {{pct}}% ou menos para diversificar o teu risco.',
    feesNote: 'Comissões por trimestre: fundo de índice 0,05%, obrigações 0,1%, ações de cada empresa 0,3%.',
    run: 'Próximo trimestre',
    report: 'RESULTADOS DO TRIMESTRE {{n}}',
    yourReturn: 'O teu retorno: {{pct}}',
    indexReturn: 'O mercado inteiro: {{pct}}',
    fees: 'Comissões: {{pct}}',
    value: 'Carteira agora: ${{value}}',
    concentrated: 'Demasiado numa só empresa! Se ela cair, a tua carteira inteira cai com ela.',
    risk: {
      low: 'Risco baixo',
      medium: 'Risco médio',
      high: 'Risco alto',
    },
    assets: {
      cash: { name: 'Poupança em dinheiro', body: 'Segura, mas cresce muito devagar' },
      bonds: { name: 'Fundo de obrigações', body: 'Empréstimos a governos e empresas: retornos estáveis e pequenos' },
      index: { name: 'Fundo de índice', body: 'Um pouco de cada empresa: diversifica o teu risco' },
      sunpower: { name: 'SunPower Energy', body: 'Solar e eletricidade' },
      greenleaf: { name: 'GreenLeaf Foods', body: 'Alimentação e mercearia' },
      roboworks: { name: 'RoboWorks', body: 'Robôs e tecnologia' },
      citybank: { name: 'City Bank', body: 'Banca e empréstimos' },
      vitahealth: { name: 'VitaHealth', body: 'Medicamentos e saúde' },
      shopstream: { name: 'ShopStream', body: 'Lojas online e de rua' },
    },
    newsItems: {
      heatwave: 'Onda de calor! A procura de eletricidade dispara.',
      robotOrder: 'A RoboWorks ganha uma encomenda gigante de robôs industriais.',
      harvest: 'Colheita recorde baixa os custos das empresas alimentares.',
      recall: 'A RoboWorks recolhe milhares de robôs com defeito.',
      shopping: 'As compras de Natal batem recordes.',
      medicine: 'Novo medicamento da VitaHealth aprovado.',
      rateRise: 'O banco central sobe as taxas de juro.',
      oilDrop: 'Os preços da energia caem a pique.',
      recession: 'Medo de recessão: os consumidores cortam nos gastos.',
      boom: 'A economia cresce mais depressa do que o esperado.',
      bankScandal: 'City Bank multado por esconder prejuízos.',
      hype: 'Toda a gente na internet diz que a RoboWorks vai "à lua"!',
      rumour: 'Publicação anónima: "A ShopStream vai ser comprada!" (não confirmado)',
      quietQuarter: 'Um trimestre calmo: sem grandes notícias.',
      crash: 'Crash na bolsa! Os preços caem em todo o lado.',
      rebound: 'Os mercados recuperam depois do crash.',
    },
    quiz: {
      share: {
        q: 'O que tens quando compras uma ação?',
        options: [
          'Um empréstimo à empresa',
          'Uma pequena parte da empresa',
          'Um lucro garantido',
          'Um emprego na empresa',
        ],
        why: 'Uma ação é uma pequena parte da propriedade de uma empresa. Se a empresa correr bem, a tua ação pode valorizar e pagar dividendos.',
      },
      diversify: {
        q: 'O que significa diversificar?',
        options: [
          'Comprar só a melhor empresa',
          'Manter todo o dinheiro em numerário',
          'Distribuir o dinheiro por muitos investimentos diferentes',
          'Vender sempre que os preços caem',
        ],
        why: 'Diversificar é não pôr os ovos todos no mesmo cesto. Se um investimento cair, os outros podem manter a tua carteira estável.',
      },
      riskReturn: {
        q: 'Os investimentos que podem render mais normalmente…',
        options: ['Têm mais risco', 'São totalmente seguros', 'Nunca perdem dinheiro', 'São só para bancos'],
        why: 'Retornos possíveis mais altos costumam vir com mais risco: o preço pode oscilar muito nos dois sentidos.',
      },
      index: {
        q: 'O que é um fundo de índice?',
        options: [
          'Uma conta poupança',
          'Uma única empresa de tecnologia',
          'Um empréstimo ao governo',
          'Um fundo com muitas empresas de um mercado',
        ],
        why: 'Um fundo de índice compra um pouco de cada empresa de um mercado, por isso tens o retorno médio do mercado com comissões baixas e menos risco do que com empresas isoladas.',
      },
      bond: {
        q: 'Quando compras uma obrigação, estás a…',
        options: [
          'Comprar parte de uma empresa',
          'Emprestar dinheiro que te é devolvido com juros',
          'Comprar ouro',
          'Pagar um imposto',
        ],
        why: 'Uma obrigação é um empréstimo a um governo ou empresa. Pagam-te juros e devolvem o dinheiro mais tarde, por isso as obrigações costumam ser mais estáveis do que as ações.',
      },
      dividend: {
        q: 'O que é um dividendo?',
        options: [
          'Parte do lucro de uma empresa paga aos acionistas',
          'Uma comissão por comprar ações',
          'Um tipo de empréstimo',
          'Uma descida do preço da ação',
        ],
        why: 'Algumas empresas partilham parte dos lucros com os seus donos (os acionistas) sob a forma de dividendos.',
      },
      compound: {
        q: 'Porque é que começar a investir cedo ajuda tanto?',
        options: [
          'Os preços são sempre mais baixos',
          'Os bancos dão bónus aos jovens',
          'Os ganhos geram mais ganhos ao longo do tempo (juros compostos)',
          'Não pagas comissões',
        ],
        why: 'Com os juros compostos, os teus ganhos começam a gerar os seus próprios ganhos. Quanto mais tempo o teu dinheiro cresce, mais depressa cresce.',
      },
      emergencyFirst: {
        q: 'O que deves normalmente ter antes de investir?',
        options: ['Um carro', 'Um cartão de crédito', 'Uma dica de bolsa de um amigo', 'Um fundo de emergência'],
        why: 'Os investimentos podem cair no curto prazo. Um fundo de emergência evita que sejas obrigado a vender num mau momento para pagar um imprevisto.',
      },
      pastPerformance: {
        q: 'O preço de uma ação duplicou no ano passado. Isto significa…',
        options: [
          'Que vai duplicar outra vez',
          'Nada de certo sobre o próximo ano',
          'Que agora não tem risco',
          'Que tens de a comprar já',
        ],
        why: 'Rendimentos passados não garantem resultados futuros. Os preços dependem do que vai acontecer, não do que aconteceu antes.',
      },
      inflation: {
        q: 'Porque é que guardar todo o dinheiro em numerário pode perder valor com o tempo?',
        options: [
          'A inflação faz os preços subir mais depressa do que o dinheiro cresce',
          'Os bancos ficam com ele',
          'O dinheiro expira',
          'As ações substituem o dinheiro',
        ],
        why: 'Inflação significa que os preços sobem todos os anos. Se o teu dinheiro crescer mais devagar do que os preços, compra menos com o tempo.',
      },
      longTerm: {
        q: 'Que abordagem costuma resultar melhor para investidores comuns?',
        options: [
          'Negociar todos os dias',
          'Seguir dicas da internet',
          'Investir com regularidade a longo prazo',
          'Pôr tudo numa só empresa',
        ],
        why: 'Investir com regularidade e a longo prazo numa carteira diversificada tem historicamente batido as tentativas de adivinhar movimentos de curto prazo.',
      },
      fees: {
        q: 'Porque é que as comissões de investimento importam?',
        options: [
          'Não importam, são minúsculas',
          'Aumentam os retornos',
          'Só os bancos as pagam',
          'São cobradas todos os anos e reduzem os teus retornos',
        ],
        why: 'As comissões saem todos os anos, aconteça o que acontecer. Ao longo de muitos anos, até comissões pequenas fazem uma grande diferença.',
      },
      hype: {
        q: 'Toda a gente na internet diz que uma ação vai "à lua". O que é sensato?',
        options: [
          'Comprar o máximo possível',
          'Ter cuidado: o entusiasmo muitas vezes já está no preço',
          'Pedir dinheiro emprestado para comprar',
          'Dizer a toda a gente para comprar',
        ],
        why: 'Quando algo está na moda em todo o lado, o preço normalmente já subiu. O entusiasmo exagerado acaba muitas vezes em quedas bruscas.',
      },
      bearMarket: {
        q: 'O que é um mercado em baixa (bear market)?',
        options: [
          'Um longo período em que os preços caem',
          'Um mercado de animais',
          'Uma altura em que os preços sobem depressa',
          'Um mercado fechado',
        ],
        why: 'Um mercado em baixa é uma longa descida dos preços; um mercado em alta, uma longa subida. Ambos fazem parte normal de investir.',
      },
      pricedIn: {
        q: 'Uma boa notícia que toda a gente já conhece muitas vezes…',
        options: ['É lucro garantido', 'É proibida de usar', 'Já está refletida no preço', 'É ignorada pelo mercado'],
        why: 'Os mercados reagem depressa. Quando uma notícia é amplamente conhecida, os compradores normalmente já fizeram subir o preço.',
      },
      rates: {
        q: 'Quando as taxas de juro sobem, o que costuma acontecer?',
        options: [
          'Todas as ações sobem',
          'A poupança em dinheiro rende menos',
          'Nada muda',
          'Pedir emprestado fica mais caro, e algumas ações caem',
        ],
        why: 'Taxas de juro mais altas encarecem os empréstimos, o que pode travar empresas que dependem deles, enquanto os bancos podem ganhar mais.',
      },
      panicSell: {
        q: 'O mercado cai 12%. O que costumam fazer os investidores pacientes?',
        options: [
          'Vender tudo de uma vez',
          'Manter a calma e seguir o plano',
          'Pedir emprestado para comprar uma ação',
          'Deixar de poupar para sempre',
        ],
        why: 'Vender em pânico torna as perdas definitivas. Historicamente, os mercados recuperaram com o tempo, e os investidores que mantiveram o rumo foram recompensados.',
      },
      rebalance: {
        q: 'O que significa reequilibrar uma carteira?',
        options: [
          'Voltar à combinação de investimentos planeada',
          'Vender tudo',
          'Comprar mais do que subiu mais',
          'Mudar de banco',
        ],
        why: 'À medida que os preços mexem, a tua combinação desvia-se. Reequilibrar devolve-a ao nível de risco que planeaste.',
      },
    },
  },
};

export default business;
