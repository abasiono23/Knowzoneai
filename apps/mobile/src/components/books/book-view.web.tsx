import { createElement } from 'react';
import { View } from 'react-native';

/** Web version (for checking the app in a browser): the book's online reader in a frame. */
export function BookView({ uri }: { uri: string; local: boolean; onPage?: (page: number) => void }) {
  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      {createElement('iframe', { src: uri, title: 'Book', style: { border: 0, width: '100%', height: '100%' } })}
    </View>
  );
}
