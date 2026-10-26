import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { VideoRow } from '@/components/videos/video-thumb';
import { VideoRoute } from '@/components/videos/video-route';
import { Screen, ScreenHeader, Text } from '@/components/ui';
import { Colors, Spacing } from '@/constants/theme';
import { subjectLabel } from '@/lib/videos/options';
import { relatedTo, useVideos } from '@/lib/videos/store';

/** Screen 94: videos related by subject and level. */
export default function RelatedScreen() {
  const { catalog, generated } = useVideos();
  const { t } = useTranslation('videos');
  const { t: tHome } = useTranslation('home');
  return (
    <VideoRoute>
      {(v) => {
        const all = [...catalog, ...generated.filter((g) => g.status === 'ready')];
        const list = relatedTo(v, all, 12);
        const same = list.filter((x) => x.subject === v.subject);
        const other = list.filter((x) => x.subject !== v.subject);
        return (
          <Screen withTabBar={false}>
            <ScreenHeader eyebrow={t('related.eyebrow')} title={v.title} />
            {same.length > 0 && (
              <View style={{ gap: Spacing.sm }}>
                <Text variant="label" color={Colors.textMuted}>
                  {t('related.more', { subject: subjectLabel(v.subject, t, tHome).toUpperCase() })}
                </Text>
                {same.map((r) => (
                  <VideoRow key={r.id} video={r} />
                ))}
              </View>
            )}
            {other.length > 0 && (
              <View style={{ gap: Spacing.sm }}>
                <Text variant="label" color={Colors.textMuted}>
                  {t('related.alsoLike')}
                </Text>
                {other.map((r) => (
                  <VideoRow key={r.id} video={r} />
                ))}
              </View>
            )}
          </Screen>
        );
      }}
    </VideoRoute>
  );
}
