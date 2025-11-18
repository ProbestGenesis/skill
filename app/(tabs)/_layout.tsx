import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';


type Props = {};
function TabsLayout({}: Props) {

  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen
        name="(home)"
        options={{
          title: 'Accueil',
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'home-sharp' : 'home-outline'} color={color} size={24} />
          ),
        }}
      />

      <Tabs.Screen
        name="(services)"
        options={{
          title: 'Services',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'code-working-sharp' : 'code-working-outline'}
              color={color}
              size={24}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="(setting)"
        options={{
          headerShown: false,
          title: 'Vous',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'person-sharp' : 'person-outline'} color={color} size={24} />
          ),
        }}
      />
    </Tabs>
  );
}
export default TabsLayout;
