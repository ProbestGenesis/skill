import { authClient } from '@/lib/auth-client';
import { z } from 'zod';
import { View, Text, Platform, KeyboardAvoidingView, TextInput, ScrollView, ActivityIndicator } from 'react-native';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useState, useEffect, useRef, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { postsSchema as formSchema } from '@/lib/zodSchema';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import clsx from 'clsx';
import { useRouter, Redirect } from 'expo-router';

import { useQueryClient, useMutation } from '@tanstack/react-query';
import * as Location from 'expo-location';
//import AddPostIllustration from '@/assets/images/addpost.svg';

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Animated, { useSharedValue } from 'react-native-reanimated';
import { MotiView } from 'moti';
import { Checkbox } from '@/components/ui/checkbox';
import { profession } from '@/lib/data/professionData';

export default function AddPostCard({
  setAddPostCard,
  addPostCart,
}: {
  setAddPostCard: any;
  addPostCart: boolean;
}) {
  const { data: session, isPending } = authClient.useSession();
  const queryClient = useQueryClient();
  const router = useRouter();
  const titleRef = useRef<TextInput>(null);
  const bodyRef = useRef<TextInput>(null);

  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [success, setSuccess] = useState<{
    message?: string;
    status: number | null;
  }>({ message: '', status: null });

  // Valeurs partagées pour les animations
  const illustrationHeight = useSharedValue(1);
  const illustrationOpacity = useSharedValue(1);
  const formTranslateY = useSharedValue(0);

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

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    {
      /** */
    }
    setLoading(true);
    const response = await fetch(`${process.env.EXPO_PUBLIC_SERVER_URL}/api/user/${session?.user.id}/post`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        body: data.body,
        id: session?.user?.id,
        profession: data.profession,
        location: location,
      }),
    });

    const result = await response.json();
    if (result.status !== 201) {
      setSuccess({ message: result.message, status: result.status });
      setLoading(false);
    } else {
      setSuccess({ message: result.message, status: result.status });
      setTimeout(() => {
        router.replace('/(tabs)/(home)');
      }, 1000);
    }
  };

  const createPostMutation = useMutation({
    mutationFn: onSubmit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['yourLastPost'] });
    },
  });

  return (
    <MotiView
      from={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0 }}
      transition={{ type: 'spring', duration: 400 }}
      className="z-50">
      <Card>
        <CardHeader>
          <CardTitle>Demande de service</CardTitle>
        </CardHeader>

        <CardContent className="flex-col gap-2.5">
          <Controller
            control={control}
            name="profession"
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <View>
                <Label className="">Metier recherché</Label>

                <Select onValueChange={(v: any) => onChange(v)} value={value} defaultValue={value}>
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

          {/* Champ Description */}
          <View className="">
            <Label className="mb-2">Description</Label>
            <Controller
              control={control}
              name="body"
              render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                <View>
                  <Textarea
                    placeholder="Description détaillée du service recherché"
                    onChangeText={onChange}
                    value={value}
                    className={clsx('h-24', {
                      'border-destructive': error,
                    })}
                    numberOfLines={4}
                  />
                  {error && (
                    <MotiView
                      from={{ opacity: 0, translateX: -10 }}
                      animate={{ opacity: 1, translateX: 0 }}
                      transition={{ type: 'timing', duration: 200 }}>
                      <Text className="mt-1 text-sm text-destructive">{error.message}</Text>
                    </MotiView>
                  )}
                </View>
              )}
            />
          </View>

          {/*<View>
            <View className="flex-row gap-2 items-center">
              <Checkbox
                id="toogle"
                checked={false}
                onCheckedChange={() => {}}
              />
              <Text className="text-lg">Choisir le premier venue</Text>
            </View>
          </View>*/}

          {/* Bouton de soumission */}
          <MotiView
            from={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              type: 'spring',
              delay: 400,
              damping: 15,
            }}></MotiView>

          {/* Message de succès/erreur */}
          {success.message && (
            <MotiView
              from={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                type: 'spring',
                damping: 10,
              }}
              className="mt-4">
              <Text
                className={clsx('text-center font-bold', {
                  'text-green-600': success.status === 201,
                  'text-destructive': success.status !== 201,
                })}>
                {success.message}
              </Text>
            </MotiView>
          )}
        </CardContent>

        <CardFooter className="w-full">
          <View className="w-full flex-row justify-end gap-2">
            <Button
              className="rounded-full"
              variant={'outline'}
              size={'sm'}
              onPress={() => setAddPostCard(!addPostCart)}>
              <Text className="">fermer</Text>
            </Button>
            <Button
              size="sm"
              disabled={loading}
              className={clsx('rounded-full', {
                'opacity-50': loading,
              })}
              onPress={handleSubmit((data) => createPostMutation.mutate(data))}>
            {loading ? <ActivityIndicator size={24} color={"white"} /> :  <Text className="font-bold text-white">Publier</Text>}
            </Button>
          </View>
        </CardFooter>
      </Card>
    </MotiView>
  );
}
