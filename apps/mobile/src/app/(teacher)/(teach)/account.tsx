import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { ProfileAvatar } from '@/components/rewards/reward-ui';
import { SettingsLink, SettingsSection } from '@/components/settings/rows';
import { Button, Screen, Text } from '@/components/ui';
import { Colors, Gradients, Radius, Spacing } from '@/constants/theme';
import { useSession } from '@/lib/session';

export default function TeacherAccountScreen() {
  const { t } = useTranslation('teacher');
  const { user } = useSession();
  if (!user) return null;

  return (
    <Screen>
      <LinearGradient
        colors={['#FF9F43', Colors.primary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.hero}>
        <Pressable
          onPress={() => router.push('/settings/photo')}
          accessibilityRole="button"
          accessibilityLabel={t('account.changePhoto')}>
          <ProfileAvatar size={88} />
        </Pressable>
        <Text variant="title">{user.name}</Text>
        <View style={styles.role}>
          <Ionicons name="easel" size={14} color={Colors.text} />
          <Text variant="label">{t('account.role')}</Text>
        </View>
        <Text variant="small" color="rgba(255,255,255,0.85)">
          {user.email}
        </Text>
      </LinearGradient>

      <SettingsSection title={t('account.section')}>
        <SettingsLink
          icon="person-outline"
          label={t('account.editProfile')}
          onPress={() => router.push('/settings/edit-profile')}
        />
        <SettingsLink
          icon="notifications-outline"
          label={t('account.notifications')}
          onPress={() => router.push('/settings/notifications')}
        />
        <SettingsLink
          icon="shield-checkmark-outline"
          label={t('account.privacy')}
          onPress={() => router.push('/settings/privacy')}
        />
        <SettingsLink
          icon="settings-outline"
          label={t('account.allSettings')}
          onPress={() => router.push('/settings')}
          last
        />
      </SettingsSection>

      <LinearGradient colors={Gradients.reward} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.upsell}>
        <Text variant="heading" color={Colors.backgroundDeep}>
          {t('account.upsellTitle')}
        </Text>
        <Text variant="small" color={Colors.backgroundDeep}>
          {t('account.upsellBody')}
        </Text>
      </LinearGradient>

      <Button
        variant="secondary"
        title={t('account.logOut')}
        icon="log-out-outline"
        onPress={() => router.push('/settings/logout')}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { borderRadius: Radius.xl, padding: Spacing.lg, alignItems: 'center', gap: Spacing.xs },
  role: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.pill,
  },
  upsell: { borderRadius: Radius.lg, padding: Spacing.md, gap: 4 },
});
