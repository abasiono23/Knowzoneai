import { Ionicons } from '@expo/vector-icons';
import { router, type Href } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { Button, Screen, ScreenHeader, Text } from '@/components/ui';
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';
import { errorText } from '@/i18n/errors';
import { roomsApi } from '@/lib/rooms';
import { useSession } from '@/lib/session';

/** Create a study room: a name, an optional subject, and who can join. */
export default function CreateRoom() {
  const { t } = useTranslation('rooms');
  const { user } = useSession();
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [visibility, setVisibility] = useState<'private' | 'school'>('private');
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const hasSchool = !!user?.school;

  const create = async () => {
    setBusy(true);
    setNote(null);
    try {
      const { room } = await roomsApi.create({
        name: name.trim(),
        ...(subject.trim() && { subject: subject.trim() }),
        visibility,
      });
      router.replace(`/rooms/${room.id}?invite=1` as Href);
    } catch (e) {
      setNote(errorText(e));
      setBusy(false);
    }
  };

  const choice = (id: 'private' | 'school') => {
    const on = visibility === id;
    const disabled = id === 'school' && !hasSchool;
    return (
      <Pressable
        key={id}
        onPress={() => setVisibility(id)}
        disabled={disabled}
        accessibilityRole="radio"
        accessibilityState={{ checked: on, disabled }}
        style={[styles.choice, on && styles.choiceOn, disabled && { opacity: 0.5 }]}>
        <Ionicons
          name={id === 'school' ? 'school' : 'people'}
          size={22}
          color={on ? Colors.primary : Colors.textMuted}
        />
        <View style={{ flex: 1, gap: 2 }}>
          <Text variant="bodyStrong">{t(`${id}.title`)}</Text>
          <Text variant="small" color={Colors.textSecondary}>
            {disabled ? t('noSchool') : t(`${id}.body`)}
          </Text>
        </View>
        <Ionicons
          name={on ? 'radio-button-on' : 'radio-button-off'}
          size={20}
          color={on ? Colors.primary : Colors.textMuted}
        />
      </Pressable>
    );
  };

  return (
    <Screen withTabBar={false}>
      <ScreenHeader eyebrow={t('title')} title={t('newRoom')} />
      <View style={{ gap: 6 }}>
        <Text variant="small" color={Colors.textSecondary} style={{ fontFamily: Fonts.semibold }}>
          {t('name')}
        </Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder={t('namePlaceholder')}
          placeholderTextColor={Colors.textMuted}
          maxLength={40}
          accessibilityLabel={t('name')}
          style={styles.input}
        />
      </View>
      <View style={{ gap: 6 }}>
        <Text variant="small" color={Colors.textSecondary} style={{ fontFamily: Fonts.semibold }}>
          {t('subject')}
        </Text>
        <TextInput
          value={subject}
          onChangeText={setSubject}
          placeholder={t('subjectPlaceholder')}
          placeholderTextColor={Colors.textMuted}
          maxLength={40}
          accessibilityLabel={t('subject')}
          style={styles.input}
        />
      </View>
      <View style={{ gap: Spacing.sm }}>
        <Text variant="small" color={Colors.textSecondary} style={{ fontFamily: Fonts.semibold }}>
          {t('who')}
        </Text>
        {choice('private')}
        {choice('school')}
      </View>
      {!!note && (
        <Text variant="small" color={Colors.danger}>
          {note}
        </Text>
      )}
      <Button
        title={t('createButton')}
        icon="add-circle"
        loading={busy}
        disabled={!name.trim()}
        onPress={() => void create()}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  input: {
    minHeight: 52,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    color: Colors.text,
    fontFamily: Fonts.regular,
    fontSize: 16,
  },
  choice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  choiceOn: { borderColor: Colors.primary, backgroundColor: Colors.primarySoft },
});
