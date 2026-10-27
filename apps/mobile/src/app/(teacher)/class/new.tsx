import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Share, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AuthScreen } from '@/components/auth/auth-screen';
import { HeroIcon } from '@/components/auth/hero-icon';
import { TextField } from '@/components/auth/text-field';
import { SuccessBadge } from '@/components/onboarding/success-badge';
import { ChoiceChip, ChipWrap } from '@/components/personalize/choice-chip';
import { Button, Card, Text } from '@/components/ui';
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';
import { errorText } from '@/i18n/errors';
import { subjectLabel, TEACH_LEVELS } from '@/lib/personalization';
import { teacherApi, type ClassSummary } from '@/lib/teacher';

const SUBJECTS = [
  'Mathematics',
  'English Language',
  'Physics',
  'Chemistry',
  'Biology',
  'Economics',
  'Government',
  'Literature',
  'Computer Studies',
];

export default function NewClassScreen() {
  const { t } = useTranslation('teacher');
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [level, setLevel] = useState('sss');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<ClassSummary | null>(null);

  const create = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await teacherApi.createClass({ name: name.trim(), subject, level });
      setCreated(res.class);
    } catch (e) {
      setError(errorText(e, t('newClass.failed')));
    } finally {
      setBusy(false);
    }
  };

  if (created) {
    const share = () =>
      Share.share({
        message: t('newClass.shareMessage', {
          subject: subjectLabel(created.subject),
          name: created.name,
          code: created.joinCode,
        }),
      });
    return (
      <AuthScreen
        center
        back={false}
        backdrop="reward"
        footer={
          <>
            <Button title={t('newClass.shareCode')} icon="share-social" onPress={share} />
            <Button
              variant="secondary"
              title={t('newClass.addFirstAssignment')}
              onPress={() => router.replace({ pathname: '/assignment/new', params: { classId: created.id } })}
            />
            <Button
              variant="ghost"
              title={t('actions.done', { ns: 'common' })}
              onPress={() => router.replace(`/class/${created.id}`)}
            />
          </>
        }>
        <SuccessBadge icon="people" />
        <Animated.View entering={FadeInDown.delay(250)} style={{ gap: Spacing.sm }}>
          <Text variant="display" center>
            {t('newClass.ready', { name: created.name })}
          </Text>
          <Text color={Colors.textSecondary} center>
            {t('newClass.readyHint')}
          </Text>
          <Card style={styles.code}>
            <Text style={styles.codeText}>{created.joinCode}</Text>
          </Card>
        </Animated.View>
      </AuthScreen>
    );
  }

  return (
    <AuthScreen
      hero={<HeroIcon icon="people" colors={['#FF9F43', '#7C5CFF']} />}
      title={t('newClass.title')}
      subtitle={t('newClass.subtitle')}
      footer={
        <>
          {error && (
            <Text variant="small" color={Colors.danger} center>
              {error}
            </Text>
          )}
          <Button title={t('newClass.create')} onPress={create} loading={busy} disabled={!name.trim() || !subject} />
        </>
      }>
      <TextField
        label={t('newClass.nameLabel')}
        icon="people-outline"
        placeholder={t('newClass.namePlaceholder')}
        value={name}
        onChangeText={setName}
        autoCapitalize="words"
      />
      <Text variant="heading">{t('newClass.subject')}</Text>
      <ChipWrap>
        {SUBJECTS.map((s) => (
          <ChoiceChip key={s} label={subjectLabel(s)} selected={subject === s} onPress={() => setSubject(s)} />
        ))}
      </ChipWrap>
      <Text variant="heading">{t('newClass.level')}</Text>
      <ChipWrap>
        {TEACH_LEVELS.map((l) => (
          <ChoiceChip
            key={l.id}
            label={l.label}
            emoji={l.emoji}
            selected={level === l.id}
            onPress={() => setLevel(l.id)}
          />
        ))}
      </ChipWrap>
      <View style={{ height: Spacing.sm }} />
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  code: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    borderStyle: 'dashed',
    borderColor: Colors.reward,
    backgroundColor: Colors.rewardSoft,
    borderRadius: Radius.lg,
  },
  codeText: { fontFamily: Fonts.extrabold, fontSize: 40, lineHeight: 48, letterSpacing: 8, color: Colors.text },
});
