import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

import { Colors, Radius } from '@/constants/theme';

/**
 * A YouTube video in YouTube's own embedded player (videos are never downloaded). The page is
 * given a web origin, which YouTube's player needs to play inside an app.
 */
export function YouTubePlayer({ videoId, title }: { videoId: string; title: string }) {
  const html = `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1">
<style>html,body{margin:0;height:100%;background:#000}iframe{border:0;width:100%;height:100%}</style></head>
<body><iframe src="https://www.youtube-nocookie.com/embed/${videoId}?playsinline=1&rel=0&modestbranding=1"
title="${title.replace(/"/g, '&quot;')}" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe></body></html>`;
  return (
    <View style={styles.frame}>
      <WebView
        source={{ html, baseUrl: 'https://knowzone.ai' }}
        allowsInlineMediaPlayback
        allowsFullscreenVideo
        mediaPlaybackRequiresUserAction={false}
        javaScriptEnabled
        style={{ backgroundColor: '#000' }}
        accessibilityLabel={title}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  frame: { width: '100%', aspectRatio: 16 / 9, borderRadius: Radius.lg, overflow: 'hidden', backgroundColor: Colors.backgroundDeep },
});
