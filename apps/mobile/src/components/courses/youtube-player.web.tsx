import { createElement } from 'react';
import { StyleSheet, View } from 'react-native';

import { Colors, Radius } from '@/constants/theme';

/** A YouTube video in YouTube's own embedded player (web version). Videos are never downloaded. */
export function YouTubePlayer({ videoId, title, autoplay }: { videoId: string; title: string; autoplay?: boolean }) {
  return (
    <View style={styles.frame}>
      {createElement('iframe', {
        src: `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1&playsinline=1${autoplay ? '&autoplay=1' : ''}`,
        title,
        allow: 'autoplay; encrypted-media; picture-in-picture; fullscreen',
        allowFullScreen: true,
        style: { border: 0, width: '100%', height: '100%' },
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    backgroundColor: Colors.backgroundDeep,
  },
});
