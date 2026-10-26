import { useId } from 'react';
import Svg, {
  Circle,
  ClipPath,
  Defs,
  Ellipse,
  G,
  LinearGradient,
  Path,
  Rect,
  Stop,
  Text as SvgText,
} from 'react-native-svg';

import { backgroundOf } from '@/lib/world/avatar';
import type { AvatarConfig } from '@/lib/world/types';

const BODY = 'M14 124 C14 98 34 87 60 87 C86 87 106 98 106 124 Z';

function shade(hex: string, amt: number) {
  const n = parseInt(hex.slice(1), 16);
  const c = (v: number) => Math.max(0, Math.min(255, Math.round(v + amt)));
  return `#${((c(n >> 16) << 16) | (c((n >> 8) & 255) << 8) | c(n & 255)).toString(16).padStart(6, '0')}`;
}

function HairBack({ a }: { a: AvatarConfig }) {
  const c = a.hairColor;
  switch (a.hair) {
    case 'afro':
      return <Circle cx={60} cy={46} r={34} fill={c} />;
    case 'puffs':
      return (
        <G fill={c}>
          <Circle cx={31} cy={30} r={14} />
          <Circle cx={89} cy={30} r={14} />
        </G>
      );
    case 'bun':
      return <Circle cx={60} cy={20} r={12} fill={c} />;
    case 'braids':
      return (
        <G fill={c}>
          <Path d="M34 50 C30 70 30 90 34 100 L42 100 C40 86 40 70 42 52 Z" />
          <Path d="M86 50 C90 70 90 90 86 100 L78 100 C80 86 80 70 78 52 Z" />
          <Circle cx={38} cy={102} r={4} fill={shade(c, 40)} />
          <Circle cx={82} cy={102} r={4} fill={shade(c, 40)} />
        </G>
      );
    case 'locs':
      return (
        <G fill={c}>
          {[30, 38, 46, 74, 82, 90].map((x, i) => (
            <Rect key={x} x={x - 3.5} y={40} width={7} height={46 + (i % 3) * 6} rx={3.5} />
          ))}
        </G>
      );
    default:
      return null;
  }
}

function HairFront({ a }: { a: AvatarConfig }) {
  const c = a.hairColor;
  if (a.hair === 'fade')
    return (
      <G>
        <Path d="M37 50 C37 31 48 25 60 25 C72 25 83 31 83 50 C78 41 70 36 60 36 C50 36 42 41 37 50 Z" fill={c} />
        <Path d="M36 52 C35 46 36 42 38 40 L40 56 Z M84 52 C85 46 84 42 82 40 L80 56 Z" fill={c} opacity={0.45} />
      </G>
    );
  if (a.hair === 'afro')
    return <Path d="M35 54 C33 34 45 22 60 22 C75 22 87 34 85 54 C80 42 70 37 60 37 C50 37 40 42 35 54 Z" fill={c} />;
  return <Path d="M35 54 C34 32 46 24 60 24 C74 24 86 32 85 54 C79 41 70 35 60 35 C50 35 41 41 35 54 Z" fill={c} />;
}

function Eyes({ a }: { a: AvatarConfig }) {
  const dark = '#1B1530';
  const round = (x: number) => (
    <G key={x}>
      <Circle cx={x} cy={58} r={3.4} fill={dark} />
      <Circle cx={x + 1.1} cy={56.9} r={1.1} fill="#fff" />
    </G>
  );
  const arc = (x: number) => (
    <Path
      key={x}
      d={`M${x - 4} 59 Q${x} 54 ${x + 4} 59`}
      stroke={dark}
      strokeWidth={2.4}
      fill="none"
      strokeLinecap="round"
    />
  );
  if (a.eyes === 'happy') return <G>{[arc(51), arc(69)]}</G>;
  if (a.eyes === 'wink') return <G>{[round(51), arc(69)]}</G>;
  return <G>{[round(51), round(69)]}</G>;
}

function Mouth({ a }: { a: AvatarConfig }) {
  if (a.mouth === 'grin')
    return (
      <G>
        <Path d="M51 67 Q60 78 69 67 Z" fill="#5A1E2B" />
        <Path d="M53 67.5 L67 67.5 L66 70 L54 70 Z" fill="#fff" />
      </G>
    );
  if (a.mouth === 'open') return <Ellipse cx={60} cy={70} rx={4.5} ry={5} fill="#5A1E2B" />;
  return <Path d="M52 68 Q60 75 68 68" stroke="#5A1E2B" strokeWidth={2.6} fill="none" strokeLinecap="round" />;
}

