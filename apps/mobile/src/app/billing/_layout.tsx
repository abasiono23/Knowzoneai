import { Stack } from 'expo-router';

import { Colors } from '@/constants/theme';
import { CheckoutProvider } from '@/lib/billing/checkout';

export default function BillingLayout() {
  return (
    <CheckoutProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          contentStyle: { backgroundColor: Colors.background },
        }}>
        <Stack.Screen name="upgrade" options={{ presentation: 'modal' }} />
        <Stack.Screen name="promo" options={{ presentation: 'modal' }} />
        <Stack.Screen name="processing" options={{ animation: 'fade', gestureEnabled: false }} />
        <Stack.Screen name="success" options={{ animation: 'fade', gestureEnabled: false }} />
        <Stack.Screen name="failed" options={{ animation: 'fade' }} />
        <Stack.Screen name="pending" options={{ animation: 'fade' }} />
      </Stack>
    </CheckoutProvider>
  );
}
