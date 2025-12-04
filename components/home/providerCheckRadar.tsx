import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, LayoutChangeEvent, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { authClient } from '@/lib/auth-client';
import { AnimatePresence, MotiView } from 'moti';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Ripple } from '@/components/ui/ripple';
import { useQuery } from '@tanstack/react-query';
import { fetchProximityCustomer } from '@/lib/fetching/home';
import { Provider, Post, User } from '@/prisma/generated/prisma';
import PostCardComponent from './postCard';
import SubmitedPosts from './submitedPost';
import { usePreciseLocation } from '@/lib/geolocation';

type UserDataType = Provider & { user: User };
type PostCardData = Post & { user: User; distance?: number };

type Props = {
  userData?: UserDataType;
};

function ProviderCheckRadar({ userData }: Props) {
  const { data: session } = authClient.useSession();
  const { location, error: locationError } = usePreciseLocation();

  const stableLoc = useMemo(() => {
    if (!location) return null;
    return {
      lat: parseFloat(location.latitude.toFixed(4)),
      long: parseFloat(location.longitude.toFixed(4)),
    };
  }, [location?.latitude, location?.longitude]);

  const [containerSize, setContainerSize] = useState<{ w: number; h: number }>({
    w: 0,
    h: 0,
  });

  const [postCard, setPostCard] = useState<PostCardData | null>(null);

  const { data: proximityCustomers, isLoading: loadingProximityCustomers } = useQuery({
    queryKey: [
      'noFarProviders',
      session?.user?.id,
      stableLoc?.lat, // Utilisation de la loc stable
      stableLoc?.long,
    ],
    queryFn: () =>
      fetchProximityCustomer({
        userId: session?.user.id ?? '',
        lat: location?.latitude,
        long: location?.longitude,
        providerId: userData?.id,
      }),
    enabled: !!location && !!stableLoc,
    staleTime: 1000 * 60, // Cache de 1 minute
  });

  // --- CONSTANTES DIMENSIONS ---
  const AVATAR_SIZE = 64;
  const CENTRAL_AVATAR_SIZE = 96;


  const MIN_RADIUS = CENTRAL_AVATAR_SIZE / 2 + AVATAR_SIZE / 2 + 20;
  const MAX_RADIUS = 160;

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setContainerSize({ w: width, h: height });
  }, []);

  const customers = (Array.isArray(proximityCustomers) ? proximityCustomers : []) as PostCardData[];

  // --- CALCUL DES DISTANCES MIN/MAX ---
  const { minDistance, maxDistance } = useMemo(() => {
    if (customers.length === 0) return { minDistance: 0, maxDistance: 1 };
    // Si l'API renvoie la distance, on l'utilise, sinon on simule avec l'index
    const distances = customers.map((c, i) => c.distance ?? i);
    return {
      minDistance: Math.min(...distances),
      maxDistance: Math.max(...distances),
    };
  }, [customers]);

  return (
    <View className="relative flex-1 flex-col items-center justify-center">
      <View
        className="relative h-[60vh] w-full flex-col items-center justify-center"
        onLayout={onLayout}>
        {/* Central Avatar */}
        {loadingProximityCustomers && <Ripple />}

        <View className="absolute left-1/2 top-[47%] z-10 -translate-x-1/2 -translate-y-1/2 items-center">
          <Avatar
            alt="user-avatar"
            style={{ width: CENTRAL_AVATAR_SIZE, height: CENTRAL_AVATAR_SIZE }}>
            <AvatarImage source={{ uri: session?.user?.image ?? undefined }} />
            <AvatarFallback />
          </Avatar>
          <Text className="mt-2 text-sm font-medium">{session?.user?.name ?? 'Vous'}</Text>
        </View>

        {/* Customers Radar Mapping */}
        <AnimatePresence>
          {customers.map((item: PostCardData, idx: number) => {
     
            const val = item.distance ?? idx;
            let normalizedDist = 0.5;

            if (maxDistance !== minDistance) {
              normalizedDist = (val - minDistance) / (maxDistance - minDistance);
            } else {
   
              normalizedDist = 0;
            }

            const radius = MIN_RADIUS + normalizedDist * (MAX_RADIUS - MIN_RADIUS);

            const goldenAngle = 137.5 * (Math.PI / 180);
            const angleRad = idx * goldenAngle;

            const x = Math.cos(angleRad) * radius;
            const y = Math.sin(angleRad) * radius;

            return (
              <MotiView
                key={item.id}
                from={{ opacity: 0, scale: 0, translateX: 0, translateY: 0 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  translateX: x - AVATAR_SIZE / 2,
                  translateY: y - AVATAR_SIZE / 2,
                }}
                transition={{
                  type: 'spring',
                  damping: 15,
                  stiffness: 100,
                  delay: idx * 100,
                }}
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: '47%', 
                  width: AVATAR_SIZE,
                  height: AVATAR_SIZE,
                  zIndex: 10, 
                }}>
                <TouchableOpacity activeOpacity={0.8} onPress={() => setPostCard(item)}>
                  <View className="flex-col items-center justify-center gap-0.5">
                    <Avatar
                      alt={`avatar-${idx}`}
                      style={{
                        width: AVATAR_SIZE,
                        height: AVATAR_SIZE,
                        borderWidth: 2,
                        borderColor: 'white',
                      }}>
                      <AvatarImage source={{ uri: item.user?.image ?? undefined }} />
                      <AvatarFallback />
                    </Avatar>

                    {/* Label Nom avec fond pour lisibilité */}
                    <View className="absolute -bottom-5 rounded-full bg-white/90 px-2 py-0.5 shadow-sm">
                      <Text
                        className="max-w-[80px] text-center text-[10px] font-bold text-black"
                        numberOfLines={1}>
                        {item.user.name}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              </MotiView>
            );
          })}
        </AnimatePresence>

        <AnimatePresence>
          {postCard !== null && (
            <View className="absolute z-50 h-[110vh] w-full bg-black/10">
              <View className="flex-1 items-center justify-center">
                <PostCardComponent post={postCard} setPostCard={setPostCard} />
              </View>
            </View>
          )}
        </AnimatePresence>

        <View className="absolute bottom-2 items-center">
          <Text className="text-2xl font-bold tracking-tighter">Près de chez vous</Text>
          {loadingProximityCustomers ? (
            <Text className="mt-2 text-sm text-muted-foreground">Chargement…</Text>
          ) : locationError ? (
            <Text className="mt-2 text-sm text-red-500">{locationError}</Text>
          ) : (
            <Text className="mt-2 text-sm">{customers.length} clients à proximité</Text>
          )}
        </View>
      </View>

      <SubmitedPosts providerData={userData} />
    </View>
  );
}

export default ProviderCheckRadar;
