import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';
import { MotiView, AnimatePresence } from 'moti';
import { Ionicons } from '@expo/vector-icons';
import { useState, useCallback, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { createProvider } from '@/lib/zodSchema';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Textarea } from '@/components/ui/textarea';
import { useRouter } from 'expo-router';
import clsx from 'clsx';
import { authClient } from '@/lib/auth-client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { userProviderData } from '@/lib/fetching/user';
import * as Location from 'expo-location';
import { profession } from '@/lib/data/professionData';
import { availability } from '@/lib/data/availability';
import { usePreciseLocation } from '@/lib/geolocation';
type Props = {
  onComplete?: () => void;
};

export default function BecomeProvider({}: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: session } = authClient.useSession();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<{
    message: string | undefined;
    status: number | null;
  }>({ message: '', status: 201 });

 /* const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function getCurrentLocation() {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    }

    getCurrentLocation();
  }, []);
 */
  const { location, error: locationError, permissionGranted } = usePreciseLocation()
  useEffect(() => {
      if (locationError) {
        alert(locationError);
      }
  }, [locationError, permissionGranted]);

  const insets = useSafeAreaInsets();
  const contentInsets = {
    top: insets.top,
    bottom: Platform.select({
      ios: insets.bottom,
      android: insets.bottom + 24,
    }),
    left: 12,
    right: 12,
  };
  const [closeLanding, setCloseLanding] = useState(false);

  const { handleSubmit, control } = useForm({
    resolver: zodResolver(createProvider),
  });

  const handleCloseLanding = () => {
    setCloseLanding(true);
  };

  const onSubmit = async (data: z.infer<typeof createProvider>) => {
    console.log(location);
    setLoading(true);

    const res = await fetch(
      `${process.env.EXPO_PUBLIC_SERVER_URL}/api/user/${session?.user?.id}/provider`,
      {
        method: 'POST',
        body: JSON.stringify({
          profession: data.profession?.value,
          bio: data.bio,
          location: location,
          availability: data.availability.value,
          id: session?.user?.id,
        }),
      }
    );

    const { message, status } = await res.json();
    if (res.status !== 201) {
      setSuccess({ message: message, status: status });
      setLoading(false);
    } else {
      await userProviderData(session?.user?.id);
      setSuccess({ message: message, status: status });
      setTimeout(() => {
        router.back();
      }, 1000);
    }
  };

  const createProviderMutation = useMutation({
    mutationFn: onSubmit,
    onSuccess: () => {
      (queryClient.invalidateQueries({
        queryKey: ['userProviderInfo'],
      }),
        queryClient.invalidateQueries({
          queryKey: ['bestProvider'],
        }),
        queryClient.invalidateQueries({
          queryKey: ['user', session?.user.id],
        }));
    },
  });

  if (!session) {
    router.push('/(auth)');
  }

  return (
    <View className="flex-1">
      <AnimatePresence>
        {closeLanding ? (
          // Écran après fermeture
          <MotiView
            key="next"
            from={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{
              type: 'timing',
              duration: 200,
            }}
            className="flex-1">
            <View className="flex-1 flex-col gap-6 px-4 pt-5">
              <Controller
                control={control}
                name="profession"
                render={({ field: { onChange, value }, fieldState: { error } }) => (
                  <View>
                    <Label className="text-lg font-bold">Votre profession</Label>

                    <Select
                      onValueChange={(v: any) => onChange(v)}
                      value={value}
                      defaultValue={value}>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Selectionner votre professions" />
                      </SelectTrigger>
                      <SelectContent insets={contentInsets} className="">
                        <SelectGroup>
                          <SelectLabel>Professions</SelectLabel>
                          {profession.map((item) => (
                            <SelectItem key={item.value} label={item.label} value={item.value}>
                              {item.label}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>

                    {error?.message && (
                      <Text className="mt-1 text-sm text-red-600">{error.message}</Text>
                    )}
                  </View>
                )}
              />
              <Controller
                control={control}
                name="availability"
                render={({ field: { onChange, value }, fieldState: { error } }) => (
                  <View>
                    <Label className="text-lg font-bold">Votre disponibilité</Label>

                    <Select
                      onValueChange={(v: any) => onChange(v)}
                      value={value}
                      defaultValue={value}>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Sélectionner votre disponibilité" />
                      </SelectTrigger>
                      <SelectContent insets={contentInsets} className="">
                        <SelectGroup>
                          <SelectLabel>Disponibilités</SelectLabel>
                          {availability.map((item) => (
                            <SelectItem key={item.value} label={item.label} value={item.value}>
                              {item.label}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>

                    {error?.message && (
                      <Text className="mt-1 text-sm text-red-600">{error.message}</Text>
                    )}
                  </View>
                )}
              />

              <Controller
                name="bio"
                control={control}
                defaultValue=""
                render={({ field: { onChange, value }, fieldState: { error } }) => (
                  <View className="w-full">
                    <Label className="text-lg font-bold">Parlez-nous de vous</Label>
                    <Textarea
                      placeholder="Décrivez vos compétences, expériences, etc."
                      onChangeText={onChange}
                      value={value}
                      className="mt-1 h-32"
                      multiline
                      textAlignVertical="top"
                    />
                    {error?.message && (
                      <Text className="mt-1 text-sm text-red-600">{error.message}</Text>
                    )}
                  </View>
                )}
              />

              <Button
                className="rounded-full"
                disabled={loading}
                onPress={handleSubmit((data) => createProviderMutation.mutate(data))}>
              {loading ? <ActivityIndicator size={24} color={'white'} /> :  <Text className="font-bold text-white">Enregistrer</Text>}
              </Button>

              {success.message && (
                <Text
                  className={clsx('text-center font-bold', {
                    'text-green-600': success.status === 201,
                    'text-destructive': success.status !== 201,
                  })}>
                  {' '}
                  {success.message}{' '}
                </Text>
              )}
            </View>
          </MotiView>
        ) : (
          // Écran d’accueil
          <MotiView
            key="landing"
            from={{ opacity: 0, scale: 0.9, translateY: 30 }}
            animate={{ opacity: 1, scale: 1, translateY: 0 }}
            exit={{ opacity: 0, scale: 0.85, translateY: -20 }}
            transition={{
              type: 'spring',
              damping: 14,
              stiffness: 180,
              mass: 0.8,
            }}
            className="flex-1 justify-between px-6 py-10">
            {/* Header */}
            <View>
              <Text className="text-center text-2xl font-extrabold">
                🎯 Bienvenue sur <Text className="text-primary">BTPpro</Text>
              </Text>
              <Text className="mt-2 text-center text-base text-gray-600">
                La plateforme de toutes les opportunités pour les pros du BTP.
              </Text>
            </View>

            {/* Illustration */}
            <View className="items-center">
              <Ionicons name="construct-outline" size={120} color="#FDBA74" />
            </View>

            {/* Call-to-action */}
            <View className="gap-4">
              <Text className="text-center text-lg font-semibold text-gray-700">
                Devenir prestataire
              </Text>

              <Pressable
                onPress={handleCloseLanding}
                className="flex-row items-center justify-center gap-2 rounded-full bg-primary py-3 active:opacity-80">
                <Text className="text-base font-medium text-white">Quel emploie exercez vous?</Text>
              </Pressable>
            </View>
          </MotiView>
        )}
      </AnimatePresence>
    </View>
  );
}
