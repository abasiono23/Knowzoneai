import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { CodeBlock, FigureBlock, NoteBlock } from '@/components/content/rich-blocks';
import { Text } from '@/components/ui';
import { Colors, Radius, Spacing } from '@/constants/theme';
import type { Block } from '@/lib/tutor/types';

/** Renders structured blocks: paragraphs, headings, lists, formulas, tips, warnings, notes, code and figures. */
export function AnswerBlocks({ blocks }: { blocks: Block[] }) {
  return (
    <View style={{ gap: Spacing.sm }}>
      {blocks.map((b, i) => {
        switch (b.type) {
          case 'h':
            return (
              <Text key={i} variant="heading" style={{ marginTop: 4 }}>
                {b.text}
              </Text>
            );
          case 'list':
            return (
              <View key={i} style={{ gap: 6 }}>
                {b.items.map((item, j) => (
                  <View key={j} style={styles.bullet}>
                    <View style={styles.dot} />
                    <Text style={{ flex: 1 }}>{item}</Text>
                  </View>
                ))}
              </View>
            );
          case 'formula':
            return (
              <View key={i} style={styles.formula}>
                <Text style={styles.formulaText}>{b.text}</Text>
              </View>
            );
          case 'tip':
            return (
              <View
                key={i}
                style={[styles.callout, { backgroundColor: Colors.successSoft, borderColor: Colors.success + '55' }]}>
                <Ionicons name="bulb" size={16} color={Colors.success} />
                <Text variant="small" style={{ flex: 1 }}>
                  {b.text}
                </Text>
              </View>
            );
          case 'warning':
            return (
              <View
                key={i}
                style={[styles.callout, { backgroundColor: Colors.rewardSoft, borderColor: Colors.reward + '55' }]}>
                <Ionicons name="warning" size={16} color={Colors.reward} />
                <Text variant="small" style={{ flex: 1 }}>
                  {b.text}
                </Text>
              </View>
            );
          case 'note':
            return <NoteBlock key={i} title={b.title} text={b.text} />;
          case 'code':
            return <CodeBlock key={i} text={b.text} />;
          case 'image':
            return <FigureBlock key={i} src={b.src} caption={b.caption} alt={b.alt} />;
          default:
            return <Text key={i}>{b.text}</Text>;
        }
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bullet: { flexDirection: 'row', gap: Spacing.xs, alignItems: 'flex-start' },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.primary, marginTop: 9 },
  formula: {
    backgroundColor: Colors.backgroundDeep,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  formulaText: { fontFamily: 'Manrope_700Bold', fontSize: 16, lineHeight: 24, color: Colors.text, textAlign: 'center' },
  callout: {
    flexDirection: 'row',
    gap: Spacing.xs,
    alignItems: 'flex-start',
    padding: Spacing.sm,
    borderRadius: Radius.sm,
    borderWidth: 1,
  },
});
