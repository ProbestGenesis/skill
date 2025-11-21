import { Stack } from "expo-router"
import { SafeAreaView } from "react-native-safe-area-context"


type Props = {}
function TabsLayout({}: Props) {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(register)" />
    </Stack>
  )
} 
export default TabsLayout