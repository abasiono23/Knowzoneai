import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, Pressable, StyleSheet, Switch, useWindowDimensions, View, type ViewStyle } from 'react-native';

import { Text } from '@/components/ui';
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';
import { closeCookieSettings, saveCookieChoice, useCookieConsent } from '@/lib/cookie-consent';

/**
 * The cookie notice of the web version, shown until the visitor has chosen and again when opened from
 * Settings → Privacy. It stays clear of a screen's main buttons, which sit at the bottom in this app
 * (Get started, Log in, the tab bar): on a computer it is a bar with its own space under the app; on a
 * phone, where the first screens have no room to give, it is a card over the top of the screen.
 * "Accept all" and "Only essential" look the same on purpose. The site's own pages show the same notice
 * (apps/webapp/site.js) and share the choice. Never drawn in the phone apps.
 */
export function CookieNotice() {
  if (Platform.OS !== 'web') return null;
  return <WebCookieNotice />;
}

function WebCookieNotice() {
  const { choice, open } = useCookieConsent();
  const { t } = useTranslation('settings');
  const { width } = useWindowDimensions();
  // The settings panel: opened by the link in the notice, and always when it comes from Settings.
  const [panel, setPanel] = useState(false);
  // What the switch shows while the panel is open; null until the visitor moves it.
  const [draft, setDraft] = useState<boolean | null>(null);
  if (choice && !open) return null;

  const showPanel = panel || open;
  const desktop = width >= 820;
  // On a computer the words and the two answers share one line.
  const wide = desktop && !showPanel;
  const analytics = draft ?? choice?.analytics ?? false;
  const choose = (accept: boolean) => {
    setPanel(false);
    setDraft(null);
    saveCookieChoice({ analytics: accept });
  };
  const close = () => {
    setPanel(false);
    setDraft(null);
    closeCookieSettings();
  };

  return (
    <View role="region" aria-label={t('cookies.title')} style={desktop ? styles.bar : phoneDock}>
      <View style={[styles.inner, wide && styles.innerWide, !desktop && styles.card]}>
        <View style={[styles.words, wide && styles.wordsWide]}>
          <Text variant="small" color={Colors.textSecondary} style={styles.notice}>
            <Text variant="small" style={styles.strong}>
              {t('cookies.title')}
              {'. '}
            </Text>
            {t('cookies.notice')}
          </Text>
          <View style={styles.links}>
            <Pressable
              accessibilityRole="link"
              onPress={() => {
                if (open) close();
                router.push('/legal/cookies');
              }}>
              <Text variant="small" style={styles.link}>
                {t('cookies.policy')}
              </Text>
            </Pressable>
            {!open && (
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ expanded: showPanel }}
                onPress={() => setPanel(!panel)}>
                <Text variant="small" style={styles.link}>
                  {t('cookies.settings')}
                </Text>
              </Pressable>
            )}
          </View>
        </View>

        {showPanel && (
          <View style={styles.panel}>
            <View style={styles.row}>
              <View style={styles.rowText}>
                <Text variant="small" style={styles.strong}>
                  {t('cookies.essential')}
                </Text>
                <Text variant="small" color={Colors.textMuted} style={styles.hint}>
                  {t('cookies.essentialHint')}
                </Text>
              </View>
              <Text variant="small" color={Colors.textMuted} style={styles.hint}>
                {t('cookies.alwaysOn')}
              </Text>
            </View>
            <View style={styles.row}>
              <View style={styles.rowText}>
                <Text variant="small" style={styles.strong}>
                  {t('cookies.analytics')}
                </Text>
                <Text variant="small" color={Colors.textMuted} style={styles.hint}>
                  {t('cookies.analyticsHint')}
                </Text>
              </View>
              <Switch
                value={analytics}
                onValueChange={setDraft}
                trackColor={{ true: Colors.primary, false: Colors.surfaceRaised }}
                thumbColor="#fff"
                accessibilityLabel={t('cookies.analytics')}
              />
            </View>
          </View>
        )}

        {showPanel ? (
          <View style={styles.actions}>
            {open && <Choice title={t('actions.cancel', { ns: 'common' })} onPress={close} quiet />}
            <Choice title={t('cookies.save')} onPress={() => choose(analytics)} />
          </View>
        ) : (
          <View style={[styles.actions, wide && styles.actionsWide]}>
            <Choice title={t('cookies.onlyEssential')} onPress={() => choose(false)} />
            <Choice title={t('cookies.acceptAll')} onPress={() => choose(true)} />
          </View>
        )}
      </View>
    </View>
  );
}

/** One answer. Every answer has the same weight, so neither is pushed. */
function Choice({ title, onPress, quiet }: { title: string; onPress: () => void; quiet?: boolean }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.choice, quiet && styles.choiceQuiet, pressed && { opacity: 0.85 }]}>
      <Text variant="bodyStrong" center color={quiet ? Colors.text : Colors.textOnAccent} style={styles.choiceText}>
        {title}
      </Text>
    </Pressable>
  );
}

// On a phone: fixed to the top of the window (a web-only position), above every screen.
const phoneDock = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  zIndex: 1000,
  padding: Spacing.xs,
  alignItems: 'center',
} as unknown as ViewStyle;

const styles = StyleSheet.create({
  bar: {
    alignItems: 'center',
    padding: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.borderStrong,
    backgroundColor: Colors.surface,
    boxShadow: '0 -10px 30px -18px rgba(27, 31, 59, 0.5)',
  },
  inner: { width: '100%', maxWidth: 560, gap: Spacing.xs },
  card: {
    padding: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    backgroundColor: Colors.surface,
    boxShadow: '0 16px 40px -12px rgba(27, 31, 59, 0.45)',
  },
  innerWide: { maxWidth: 1040, flexDirection: 'row', alignItems: 'center', gap: Spacing.lg },
  words: { gap: Spacing.xxs },
  wordsWide: { flex: 1 },
  notice: { fontSize: 13, lineHeight: 19 },
  strong: { fontFamily: Fonts.bold, fontSize: 13, lineHeight: 19, color: Colors.text },
  hint: { fontSize: 12, lineHeight: 17 },
  links: { flexDirection: 'row', flexWrap: 'wrap', columnGap: Spacing.md, rowGap: Spacing.xxs },
  link: { fontFamily: Fonts.bold, fontSize: 13, color: Colors.primaryPressed, textDecorationLine: 'underline' },
  panel: { gap: Spacing.xs, paddingTop: Spacing.xs, borderTopWidth: 1, borderTopColor: Colors.border },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  rowText: { flex: 1 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
  actionsWide: { flexWrap: 'nowrap', width: 340 },
  choice: {
    flexGrow: 1,
    flexBasis: 140,
    minHeight: 44,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.pill,
    backgroundColor: Colors.primaryPressed,
    alignItems: 'center',
    justifyContent: 'center',
  },
  choiceQuiet: { backgroundColor: Colors.surfaceRaised, borderWidth: 1, borderColor: Colors.borderStrong },
  choiceText: { fontSize: 14, lineHeight: 20 },
});