function Outfit({ a, clip }: { a: AvatarConfig; clip: string }) {
  switch (a.outfit) {
    case 'outfit-ankara':
      return (
        <G clipPath={`url(#${clip})`}>
          <Path d={BODY} fill="#E85D04" />
          {[20, 40, 60, 80, 100].flatMap((x, i) =>
            [96, 110, 124].map((y, j) => (
              <G key={`${x}-${y}`}>
                <Circle cx={x + (j % 2) * 10} cy={y} r={6} fill={(i + j) % 2 ? '#FFC857' : '#0F7C9C'} />
                <Circle cx={x + (j % 2) * 10} cy={y} r={2.5} fill="#7B1E3A" />
              </G>
            )),
          )}
        </G>
      );
    case 'outfit-labcoat':
      return (
        <G>
          <Path d={BODY} fill="#F4F5FF" />
          <Path d="M52 88 L60 104 L68 88 Z" fill="#4CC9FF" />
          <Path d="M48 89 L60 112 L52 124 L42 124 Z M72 89 L60 112 L68 124 L78 124 Z" fill="#DDE1F5" />
          <Rect x={76} y={104} width={10} height={7} rx={1.5} fill="#7C5CFF" />
        </G>
      );
    case 'outfit-jersey':
      return (
        <G clipPath={`url(#${clip})`}>
          <Path d={BODY} fill="#008751" />
          <Rect x={52} y={86} width={16} height={40} fill="#FFFFFF" />
          <SvgText x={60} y={116} fontSize={14} fontWeight="bold" fill="#008751" textAnchor="middle">
            10
          </SvgText>
        </G>
      );
    case 'outfit-explorer':
      // A khaki safari shirt with pockets and a satchel strap.
      return (
        <G clipPath={`url(#${clip})`}>
          <Path d={BODY} fill="#C9A66B" />
          <Path d="M52 88 L60 100 L68 88 Z" fill="#E8D3A2" />
          <Rect x={42} y={104} width={12} height={9} rx={2} fill="#B08A4E" />
          <Rect x={66} y={104} width={12} height={9} rx={2} fill="#B08A4E" />
          <Path d="M40 90 L84 126" stroke="#6B4423" strokeWidth={5} />
        </G>
      );
    case 'outfit-astronaut':
      return (
        <G>
          <Path d={BODY} fill="#E8EBF7" />
          <Path d="M40 92 Q60 102 80 92" stroke="#A6ADD6" strokeWidth={5} fill="none" />
          <Circle cx={44} cy={110} r={6} fill="#FF7A93" />
          <Rect x={68} y={106} width={14} height={9} rx={2} fill="#4CC9FF" />
        </G>
      );
    default:
      return (
        <G>
          <Path d={BODY} fill={a.outfit} />
          <Path d="M50 88 Q60 98 70 88" stroke={shade(a.outfit, -40)} strokeWidth={3} fill="none" />
        </G>
      );
  }
}

function Glasses({ id }: { id?: string }) {
  if (id === 'glasses-round')
    return (
      <G stroke="#1B1530" strokeWidth={2} fill="rgba(255,255,255,0.15)">
        <Circle cx={51} cy={58} r={7} />
        <Circle cx={69} cy={58} r={7} />
        <Path d="M58 58 L62 58" />
      </G>
    );
  if (id === 'glasses-shades')
    return (
      <G>
        <Path
          d="M41 53 L59 53 L57 63 Q50 66 43 63 Z M61 53 L79 53 L77 63 Q70 66 63 63 Z"
          fill="#1B1530"
          stroke="#FFC857"
          strokeWidth={1.5}
        />
        <Path d="M45 56 L49 56" stroke="#fff" strokeWidth={1.5} opacity={0.6} />
      </G>
    );
  if (id === 'glasses-goggles')
    return (
      <G>
        <Rect x={34} y={53} width={52} height={5} fill="#3B2DBF" />
        <Rect
          x={41}
          y={50}
          width={17}
          height={14}
          rx={6}
          fill="rgba(76,201,255,0.55)"
          stroke="#E8EBF7"
          strokeWidth={2.5}
        />
        <Rect
          x={62}
          y={50}
          width={17}
          height={14}
          rx={6}
          fill="rgba(76,201,255,0.55)"
          stroke="#E8EBF7"
          strokeWidth={2.5}
        />
      </G>
    );
  return null;
}

