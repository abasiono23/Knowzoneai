import Constants from 'expo-constants';
import { Dimensions, Platform } from 'react-native';

/** Non-personal technical details attached to support requests and bug reports (shown before sending). */
export function deviceInfo(): Record<string, string> {
  const { width, height } = Dimensions.get('window');
  return {
    app: `Knowzone ${Constants.expoConfig?.version ?? '1.0.0'}`,
    platform:
      Platform.OS === 'web'
        ? `Web (${typeof navigator !== 'undefined' ? (navigator.userAgent.split(') ')[0].split('(')[1] ?? 'browser') : 'browser'})`
        : `${Platform.OS === 'ios' ? 'iOS' : 'Android'} ${String(Platform.Version)}`,
    screen: `${Math.round(width)}×${Math.round(height)}`,
  };
}
