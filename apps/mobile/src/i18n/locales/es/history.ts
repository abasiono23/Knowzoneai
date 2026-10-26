/** Knowzone World Museum of Time (Spanish): walking around the museum, its stations and the History & Geography games. */
import type { Translation } from '../../types';
import type en from '../en/history';

const history: Translation<typeof en> = {
  title: 'Museo del Tiempo',
  entryEyebrow: 'HISTORIA Y GEOGRAFÍA · NUEVO',
  entryTitle: 'Museo del Tiempo',
  entryBody: 'Viaja por la historia, desentierra ciudades perdidas y explora África',
  leave: 'Salir del museo',
  offline: 'El Museo del Tiempo necesita conexión a internet, porque cada respuesta se comprueba en nuestro servidor.',
  result: {
    back: 'Volver al museo',
  },
  hall: {
    walkTo: 'Caminar a: {{station}}',
    you: 'Tú, el explorador',
    open: 'Entrar: {{station}}',
    goHere: 'Ir aquí',
    stars: '{{count}} de {{max}} estrellas',
    tip: 'Camina a una exhibición para empezar un juego. Toca un nombre para ir allí.',
  },
  stations: {
    timemachine: 'Máquina del tiempo',
    dig: 'Civilizaciones perdidas',
    maptable: 'Mapa de África',
  },
  games: {
    'time-machine': {
      name: 'Máquina del Tiempo de la Historia',
      how: 'Viaja a momentos reales de la historia, desde las pirámides hasta la independencia de Nigeria. Recorre cada época y supera sus retos.',
    },
    'lost-civilization': {
      name: 'Civilización Perdida',
      how: 'Desentierra objetos en sitios antiguos, lee las pistas y nombra la civilización que los hizo para desbloquear su ciudad.',
    },
    'africa-explorer': {
      name: 'Explorador de África',
      how: 'Encuentra países en el mapa de África, visita sus monumentos famosos y consigue un sello de pasaporte por cada uno.',
    },
  },
  time: {
    objective: 'Época {{n}} de {{total}}: {{title}}',
    travelling: 'Viajando a {{when}}…',
    spot: 'Camina a un punto brillante para encontrar un reto.',
    challenge: 'RETO {{n}} DE {{total}}',
    nextEra: 'Siguiente época',
    order: {
      earliest: 'MÁS ANTIGUO',
      latest: 'MÁS RECIENTE',
      up: 'Mover “{{item}}” antes',
      down: 'Mover “{{item}}” después',
      check: 'Comprobar el orden',
      right: '¡Línea del tiempo perfecta! +{{points}}',
      wrong: 'Casi. Aquí tienes el orden correcto.',
    },
  },
  dig: {
    objective: 'Excavación {{n}} de {{total}}',
    spot: 'Punto de excavación {{n}}',
    dig: 'Excavar',
    tap: 'Toca para excavar con cuidado',
    digA11y: 'Excavar aquí',
    found: 'OBJETO ENCONTRADO',
    finds: '{{done}} de {{total}} objetos',
    collect: 'Recoger',
    solve: 'Resolver el misterio',
    unlocked: '¡Ciudad desbloqueada!',
    cities: '{{count}} de {{total}} ciudades desbloqueadas',
    next: 'Siguiente excavación',
  },
  africa: {
    objective: 'Parada {{n}} de {{total}}',
    find: 'Encuentra {{name}} en el mapa',
    hint: 'Pista: {{region}}',
    tap: 'Toca donde crees que está y luego comprueba.',
    check: 'Comprobar',
    found: '¡Lo encontraste! +{{points}}',
    missed: 'Casi. {{name}} está aquí.',
    visit: 'Visitar: {{landmark}}',
    passport: 'PASAPORTE',
    stamp: '{{name}} sellado',
    facts: '¿SABÍAS QUE…?',
    question: 'PREGUNTA',
    next: 'Siguiente país',
    mapA11y: 'Mapa de África. Toca para colocar un marcador.',
  },
};

export default history;
