/** Knowzone World Museum of Time (Arabic): walking around the museum, its stations and the History & Geography games. */
import type { Translation } from '../../types';
import type en from '../en/history';

const history: Translation<typeof en> = {
  title: 'متحف الزمن',
  entryEyebrow: 'التاريخ والجغرافيا · جديد',
  entryTitle: 'متحف الزمن',
  entryBody: 'سافر عبر التاريخ، واكتشف المدن المفقودة، واستكشف أفريقيا',
  leave: 'غادر المتحف',
  offline: 'يحتاج متحف الزمن إلى اتصال بالإنترنت، لأن كل إجابة يتم التحقق منها على خادمنا.',
  result: {
    back: 'العودة إلى المتحف',
  },
  hall: {
    walkTo: 'امشِ إلى {{station}}',
    you: 'أنت، المستكشف',
    open: 'ادخل {{station}}',
    goHere: 'اذهب إلى هنا',
    stars: '{{count}} من {{max}} نجوم',
    tip: 'امشِ إلى أحد المعروضات لتبدأ لعبة. اضغط على اسم لتمشي إليه.',
  },
  stations: {
    timemachine: 'آلة الزمن',
    dig: 'الحضارات المفقودة',
    maptable: 'خريطة أفريقيا',
  },
  games: {
    'time-machine': {
      name: 'آلة الزمن التاريخية',
      how: 'سافر إلى لحظات حقيقية في التاريخ، من الأهرامات إلى استقلال نيجيريا. تجوّل في كل حقبة وحُلّ تحدياتها.',
    },
    'lost-civilization': {
      name: 'الحضارة المفقودة',
      how: 'احفر لاستخراج القطع الأثرية في المواقع القديمة، واقرأ الأدلة، وسمِّ الحضارة التي صنعتها لتفتح مدينتها.',
    },
    'africa-explorer': {
      name: 'مستكشف أفريقيا',
      how: 'اعثر على الدول في خريطة أفريقيا، وزُر معالمها الشهيرة، واجمع ختم جواز سفر لكل دولة.',
    },
  },
  time: {
    objective: 'الحقبة {{n}} من {{total}}: {{title}}',
    travelling: 'جارٍ السفر إلى {{when}}…',
    spot: 'امشِ إلى بقعة متوهجة لتجد تحديًا.',
    challenge: 'التحدي {{n}} من {{total}}',
    nextEra: 'الحقبة التالية',
    order: {
      earliest: 'الأقدم',
      latest: 'الأحدث',
      up: 'انقل «{{item}}» إلى وقت أبكر',
      down: 'انقل «{{item}}» إلى وقت لاحق',
      check: 'تحقق من الترتيب',
      right: 'خط زمني مثالي! +{{points}}',
      wrong: 'ليس تمامًا. هذا هو الترتيب الصحيح.',
    },
  },
  dig: {
    objective: 'الحفرية {{n}} من {{total}}',
    spot: 'موقع الحفر {{n}}',
    dig: 'احفر',
    tap: 'اضغط لتحفر بحذر',
    digA11y: 'احفر هنا',
    found: 'عُثر على قطعة أثرية',
    finds: '{{done}} من {{total}} قطع أثرية',
    collect: 'اجمعها',
    solve: 'حُلّ اللغز',
    unlocked: 'فُتحت المدينة!',
    cities: 'فُتحت {{count}} من {{total}} مدن',
    next: 'الحفرية التالية',
  },
  africa: {
    objective: 'المحطة {{n}} من {{total}}',
    find: 'اعثر على {{name}} في الخريطة',
    hint: 'تلميح: {{region}}',
    tap: 'اضغط حيث تظن أنها تقع، ثم تحقق.',
    check: 'تحقق',
    found: 'وجدتها! +{{points}}',
    missed: 'ليس تمامًا. {{name}} تقع هنا.',
    visit: 'زُر {{landmark}}',
    passport: 'جواز السفر',
    stamp: 'تم ختم {{name}}',
    facts: 'هل تعلم؟',
    question: 'سؤال',
    next: 'الدولة التالية',
    mapA11y: 'خريطة أفريقيا. اضغط لوضع دبوس.',
  },
};

export default history;