function Hat({ id }: { id?: string }) {
  switch (id) {
    case 'hat-cap':
      return (
        <G>
          <Path d="M35 42 C35 24 47 18 60 18 C73 18 85 24 85 42 Z" fill="#FF5A7A" />
          <Path d="M58 40 C70 38 88 38 98 44 L84 46 C76 43 66 43 58 44 Z" fill="#C2334F" />
          <Circle cx={60} cy={19} r={2.5} fill="#C2334F" />
        </G>
      );
    case 'hat-gele':
      return (
        <G>
          <Path d="M30 44 C24 22 40 6 60 10 C82 4 98 22 90 44 C80 34 70 32 60 32 C50 32 40 34 30 44 Z" fill="#D9467A" />
          <Path
            d="M36 36 C42 20 54 14 62 18 M50 34 C58 18 72 14 84 24 M70 32 C76 22 84 22 88 30"
            stroke="#FFC857"
            strokeWidth={2.5}
            fill="none"
          />
          <Path d="M84 14 C96 6 104 14 98 24 C92 22 88 18 84 14 Z" fill="#B5306A" />
        </G>
      );
    case 'hat-headphones':
      return (
        <G>
          <Path d="M32 58 C30 28 44 18 60 18 C76 18 90 28 88 58" stroke="#1A2150" strokeWidth={6} fill="none" />
          <Rect x={26} y={52} width={12} height={18} rx={6} fill="#7C5CFF" />
          <Rect x={82} y={52} width={12} height={18} rx={6} fill="#7C5CFF" />
        </G>
      );
    case 'hat-graduate':
      return (
        <G>
          <Path d="M38 34 L60 26 L82 34 L60 42 Z" fill="#1B1530" />
          <Path d="M24 26 L60 14 L96 26 L60 38 Z" fill="#262E66" />
          <Path d="M88 28 L90 46" stroke="#FFC857" strokeWidth={2} />
          <Circle cx={90} cy={47} r={3} fill="#FFC857" />
        </G>
      );
    case 'hat-crown':
      return (
        <G>
          <Path
            d="M38 34 L40 14 L50 26 L60 8 L70 26 L80 14 L82 34 Z"
            fill="#FFC857"
            stroke="#C98A12"
            strokeWidth={1.5}
          />
          <Circle cx={60} cy={26} r={3.5} fill="#FF5A7A" />
          <Circle cx={47} cy={30} r={2.5} fill="#4CC9FF" />
          <Circle cx={73} cy={30} r={2.5} fill="#2DD4BF" />
        </G>
      );
    case 'hat-explorer':
      // A khaki pith helmet with a brown band.
      return (
        <G>
          <Path d="M24 42 C30 36 90 36 96 42 C92 46 28 46 24 42 Z" fill="#B8955A" />
          <Path d="M36 40 C36 18 48 12 60 12 C72 12 84 18 84 40 Z" fill="#D9BC7E" />
          <Path d="M36 34 L84 34 L84 40 L36 40 Z" fill="#6B4423" />
          <Path d="M48 18 C52 14 58 13 62 14" stroke="#F2DDA8" strokeWidth={2.5} fill="none" />
        </G>
      );
    case 'hat-wizard':
      return (
        <G>
          <Path d="M30 40 C46 34 74 34 90 40 L78 44 L42 44 Z" fill="#3B2DBF" />
          <Path d="M42 42 L64 0 L78 42 Z" fill="#6A45FF" />
          <Path d="M58 22 L60 17 L62 22 L67 22 L63 25 L64 30 L60 27 L56 30 L57 25 L53 22 Z" fill="#FFC857" />
        </G>
      );
    default:
      return null;
  }
}

/** Layered SVG avatar: backdrop, hair, outfit, face and accessories. */
export function Avatar({ config: a, size = 96, ring }: { config: AvatarConfig; size?: number; ring?: string }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const bg = backgroundOf(a.background);
  const skinDark = shade(a.skin, -28);
  return (
    <Svg width={size} height={size} viewBox="0 0 120 120">
      <Defs>
        <LinearGradient id={`bg${uid}`} x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor={bg[0]} />
          <Stop offset="1" stopColor={bg[1]} />
        </LinearGradient>
        <ClipPath id={`clip${uid}`}>
          <Circle cx={60} cy={60} r={60} />
        </ClipPath>
        <ClipPath id={`body${uid}`}>
          <Path d={BODY} />
        </ClipPath>
      </Defs>
      <G clipPath={`url(#clip${uid})`}>
        <Rect width={120} height={120} fill={`url(#bg${uid})`} />
        <Circle cx={100} cy={18} r={22} fill="#fff" opacity={0.08} />
        <HairBack a={a} />
        <Rect x={52} y={72} width={16} height={18} rx={6} fill={skinDark} />
        <Outfit a={a} clip={`body${uid}`} />
        <Circle cx={36} cy={60} r={5.5} fill={skinDark} />
        <Circle cx={84} cy={60} r={5.5} fill={skinDark} />
        <Ellipse cx={60} cy={57} rx={24} ry={26} fill={a.skin} />
        <HairFront a={a} />
        <Eyes a={a} />
        <Circle cx={45} cy={66} r={3.5} fill="#FF7A93" opacity={0.25} />
        <Circle cx={75} cy={66} r={3.5} fill="#FF7A93" opacity={0.25} />
        <Mouth a={a} />
        <Glasses id={a.glasses} />
        <Hat id={a.hat} />
      </G>
      {ring && <Circle cx={60} cy={60} r={58.5} stroke={ring} strokeWidth={3} fill="none" />}
    </Svg>
  );
}
