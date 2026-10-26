/** Knowzone World Museum of Time (Portuguese): walking around the museum, its stations and the History & Geography games. */
import type { Translation } from '../../types';
import type en from '../en/history';

const history: Translation<typeof en> = {
  title: 'Museu do Tempo',
  entryEyebrow: 'HISTÓRIA E GEOGRAFIA · NOVO',
  entryTitle: 'Museu do Tempo',
  entryBody: 'Viaja pela história, desenterra cidades perdidas e explora África',
  leave: 'Sair do museu',
  offline: 'O Museu do Tempo precisa de ligação à internet, porque cada resposta é verificada no nosso servidor.',
  result: {
    back: 'Voltar ao museu',
  },
  hall: {
    walkTo: 'Caminhar até: {{station}}',
    you: 'Tu, o explorador',
    open: 'Entrar: {{station}}',
    goHere: 'Ir para aqui',
    stars: '{{count}} de {{max}} estrelas',
    tip: 'Caminha até uma exposição para começar um jogo. Toca num nome para ir até lá.',
  },
  stations: {
    timemachine: 'Máquina do tempo',
    dig: 'Civilizações perdidas',
    maptable: 'Mapa de África',
  },
  games: {
    'time-machine': {
      name: 'Máquina do Tempo da História',
      how: 'Viaja até momentos reais da história, das pirâmides à independência da Nigéria. Explora cada época e resolve os seus desafios.',
    },
    'lost-civilization': {
      name: 'Civilização Perdida',
      how: 'Desenterra artefactos em locais antigos, lê as pistas e diz o nome da civilização que os fez para desbloquear a sua cidade.',
    },
    'africa-explorer': {
      name: 'Explorador de África',
      how: 'Encontra países no mapa de África, visita os seus monumentos famosos e recolhe um carimbo no passaporte por cada um.',
    },
  },
  time: {
    objective: 'Época {{n}} de {{total}}: {{title}}',
    travelling: 'A viajar até {{when}}…',
    spot: 'Caminha até um ponto brilhante para encontrar um desafio.',
    challenge: 'DESAFIO {{n}} DE {{total}}',
    nextEra: 'Época seguinte',
    order: {
      earliest: 'MAIS ANTIGO',
      latest: 'MAIS RECENTE',
      up: 'Mover “{{item}}” para mais cedo',
      down: 'Mover “{{item}}” para mais tarde',
      check: 'Verificar a ordem',
      right: 'Cronologia perfeita! +{{points}}',
      wrong: 'Quase. Aqui está a ordem certa.',
    },
  },
  dig: {
    objective: 'Escavação {{n}} de {{total}}',
    spot: 'Local de escavação {{n}}',
    dig: 'Escavar',
    tap: 'Toca para escavar com cuidado',
    digA11y: 'Escavar aqui',
    found: 'ARTEFACTO ENCONTRADO',
    finds: '{{done}} de {{total}} artefactos',
    collect: 'Recolher',
    solve: 'Resolver o mistério',
    unlocked: 'Cidade desbloqueada!',
    cities: '{{count}} de {{total}} cidades desbloqueadas',
    next: 'Escavação seguinte',
  },
  africa: {
    objective: 'Paragem {{n}} de {{total}}',
    find: 'Encontra {{name}} no mapa',
    hint: 'Pista: {{region}}',
    tap: 'Toca onde achas que fica e depois verifica.',
    check: 'Verificar',
    found: 'Encontraste! +{{points}}',
    missed: 'Quase. {{name}} fica aqui.',
    visit: 'Visitar: {{landmark}}',
    passport: 'PASSAPORTE',
    stamp: '{{name}} carimbado',
    facts: 'SABIAS QUE?',
    question: 'PERGUNTA',
    next: 'País seguinte',
    mapA11y: 'Mapa de África. Toca para colocar um alfinete.',
  },
};

export default history;
