import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { colors } from '../theme';

export default function RootLayout() {
  const customDarkTheme = {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      background: colors.background,
      card: colors.card,
      text: colors.text,
      border: colors.border,
      primary: colors.primary,
    },
  };

  return (
    <ThemeProvider value={customDarkTheme}>
      <Stack screenOptions={{ 
          headerStyle: { backgroundColor: colors.backgroundSecondary },
          headerTintColor: colors.text,
          headerShadowVisible: false,
      }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="anime/[session]" options={{ headerShown: false }} />
        <Stack.Screen name="watch/[session]" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" options={{ title: 'Oops!' }} />
      </Stack>
      <StatusBar style="light" />
    </ThemeProvider>
  );
}
