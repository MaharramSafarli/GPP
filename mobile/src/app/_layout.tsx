import { Baloo2_700Bold, Baloo2_800ExtraBold, useFonts } from '@expo-google-fonts/baloo-2';
import { Nunito_600SemiBold, Nunito_800ExtraBold } from '@expo-google-fonts/nunito';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { SettingsProvider } from '@/lib/settings';
import { colors, fonts } from '@/theme';

SplashScreen.preventAutoHideAsync();

const hidden = { headerShown: false, gestureEnabled: false } as const;

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Baloo2_700Bold,
    Baloo2_800ExtraBold,
    Nunito_600SemiBold,
    Nunito_800ExtraBold,
  });

  useEffect(() => {
    if (loaded || error) SplashScreen.hideAsync();
  }, [loaded, error]);

  if (!loaded && !error) return null;

  return (
    <SettingsProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.header },
          headerTintColor: colors.text,
          headerTitleStyle: { fontFamily: fonts.display, fontSize: 24 },
          headerShadowVisible: false,
          headerBackButtonDisplayMode: 'minimal',
          contentStyle: { backgroundColor: colors.header },
        }}>
        <Stack.Screen name="index" options={{ title: 'Ana səhifə' }} />
        <Stack.Screen name="children/index" options={{ title: 'Uşaqlar' }} />
        <Stack.Screen name="children/explain-it/index" options={{ title: 'İzah et!' }} />
        <Stack.Screen name="children/explain-it/setup" options={{ title: 'Yeni oyun' }} />
        <Stack.Screen name="children/explain-it/play" options={hidden} />
        <Stack.Screen name="children/memory/index" options={{ title: 'Kartları tap' }} />
        <Stack.Screen name="children/memory/[level]" options={hidden} />
        <Stack.Screen name="children/crossword/index" options={hidden} />
        <Stack.Screen name="children/word-search/index" options={hidden} />
        <Stack.Screen name="children/quiz/index" options={{ title: 'Bilik Çarxı' }} />
        <Stack.Screen name="children/quiz/[id]" options={{ headerShown: false }} />
      </Stack>
    </SettingsProvider>
  );
}
