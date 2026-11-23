import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FONT, GameBackground, PrimaryButton, W } from '@/components/games/ui';
import { WorldCover } from '@/components/world/world-cover';
import { Text } from '@/components/ui';
import { Fonts } from '@/constants/theme';
import { useSession } from '@/lib/session';
import { WORLDS } from '@/lib/world/content';

/** Welcome to Knowzone World: the seven worlds, and what playing them is like. */
export default function WorldWelcomeScreen() {
  const { t } = useTranslation('world');
  const { user } = useSession();
  return (
    <GameBackground>
      <SafeAreaView style={styles.wrap}>
        <View style={styles.covers} accessible={false}>
          {WORLDS.map((w, k) => (
            <Animated.View key={w.id} entering={FadeIn.delay(80 + k * 60).duration(240)}>
              <WorldCover world={w.id} size={64} />
            </Animated.View>
          ))}
        </View>
        <Animated.View entering={FadeInDown.delay(300).duration(240)} style={{ gap: 10, alignItems: 'center' }}>
          <Text style={styles.eyebrow}>
            {user ? t('welcome.eyebrowName', { name: user.name.split(' ')[0].toUpperCase() }) : t('welcome.eyebrow')}
          </Text>
          <Text style={styles.title} accessibilityRole="header">
            {t('welcome.title')}
          </Text>
          <Text style={styles.body}>{t('adv.welcomeBody')}</Text>
        </Animated.View>
        <View style={{ alignSelf: 'stretch', gap: 6, marginTop: 'auto' }}>
          <PrimaryButton title={t('welcome.go')} icon="arrow-forward" onPress={() => router.replace('/world/intro')} />
          <Pressable onPress={() => router.back()} accessibilityRole="button" style={styles.link}>
            <Text style={styles.linkText}>{t('welcome.later')}</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </GameBackground>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', gap: 28, padding: 24, maxWidth: 560, width: '100%', alignSelf: 'center' },
  covers: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10, maxWidth: 330, marginTop: 32 },
  eyebrow: { fontFamily: Fonts.bold, fontSize: 11, letterSpacing: 1.2, color: W.muted },
  title: { fontFamily: FONT, fontSize: 30, lineHeight: 36, letterSpacing: -0.6, color: W.ink, textAlign: 'center' },
  body: { fontFamily: Fonts.regular, fontSize: 16, lineHeight: 24, color: W.inkSoft, textAlign: 'center' },
  link: { alignSelf: 'center', minHeight: 44, justifyContent: 'center', paddingHorizontal: 16 },
  linkText: { fontFamily: Fonts.bold, fontSize: 15, color: W.inkSoft, textDecorationLine: 'underline' },
});
