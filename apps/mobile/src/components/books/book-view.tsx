import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

import { Colors } from '@/constants/theme';

/**
 * Shows a book inside the app: a saved file (allowed to read its PDF reader files next to it) or
 * the book's online reader. Reports the page in view for saved PDFs.
 */
export function BookView({ uri, local, onPage }: { uri: string; local: boolean; onPage?: (page: number) => void }) {
  return (
    <WebView
      source={{ uri }}
      originWhitelist={['*']}
      javaScriptEnabled
      domStorageEnabled
      allowFileAccess={local}
      allowFileAccessFromFileURLs={local}
      allowUniversalAccessFromFileURLs={local}
      setSupportMultipleWindows={false}
      startInLoadingState
      renderLoading={() => (
        <View style={[StyleSheet.absoluteFill, styles.loading]}>
          <ActivityIndicator color={Colors.primary} size="large" />
        </View>
      )}
      onMessage={(e) => {
        try {
          const m = JSON.parse(e.nativeEvent.data) as { page?: number };
          if (m.page) onPage?.(m.page);
        } catch {
          // Not a message from the reader page.
        }
      }}
      style={{ flex: 1, backgroundColor: '#fff' }}
    />
  );
}

const styles = StyleSheet.create({
  loading: { alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
});
