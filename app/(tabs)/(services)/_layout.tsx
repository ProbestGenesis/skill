import { Stack } from "expo-router"


type Props = {}
function TabsLayout({}: Props) {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ 
         title: "Services"
        }} />
    </Stack>
  )
}
export default TabsLayout