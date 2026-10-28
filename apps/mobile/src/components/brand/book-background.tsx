import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { Colors } from '@/constants/theme';

const BOOK = require('@/assets/images/book-bg.webp');

/** The app's page background: white, with a soft purple open book faintly behind the content. */
export function BookBackground() {
  return (
    <View style={styles.fill} pointerEvents="none">
      <Image source={BOOK} style={styles.book} contentFit="contain" accessible={false} />
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.background,
    overflow: 'hidden',
  },
  book: { position: 'absolute', left: '-12%', right: '-12%', top: '18%', aspectRatio: 900 / 566, opacity: 0.45 },
});
