import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { Loading } from '@/components/exams/ui';
import { Sheet } from '@/components/rooms/ui';
import { Text } from '@/components/ui';
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';
import { formatDate } from '@/i18n';
import { roomsApi, when, type RoomHistory } from '@/lib/rooms';

/** The room's streak and history: totals, minutes on each of the last 7 days and recent sessions. */
export function HistorySheet({ visible, roomId, onClose }: { visible: boolean; roomId: string; onClose: () => void }) {
  const { t } = useTranslation('rooms');
  const [h, setH] = useState<RoomHistory | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    if (visible)
      roomsApi
        .history(roomId)
        .then((x) => {
          setH(x);
          setFailed(false);
        })
        .catch(() => setFailed(true));
  }, [visible, roomId]);
  const most = Math.max(25, ...(h?.days.map((d) => d.minutes) ?? []));
  const labels = { today: t('today'), tomorrow: t('tomorrow') };

  return (
    <Sheet visible={visible} title={t('history.title')} onClose={onClose}>
      {!h ? (
        failed ? (
          <Text variant="small" color={Colors.textSecondary}>
            {t('loadFailed')}
          </Text>
        ) : (
          <Loading />
        )
      ) : (
        <>
          <View style={styles.stats}>
            <Stat big={`🔥 ${h.streak}`} label={t('history.streak')} />
            <Stat big={`${h.bestStreak}`} label={t('history.best')} />
            <Stat
              big={t('history.hm', { h: Math.floor(h.totalMinutes / 60), m: h.totalMinutes % 60 })}
              label={t('history.total')}
            />
          </View>
          <Text variant="label" color={Colors.textSecondary}>
            {t('history.week')}
          </Text>
          <View style={styles.chart}>
            {h.days.map((d) => (
              <View key={d.day} style={styles.col}>
                <Text variant="small" color={Colors.textMuted} style={{ fontSize: 10 }}>
                  {d.minutes || ''}
                </Text>
                <View style={styles.track}>
                  <View style={[styles.bar, { height: `${Math.max(d.minutes ? 8 : 0, (d.minutes / most) * 100)}%` }]} />
                </View>
                <Text variant="small" color={Colors.textSecondary} style={{ fontSize: 11 }}>
                  {formatDate(new Date(`${d.day}T12:00:00`), { weekday: 'narrow' })}
                </Text>
              </View>
            ))}
          </View>
          <Text variant="small" color={Colors.textSecondary}>
            {t('history.totals', { sessions: h.totalSessions, quizzes: h.quizzes })}
          </Text>
          {h.sessions.length > 0 && (
            <>
              <Text variant="label" color={Colors.textSecondary}>
                {t('history.recent')}
              </Text>
              {h.sessions.slice(0, 5).map((s) => (
                <View key={s.endedAt} style={styles.session}>
                  <Text variant="small" style={{ flex: 1 }}>
                    {when(s.endedAt, labels)}
                  </Text>
                  <Text variant="small" color={Colors.textSecondary}>
                    {t('history.session', { minutes: s.minutes, count: s.people })}
                  </Text>
                </View>
              ))}
            </>
          )}
        </>
      )}
    </Sheet>
  );
}

function Stat({ big, label }: { big: string; label: string }) {
  return (
    <View style={styles.stat}>
      <Text style={{ fontFamily: Fonts.extrabold, fontSize: 20 }}>{big}</Text>
      <Text variant="small" color={Colors.textSecondary} center style={{ fontSize: 11 }}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  stats: { flexDirection: 'row', gap: Spacing.sm },
  stat: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
    padding: Spacing.sm,
    borderRadius: Radius.md,
    backgroundColor: Colors.surfaceRaised,
  },
  chart: { flexDirection: 'row', gap: 6, height: 120 },
  col: { flex: 1, alignItems: 'center', gap: 4 },
  track: { flex: 1, width: '70%', justifyContent: 'flex-end', borderRadius: 6, backgroundColor: Colors.surfaceRaised },
  bar: { width: '100%', borderRadius: 6, backgroundColor: Colors.primary },
  session: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: 4 },
});
