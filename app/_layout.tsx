import '@/global.css';
import { authClient } from '@/lib/auth-client';
import { NAV_THEME } from '@/lib/theme';
import { ThemeProvider } from '@react-navigation/native';
import { PortalHost } from '@rn-primitives/portal';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'nativewind';
import { ActivityIndicator, View } from 'react-native';
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';


const queryClient = new QueryClient();
export default function RootLayout() {
  const { colorScheme } = useColorScheme();
  const { data: session, isPending } = authClient.useSession();
  if (isPending) {
    return (
      <View className="flex-col h-screen items-center justify-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }
  return (
    <ThemeProvider value={NAV_THEME[colorScheme ?? 'light']}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <QueryClientProvider client={queryClient}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(auth)" />
      </Stack>
        <PortalHost />
      </QueryClientProvider>
    </ThemeProvider>
  );
}
