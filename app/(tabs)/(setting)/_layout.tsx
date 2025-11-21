import { Stack } from "expo-router"


type Props = {}
function TabsLayout({}: Props) {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: 'Vous',
        }}
      />
      <Stack.Screen
        name="provider"
        options={{
          title: 'Prestataire de services',
          headerBackVisible: true,
        }}
      />

      <Stack.Screen
        name="skills"
        options={{
          title: 'Vos compétences',
          headerBackVisible: true,
        }}
      />
      <Stack.Screen
        name="profilPicture"
        options={{
          title: 'Photo de profil',
          headerBackVisible: true,
        }}
      />
    </Stack>
  );
}
export default TabsLayout