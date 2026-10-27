/** Knowzone World Business District (Spanish): walking around the square, its five places and the five business games. */
import type { Translation } from '../../types';
import type en from '../en/business';

const business: Translation<typeof en> = {
  title: 'Distrito de Negocios',
  entryEyebrow: 'NEGOCIOS Y FINANZAS · NUEVO',
  entryTitle: 'Distrito de Negocios',
  entryBody:
    'Dirige una startup, domina un presupuesto, pon precios en un puesto, haz rentable una fábrica e invierte dinero de práctica',
  leave: 'Salir del Distrito de Negocios',
  offline: 'El Distrito de Negocios necesita conexión a internet, porque cada decisión se calcula en nuestro servidor.',
  result: {
    back: 'Volver al Distrito de Negocios',
  },
  hall: {
    walkTo: 'Caminar a: {{station}}',
    you: 'Tú, con tu blazer de Knowzone',
    open: 'Entrar: {{station}}',
    goHere: 'Ir aquí',
    stars: '{{count}} de {{max}} estrellas',
    tip: 'Camina hasta un edificio para empezar un juego. Toca un nombre para ir allí.',
  },
  stations: {
    startup: 'Sede Startup',
    budget: 'Banco del Presupuesto',
    market: 'Plaza del Mercado',
    factory: 'Fábrica de Ganancias',
    exchange: 'Bolsa de Valores',
  },
  games: {
    'startup-tycoon': {
      name: 'Magnate de Startups',
      how: 'Dirige tu propia empresa mes a mes: contrata productores, vendedores y personal de apoyo, invierte en marketing y toma decisiones de gestión difíciles. Haz crecer su valor sin quedarte sin liquidez.',
    },
    'budget-master': {
      name: 'Maestro del Presupuesto',
      how: 'Planifica un sueldo mensual: paga las facturas, come bien, ahorra para una meta, crea un fondo de emergencia y afronta imprevistos sin endeudarte.',
    },
    'market-master': {
      name: 'Maestro del Mercado',
      how: 'Lleva un puesto en el mercado: elige tu precio y cuánto stock comprar cada día mientras el clima, la gente y un rival cambian la demanda.',
    },
    'profit-quest': {
      name: 'Misión Ganancias',
      how: 'Domina las matemáticas de un negocio (márgenes, punto de equilibrio, beneficio) y luego dirige una fábrica semana a semana: fija el precio, cuánto producir y cuándo invertir.',
    },
    'market-simulator': {
      name: 'Simulador de Bolsa',
      how: 'Invierte dinero de práctica en empresas inventadas, bonos y un fondo indexado. Las noticias mueven el mercado: reparte tu riesgo y aprende cómo funciona invertir. Sin dinero real.',
    },
  },

  ui: {
    money: '${{amount}}',
    minus: '−${{amount}}',
    perMonth: '${{amount}}/mes',
    next: 'Siguiente',
    finish: 'Ver resultados',
    best: 'Mejor opción',
    good: 'Buena opción',
    fair: 'Opción aceptable',
    poor: 'Mala opción',
    bestWas: 'La mejor opción era: {{choice}}',
    lesson: 'LECCIÓN DE NEGOCIOS',
    left: 'Por planificar: ${{amount}}',
    over: 'Te pasas por ${{amount}}',
    points: '+{{points}} puntos',
    more: 'Más',
    less: 'Menos',
    pick: 'Elige primero una opción.',
    unbalanced: 'Planifica cada dólar: el total debe cuadrar exactamente.',
    invalid: 'Ese plan no está permitido. Revisa los números.',
  },

  // ─── Startup Tycoon ────────────────────────────────────────────────────────
  startup: {
    companies: {
      bakery: 'Panadería y Café Amanecer',
      repair: 'FixIt Reparación de Móviles',
      apps: 'Pixel Estudio de Apps',
      fashion: 'Thread Marca de Moda',
      solar: 'BrightSun Instalaciones Solares',
    },
    sale: {
      bakery: 'pasteles y cafés',
      repair: 'reparaciones',
      apps: 'proyectos de apps',
      fashion: 'prendas',
      solar: 'instalaciones',
    },
    month: 'Mes {{n}} de {{total}}',
    goal: 'Meta: que tu parte valga ${{goal}}',
    value: 'Valor de la empresa',
    cash: 'Liquidez',
    morale: 'Moral',
    rep: 'Reputación',
    owned: 'Tienes el {{pct}} %',
    decision: 'DECISIÓN DEL MES',
    team: 'TU EQUIPO',
    roles: {
      maker: 'Productores',
      seller: 'Vendedores',
      support: 'Apoyo',
    },
    roleHint: {
      maker: 'Cada uno hace unos {{n}} {{sale}} al mes',
      seller: 'Cada uno trae unos {{n}} clientes más al mes',
      support: 'Lleva la administración y los clientes; cada uno atiende a 4 compañeros',
    },
    salary: '${{amount}}/mes cada uno',
    hireCost: 'Coste de contratar: ${{amount}} (selección y formación)',
    payroll: 'Nómina: ${{amount}}/mes',
    marketing: 'MARKETING ESTE MES',
    none: 'Nada',
    run: 'Jugar el mes',
    report: 'INFORME DEL MES {{n}}',
    statement: {
      revenue: 'Ingresos (ventas)',
      cogs: 'Coste de ventas',
      gross: 'Beneficio bruto ({{pct}} % de margen)',
      payroll: 'Salarios',
      rent: 'Alquiler',
      marketing: 'Marketing',
      other: 'Gastos e ingresos puntuales',
      loan: 'Pago del préstamo',
      net: 'Beneficio neto',
      cash: 'Dinero en el banco',
      runway: 'A este ritmo, el dinero dura {{count}} meses más',
    },
    ops: {
      line: '{{demand}} clientes querían comprar · tu equipo podía atender a {{capacity}} · vendiste {{sold}}',
      order: 'Más un pedido especial de {{count}}',
      turnedAway: 'Rechazaste a {{count}} clientes. Con más productores habrías ganado más.',
      idle: 'Tus productores tuvieron tiempo libre. Más vendedores o marketing traerían clientes.',
      balanced: 'La producción de tu equipo encajó bien con la demanda.',
      overload: 'Tu equipo es demasiado grande para su personal de apoyo: todos fueron más lentos.',
      saturated: 'Tu mercado se está llenando: cada vendedor extra trae menos clientes nuevos.',
    },
    bankrupt: '¡Sin liquidez! Una empresa puede ser rentable sobre el papel y aun así fracasar si se queda sin dinero.',
    dilemmas: {
      poach: {
        title: '¿Se va tu mejor productor?',
        body: 'Una empresa rival ofrece a tu productor más hábil un trabajo mejor pagado. Prefiere quedarse, pero necesita un aumento.',
        options: {
          match: 'Subir $120/mes a cada productor',
          letGo: 'Desearle suerte y dejarle ir',
          threaten: 'Decirle que se arrepentirá de irse',
        },
        lesson:
          'Reemplazar a un buen empleado suele costar mucho más que retenerlo: selección, formación y producción perdida mientras el nuevo aprende. Un sueldo justo mantiene a tu mejor gente y la moral alta.',
      },
      bigOrder: {
        title: 'Un pedido enorme, con un gran descuento',
        body: 'Un cliente grande quiere un pedido enorme este mes, pero solo con un 40 % de descuento sobre tu precio normal.',
        options: {
          negotiate: 'Negociar: un pedido más pequeño con un 15 % de descuento',
          accept: 'Aceptar el 40 % de descuento',
          decline: 'Decir que no con educación',
        },
        lesson:
          'Un descuento sale directamente de tu margen de beneficio. Antes de aceptar, comprueba que el precio sigue cubriendo el coste de fabricar cada unidad y que tienes capacidad libre. Negociar es normal en los negocios.',
      },
      review: {
        title: 'Una reseña furiosa en internet',
        body: 'Un cliente publica que tu servicio fue lento y maleducado. Otras personas lo están leyendo.',
        options: {
          fix: 'Disculparte en público, solucionar el problema y devolverle el dinero',
          ignore: 'Ignorarla, ya se olvidará',
          argue: 'Responder que el cliente miente',
        },
        lesson:
          'Tu reputación hace que los clientes vuelvan y te recomienden. Una respuesta pública y honesta a una queja suele ganar más confianza que no tener quejas.',
      },
      burnout: {
        title: 'El equipo está agotado',
        body: 'Tras semanas de horas extra, tu personal está cansado y comete errores.',
        options: {
          rest: 'Dar a todos un día libre pagado y traer ayuda temporal',
          pizza: 'Invitar a pizza al equipo',
          push: 'Pedir aún más horas extra este mes',
        },
        lesson:
          'La gente cansada produce menos y se va más. Apretar más da un pequeño empujón de producción, pero luego te cuesta moral y rotación de personal. Los buenos jefes cuidan la energía de su equipo.',
      },
      agency: {
        title: 'Una promesa de marketing «viral»',
        body: 'Una agencia promete que una campaña de $2.000 te hará famoso de la noche a la mañana.',
        options: {
          test: 'Hacer una pequeña prueba de $300 y medir los resultados',
          pay: 'Pagar los $2.000',
          skip: 'Pasar',
        },
        lesson:
          'Prueba antes de gastar mucho. Una prueba pequeña y medida muestra si el marketing trae clientes de verdad, para ampliar solo lo que funciona. Las grandes promesas no son pruebas.',
      },
      fancyOffice: {
        title: '¿Una oficina nueva de lujo?',
        body: 'Podrías mudarte a una oficina con estilo y sala de juegos. La mudanza cuesta $2.500 y el alquiler es un 30 % más caro.',
        options: {
          stay: 'Quedarte y gastar en lo que notan los clientes',
          move: 'Mudarte, al equipo le encantará',
        },
        lesson:
          'Los costes fijos como el alquiler se pagan cada mes, vendas o no. Mantenlos bajos, sobre todo al principio, para que tu negocio sobreviva a los meses flojos.',
      },
      sponsor: {
        title: '¿Patrocinar el día deportivo del colegio?',
        body: 'Un colegio del barrio te pide patrocinar su día deportivo por $300. Tu nombre saldría en las camisetas.',
        options: {
          sponsor: 'Patrocinarlo',
          decline: 'Rechazarlo con educación',
        },
        lesson:
          'Apoyar a tu comunidad crea buena imagen y da a conocer tu marca en la zona. Es una forma de marketing que además hace el bien.',
      },
      supplier: {
        title: 'Tu proveedor sube los precios',
        body: 'Los materiales que compras ahora cuestan un 20 % más.',
        options: {
          shop: 'Comparar otros proveedores y negociar',
          raise: 'Trasladar el coste: subir tu precio un 8 %',
          cheap: 'Cambiar a materiales mucho más baratos y de peor calidad',
        },
        lesson:
          'Cuando suben los costes, compara y negocia primero. Bajar la calidad protege tu margen un mes, pero daña tu reputación durante mucho más tiempo.',
      },
      latePayer: {
        title: 'Un cliente no ha pagado',
        body: 'Un cliente grande aún te debe $1.500 de hace 60 días, y el dinero empieza a escasear.',
        options: {
          remind: 'Enviar un recordatorio amable y ofrecer un pequeño descuento por pagar ya',
          wait: 'Esperar y confiar en que pague',
          threaten: 'Amenazarle con abogados',
        },
        lesson:
          'El beneficio no es lo mismo que la liquidez. El dinero que te deben los clientes (cuentas por cobrar) no paga tus facturas hasta que llega. Reclamar los pagos con educación y rapidez mantiene el flujo de caja.',
      },
      newLine: {
        title: 'Una idea de producto nuevo',
        body: 'Alguien del equipo tiene una idea para una nueva línea de productos.',
        options: {
          pilot: 'Hacer primero un pequeño piloto con algunos clientes',
          bigLaunch: 'Lanzarla a lo grande con mucho stock y anuncios',
          later: 'Ahora no',
        },
        lesson:
          'La innovación hace crecer un negocio, pero lanzar en pequeño te permite aprender lo que los clientes quieren de verdad antes de arriesgar mucho dinero. Se llama piloto o producto mínimo viable.',
      },
      training: {
        title: '¿Formar al equipo?',
        body: 'Un curso de $500 haría a tu personal más rápido y más capaz.',
        options: {
          train: 'Pagar el curso',
          free: 'Compartir vídeos gratis de internet',
          skip: 'Sin formación',
        },
        lesson:
          'La formación es una inversión en personas: el personal capacitado produce más y se siente valorado, y eso recupera el coste en los meses siguientes.',
      },
      loan: {
        title: 'Un préstamo bancario',
        body: 'El banco ofrece $4.000, a devolver con $190 al mes (alrededor de un 12 % de interés anual).',
        options: {
          machine: 'Pedirlo para comprar una máquina que produce un 25 % más',
          party: 'Pedirlo para una fiesta del equipo y muebles nuevos',
          no: 'No pedir prestado',
        },
        lesson:
          'La deuda buena paga cosas que generan más que los intereses, como equipos que aumentan la producción. Pedir prestado para cosas que no generan dinero solo te deja cuotas que pagar.',
      },
      rent: {
        title: 'El casero sube el alquiler',
        body: 'Tu casero quiere un 25 % más de alquiler a partir del mes que viene.',
        options: {
          lease: 'Ofrecer un contrato más largo a cambio de una subida menor',
          accept: 'Aceptar la subida',
          moveFar: 'Mudarte a un local más barato lejos de tus clientes',
        },
        lesson:
          'Casi todo en los negocios se puede negociar. Ofrecer algo que la otra parte valora (un contrato largo y fiable) puede darte un mejor trato. La ubicación también importa: alejarte de los clientes hace perder ventas.',
      },
      competitor: {
        title: 'Un competidor abre cerca',
        body: 'Un negocio nuevo abre calle abajo con precios más bajos.',
        options: {
          quality: 'Competir en calidad y servicio, con una tarjeta de fidelidad',
          priceWar: 'Bajar tus precios un 25 % para ganarles',
          nothing: 'No hacer nada',
        },
        lesson:
          'Una guerra de precios puede destruir los beneficios de ambos negocios. Suele ser más inteligente competir en lo que te hace diferente: calidad, servicio y clientes fieles.',
      },
      safety: {
        title: 'Una inspección de seguridad',
        body: 'Un inspector encuentra un problema de seguridad en tu lugar de trabajo.',
        options: {
          fixNow: 'Arreglarlo bien enseguida',
          later: 'Ponerle un parche barato y arreglarlo después',
        },
        lesson:
          'Las empresas deben mantener seguros a trabajadores y clientes. Arreglar los problemas pronto es más barato que las multas, los accidentes y una reputación dañada.',
      },
      remote: {
        title: '¿Teletrabajo?',
        body: 'Tu personal pide trabajar desde casa algunos días.',
        options: {
          trial: 'Probarlo un mes y medir los resultados',
          refuse: 'Negarte',
          always: 'Permitirlo a todos, todos los días, sin controles',
        },
        lesson:
          'La flexibilidad puede subir la moral, pero los buenos jefes prueban los cambios y miden su efecto en la producción antes de decidir para siempre.',
      },
      investor: {
        title: 'Un inversor quiere entrar',
        body: 'Un inversor ofrece $10.000 a cambio del 40 % de tu empresa.',
        options: {
          counter: 'Contraoferta: $8.000 por el 20 %',
          accept: 'Aceptar $10.000 por el 40 %',
          refuse: 'Rechazar y crecer con tu propio dinero',
        },
        lesson:
          'Vender participaciones (capital) trae dinero sin deuda, pero cedes parte de cada beneficio futuro y del valor de la empresa. Esto se llama dilución. Negocia el precio de tus participaciones.',
      },
      tax: {
        title: 'Toca pagar impuestos',
        body: 'Debes $700 en impuestos de la empresa este mes.',
        options: {
          pay: 'Pagarlos a tiempo',
          plan: 'Pedir un plan de pago oficial',
          ignore: 'Ignorarlos por ahora',
        },
        lesson:
          'Los impuestos pagan carreteras, colegios y hospitales, y toda empresa debe pagarlos. Pagar tarde trae recargos, así que los negocios listos van apartando dinero para impuestos mientras ganan.',
      },
      bigClient: {
        title: 'Un cliente gigante',
        body: 'Un cliente enorme ofrece comprar la mitad de todo lo que produces, pero solo si dejas a tus otros clientes.',
        options: {
          balance: 'Aceptar un trato menor y mantener a tus otros clientes',
          allIn: 'Dejar a todos los demás y firmar',
          decline: 'Rechazarlo',
        },
        lesson:
          'Depender de un solo cliente es arriesgado: si se va, la mayor parte de tu negocio se va con él. Repartir las ventas entre muchos clientes hace más fuerte a una empresa.',
      },
      ethics: {
        title: 'Un «regalo» secreto',
        body: 'Un proveedor te ofrece un regalo personal secreto si sigues comprándole a precios más altos.',
        options: {
          refuse: 'Rechazarlo y denunciarlo',
          accept: 'Aceptar el regalo',
        },
        lesson:
          'Ese regalo es un soborno. Le cuesta dinero a tu empresa, a menudo es ilegal y destruye la confianza. Las empresas éticas duran más.',
      },
    },
  },

  // ─── Budget Master ─────────────────────────────────────────────────────────
  budget: {
    month: 'Mes {{n}} de {{total}}',
    income: 'Ingresos este mes',
    bills: 'FACTURAS (OBLIGATORIAS)',
    afterBills: 'Te queda tras las facturas',
    plan: 'TU PLAN',
    billNames: {
      rent: 'Alquiler',
      utilities: 'Luz y agua',
      phone: 'Teléfono y datos',
      transport: 'Transporte',
      minimum: 'Pago mínimo de la tarjeta',
      subscription: 'Suscripción de streaming',
      bankFees: 'Comisiones bancarias',
      carDeal: 'Cuota del coche',
    },
    keys: {
      food: 'Comida',
      fun: 'Ocio',
      clothes: 'Ropa',
      emergency: 'Fondo de emergencia',
      goal: 'Meta de ahorro',
      debt: 'Pago extra de la tarjeta',
    },
    keyHint: {
      food: 'Necesitas al menos ${{min}}',
      fun: 'Salir, juegos, caprichos',
      clothes: 'Ropa y zapatos nuevos',
      emergency: '${{have}} ahorrados · objetivo ${{target}}',
      goal: '{{goal}}: ${{have}} de ${{target}}',
      debt: 'Deuda de tarjeta ${{have}} · {{rate}} % de interés al mes',
    },
    goals: {
      laptop: 'Portátil nuevo',
      bike: 'Bicicleta',
      course: 'Curso de programación',
      travel: 'Viaje',
      deposit: 'Fianza de un piso',
    },
    rule: 'Necesidades {{needs}} % · Deseos {{wants}} % · Ahorro {{savings}} %',
    ruleHint: 'Una buena guía: necesidades cerca del 50 %, deseos hasta el 30 %, ahorra al menos el 20 %.',
    restToGoal: 'Poner el resto en ahorros',
    event: 'ESTE MES',
    costFrom: {
      fun: '−${{amount}} del dinero de ocio',
      emergency: '−${{amount}} del fondo de emergencia',
      goal: '−${{amount}} de los ahorros',
      card: '−${{amount}} con la tarjeta de crédito',
    },
    gain: '+${{amount}} a los ahorros',
    newBill: '+${{amount}} cada mes',
    run: 'Vivir el mes',
    report: 'INFORME DEL MES {{n}}',
    check: {
      food: 'Comiste bien',
      noFood: 'No alcanzó para comida',
      saved: 'Ahorraste el {{pct}} % de tus ingresos',
      wants: 'Gastaste el {{pct}} % en deseos',
      card: '${{amount}} se cargaron a la tarjeta de crédito',
      interest: 'Intereses de la tarjeta este mes: ${{amount}}',
      debt: 'Deuda de tarjeta ahora: ${{amount}}',
      emergency: 'Fondo de emergencia: ${{amount}}',
      goal: 'Meta de ahorro: ${{amount}} de ${{target}}',
    },
    events: {
      concert: {
        title: 'Invitación a un concierto',
        body: 'Un amigo te invita a un concierto. Las entradas cuestan $80.',
        options: {
          funMoney: 'Ir, pagando con tu dinero de ocio',
          freePlan: 'Proponer un picnic gratis',
          card: 'Ir y pagar con la tarjeta de crédito',
        },
        lesson:
          'Divertirse es parte de un presupuesto sano: para eso es tu dinero de ocio. Pagar deseos a crédito significa pagar intereses por una noche de fiesta durante meses.',
      },
      phone: {
        title: 'Pantalla del móvil rota',
        body: 'Se te cae el móvil. Reparar la pantalla cuesta $150.',
        options: {
          emergency: 'Pagar con tu fondo de emergencia',
          card: 'Pagar con la tarjeta de crédito',
          newPhone: 'Comprar un móvil nuevo de $700 a crédito',
        },
        lesson:
          'Justo para esto existe un fondo de emergencia: imprevistos que no puedes evitar. Reparar suele ser mucho más barato que sustituir.',
      },
      sale: {
        title: '«¡50 % de descuento, solo hoy!»',
        body: 'Una tienda tiene una oferta relámpago en unas zapatillas que no necesitas de verdad: $120.',
        options: {
          skip: 'Pasar',
          funMoney: 'Comprarlas con el dinero de ocio',
          card: 'Comprarlas con la tarjeta de crédito',
        },
        lesson:
          'Un descuento en algo que no necesitas no es un ahorro, es un gasto. «Solo hoy» está pensado para meterte prisa. Espera un día antes de comprar un capricho.',
      },
      gift: {
        title: 'El cumpleaños de mamá',
        body: 'Este mes es el cumpleaños de tu madre.',
        options: {
          funMoney: 'Un regalo de $40 con tu dinero de ocio',
          handmade: 'Una tarjeta hecha a mano y prepararle la cena',
          card: 'Un regalo caro de $150 con la tarjeta de crédito',
        },
        lesson:
          'Detallista no tiene por qué significar caro. Los regalos van en tus gastos planificados, no en la tarjeta de crédito.',
      },
      bonus: {
        title: '¡Un bonus de $300!',
        body: 'Tu jefe te da un bonus de $300 por tu gran trabajo.',
        options: {
          save: 'Ahorrarlo todo',
          split: 'Ahorrar $240 y disfrutar $60',
          spend: 'Gastarlo todo este fin de semana',
        },
        lesson:
          'El dinero extra es el más fácil de ahorrar, porque ya vivías sin él. Ahorrar la mayor parte de un ingreso inesperado y disfrutar un poco es un gran hábito.',
      },
      scam: {
        title: '«¡Duplica tu dinero en una semana!»',
        body: 'Un chat de grupo promete duplicar cualquier dinero que les envíes en una semana.',
        options: {
          ignore: 'Ignorarlo y avisar a tus amigos',
          invest: 'Enviarles $200 de tus ahorros',
        },
        lesson:
          'Nadie puede duplicar dinero en una semana de forma segura. Las rentabilidades altas garantizadas son señal de estafa: tu dinero desaparece.',
      },
      bike: {
        title: 'Reparar la bici',
        body: 'La bici con la que vas al trabajo necesita una reparación de $220.',
        options: {
          emergency: 'Pagar con tu fondo de emergencia',
          card: 'Pagar con la tarjeta de crédito',
          taxis: 'No repararla y coger taxis todo el mes ($380)',
        },
        lesson:
          'Aplazar una reparación necesaria suele salir más caro. Tu fondo de emergencia te permite resolver problemas rápido sin pedir prestado.',
      },
      subscription: {
        title: 'Se acaba la prueba gratis',
        body: 'Termina tu prueba gratis de streaming. A partir de ahora cuesta $15 al mes.',
        options: { cancel: 'Cancelarla', keep: 'Mantenerla' },
        lesson:
          'Las pequeñas suscripciones mensuales suman: $15 al mes son $180 al año. Revisa tus suscripciones a menudo y cancela las que no uses.',
      },
      sideHustle: {
        title: 'Clases particulares el fin de semana',
        body: 'Un vecino te ofrece $150 por dar clases a su hijo los fines de semana.',
        options: {
          takeSave: 'Aceptar y ahorrar lo que ganes',
          decline: 'Rechazar y conservar tus fines de semana',
        },
        lesson:
          'Un ingreso extra acelera tus metas. Ahorrar ese ingreso extra, en vez de gastarlo, te lleva allí mucho más rápido.',
      },
      dentist: {
        title: 'Dolor de muelas',
        body: 'Te duele una muela. El dentista cuesta $180.',
        options: {
          emergency: 'Ir ya, pagando con tu fondo de emergencia',
          card: 'Ir ya, pagando con la tarjeta de crédito',
          wait: 'Esperar a que empeore ($450 más adelante)',
        },
        lesson:
          'Cuidar tu salud pronto es más barato que tratar un problema mayor después. Nunca te saltes atención que necesitas para ahorrar dinero.',
      },
      loanApp: {
        title: 'App de préstamos al instante',
        body: 'Una app te ofrece $500 al instante. Devolverías $650 en solo dos semanas.',
        options: { decline: 'Rechazarlo', take: 'Aceptarlo' },
        lesson:
          'Devolver $650 por $500 en dos semanas es un tipo de interés enorme, muchas veces mayor que el de una tarjeta de crédito. Los préstamos rápidos de este tipo atrapan a la gente en deudas.',
      },
      foodPrices: {
        title: 'Suben los precios de la comida',
        body: 'Los precios en las tiendas suben un 10 % este mes: la comida te cuesta $30 más.',
        options: {
          cutWants: 'Gastar menos en deseos este mes',
          card: 'Cargar la diferencia a la tarjeta de crédito',
        },
        lesson:
          'Cuando suben los precios (inflación), ajusta tu presupuesto recortando deseos, no pidiendo prestado para necesidades.',
      },
      bankFees: {
        title: 'Comisiones bancarias',
        body: 'Tu banco te cobra $12 cada mes solo por tener una cuenta.',
        options: { switch: 'Cambiar a una cuenta gratuita', stay: 'Quedarte en este banco' },
        lesson:
          'Las comisiones se comen tu dinero en silencio cada mes. Comparar bancos y cambiar a una cuenta gratuita es una victoria fácil.',
      },
      friendLoan: {
        title: 'Un amigo necesita dinero',
        body: 'Un amigo te pide $100 prestados hasta el mes que viene.',
        options: {
          afford: 'Prestar $100 del dinero de ocio, dinero del que puedes prescindir',
          kindNo: 'Explicarle con amabilidad que este mes no puedes',
          savings: 'Prestarlo de tu fondo de emergencia',
        },
        lesson:
          'Presta solo lo que podrías permitirte no recuperar nunca, y nunca de tu fondo de emergencia. Decir que no con amabilidad también está bien.',
      },
      matching: {
        title: 'Dinero gratis del trabajo',
        body: 'Tu empresa añade $1 a tu ahorro para la jubilación por cada $1 que ahorres ahí, hasta $100 al mes.',
        options: { join: 'Apuntarte: ahorrar $100 y recibir $100 extra', later: 'Quizá más adelante' },
        lesson:
          'La aportación de la empresa es una rentabilidad instantánea del 100 % sobre tu dinero. Es uno de los mejores tratos de las finanzas personales: aprovéchalo siempre que puedas.',
      },
      carDeal: {
        title: '«¡Solo $250 al mes!»',
        body: 'Un concesionario te ofrece un coche reluciente por «solo $250 al mes» durante seis años.',
        options: {
          decline: 'Rechazarlo: no necesitas coche',
          sign: 'Firmar el contrato',
        },
        lesson:
          'Mira el total, no la cuota mensual: $250 × 72 meses son $18.000. Un plan de pagos largo es un gran compromiso.',
      },
    },
  },

  // ─── Market Master ─────────────────────────────────────────────────────────
  market: {
    products: {
      lemonade: 'Limonada',
      fruit: 'Vasitos de fruta',
      icePops: 'Polos',
      sandwiches: 'Sándwiches',
    },
    day: 'Día {{n}} de {{total}}',
    costEach: 'El stock cuesta ${{cost}} cada uno',
    fee: 'Puesto ${{fee}} al día · lo que no se vende se tira',
    rival: 'Precio del puesto rival: ${{price}}',
    research: 'ESTUDIO DE MERCADO',
    researchRow: 'A ${{price}}: unos {{count}} clientes',
    noResearch: 'Hoy no hay estudio: usa la previsión y lo que has aprendido.',
    yesterday: 'Ayer: precio ${{price}}, {{wanted}} clientes querían comprar',
    price: 'Tu precio',
    stock: 'Stock a comprar',
    preview: 'Si lo vendes todo: ${{revenue}} en ventas, ${{profit}} de beneficio',
    open: 'Abrir el puesto',
    report: 'INFORME DEL DÍA {{n}}',
    line: {
      wanted: '{{count}} clientes querían comprar',
      sold: 'Vendiste {{count}}',
      wasted: '{{count}} tirados sin vender',
      missed: '{{count}} clientes se fueron con las manos vacías',
      revenue: 'Ventas',
      stock: 'Stock comprado',
      fee: 'Puesto',
      profit: 'Beneficio',
      best: 'Lo mejor hoy: ${{price}} con {{count}} en stock, para ${{profit}} de beneficio',
    },
    days: {
      sunny: { title: 'Un día soleado normal', body: 'Hoy hay gente constante en el mercado.' },
      hot: { title: '¡Ola de calor!', body: 'Hace un calor abrasador: todo el mundo quiere algo frío.' },
      cloudy: { title: 'Gris y fresco', body: 'Las nubes y un viento frío dejan a muchos compradores en casa.' },
      rainy: { title: 'Lluvia todo el día', body: 'Lluvia fuerte: solo sale la mitad de los compradores habituales.' },
      festival: { title: '¡Día de festival!', body: 'Un festival de música llena las calles de gente.' },
      rival: { title: 'Abre un puesto rival', body: 'Un puesto nuevo al otro lado de la calle vende lo mismo.' },
      rivalSale: {
        title: 'La gran oferta del rival',
        body: 'El puesto rival rebaja mucho su precio para ganar clientes.',
      },
      shortage: { title: 'Escasez de suministro', body: 'Mala cosecha: tus suministros cuestan un 60 % más hoy.' },
      tourists: {
        title: 'Llega un autobús turístico',
        body: 'Los turistas llenan el mercado. El precio les importa menos.',
      },
      payday: { title: 'Día de paga', body: 'La fábrica de al lado acaba de pagar a sus trabajadores.' },
      cold: { title: 'Ola de frío', body: 'Hace un frío helador: menos compradores, y buscan gangas.' },
      bulk: {
        title: 'Cosecha abundante',
        body: 'Los proveedores tienen de sobra: tu stock es un 25 % más barato hoy.',
      },
    },
    ideas: {
      demand:
        'La ley de la demanda: cuando el precio sube, la gente compra menos; cuando baja, compra más. El mejor precio equilibra cuánto vendes con cuánto ganas en cada venta.',
      shiftRight:
        'La demanda aumentó: a cada precio, más gente quiere comprar. Cuando sube la demanda puedes vender más y a menudo cobrar un poco más.',
      shiftLeft:
        'La demanda bajó: a cada precio, menos gente quiere comprar. Compra menos stock para no desperdiciarlo y no esperes que funcionen los precios altos.',
      peak: 'Demanda máxima: los días de mucha gente es cuando los negocios ganan más. Ten stock suficiente: quedarte sin él es rechazar a clientes que pagan.',
      competition:
        'Competencia: cuando un rival vende lo mismo, los clientes comparan precios. Cobra mucho más que él y cruzarán la calle.',
      substitutes:
        'Sustitutos: cuando un producto parecido se abarata, la demanda del tuyo baja. Puedes igualarlo un poco, pero una guerra de precios puede acabar con el beneficio.',
      supplyShock:
        'Un shock de oferta: cuando suben los costes, cada venta gana menos. Los negocios suelen subir precios y vender un poco menos.',
      inelastic:
        'Demanda inelástica: algunos clientes apenas reaccionan al precio. Cuando al comprador le importa menos el precio, un precio más alto gana más.',
      income: 'Efecto renta: cuando la gente tiene más dinero, compra más y le importa un poco menos el precio.',
      elastic:
        'Demanda elástica: los clientes sensibles al precio compran mucho menos cuando sube. Mantén precios bajos en días como este.',
      supplyGlut:
        'Costes más bajos: cuando los suministros son baratos, cada venta gana más, y un precio algo más bajo puede atraer clientes extra.',
    },
  },

  // ─── Profit Quest ──────────────────────────────────────────────────────────
  profit: {
    products: {
      backpacks: 'mochilas',
      bikes: 'bicicletas',
      phoneCases: 'fundas de móvil',
      shoes: 'zapatos escolares',
    },
    factory: 'Tu fábrica hace {{product}}',
    step: 'Reto {{n}} de {{total}}',
    calcTitle: 'MATEMÁTICAS DEL NEGOCIO',
    calc: {
      contribution:
        'Vendes {{product}} a ${{price}} la unidad. Fabricar una unidad cuesta ${{unit}} en materiales y mano de obra. ¿Cuánto aporta cada venta a tus costes fijos?',
      breakeven:
        'Cada unidad de {{product}} se vende a ${{price}} y cuesta ${{unit}} fabricarla. Los costes fijos (alquiler, máquinas, jefes) son ${{fixed}} a la semana. ¿Cuántas unidades debes vender cada semana para alcanzar el punto de equilibrio?',
      profit:
        'Vendes {{units}} {{product}} a ${{price}}. Cada unidad cuesta ${{unit}} fabricarla y los costes fijos son ${{fixed}}. ¿Cuál es tu beneficio?',
      margin:
        'Vendes {{units}} {{product}} a ${{price}}. Cada unidad cuesta ${{unit}} fabricarla y los costes fijos son ${{fixed}}. ¿Cuál es tu margen de beneficio (beneficio como % de los ingresos)?',
      priceForTarget:
        'Esperas vender {{units}} {{product}}. Cada unidad cuesta ${{unit}} fabricarla y los costes fijos son ${{fixed}}. ¿Qué precio te da un beneficio de ${{target}}?',
      machine:
        'Cada unidad de {{product}} se vende a ${{price}} y cuesta ${{unit}} fabricarla; los costes fijos son ${{fixed}}. Una máquina nueva añade ${{extra}} a los costes fijos pero ahorra ${{saving}} en cada unidad. ¿Cuál es la nueva cantidad de equilibrio?',
    },
    formula: {
      contribution:
        'Margen de contribución por unidad = precio − coste variable. Es lo que cada venta aporta para pagar los costes fijos y, después, al beneficio.',
      breakeven:
        'Punto de equilibrio = costes fijos ÷ margen de contribución por unidad (redondea hacia arriba). Vende más que eso y tendrás beneficio.',
      profit: 'Beneficio = unidades × (precio − coste variable) − costes fijos.',
      margin: 'Margen de beneficio = beneficio ÷ ingresos × 100. Muestra cuánto te quedas de cada dólar de ventas.',
      priceForTarget: 'Precio = coste variable + (costes fijos + beneficio objetivo) ÷ unidades.',
      machine:
        'Nuevo equilibrio = (costes fijos + coste fijo extra) ÷ (precio − nuevo coste variable). Las máquinas suben los costes fijos pero bajan el coste de cada unidad.',
    },
    percent: '{{n}} %',
    right: '¡Correcto! +{{points}}',
    wrong: 'Casi: la respuesta es {{answer}}.',
    week: 'SEMANA EN LA FÁBRICA',
    numbers: 'Fabricar una unidad cuesta ${{unit}} · costes fijos ${{fixed}} a la semana · {{stock}} en el almacén',
    research: 'ESTUDIO DE MERCADO',
    researchRow: 'A ${{price}}: {{count}} clientes a la semana',
    researchAbout: 'A ${{price}}: unos {{count}} clientes a la semana',
    price: 'Precio',
    make: 'Producir esta semana',
    breakEven: 'A este precio alcanzas el equilibrio tras {{count}} ventas',
    noBreakEven: '¡A este precio pierdes dinero con cada venta!',
    upgrades: '¿INVERTIR ESTA SEMANA?',
    upgrade: {
      none: { title: 'Sin inversión', body: 'Dejar las cosas como están.' },
      machine: {
        title: 'Máquina nueva',
        body: 'Costes fijos +25 %, pero cada unidad cuesta un 25 % menos de fabricar.',
      },
      ads: { title: 'Publicidad', body: 'Costes fijos +15 %, y un 20 % más de clientes a cualquier precio.' },
    },
    owned: 'Ya comprado',
    run: 'Jugar la semana',
    report: 'INFORME DE LA SEMANA',
    line: {
      demand: '{{wanted}} clientes querían comprar · vendiste {{sold}} · quedan {{stock}} en el almacén',
      revenue: 'Ingresos',
      cogs: 'Coste de las unidades vendidas',
      fixed: 'Costes fijos',
      storage: 'Almacenaje del stock sin vender',
      profit: 'Beneficio',
      best: 'Mejor precio esta semana: ${{price}}, para ${{profit}} de beneficio',
      over: 'Produjiste más de lo que podías vender: almacenar lo no vendido cuesta dinero.',
      under: 'Te quedaste sin stock: más clientes querían comprar.',
    },
  },

  // ─── Market Simulator ──────────────────────────────────────────────────────
  invest: {
    practice: 'Solo dinero de práctica · empresas inventadas',
    quarter: 'Trimestre {{n}} de {{total}}',
    portfolio: 'Tu cartera',
    indexCompare: 'Todo el mercado (fondo indexado): ${{value}}',
    news: 'NOTICIAS',
    quizTitle: 'PREGUNTA DE INVERSOR',
    allocate: 'REPARTE TUS ${{value}}',
    total: 'Total: {{pct}} %',
    totalHint: 'Tus elecciones deben sumar el 100 %.',
    limit: 'No pongas más del {{pct}} % en una sola empresa para repartir tu riesgo.',
    feesNote: 'Comisiones por trimestre: fondo indexado 0,05 %, bonos 0,1 %, acciones de cada empresa 0,3 %.',
    run: 'Siguiente trimestre',
    report: 'RESULTADOS DEL TRIMESTRE {{n}}',
    yourReturn: 'Tu rentabilidad: {{pct}}',
    indexReturn: 'Todo el mercado: {{pct}}',
    fees: 'Comisiones: {{pct}}',
    value: 'Cartera ahora: ${{value}}',
    concentrated: '¡Demasiado en una sola empresa! Si cae, toda tu cartera cae con ella.',
    risk: {
      low: 'Riesgo bajo',
      medium: 'Riesgo medio',
      high: 'Riesgo alto',
    },
    assets: {
      cash: { name: 'Ahorro en efectivo', body: 'Seguro, pero crece muy despacio' },
      bonds: { name: 'Fondo de bonos', body: 'Préstamos a gobiernos y empresas: rentabilidad estable y pequeña' },
      index: { name: 'Fondo indexado', body: 'Un poco de cada empresa: reparte tu riesgo' },
      sunpower: { name: 'SunPower Energy', body: 'Energía solar y electricidad' },
      greenleaf: { name: 'GreenLeaf Foods', body: 'Alimentación y supermercados' },
      roboworks: { name: 'RoboWorks', body: 'Robots y tecnología' },
      citybank: { name: 'City Bank', body: 'Banca y préstamos' },
      vitahealth: { name: 'VitaHealth', body: 'Medicamentos y salud' },
      shopstream: { name: 'ShopStream', body: 'Tiendas online y a pie de calle' },
    },
    newsItems: {
      heatwave: '¡Ola de calor! La demanda de electricidad se dispara.',
      robotOrder: 'RoboWorks gana un pedido gigante de robots industriales.',
      harvest: 'Una cosecha récord baja los costes de las empresas de alimentación.',
      recall: 'RoboWorks retira miles de robots defectuosos.',
      shopping: 'Las compras navideñas baten récords.',
      medicine: 'Aprobado el nuevo medicamento de VitaHealth.',
      rateRise: 'El banco central sube los tipos de interés.',
      oilDrop: 'Los precios de la energía caen con fuerza.',
      recession: 'Miedo a la recesión: los consumidores recortan gastos.',
      boom: 'La economía crece más rápido de lo esperado.',
      bankScandal: 'Multa a City Bank por ocultar pérdidas.',
      hype: '¡Todo internet dice que RoboWorks «llegará a la luna»!',
      rumour: 'Mensaje anónimo: «¡Van a comprar ShopStream!» (sin confirmar)',
      quietQuarter: 'Un trimestre tranquilo: sin grandes noticias.',
      crash: '¡Desplome del mercado! Los precios caen en todas partes.',
      rebound: 'Los mercados se recuperan tras el desplome.',
    },
    quiz: {
      share: {
        q: '¿Qué tienes cuando compras una acción?',
        options: [
          'Un préstamo a la empresa',
          'Una pequeña parte de la empresa',
          'Un beneficio garantizado',
          'Un trabajo en la empresa',
        ],
        why: 'Una acción es una pequeña parte de la propiedad de una empresa. Si a la empresa le va bien, tu acción puede subir de valor y pagar dividendos.',
      },
      diversify: {
        q: '¿Qué significa diversificar?',
        options: [
          'Comprar solo la mejor empresa',
          'Tener todo tu dinero en efectivo',
          'Repartir el dinero entre muchas inversiones distintas',
          'Vender siempre que bajen los precios',
        ],
        why: 'Diversificar es no poner todos los huevos en la misma cesta. Si una inversión cae, las demás pueden mantener estable tu cartera.',
      },
      riskReturn: {
        q: 'Las inversiones que pueden ganar más normalmente…',
        options: ['Tienen más riesgo', 'Son totalmente seguras', 'Nunca pierden dinero', 'Son solo para bancos'],
        why: 'Una rentabilidad posible más alta suele venir con más riesgo: el precio puede moverse mucho en ambas direcciones.',
      },
      index: {
        q: '¿Qué es un fondo indexado?',
        options: [
          'Una cuenta de ahorro',
          'Una sola empresa tecnológica',
          'Un préstamo al gobierno',
          'Un fondo con muchas empresas de un mercado',
        ],
        why: 'Un fondo indexado compra un poco de cada empresa de un mercado, así obtienes la rentabilidad media del mercado con comisiones bajas y menos riesgo que con empresas sueltas.',
      },
      bond: {
        q: 'Cuando compras un bono, estás…',
        options: [
          'Comprando parte de una empresa',
          'Prestando dinero que te devuelven con intereses',
          'Comprando oro',
          'Pagando un impuesto',
        ],
        why: 'Un bono es un préstamo a un gobierno o a una empresa. Te pagan intereses y te devuelven el dinero más tarde, por eso los bonos suelen ser más estables que las acciones.',
      },
      dividend: {
        q: '¿Qué es un dividendo?',
        options: [
          'Parte del beneficio de una empresa pagada a los accionistas',
          'Una comisión por comprar acciones',
          'Un tipo de préstamo',
          'Una caída del precio de la acción',
        ],
        why: 'Algunas empresas reparten parte de sus beneficios con sus dueños (los accionistas) en forma de dividendos.',
      },
      compound: {
        q: '¿Por qué ayuda tanto empezar a invertir pronto?',
        options: [
          'Los precios siempre son más bajos',
          'Los bancos dan bonus a los jóvenes',
          'Las ganancias generan más ganancias con el tiempo (interés compuesto)',
          'No pagas comisiones',
        ],
        why: 'Con el interés compuesto, tus ganancias empiezan a generar sus propias ganancias. Cuanto más tiempo crece tu dinero, más rápido crece.',
      },
      emergencyFirst: {
        q: '¿Qué conviene tener normalmente antes de invertir?',
        options: ['Un coche', 'Una tarjeta de crédito', 'Un chivatazo bursátil de un amigo', 'Un fondo de emergencia'],
        why: 'Las inversiones pueden caer a corto plazo. Un fondo de emergencia evita que tengas que vender en mal momento para pagar un imprevisto.',
      },
      pastPerformance: {
        q: 'El precio de una acción se duplicó el año pasado. Esto significa…',
        options: [
          'Que se volverá a duplicar',
          'Nada seguro sobre el próximo año',
          'Que ahora no tiene riesgo',
          'Que debes comprarla ya',
        ],
        why: 'La rentabilidad pasada no garantiza resultados futuros. Los precios dependen de lo que pase después, no de lo que pasó antes.',
      },
      inflation: {
        q: '¿Por qué tener todo tu dinero en efectivo puede hacerle perder valor con el tiempo?',
        options: [
          'La inflación sube los precios más rápido de lo que crece el efectivo',
          'Los bancos se lo quedan',
          'El efectivo caduca',
          'Las acciones sustituyen al efectivo',
        ],
        why: 'La inflación significa que los precios suben cada año. Si tu dinero crece más despacio que los precios, con el tiempo compra menos.',
      },
      longTerm: {
        q: '¿Qué enfoque suele funcionar mejor para los inversores normales?',
        options: [
          'Operar todos los días',
          'Seguir consejos de internet',
          'Invertir con regularidad a largo plazo',
          'Ponerlo todo en una empresa',
        ],
        why: 'Invertir con regularidad y a largo plazo en una cartera diversificada ha superado históricamente a intentar adivinar los movimientos a corto plazo.',
      },
      fees: {
        q: '¿Por qué importan las comisiones de inversión?',
        options: [
          'No importan, son minúsculas',
          'Hacen mayor la rentabilidad',
          'Solo las pagan los bancos',
          'Se cobran cada año y reducen tu rentabilidad',
        ],
        why: 'Las comisiones se cobran cada año pase lo que pase. A lo largo de muchos años, incluso las pequeñas suman una gran diferencia.',
      },
      hype: {
        q: 'Todo internet dice que una acción «llegará a la luna». ¿Qué es lo sensato?',
        options: [
          'Comprar todo lo posible',
          'Tener cuidado: la euforia suele estar ya en el precio',
          'Pedir dinero prestado para comprarla',
          'Decir a todos que la compren',
        ],
        why: 'Cuando algo está de moda en todas partes, su precio normalmente ya ha subido. La euforia a menudo termina en caídas bruscas.',
      },
      bearMarket: {
        q: '¿Qué es un mercado bajista?',
        options: [
          'Un periodo largo en que los precios caen',
          'Un mercado de animales',
          'Un momento en que los precios suben rápido',
          'Un mercado cerrado',
        ],
        why: 'Un mercado bajista es una caída larga de los precios; un mercado alcista, una subida larga. Ambos son parte normal de invertir.',
      },
      pricedIn: {
        q: 'Una buena noticia que todo el mundo ya conoce suele estar…',
        options: [
          'Garantizando beneficios',
          'Prohibida de usar',
          'Ya descontada en el precio',
          'Ignorada por el mercado',
        ],
        why: 'Los mercados reaccionan rápido. Cuando una noticia es muy conocida, los compradores normalmente ya han hecho subir el precio.',
      },
      rates: {
        q: 'Cuando suben los tipos de interés, ¿qué suele pasar?',
        options: [
          'Suben todas las acciones',
          'El ahorro en efectivo gana menos',
          'No cambia nada',
          'Pedir prestado cuesta más y algunas acciones caen',
        ],
        why: 'Unos tipos de interés más altos encarecen los préstamos, lo que puede frenar a las empresas que dependen de ellos, mientras que los bancos pueden ganar más.',
      },
      panicSell: {
        q: 'El mercado cae un 12 %. ¿Qué suelen hacer los inversores pacientes?',
        options: [
          'Venderlo todo de golpe',
          'Mantener la calma y seguir su plan',
          'Pedir prestado para comprar una acción',
          'Dejar de ahorrar para siempre',
        ],
        why: 'Vender por pánico convierte las pérdidas en definitivas. Históricamente, los mercados se han recuperado con el tiempo, y quienes mantuvieron el rumbo salieron ganando.',
      },
      rebalance: {
        q: '¿Qué significa reequilibrar una cartera?',
        options: [
          'Devolverla a la mezcla de inversiones planeada',
          'Venderlo todo',
          'Comprar más de lo que más subió',
          'Cambiar de banco',
        ],
        why: 'Al moverse los precios, tu mezcla se desvía. Reequilibrar la devuelve al nivel de riesgo que planeaste.',
      },
    },
  },
};

export default business;
