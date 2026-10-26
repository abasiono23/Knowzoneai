import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, View, type ScrollViewInstance } from 'react-native';
import Svg, { Line } from 'react-native-svg';

import { ReadyMaterial } from '@/components/materials/ready-material';
import { Card, IconButton, Screen, ScreenHeader, Text } from '@/components/ui';
import { Colors, Gradients, Radius, Spacing } from '@/constants/theme';
import { percentLabel } from '@/lib/studio/labels';

const SIZE = 900;
const C = SIZE / 2;
const R1 = 200;
const R2 = 360;
const VIEW_H = 520;

/** Screen 82: radial mind map. Tap a branch to show or hide its details; zoom with the buttons. */
export default function MindMapScreen() {
  const { t } = useTranslation('study');
  const [scale, setScale] = useState(0.7);
  const [hidden, setHidden] = useState<Set<number>>(new Set());
  const [view, setView] = useState<'map' | 'outline'>('map');
  const [viewW, setViewW] = useState(0);
  const hRef = useRef<ScrollViewInstance>(null);
  const vRef = useRef<ScrollViewInstance>(null);

  // Keep the centre topic in the middle of the viewport (contentOffset is ignored on web).
  useEffect(() => {
    if (!viewW || view !== 'map') return;
    const timer = setTimeout(() => {
      hRef.current?.scrollTo({ x: Math.max(0, (SIZE * scale - viewW) / 2), animated: false });
      vRef.current?.scrollTo({ y: Math.max(0, (SIZE * scale - VIEW_H) / 2), animated: false });
    }, 50);
    return () => clearTimeout(timer);
  }, [scale, viewW, view]);

  return (
    <ReadyMaterial>
      {(m) => {
        const { center, branches } = m.content.mindMap;
        const n = branches.length;
        const nodes = branches.map((b, i) => {
          const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
          const bx = C + Math.cos(angle) * R1;
          const by = C + Math.sin(angle) * R1;
          const spread = Math.min(0.5, (Math.PI * 2) / n / 2.2);
          const kids = b.children.map((label, k) => {
            const a = angle + (k - (b.children.length - 1) / 2) * (spread / Math.max(1, b.children.length - 1)) * 2;
            return { label, x: C + Math.cos(a) * R2, y: C + Math.sin(a) * R2 };
          });
          return { ...b, x: bx, y: by, kids };
        });

        return (
          <Screen withTabBar={false} scroll={view === 'outline'}>
            <ScreenHeader
              eyebrow={t('mindmap.eyebrow')}
              eyebrowColor={Colors.info}
              title={m.title}
              right={
                <IconButton
                  icon={view === 'map' ? 'list' : 'git-network'}
                  label={view === 'map' ? t('mindmap.showOutline') : t('mindmap.showMap')}
                  onPress={() => setView(view === 'map' ? 'outline' : 'map')}
                />
              }
            />
            {view === 'outline' ? (
              <View style={{ gap: Spacing.sm }}>
                <Text variant="title">{center}</Text>
                {branches.map((b, bi) => (
                  <Card key={`${b.label}-${bi}`} style={{ gap: 6, borderLeftWidth: 4, borderLeftColor: b.color }}>
                    <Text variant="bodyStrong" color={b.color}>
                      {b.label}
                    </Text>
                    {b.children.map((c, ci) => (
                      <Text key={ci} variant="small" color={Colors.textSecondary}>
                        • {c}
                      </Text>
                    ))}
                  </Card>
                ))}
              </View>
            ) : (
              <View style={{ flex: 1 }}>
                <View style={styles.canvasWrap} onLayout={(e) => setViewW(e.nativeEvent.layout.width)}>
                  <ScrollView ref={hRef} horizontal showsHorizontalScrollIndicator={false}>
                    <ScrollView ref={vRef} style={{ height: VIEW_H }} showsVerticalScrollIndicator={false}>
                      <View style={{ width: SIZE * scale, height: SIZE * scale }}>
                        <View
                          style={{ width: SIZE, height: SIZE, transform: [{ scale }], transformOrigin: 'top left' }}>
                          <Svg width={SIZE} height={SIZE} style={StyleSheet.absoluteFill}>
                            {nodes.map((b, i) => (
                              <Line
                                key={`l${i}`}
                                x1={C}
                                y1={C}
                                x2={b.x}
                                y2={b.y}
                                stroke={b.color}
                                strokeWidth={3}
                                strokeOpacity={0.7}
                              />
                            ))}
                            {nodes.flatMap((b, i) =>
                              hidden.has(i)
                                ? []
                                : b.kids.map((k, j) => (
                                    <Line
                                      key={`k${i}-${j}`}
                                      x1={b.x}
                                      y1={b.y}
                                      x2={k.x}
                                      y2={k.y}
                                      stroke={b.color}
                                      strokeWidth={1.5}
                                      strokeOpacity={0.45}
                                    />
                                  )),
                            )}
                          </Svg>
                          <View style={[styles.center, { left: C - 80, top: C - 44 }]}>
                            <LinearGradient
                              colors={Gradients.ai}
                              start={{ x: 0, y: 0 }}
                              end={{ x: 1, y: 1 }}
                              style={styles.centerInner}>
                              <Text variant="bodyStrong" center numberOfLines={3}>
                                {center}
                              </Text>
                            </LinearGradient>
                          </View>
                          {nodes.map((b, i) => (
                            <Pressable
                              key={`${b.label}-${i}`}
                              onPress={() =>
                                setHidden((s) => {
                                  const next = new Set(s);
                                  if (next.has(i)) next.delete(i);
                                  else next.add(i);
                                  return next;
                                })
                              }
                              accessibilityRole="button"
                              accessibilityLabel={t(hidden.has(i) ? 'mindmap.branchShow' : 'mindmap.branchHide', {
                                label: b.label,
                              })}
                              style={[
                                styles.branch,
                                {
                                  left: b.x - 70,
                                  top: b.y - 22,
                                  borderColor: b.color,
                                  backgroundColor: b.color + '33',
                                },
                              ]}>
                              <Text variant="small" center numberOfLines={2} style={{ fontFamily: 'Manrope_700Bold' }}>
                                {b.label}
                              </Text>
                            </Pressable>
                          ))}
                          {nodes.flatMap((b, i) =>
                            hidden.has(i)
                              ? []
                              : b.kids.map((k, j) => (
                                  <View
                                    key={`n${i}-${j}`}
                                    style={[
                                      styles.leaf,
                                      { left: k.x - 62, top: k.y - 18, borderColor: b.color + '88' },
                                    ]}>
                                    <Text
                                      variant="small"
                                      center
                                      numberOfLines={3}
                                      style={{ fontSize: 11, lineHeight: 14 }}>
                                      {k.label}
                                    </Text>
                                  </View>
                                )),
                          )}
                        </View>
                      </View>
                    </ScrollView>
                  </ScrollView>
                </View>
                <View style={styles.zoom}>
                  <IconButton
                    icon="remove"
                    label={t('mindmap.zoomOut')}
                    onPress={() => setScale((s) => Math.max(0.45, +(s - 0.15).toFixed(2)))}
                  />
                  <Text variant="small" color={Colors.textSecondary}>
                    {percentLabel(scale, t)}
                  </Text>
                  <IconButton
                    icon="add"
                    label={t('mindmap.zoomIn')}
                    onPress={() => setScale((s) => Math.min(1.4, +(s + 0.15).toFixed(2)))}
                  />
                </View>
                <View style={styles.hint}>
                  <Ionicons name="hand-left-outline" size={14} color={Colors.textMuted} />
                  <Text variant="small" color={Colors.textMuted}>
                    {t('mindmap.hint')}
                  </Text>
                </View>
              </View>
            )}
          </Screen>
        );
      }}
    </ReadyMaterial>
  );
}

const styles = StyleSheet.create({
  canvasWrap: {
    height: VIEW_H,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    backgroundColor: Colors.backgroundDeep,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  center: { position: 'absolute', width: 160, height: 88 },
  centerInner: {
    flex: 1,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.sm,
  },
  branch: {
    position: 'absolute',
    width: 140,
    minHeight: 44,
    borderRadius: Radius.md,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
  },
  leaf: {
    position: 'absolute',
    width: 124,
    minHeight: 36,
    borderRadius: Radius.sm,
    borderWidth: 1,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
  },
  zoom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
  hint: { flexDirection: 'row', gap: 4, alignItems: 'center', justifyContent: 'center', marginTop: Spacing.xs },
});
