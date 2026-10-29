import { router, useFocusEffect, type Href } from 'expo-router';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, TextInput, View } from 'react-native';

import { LoadError, Loading } from '@/components/exams/ui';
import { RoomRow } from '@/components/rooms/ui';
import { Button, Card, Screen, ScreenHeader, Text } from '@/components/ui';
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';
import { errorText } from '@/i18n/errors';
import { USE_MOCKS } from '@/lib/config';
import { roomsApi, type RoomsHome } from '@/lib/rooms';

/** Study Rooms: invitations, your rooms, rooms open to your school, and joining with a code. */
export default function RoomsScreen() {
  const { t } = useTranslation('rooms');
  const [data, setData] = useState<RoomsHome | null>(null);
  const [error, setError] = useState<string | null>(USE_MOCKS ? t('offline') : null);
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  const load = useCallback(() => {
    if (USE_MOCKS) return;
    roomsApi
      .home()
      .then(setData)
      .catch((e) => setError(errorText(e, t('loadFailed'))));
  }, [t]);
  useFocusEffect(load);

  const open = (id: string) => router.push(`/rooms/${id}` as Href);
  const join = async (body: { code?: string; roomId?: string }) => {
    setBusy(true);
    setNote(null);
    try {
      const { room } = await roomsApi.join(body);
      setCode('');
      open(room.id);
    } catch (e) {
      setNote(errorText(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen withTabBar={false}>
      <ScreenHeader eyebrow={t('eyebrow')} title={t('title')} />
      <Text variant="body" color={Colors.textSecondary}>
        {t('intro')}
      </Text>
      <Button title={t('create')} icon="add-circle" onPress={() => router.push('/rooms/create' as Href)} />

      <Card style={{ gap: Spacing.sm }}>
        <Text variant="label" color={Colors.textSecondary}>
          {t('joinCode')}
        </Text>
        <View style={styles.codeRow}>
          <TextInput
            value={code}
            onChangeText={(v) => setCode(v.toUpperCase())}
            placeholder={t('codePlaceholder')}
            placeholderTextColor={Colors.textMuted}
            autoCapitalize="characters"
            autoCorrect={false}
            maxLength={8}
            accessibilityLabel={t('joinCode')}
            style={styles.code}
          />
          <Button
            title={t('join')}
            variant="secondary"
            disabled={code.trim().length < 4 || busy}
            onPress={() => void join({ code })}
          />
        </View>
        {!!note && (
          <Text variant="small" color={Colors.danger}>
            {note}
          </Text>
        )}
      </Card>

      {error ? (
        <LoadError
          text={error}
          onRetry={() => {
            setError(null);
            load();
          }}
        />
      ) : !data ? (
        <Loading />
      ) : (
        <>
          {data.invites.length > 0 && (
            <View style={{ gap: Spacing.sm }}>
              <Text variant="label" color={Colors.reward}>
                {t('invites')}
              </Text>
              {data.invites.map((i) => (
                <Card key={i.id} style={{ gap: Spacing.sm }}>
                  <Text variant="small" color={Colors.textSecondary}>
                    {t('invitedBy', { name: i.from })}
                  </Text>
                  <Text variant="bodyStrong">{i.room.name}</Text>
                  <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
                    <View style={{ flex: 1 }}>
                      <Button title={t('accept')} disabled={busy} onPress={() => void join({ roomId: i.room.id })} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Button
                        title={t('decline')}
                        variant="secondary"
                        onPress={() =>
                          void roomsApi
                            .decline(i.id)
                            .then(load)
                            .catch(() => {})
                        }
                      />
                    </View>
                  </View>
                </Card>
              ))}
            </View>
          )}

          <View style={{ gap: Spacing.sm }}>
            <Text variant="label" color={Colors.primary}>
              {t('myRooms')}
            </Text>
            {data.rooms.length ? (
              data.rooms.map((r) => <RoomRow key={r.id} room={r} onPress={() => open(r.id)} />)
            ) : (
              <Text variant="small" color={Colors.textSecondary}>
                {t('empty')}
              </Text>
            )}
          </View>

          {data.school.length > 0 && (
            <View style={{ gap: Spacing.sm }}>
              <Text variant="label" color={Colors.success}>
                {t('schoolRooms')}
              </Text>
              {data.school.map((r) => (
                <RoomRow key={r.id} room={r} onPress={() => void join({ roomId: r.id })} />
              ))}
            </View>
          )}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  codeRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  code: {
    flex: 1,
    minHeight: 48,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    color: Colors.text,
    fontFamily: Fonts.bold,
    fontSize: 16,
    letterSpacing: 1,
  },
});
