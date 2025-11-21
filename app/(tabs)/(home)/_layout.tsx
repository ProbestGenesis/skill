import { Stack } from "expo-router"
import { SafeAreaView } from "react-native-safe-area-context"
import { authClient } from "@/lib/auth-client"
import { View, ActivityIndicator } from "react-native"

type Props = {}
function TabsLayout({ }: Props) {
    const { data: session, isPending } = authClient.useSession();
    if (isPending) {
      return (
        <View className="h-screen flex-col items-center justify-center">
          <ActivityIndicator size="large" />
        </View>
      );
    }
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(provider)" />
    </Stack>
  )
}
export default TabsLayout