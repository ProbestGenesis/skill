import { Stack } from "expo-router"
import { Bell } from "lucide-react-native"
import { View } from "react-native"

type Props = {}
function ProviderLayout({}: Props) {
  return (
    <Stack screenOptions={{ 
       headerRight: () => (
                    <View>
                      <Bell size={24} />
                    </View>
                  ),
        headerTitle: ""
     }}>
        <Stack.Screen name="index" options={{ 
            title: "Prestataires"
         }} />

          <Stack.Screen name='[providerId]/index' options={{}}  />
    </Stack>
  )
}
export default ProviderLayout