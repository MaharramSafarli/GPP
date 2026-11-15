import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { colors } from '@/theme';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerTitleStyle: { fontWeight: '800' },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: colors.background },
        }}>
        <Stack.Screen name="index" options={{ title: 'Home' }} />
        <Stack.Screen name="children/index" options={{ title: 'Children' }} />
        <Stack.Screen name="children/explain-it/index" options={{ title: 'Explain It!' }} />
        <Stack.Screen
          name="children/explain-it/play"
          options={{ title: 'Explain It!', gestureEnabled: false }}
        />
      </Stack>
    </>
  );
}
