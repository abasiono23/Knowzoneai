import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AuthScreen } from '@/components/auth/auth-screen';
import { TextField } from '@/components/auth/text-field';
import { ReadyMaterial } from '@/components/materials/ready-material';
import { ChoiceChip, ChipWrap } from '@/components/personalize/choice-chip';
import { Button, Text } from '@/components/ui';
import { Colors } from '@/constants/theme';
import { formatDate } from '@/i18n';
import { englishSubjectName, SUBJECTS } from '@/lib/catalog';
import { folderLabel, materialSubject, sourceText } from '@/lib/studio/labels';
import { useMaterials } from '@/lib/studio/store';
import type { Material } from '@/lib/studio/types';

/** Screen 86: rename a material, set its subject and folder, and add tags. */
export default function EditMaterialScreen() {
  return <ReadyMaterial>{(m) => <Form m={m} />}</ReadyMaterial>;
}

function Form({ m }: { m: Material }) {
  const { t } = useTranslation('study');
  const { update, folders } = useMaterials();
  const [title, setTitle] = useState(m.title);
  const [subject, setSubject] = useState(m.subject);
  const [folder, setFolder] = useState(m.folder);
  const [tags, setTags] = useState(m.tags.join(', '));
  const subjects = [...new Set([m.subject, ...SUBJECTS.map((s) => englishSubjectName(s.id))])].slice(0, 12);

  const save = () => {
    update(m.id, {
      title: title.trim() || m.title,
      subject,
      folder: folder.trim() || subject,
      tags: tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean)
        .slice(0, 6),
    });
    router.back();
  };

  return (
    <AuthScreen
      title={t('edit.title')}
      footer={<Button title={t('edit.save')} onPress={save} disabled={!title.trim()} />}>
      <TextField
        label={t('shared.titleLabel')}
        icon="text-outline"
        value={title}
        onChangeText={setTitle}
        maxLength={80}
      />
      <Text variant="heading">{t('edit.subject')}</Text>
      <ChipWrap>
        {subjects.map((s) => (
          <ChoiceChip key={s} label={materialSubject(s)} selected={subject === s} onPress={() => setSubject(s)} />
        ))}
      </ChipWrap>
      <Text variant="heading">{t('shared.folder')}</Text>
      {folders.length > 0 && (
        <ChipWrap>
          {folders.map((f) => (
            <ChoiceChip key={f} label={folderLabel(f)} selected={folder === f} onPress={() => setFolder(f)} />
          ))}
        </ChipWrap>
      )}
      <TextField
        label={t('edit.folderName')}
        icon="folder-outline"
        value={folder}
        onChangeText={setFolder}
        placeholder={materialSubject(subject)}
      />
      <TextField
        label={t('edit.tags')}
        icon="pricetags-outline"
        value={tags}
        onChangeText={setTags}
        placeholder={t('edit.tagsPlaceholder')}
        hint={t('edit.tagsHint')}
      />
      <Text variant="small" color={Colors.textMuted}>
        {t('edit.created', {
          date: formatDate(m.createdAt, { year: 'numeric', month: 'numeric', day: 'numeric' }),
          source: sourceText(m, t),
        })}
      </Text>
    </AuthScreen>
  );
}
