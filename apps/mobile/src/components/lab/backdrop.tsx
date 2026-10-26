import { Image } from 'expo-image';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { coverMap } from '@/lib/games/lab';

/** A scene picture covering the whole screen, slightly darkened so panels on it stay readable. */
export function Backdrop({ source, dim = 0.15 }: { source: number; dim?: number }) {
  const [size, setSize] = useState({ w: 0, h: 0 });
  const map = coverMap(size.w, size.h);
  return (
    <View
      style={StyleSheet.absoluteFill}
      onLayout={(e) => setSize({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}
      pointerEvents="none">
      {size.w > 0 && (
        <Image
          source={source}
          style={{ position: 'absolute', left: map.ox, top: map.oy, width: map.dw, height: map.dh }}
          contentFit="cover"
          accessible={false}
        />
      )}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: `rgba(8,10,30,${dim})` }]} />
    </View>
  );
}
