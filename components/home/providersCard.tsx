import { Star } from 'lucide-react-native';
import { View, Text, ActivityIndicator, Pressable } from 'react-native';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Provider, User } from '@/prisma/generated/prisma';
import { useRouter } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchSkills } from '@/lib/fetching/user';
import { authClient } from '@/lib/auth-client';

type Props = {
  provider: (Provider & { user: User }) | null;
  setProviderCard: any;
};
const ProviderCard = ({ provider, setProviderCard }: Props) => {
  const { data: session } = authClient.useSession();
  const router = useRouter();

  const queryClient = useQueryClient();

  const { data: skills, isPending } = useQuery({
    queryKey: ['skills', provider?.id],
    queryFn: () =>
      fetchSkills({
        providerId: provider?.id,
        userId: session?.user?.id,
      }),
    enabled: !!provider,
  });

  return (
    <Card className="">
      <CardHeader>
        <View className="flex-row gap-2">
          <Avatar alt="" className="h-16 w-16">
            <AvatarImage source={{ uri: provider?.user.image }} />
            <AvatarFallback>{provider?.user.name.slice(0, 2)}</AvatarFallback>
          </Avatar>

          <View className="flex-col items-start gap-0.5">
            <Text className="font-bold leading-tight">{provider?.user.name}</Text>
            <Badge>
              <Text className="text-white">{provider?.profession}</Text>
            </Badge>
            <Text className="flex-row items-center gap-1">
              {provider?.rate}
              <Star fill={'yellow'} stroke={'yellow'} size={14} />
            </Text>
          </View>
        </View>
      </CardHeader>

      <CardContent className="flex-col gap-2 max-w-80">
        <Text className="text-lg">Services proposé</Text>

        <View>
          {isPending ? (
            <View className="flex w-full items-center justify-center">
              <ActivityIndicator color={'orange'} size={24} />{' '}
            </View>
          ) : (
            <View>
              {skills && skills.length > 0 ? (
                <View>
                  {skills && skills.length > 0 && (
                    <View className="flex-col gap-2">
                      <View className="flex-row flex-wrap gap-2">
                        {skills.map((item: any, idx: number) => (
                          <Badge key={item.id}>
                            <Pressable
                              onPress={() => {
                                router.push({
                                  pathname:
                                    '/(tabs)/(home)/(provider)/[providerId]/services/[skillId]',
                                  params: {
                                    providerId: provider?.id,
                                    skillId: item.id,
                                  },
                                });
                              }}>
                              <Text className="text-xs text-white">{item.title}</Text>
                            </Pressable>
                          </Badge>
                        ))}
                      </View>
                    </View>
                  )}
                </View>
              ) : (
                <View className="flex w-full items-center justify-center">
                  <Text className="text-muted">Ne propose pas de services particuliers</Text>{' '}
                </View>
              )}
            </View>
          )}
        </View>
      </CardContent>

      <CardFooter className="w-full">
        <View className="w-full flex-row content-end justify-end gap-2">
          <Button
            className="rounded-full"
            variant={'outline'}
            onPress={() => {
              setProviderCard(null);
            }}>
            <Text> Fermer </Text>
          </Button>

          <Button
            className="rounded-full"
            onPress={() => {
              router.push({
                pathname: '/(tabs)/(home)/(provider)/[providerId]',
                params: { providerId: provider?.id },
              });
            }}>
            <Text className="text-white">Voir le profil</Text>
          </Button>
        </View>
      </CardFooter>
    </Card>
  );
};
export default ProviderCard;
