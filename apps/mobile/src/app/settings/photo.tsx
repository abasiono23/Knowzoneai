import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';

import { AuthScreen } from '@/components/auth/auth-screen';
import { ProfileAvatar } from '@/components/rewards/reward-ui';
import { Avatar } from '@/components/world/avatar';
import { Button, Card, Text } from '@/components/ui';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { goBack } from '@/lib/navigation';
import { errorText } from '@/i18n/errors';
import { api, uploadForm, type ProfilePhoto, type User } from '@/lib/api';
import { USE_MOCKS } from '@/lib/config';
import { useSession } from '@/lib/session';
import { useWorld } from '@/lib/world/store';

const COLORS = ['#7C5CFF', '#14C8B4', '#FF7A93', '#FF9F43', '#4CC9FF', '#B04CFF'];

/** Screen 179: choose a profile photo: your avatar, coloured initials or a photo. */
async function uploadPhoto(uri: string) {
  const form = new FormData();
  const name = 'profile.jpg';
  // A Blob on the web; a { uri, name, type } descriptor on phones.
  const part = Platform.OS === 'web' ? await (await fetch(uri)).blob() : ({ uri, name, type: 'image/jpeg' } as unknown as Blob);
  form.append('file', part, name);
  return uploadForm<{ user: User }>('/me/photo', form, () => {});
}

export default function ProfilePhotoScreen() {
  const { user, setUser } = useSession();
  const { avatar } = useWorld();
  const { t } = useTranslation('settings');
  const [choice, setChoice] = useState<ProfilePhoto>(
    user?.photo ?? (avatar ? { kind: 'avatar' } : { kind: 'initials', color: COLORS[0] }),
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  if (!user) return null;
  const teacher = user.role === 'teacher';

  const pick = async (camera: boolean) => {
    setError(null);
    try {
      if (camera) {
        const perm = await ImagePicker.requestCameraPermissionsAsync();
        if (!perm.granted) return setError(t('photo.cameraOff'));
      }
      const opts: ImagePicker.ImagePickerOptions = {
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.6,
      };
      const res = camera ? await ImagePicker.launchCameraAsync(opts) : await ImagePicker.launchImageLibraryAsync(opts);
      if (!res.canceled && res.assets[0]) setChoice({ kind: 'photo', uri: res.assets[0].uri });
    } catch {
      setError(t('photo.openError'));
    }
  };

  const save = async () => {
    setBusy(true);
    setError(null);
    try {
      // A new photo is uploaded and stored by the server, so it shows on every device;
      // the device's own file address would only work here.
      const { user: fresh } =
        !USE_MOCKS && choice.kind === 'photo' && !/^https?:/.test(choice.uri)
          ? await uploadPhoto(choice.uri)
          : await api.updateProfile({ photo: choice });
      setUser(fresh);
      goBack();
    } catch (e) {
      setError(errorText(e, t('photo.saveError')));
      setBusy(false);
    }
  };

  return (
    <AuthScreen
      title={t('photo.title')}
      subtitle={t('photo.subtitle')}
      footer={
        <>
          {error && (
            <Text variant="small" color={Colors.danger} center>
              {error}
            </Text>
          )}
          <Button title={t('photo.use')} icon="checkmark" loading={busy} onPress={save} />
        </>
      }>
      <Animated.View key={JSON.stringify(choice)} entering={ZoomIn.duration(220)} style={{ alignItems: 'center' }}>
        <ProfileAvatar size={140} photo={choice} />
      </Animated.View>

      {!teacher && (
        <Pressable
          onPress={() => (avatar ? setChoice({ kind: 'avatar' }) : router.push('/world/avatar/create'))}
          accessibilityRole="radio"
          accessibilityState={{ selected: choice.kind === 'avatar' }}
          accessibilityLabel={t('photo.avatarA11y')}>
          <Card style={[styles.option, choice.kind === 'avatar' && styles.on]}>
            {avatar ? (
              <Avatar config={avatar} size={48} />
            ) : (
              <Ionicons name="happy-outline" size={40} color={Colors.textMuted} />
            )}
            <View style={{ flex: 1 }}>
              <Text variant="bodyStrong">{t('photo.avatar')}</Text>
              <Text variant="small" color={Colors.textSecondary}>
                {avatar ? t('photo.avatarHint') : t('photo.avatarCreate')}
              </Text>
            </View>
            {choice.kind === 'avatar' && <Ionicons name="checkmark-circle" size={22} color={Colors.primary} />}
          </Card>
        </Pressable>
      )}

      <Card style={[{ gap: Spacing.sm }, choice.kind === 'initials' && styles.on]}>
        <Text variant="bodyStrong">{t('photo.initials')}</Text>
        <View style={styles.swatches}>
          {COLORS.map((c) => {
            const on = choice.kind === 'initials' && choice.color === c;
            return (
              <Pressable
                key={c}
                onPress={() => setChoice({ kind: 'initials', color: c })}
                accessibilityRole="radio"
                accessibilityState={{ selected: on }}
                accessibilityLabel={t('photo.initialsA11y', { number: COLORS.indexOf(c) + 1 })}
                style={[styles.swatchRing, on && { borderColor: '#fff' }]}>
                <View style={[styles.swatch, { backgroundColor: c }]}>
                  <Text style={{ color: '#fff', fontFamily: 'Manrope_800ExtraBold' }}>
                    {user.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      </Card>

      <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
        <Button
          variant="secondary"
          icon="images-outline"
          title={t('photo.choose')}
          style={{ flex: 1 }}
          onPress={() => pick(false)}
        />
        {Platform.OS !== 'web' && (
          <Button
            variant="secondary"
            icon="camera-outline"
            title={t('photo.take')}
            style={{ flex: 1 }}
            onPress={() => pick(true)}
          />
        )}
      </View>
      <Text variant="small" color={Colors.textMuted}>
        {t('photo.note')}
      </Text>
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  option: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  on: { borderColor: Colors.primary, borderWidth: 1.5 },
  swatches: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  swatchRing: { padding: 3, borderRadius: Radius.pill, borderWidth: 2, borderColor: 'transparent' },
  swatch: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
});
