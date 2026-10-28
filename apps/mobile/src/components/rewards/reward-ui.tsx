import { Image } from 'expo-image';
import { LinearGradient } from '@/components/ui/gradient';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Avatar } from '@/components/world/avatar';
import { Text } from '@/components/ui';
import { Colors, Gradients, Radius } from '@/constants/theme';
import { getReward, rewardTitle, type Reward } from '@/lib/rewards/catalog';
import { useRewards } from '@/lib/rewards/store';
import type { ProfilePhoto } from '@/lib/api';
import { useSession } from '@/lib/session';
import { DEFAULT_AVATAR, getItem } from '@/lib/world/avatar';
import { useWorld } from '@/lib/world/store';

export const RARITY = { common: '#A6ADD6', rare: '#4CC9FF', epic: '#FFC857' } as const;

/** The Knowzone coin. */
export function Coin({ size = 18 }: { size?: number }) {
  return (
    <LinearGradient
      colors={['#FFDE99', '#FFB627']}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: size / 12,
        borderColor: '#C98A12',
      }}>
      <Text
        style={{ fontSize: size * 0.5, lineHeight: size * 0.62, color: '#7A4B00', fontFamily: 'Manrope_800ExtraBold' }}>
        K
      </Text>
    </LinearGradient>
  );
}

/** Profile picture with the equipped (or previewed) frame. Uses the World avatar when there is one. */
export function ProfileAvatar({
  size = 88,
  frameId,
  initials,
  photo: photoOverride,
}: {
  size?: number;
  frameId?: string | null;
  initials?: string;
  /** Preview a different picture (e.g. while choosing one). */
  photo?: ProfilePhoto;
}) {
  const { equipped } = useRewards();
  const { avatar } = useWorld();
  const { user } = useSession();
  const frame = getReward(frameId === undefined ? (equipped.frame ?? '') : (frameId ?? ''));
  const ring = Math.max(4, size * 0.07);
  const inner = size - ring * 2;
  const photo = photoOverride ?? user?.photo ?? { kind: 'avatar' };
  const content =
    photo.kind === 'photo' ? (
      <Image
        source={{ uri: photo.uri }}
        style={{ width: inner, height: inner, borderRadius: inner / 2 }}
        contentFit="cover"
      />
    ) : photo.kind === 'avatar' && avatar ? (
      <Avatar config={avatar} size={inner} />
    ) : (
      <LinearGradient
        colors={photo.kind === 'initials' ? [photo.color, photo.color + 'AA'] : Gradients.ai}
        style={{
          width: inner,
          height: inner,
          borderRadius: inner / 2,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Text style={{ fontSize: inner * 0.4, color: '#fff', fontFamily: 'Manrope_800ExtraBold' }}>
          {initials ?? user?.name.charAt(0).toUpperCase() ?? 'K'}
        </Text>
      </LinearGradient>
    );
  return (
    <LinearGradient
      colors={frame?.colors ?? ['rgba(255,255,255,0.25)', 'rgba(255,255,255,0.1)']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ width: size, height: size, borderRadius: size / 2, alignItems: 'center', justifyContent: 'center' }}>
      {content}
    </LinearGradient>
  );
}

/** Title chip shown under a name. */
export function TitleChip({ titleId }: { titleId?: string | null }) {
  const { equipped } = useRewards();
  useTranslation('rewards'); // re-render when the language changes
  const r = getReward(titleId === undefined ? (equipped.title ?? '') : (titleId ?? ''));
  const title = r && rewardTitle(r);
  if (!r || !title) return null;
  return (
    <View
      style={{
        alignSelf: 'center',
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: Radius.pill,
        backgroundColor: RARITY[r.rarity] + '22',
        borderWidth: 1,
        borderColor: RARITY[r.rarity],
      }}>
      <Text variant="label" color={RARITY[r.rarity]}>
        {r.emoji} {title.toUpperCase()}
      </Text>
    </View>
  );
}

/** What a reward looks like on you. */
export function RewardPreview({ reward, size = 96 }: { reward: Reward; size?: number }) {
  const { avatar } = useWorld();
  if (reward.kind === 'frame') return <ProfileAvatar size={size} frameId={reward.id} />;
  if (reward.kind === 'avatar') {
    const item = getItem(reward.id);
    const a = avatar ?? DEFAULT_AVATAR;
    const worn =
      item?.slot === 'hat'
        ? { ...a, hat: item.id }
        : item?.slot === 'glasses'
          ? { ...a, glasses: item.id }
          : item?.slot === 'outfit'
            ? { ...a, outfit: item.id }
            : { ...a, background: reward.id };
    return <Avatar config={worn} size={size} />;
  }
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: Colors.surfaceRaised,
        borderWidth: 2,
        borderColor: RARITY[reward.rarity] + '88',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <Text style={{ fontSize: size * 0.45, lineHeight: size * 0.56 }}>{reward.emoji}</Text>
    </View>
  );
}
