import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet } from 'react-native';

import { ActionSheet } from '@/components/ui';
import { Colors } from '@/constants/theme';
import { useSafety } from '@/lib/safety/store';

import { ConfirmDialog } from './overlays';

/** ⋯ next to another player: report them, block them, or (for friends) remove them. */
export function PlayerMenu({
  id,
  name,
  remove,
}: {
  id: string;
  name: string;
  remove?: { label: string; onPress: () => void };
}) {
  const { t } = useTranslation('world');
  const { block } = useSafety();
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState(false);

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={t('playerMenu.more', { name })}
        style={styles.btn}>
        <Ionicons name="ellipsis-horizontal" size={18} color={Colors.textMuted} />
      </Pressable>
      <ActionSheet
        visible={open}
        title={name}
        onClose={() => setOpen(false)}
        options={[
          ...(remove
            ? [
                {
                  label: remove.label,
                  icon: 'person-remove-outline' as const,
                  onPress: () => {
                    setOpen(false);
                    remove.onPress();
                  },
                },
              ]
            : []),
          {
            label: t('playerMenu.report'),
            icon: 'flag-outline',
            onPress: () => {
              setOpen(false);
              router.push({ pathname: '/help/report', params: { type: 'player', id, title: name } });
            },
          },
          {
            label: t('playerMenu.block'),
            icon: 'ban-outline',
            destructive: true,
            onPress: () => {
              setOpen(false);
              setConfirm(true);
            },
          },
        ]}
      />
      <ConfirmDialog
        visible={confirm}
        icon="ban"
        title={t('playerMenu.blockTitle', { name })}
        body={t('playerMenu.blockBody')}
        confirmLabel={t('playerMenu.blockConfirm')}
        cancelLabel={t('actions.cancel', { ns: 'common' })}
        destructive
        onConfirm={() => {
          setConfirm(false);
          block(id, name).catch(() => {});
        }}
        onCancel={() => setConfirm(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  btn: { width: 32, height: 40, alignItems: 'center', justifyContent: 'center' },
});
