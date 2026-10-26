import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { AuthScreen } from '@/components/auth/auth-screen';
import { TextField } from '@/components/auth/text-field';
import { ProfileAvatar } from '@/components/rewards/reward-ui';
import { Button, Text } from '@/components/ui';
import { Colors, Fonts, NoWebOutline, Radius, Spacing } from '@/constants/theme';
import { goBack } from '@/lib/navigation';
import { errorText } from '@/i18n/errors';
import { api } from '@/lib/api';
import { useSession } from '@/lib/session';

const BIO_MAX = 160;

/** Screen 178: edit profile. */
export default function EditProfileScreen() {
  const { user, setUser } = useSession();
  const { t } = useTranslation('settings');
  const [name, setName] = useState(user?.name ?? '');
  const [username, setUsername] = useState(user?.username ?? '');
  const [school, setSchool] = useState(user?.school ?? '');
  const [grade, setGrade] = useState(user?.grade ?? '');
  const [bio, setBio] = useState(user?.bio ?? '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  if (!user) return null;
  const teacher = user.role === 'teacher';
  const changed =
    name.trim() !== user.name ||
    username.trim().toLowerCase() !== (user.username ?? '') ||
    school.trim() !== (user.school ?? '') ||
    grade.trim() !== (user.grade ?? '') ||
    bio.trim() !== (user.bio ?? '');

  const save = async () => {
    setBusy(true);
    setError(null);
    try {
      const { user: fresh } = await api.updateProfile({
        name: name.trim(),
        username: username.trim().toLowerCase(),
        school: school.trim(),
        grade: grade.trim(),
        bio: bio.trim(),
      });
      setUser(fresh);
      setSaved(true);
      setTimeout(() => goBack(), 700);
    } catch (e) {
      setError(errorText(e, t('editProfile.saveError')));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthScreen
      title={t('editProfile.title')}
      footer={
        <>
          {error && (
            <Text variant="small" color={Colors.danger} center>
              {error}
            </Text>
          )}
          <Button
            title={saved ? t('editProfile.saved') : t('editProfile.saveChanges')}
            icon="checkmark"
            loading={busy}
            disabled={!changed || !name.trim() || saved}
            onPress={save}
          />
        </>
      }>
      <Pressable
        onPress={() => router.push('/settings/photo')}
        accessibilityRole="button"
        accessibilityLabel={t('editProfile.changePhotoA11y')}
        style={styles.photo}>
        <ProfileAvatar size={96} />
        <Text variant="small" color={Colors.primary}>
          {t('editProfile.changePhoto')}
        </Text>
      </Pressable>
      <TextField
        label={t('editProfile.fullName')}
        icon="person-outline"
        value={name}
        onChangeText={setName}
        autoCapitalize="words"
        maxLength={60}
      />
      <TextField
        label={t('editProfile.username')}
        icon="at"
        value={username}
        onChangeText={(v) => setUsername(v.replace(/[^a-zA-Z0-9_]/g, '').toLowerCase())}
        placeholder={t('editProfile.usernamePlaceholder')}
        autoCapitalize="none"
        autoCorrect={false}
        maxLength={20}
        hint={t('editProfile.usernameHint')}
      />
      <TextField
        label={teacher ? t('editProfile.schoolTeacher') : t('editProfile.school')}
        icon="school-outline"
        value={school}
        onChangeText={setSchool}
        placeholder={t('editProfile.schoolPlaceholder')}
        maxLength={80}
      />
      <TextField
        label={teacher ? t('editProfile.subjectsTeacher') : t('editProfile.grade')}
        icon={teacher ? 'book-outline' : 'ribbon-outline'}
        value={grade}
        onChangeText={setGrade}
        placeholder={teacher ? t('editProfile.subjectsPlaceholder') : t('editProfile.gradePlaceholder')}
        maxLength={40}
      />
      <View style={{ gap: 6 }}>
        <Text variant="small" color={Colors.textSecondary} style={{ fontFamily: Fonts.semibold }}>
          {t('editProfile.bio')}
        </Text>
        <TextInput
          value={bio}
          onChangeText={(v) => setBio(v.slice(0, BIO_MAX))}
          placeholder={teacher ? t('editProfile.bioPlaceholderTeacher') : t('editProfile.bioPlaceholder')}
          placeholderTextColor={Colors.textMuted}
          multiline
          style={styles.bio}
          accessibilityLabel={t('editProfile.bio')}
        />
        <Text
          variant="small"
          color={bio.length > BIO_MAX - 20 ? Colors.reward : Colors.textMuted}
          style={{ alignSelf: 'flex-end', fontSize: 11 }}>
          {bio.length}/{BIO_MAX}
        </Text>
      </View>
      <Text variant="small" color={Colors.textMuted}>
        {t('editProfile.note')}
      </Text>
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  photo: { alignSelf: 'center', alignItems: 'center', gap: 6, marginBottom: Spacing.xs },
  bio: {
    ...NoWebOutline,
    minHeight: 96,
    color: Colors.text,
    fontFamily: Fonts.regular,
    fontSize: 16,
    lineHeight: 22,
    textAlignVertical: 'top',
    padding: Spacing.sm,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
});
