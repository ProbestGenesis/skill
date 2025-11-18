import { Stack } from "expo-router"


type Props = {}
function TabsLayout({}: Props) {
  return (
    <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen />
    </Stack>
  )
}
export default TabsLayout