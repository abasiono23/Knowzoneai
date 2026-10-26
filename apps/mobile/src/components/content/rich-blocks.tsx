import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui';
import { Colors, Radius, Spacing } from '@/constants/theme';

/** A textbook figure, sized to its own shape once loaded, with its caption (which carries the image credit). */
export function FigureBlock({ src, caption, alt, scale = 1 }: { src: string; caption?: string; alt?: string; scale?: number }) {
  const [ratio, setRatio] = useState(4 / 3);
  return (
    <View style={{ gap: 6 }}>
      <Image
        source={{ uri: src }}
        style={[styles.figure, { aspectRatio: ratio }]}
        contentFit="contain"
        transition={150}
        accessibilityLabel={alt ?? caption}
        onLoad={(e) => e.source.width && e.source.height && setRatio(e.source.width / e.source.height)}
      />
      {caption && (
        <Text variant="small" color={Colors.textSecondary} style={{ fontSize: 13 * scale, lineHeight: 19 * scale }}>
          {caption}
        </Text>
      )}
    </View>
  );
}

/** A code listing: monospace, scrolls sideways instead of wrapping. */
export function CodeBlock({ text, scale = 1 }: { text: string; scale?: number }) {
  return (
    <ScrollView horizontal style={styles.code} contentContainerStyle={{ padding: Spacing.sm }}>
      <Text selectable style={[styles.codeText, { fontSize: 14 * scale, lineHeight: 21 * scale }]}>
        {text}
      </Text>
    </ScrollView>
  );
}

/** A titled box from a textbook ("History: Galileo's Ship", "Careers in Biology"…). */
export function NoteBlock({ title, text, scale = 1 }: { title?: string; text: string; scale?: number }) {
  return (
    <View style={styles.note}>
      <Ionicons name="information-circle" size={18} color={Colors.primary} />
      <View style={{ flex: 1, gap: 2 }}>
        {title && (
          <Text variant="label" color={Colors.primary}>
            {title}
          </Text>
        )}
        <Text style={{ fontSize: 15 * scale, lineHeight: 22 * scale }}>{text}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Textbook figures are drawn for white paper.
  figure: { width: '100%', borderRadius: Radius.md, backgroundColor: '#FFFFFF' },
  code: {
    backgroundColor: Colors.backgroundDeep,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
  },
  codeText: { fontFamily: 'monospace', color: Colors.text },
  note: {
    flexDirection: 'row',
    gap: Spacing.xs,
    alignItems: 'flex-start',
    padding: Spacing.sm,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.primary + '55',
    backgroundColor: Colors.primary + '14',
  },
});
