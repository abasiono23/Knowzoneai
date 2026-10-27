import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

import { Colors, Radius } from '@/constants/theme';
import { API_URL } from '@/lib/config';

/**
 * A YouTube video in YouTube's own embedded player (videos are never downloaded). YouTube only plays
 * embeds on a real web page that sends its address, so the player page comes from our server
 * (`/embed/youtube/:id`) rather than being built inside the app.
 */
export function YouTubePlayer({ videoId, title }: { videoId: string; title: string }) {
  return (
    <View style={styles.frame}>
      <WebView
        source={{ uri: `${API_URL}/embed/youtube/${encodeURIComponent(videoId)}` }}
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
