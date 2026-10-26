# Knowzone design system — "Midnight Galaxy"

Source of truth in code: `apps/mobile/src/constants/theme.ts`.

## Logo

The mark is a bold, rounded **"K" whose upper arm launches into a gold four-point spark**, with a smaller white spark
beside it. The K stands for Knowzone and the student, the spark stands for AI, and gold ties it to rewards. It sits on a
purple gradient tile with a teal glow in the corner, so the logo carries all three brand accents.

| Asset | Where |
|---|---|
| Master vector | `apps/mobile/assets/brand/logo-mark.svg` |
| In-app component | `LogoMark`, `Wordmark`, `Logo` in `src/components/brand/logo.tsx` |
| App icon, Android adaptive layers, splash, favicon | `apps/mobile/assets/images/` (rendered from the master SVG) |

Wordmark: "Knowzone" in Manrope ExtraBold followed by a gold **AI** badge. Leave clear space around the mark of at
least a quarter of its width. Never recolour the spark, and never put the mark on a light background without its tile.

## Why this direction

The app is dark-first. Deep navy surfaces make purple, teal and gold read as glowing accents, which feels
premium and calm instead of cartoonish. It is also easier on the eyes for students revising late at night.

Each colour has one job, so students learn what it means:

| Role | Colour | Hex | Used for |
|---|---|---|---|
| Background | Navy 900 | `#0B1026` | App canvas |
| Surface | Navy 800 | `#121838` | Cards, inputs, tab bar |
| Raised surface | Navy 700 | `#1A2150` | Highlighted cards |
| **Primary / AI** | Electric purple | `#7C5CFF` | Primary buttons, AI features, focus, selected tabs |
| **Mastery** | Teal | `#2DD4BF` | Progress, correct answers, mastered concepts |
| **Rewards** | Warm gold | `#FFC857` | XP, coins, badges, level-ups. Never used for buttons |
| Streak / error | Coral | `#FF5A7A` | Streak flame, wrong answers. Use sparingly |
| Text | Off-white | `#F4F5FF` | Body and headings |
| Secondary text | Lavender grey | `#A6ADD6` | Supporting copy |

**Gradients** are saved for hero moments: the "Create with AI" card, the centre AI Studio tab button, flashcards,
level and score screens, and the world tiles. Each Knowzone World gets its own gradient so students recognise
it straight away (Space Lab is indigo→purple, Nature Quest is green→teal, and so on).

## Typography

**Manrope** (the PRD's suggestion; geometric, friendly and very readable):

| Token | Size / line | Weight |
|---|---|---|
| display | 32 / 38 | ExtraBold 800 |
| title | 24 / 30 | ExtraBold 800 |
| heading | 18 / 24 | Bold 700 |
| body | 16 / 24 | Medium 500 |
| small | 14 / 20 | Medium 500 |
| label | 12 / 16, +0.6 tracking, uppercase | Bold 700 |

## Shape, spacing, motion

- Spacing scale: 4 · 8 · 12 · 16 · 24 · 32 · 48. Screens use a 16 px gutter and a 720 px max width on tablet and web.
- Corner radius: 10 (small), 16 (buttons, inputs), 24 (cards), 32 (hero cards, tab bar).
- The tab bar floats, and AI Studio sits in a raised gradient button in the centre.
- Buttons shrink to 97% when pressed and give light haptic feedback. Quiz answers give success or error haptics.
- Celebrate real progress (quiz results, deck complete, level-up), not app opens. Don't add pop-ups to every screen.

## Accessibility

- All text meets WCAG AA contrast on navy surfaces. Muted text (`#6E76A8`) is only used for hints and placeholders.
- Every pressable element has an `accessibilityRole` and label. Progress bars expose `accessibilityValue`.
- Minimum touch target is 44 px. Primary buttons are 54 px.

## Next design tasks

1. Mascot / avatar system (a friendly "Knowzone guide" character) for empty states and celebrations.
2. Lottie celebrations for level-ups and badges.
3. App icon and splash: a purple→teal gradient spark on navy.
4. Optional light theme for school or classroom projectors.
