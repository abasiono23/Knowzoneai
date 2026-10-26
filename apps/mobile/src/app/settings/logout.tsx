import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';

import { ProfileAvatar } from '@/components/rewards/reward-ui';
import { Button, Text } from '@/components/ui';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { goBack } from '@/lib/navigation';
import { api } from '@/lib/api';
import { useSession } from '@/lib/session';

/** Screen 197: log out confirmation. */
export default function LogoutScreen() {
  const { user, signOut } = useSession();
  const { t } = useTranslation('settings');
  const [everywhere, setEverywhere] = useState(false);
  const [busy, setBusy] = useState(false);

  const logout = async () => {
    setBusy(true);
    if (everywhere) await api.revokeSession('others').catch(() => {});
    await signOut();
    router.replace('/');
  };

  return (
    <Animated.View entering={FadeIn.duration(150)} style={styles.backdrop}>
      <Pressable
        style={StyleSheet.absoluteFill}
        onPress={() => goBack()}
        accessibilityLabel={t('actions.cancel', { ns: 'common' })}
      />
      <Animated.View entering={ZoomIn.duration(220)} style={styles.card}>
        <ProfileAvatar size={72} />
        <Text variant="title" center>
          {t('logout.title')}
        </Text>
        <Text color={Colors.textSecondary} center>
          {user ? t('logout.bodySignedIn', { email: user.email }) : t('logout.body')}
        </Text>
        <Pressable
          onPress={() => setEverywhere(!everywhere)}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: everywhere }}
          accessibilityLabel={t('logout.everywhere')}
          style={styles.check}>
          <View style={[styles.box, everywhere && styles.boxOn]}>
            {everywhere && <Ionicons name="checkmark" size={14} color="#fff" />}
          </View>
          <Text variant="small" style={{ flex: 1 }}>
            {t('logout.everywhere')}
          </Text>
        </Pressable>
        <Button
          title={t('logout.confirm')}
          icon="log-out-outline"
          variant="danger"
          loading={busy}
          onPress={logout}
          style={{ alignSelf: 'stretch' }}
        />
        <Button
          title={t('logout.stay')}
          variant="secondary"
          disabled={busy}
          onPress={() => goBack()}
          style={{ alignSelf: 'stretch' }}
        />
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(5,8,26,0.82)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.lg,
    borderRadius: Radius.xl,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
  },
  check: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    alignSelf: 'stretch',
    padding: Spacing.sm,
    borderRadius: Radius.md,
    backgroundColor: Colors.surfaceRaised,
  },
  box: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxOn: { backgroundColor: Colors.primary, borderColor: Colors.primary },
});
