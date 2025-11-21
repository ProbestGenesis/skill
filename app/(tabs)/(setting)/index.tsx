import { Provider, Skills, User } from '@/prisma/generated/prisma';
import { useNavigation } from '@react-navigation/native';
import clsx from 'clsx';
import {
  BriefcaseBusiness,
  Calendar,
  HandCoins,
  LogOut,
  MapPin,
  MessageCircleQuestion,
  Pencil,
  Phone,
  QrCode,
  ServerIcon,
  Settings,
  Star,
  UserCheck,
  UserIcon,
} from 'lucide-react-native';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
  CardDescription,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useRouter, Redirect, Link } from 'expo-router';
import { useEffect, useState, useCallback } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { authClient } from '@/lib/auth-client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { userProviderData } from '@/lib/fetching/user';
import { SafeAreaView } from 'react-native-safe-area-context';

type Props = {};

type ProviderData = Provider & { user: User; skills: Skills[] };
function SettingScreen({}: Props) {
  const { data: session  } = authClient.useSession();

  const queryClient = useQueryClient();
  const router = useRouter();

  const { data, isLoading } = useQuery<ProviderData>({
    queryKey: ['userProviderInfo'],
    queryFn: () => userProviderData(session?.user?.id),
    staleTime: 3600,
    enabled: !!session,
    refetchOnMount: true,
  });

  const handleSignOut = async () => {
    try {
      await authClient.signOut();
    } catch (error) {
      console.log(error);
    }
  };

  if (!session) {
    router.push('/(auth)');
  }

  return (
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="px-2 pb-20">
          <View className="flex gap-2 py-4">
            <View className="mb-4 flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <Text>
                  {' '}
                  <UserIcon />{' '}
                </Text>
                <Text className="text-lg font-bold">Votre profil </Text>
              </View>

              {!data ? (
                <Link asChild href={'/(tabs)/(setting)/provider'}>
                  <Button size={'sm'} className="rounded-full">
                    <Text className="font-bold text-white">Devenir prestataire </Text>
                  </Button>
                </Link>
              ) : (
                <Button size={'sm'} variant={'outline'} className="rounded-full">
                  <Text className="font-bold">Modifier votre profil</Text>
                </Button>
              )}
            </View>

            <View className="flex-row gap-2">
              <Link href="/profilPicture">
                <Avatar alt="user profil" className="h-20 w-20">
                  <AvatarImage
                    //@ts-ignore
                    source={{ uri: data?.user?.image }}
                  />
                  <AvatarFallback>
                    <Text className="text-center">Ajouter une photo</Text>
                  </AvatarFallback>
                </Avatar>
              </Link>
              <View className="flex-col gap-0.5">
                <Text className="text-xl font-bold">{session?.user?.name}</Text>

                {isLoading ? (
                  <View className="flex-col gap-1">
                    <Skeleton className="h-4 w-40 rounded-full" />
                    <Skeleton className="h-4 w-40 rounded-full" />
                  </View>
                ) : (
                  <View className="flex-col gap-1">
                    {' '}
                    <Text className="text-primary">
                      {data?.profession || 'Profession non renseignée'}
                    </Text>
                    {data && (
                      <Badge variant="secondary" className='rounded-full'>
                        <View className="flex-row gap-2">
                          <Star fill="yellow" stroke={'yellow'} size="18" />
                          <Text
                            className={clsx({
                              'text-green-600': data?.rate > 3,
                              'text-red-700': data?.rate < 3,
                            })}>
                            {data.rate}
                          </Text>
                        </View>
                      </Badge>
                    )}
                  </View>
                )}
              </View>
            </View>
          </View>

          <View className="flex-col gap-8">
            <Card className="rounded-3xl">
              <CardHeader>
                <CardTitle>
                  <Text className="text-primary">Votre solde: </Text>
                </CardTitle>
              </CardHeader>

              <CardContent className="flex-row items-center justify-end gap-2">
                <Button variant={'outline'} className="rounded-full">
                  <Text>Retirer</Text>
                </Button>

                <Button className="rounded-full">
                  <Text className="text-white">Recharger</Text>
                </Button>
              </CardContent>
            </Card>

            {isLoading ? (
              <Skeleton className="h-32 w-full rounded-lg" />
            ) : (
              <Card>
                <CardHeader className="">
                  <CardTitle className="font-bold">
                    <Text>Vos informations</Text>
                  </CardTitle>
                  <CardDescription>
                    <Text>
                      Renseigner vos informations personel renforce la confiance de client a propos
                      de vous
                    </Text>
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <View className="flex-col gap-2">
                    <View className="flex-col items-center justify-center">
                      <Text className="font-bold tracking-widest">Bio</Text>
                      {data?.bio ? (
                        <Text className="text-center text-sm leading-snug">{data?.bio}</Text>
                      ) : (
                        <Button variant="link" size="sm">
                          Ajouter un bio
                        </Button>
                      )}
                    </View>

                    <View className="flex-row items-center justify-start gap-2">
                      <MapPin />

                      <View className="flex-row gap-1">
                        <Text>Ville et quartier: </Text>
                        {data?.user?.city || data?.user?.district ? (
                          <View className="flex-row gap-1">
                            {' '}
                            <Text>{data?.user?.city} </Text>
                            <Text>|</Text>
                            <Text> {data?.user?.district}</Text>{' '}
                          </View>
                        ) : (
                          <Text className="text-muted">non renseignée</Text>
                        )}
                      </View>
                    </View>

                    <View className="flex-row items-center justify-start gap-2">
                      <Phone />

                      <View className="flex-row gap-1">
                        <Text>Numéro de télephone: </Text>

                        {data?.user?.phoneNumber ? (
                          <Text>{data?.user?.phoneNumber}</Text>
                        ) : (
                          <Text className="text-muted">non renseignée</Text>
                        )}
                      </View>
                    </View>

                    <View className="flex-row items-center justify-start gap-2">
                      <BriefcaseBusiness />

                      <View className="flex-row gap-1">
                        <Text>Profession: </Text>

                        {data?.profession ? (
                          <Text>{data?.profession}</Text>
                        ) : (
                          <Text className="text-muted">non renseignée</Text>
                        )}
                      </View>
                    </View>

                    <View className="flex-row items-center justify-start gap-2">
                      <Calendar />

                      <View className="flex-row gap-1">
                        <Text>Disponibilité: </Text>

                        {data?.availability ? (
                          <Text>{data?.availability}</Text>
                        ) : (
                          <Text className="text-muted">non renseignée</Text>
                        )}
                      </View>
                    </View>

                    <View className="flex-row items-center justify-start gap-2">
                      <HandCoins />

                      <View className="flex-row gap-1">
                        <Text>Prix de base: </Text>

                        {data?.average_price ? (
                          <Text>{data?.average_price}</Text>
                        ) : (
                          <Text className="text-muted">non renseignée</Text>
                        )}

                        <Badge variant={'secondary'} className="h-6 w-6">
                          <Text className="text-xs font-bold">!</Text>
                        </Badge>
                      </View>
                    </View>
                  </View>
                </CardContent>

                <CardFooter className="flex-row items-end justify-end">
                  <Button
                    className="rounded-full"
                    onPress={() => {
                      router.push('/editProfil');
                    }}>
                    <Text className="text-white">Modifier</Text>
                  </Button>
                </CardFooter>
              </Card>
            )}

            <Card className="rounded-3xl">
              <CardHeader>
                <CardTitle className="text-primary font-bold text-xl">
                      Confirmation de service terminé
                </CardTitle>

                <CardDescription>
                  <Text>
                    Lorem ipsum dolor sit amet consectetur adipisicing elit. Sequi et, eveniet atque
                    aliquid molestiae{' '}
                  </Text>
                </CardDescription>
              </CardHeader>

              <CardContent>
                <View className="flex-row items-center gap-4">
                  <KeyboardAvoidingView
                    behavior={Platform.select({
                      ios: 'padding',
                      android: 'height',
                    })}
                    keyboardVerticalOffset={Platform.select({
                      ios: 60,
                      android: 100,
                    })}>
                    {' '}
                    <Input
                      placeholder="Entrer le code"
                      className="w-[120px] rounded-full text-xl"
                    />
                  </KeyboardAvoidingView>
                  <Button className="rounded-full" variant={'outline'}>
                    <Text>
                      {' '}
                      <QrCode />{' '}
                    </Text>
                  </Button>
                </View>
              </CardContent>

              <CardFooter className="flex-row items-end justify-end">
                <Button className="rounded-full">
                  <Text className="text-white">Confirmer </Text>
                </Button>
              </CardFooter>
            </Card>

            {isLoading ? (
              <Skeleton className="h-32 w-full rounded-lg" />
            ) : (
              <View>
                {' '}
                {data && (
                  <Card>
                    <CardHeader className="flex-row justify-between">
                      <View className="flex-row items-center gap-2">
                        <Text>
                          <ServerIcon />{' '}
                        </Text>
                        <Text className="text-lg font-bold">Vos services</Text>
                      </View>

                      {data && data.skills.length > 0 && (
                        <Link
                          asChild
                          href={{
                            pathname: '/skills',
                            params: { providerId: data?.id as string },
                          }}>
                          <Button size="sm" className="rounded-full">
                            <Text className="text-white">Ajouter un service</Text>
                          </Button>
                        </Link>
                      )}
                    </CardHeader>

                    <CardContent className="w-full flex-col gap-4">
                      {data && data.skills.length > 0 ? (
                        <View>
                          {data.skills.map((service: any, idx: number) => {
                            if (idx < 3) {
                              return (
                                <View className="mb-1 flex-col gap-2" key={service.id}>
                                  <View className="flex-row items-center gap-2">
                                    <View className="flex-1 flex-col">
                                      <View className="flex-col gap-1">
                                        <Text className="text-lg font-semibold">
                                          {service.title}
                                        </Text>
                                        <Text className="text-muted">{service.description}</Text>
                                      </View>

                                      <View>
                                        <Text className="font-semibold -tracking-tighter text-primary">
                                          Prix de base: {service.average_price} FCFA
                                        </Text>
                                      </View>
                                    </View>

                                    <Button
                                      className="h-8 w-8 rounded-full"
                                      variant="link"
                                      size={'sm'}>
                                      <Text className="text-xs">Modifier</Text>
                                    </Button>
                                  </View>

                                  <View className="h-0.5 w-full bg-gray-200" />
                                </View>
                              );
                            }
                            return null;
                          })}
                        </View>
                      ) : (
                        <View className="w-full flex-col items-center justify-center gap-6">
                          <Text className="font-bold">
                            Vous n'avez pas encore ajouté les services que vous éffectuez
                          </Text>

                          <Link
                            asChild
                            href={{
                              pathname: '/skills',
                              params: { providerId: data?.id as string },
                            }}>
                            <Button size={'lg'} className="rounded-full">
                              <Text className="text-white">Ajouter un service</Text>
                            </Button>
                          </Link>
                        </View>
                      )}
                    </CardContent>
                  </Card>
                )}{' '}
              </View>
            )}
            <Card>
              <CardHeader>
                <View className="flex-row items-center gap-2">
                  <Settings />
                  <Text className="text-lg font-bold">Preference</Text>
                </View>
              </CardHeader>

              <CardContent className="flex-col gap-4">
                <View className="flex-row items-center justify-between">
                  <View className="flex-col gap-1">
                    <Text className="text-lg">Activer les notifications</Text>
                    <Text className="text-muted">
                      Lorem ipsum dolor sit amet consectetur, adipisicing elit. Ipsa, magnam
                      laboriosam
                    </Text>
                  </View>
                </View>

                <View className="flex-row items-center justify-between">
                  <View className="flex-col gap-1">
                    <Text className="text-lg">Email marketing</Text>
                    <Text className="text-muted">
                      Lorem ipsum dolor sit amet consectetur, adipisicing elit. Ipsa, magnam
                      laboriosam
                    </Text>
                  </View>
                </View>
              </CardContent>
            </Card>

            <Button className="w-full flex-row gap-6" variant={'outline'} onPress={handleSignOut}>
              <LogOut />

              <Text className="font-bold">Se deconncter</Text>
            </Button>
          </View>
        </View>
      </ScrollView>
  );
}

export default SettingScreen;
