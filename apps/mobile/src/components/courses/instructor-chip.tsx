import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { Text } from '@/components/ui';
import { Colors, Spacing } from '@/constants/theme';
import { useFlipStyle } from '@/i18n/provider';
import type { Instructor } from '@/lib/courses/types';

export function InstructorAvatar({ instructor, size = 44 }: { instructor: Instructor; size?: number }) {
  return (
    <LinearGradient
      colors={instructor.colors}
      style={{ width: size, height: size, borderRadius: size / 2, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontFamily: 'Manrope_800ExtraBold', fontSize: size * 0.36, color: '#fff' }}>
        {instructor.initials}
      </Text>
    </LinearGradient>
  );
}

/** Avatar, name and title; opens the instructor profile. */
export function InstructorChip({ instructor }: { instructor: Instructor }) {
  const { t } = useTranslation('courses');
  const flip = useFlipStyle();
  return (
    <Pressable
      onPress={() => router.push(`/courses/instructor/${instructor.id}`)}
      accessibilityRole="button"
      accessibilityLabel={t('instructorChip.a11y', { name: instructor.name })}
      style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
      <InstructorAvatar instructor={instructor} />
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Text variant="bodyStrong">{instructor.name}</Text>
          {instructor.verified && <Ionicons name="checkmark-circle" size={15} color={Colors.info} />}
        </View>
        <Text variant="small" color={Colors.textSecondary} numberOfLines={1}>
          {instructor.title}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} style={flip} />
    </Pressable>
  );
}
