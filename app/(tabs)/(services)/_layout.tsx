import { Stack } from "expo-router"


type Props = {}
function TabsLayout({}: Props) {
  return (
    <Stack screenOptions={{ headerShown: false }}>
       <Stack.Screen name="index"/>
    </Stack>
  )
}
export default TabsLayout