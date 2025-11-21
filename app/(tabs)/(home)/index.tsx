import { useQuery } from '@tanstack/react-query';
import { AnimatePresence, MotiView } from 'moti';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View, Text, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/button';
import { authClient } from '@/lib/auth-client';
import { userProviderData } from '@/lib/fetching/user';
import ClientCheckRadar from '@/components/home/clientCheckRadar';
import AddPostCard from '@/components/home/addPostCard';
import { Provider, User } from '@/prisma/generated/prisma';
import ProviderCheckRadar from '@/components/home/providerCheckRadar';
import JobsList from '@/components/home/jobsList';

type Props = {};
type UserDataType = Provider & { user: User };
function HomePage({}: Props) {
  const { data: session } = authClient.useSession();
  const username = session?.user.name;
  const router = useRouter();
  if (session && !session.user.phoneNumberVerified) {
    router.push('/(auth)/(register)/opt');
  }

  if (session && username && /^\d+$/.test(username)) {
    router.push('/(auth)/(register)');
  }
  const [addPostCart, setAddPostCard] = useState(false);
  const [role, setRole] = useState('Customer');

  const { data: userData, isLoading } = useQuery({
    queryKey: ['user', session?.user?.id],
    queryFn: () => userProviderData(session?.user.id),
    enabled: !!session,
  });
  return (
    <SafeAreaView style={{ flex: 1 }} className="relative">
      <View style={{ flex: 1 }} className="relative">
        <View className="relative flex-1">
          <View className="absolute right-0 top-0 w-full">
            {!isLoading && (
              <View>
                {session ? (
                  <View className="flex-row justify-between p-2">
                    {userData === null ? (
                      <Button
                        className="rounded-full"
                        variant={'destructive'}
                        size="sm"
                        onPress={() => router.push('/(tabs)/(setting)/provider')}>
                        <Text className="text-xs font-bold text-white">Devenir prestataire</Text>
                      </Button>
                    ) : (
                      <View>
                        {' '}
                        {role === 'Customer' ? (
                          <Button
                            size="sm"
                            variant={'outline'}
                            className="rounded-full"
                            onPress={() => setRole('Provider')}>
                            <Text className="font-bold">Client</Text>
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant={'outline'}
                            className="rounded-full"
                            onPress={() => setRole('Customer')}>
                            <Text className="font-bold">Prestataire</Text>
                          </Button>
                        )}
                      </View>
                    )}
                    <Button
                      size="sm"
                      className="rounded-full"
                      onPress={() => setAddPostCard(!addPostCart)}>
                      <Text className="font-bold text-white">Demander un service</Text>
                    </Button>
                  </View>
                ) : (
                  <Button
                    size="sm"
                    variant={'outline'}
                    className="rounded-full"
                    onPress={() => router.push('/(auth)')}>
                    <Text className="font-bold">Se connecter</Text>
                  </Button>
                )}{' '}
              </View>
            )}

            <AnimatePresence>
              {addPostCart && (
                <AddPostCard setAddPostCard={setAddPostCard} addPostCart={addPostCart} />
              )}
            </AnimatePresence>
          </View>

          {role === 'Customer' ? (
            <ClientCheckRadar userData={userData} />
          ) : (
            <ProviderCheckRadar userData={userData} />
          )}
        </View>

        <View className="p-2">
          <JobsList />
        </View>
      </View>
    </SafeAreaView>
  );
}
export default HomePage;
