import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { View, Text, LayoutChangeEvent, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { authClient } from '@/lib/auth-client';
import { AnimatePresence, MotiView } from 'moti';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Ripple } from '@/components/ui/ripple';
import { useQuery } from '@tanstack/react-query';
import { fetchProximityProviders, fetchYourRecentProviders } from '@/lib/fetching/home';
import { Provider, User } from '@/prisma/generated/prisma';
import { usePreciseLocation } from '@/lib/geolocation';
import ProviderCard from './providersCard';
import Recent from './recent';

type ProviderData = Provider & { user: User };

type Props = {
  userData?: ProviderData;
};

function ClientCheckRadar({ userData }: Props) {
  const { data: session } = authClient.useSession();
  const { location, error: locationError } = usePreciseLocation();

  if (locationError) {
    alert(locationError);
  }

  const [containerSize, setContainerSize] = useState<{ w: number; h: number }>({
    w: 0,
    h: 0,
  });

  const [providerCard, setProviderCard] = useState<ProviderData | null>(null);
  
  const stableLoc = useMemo(() => {
    if (!location) return null;
    return {
      lat: parseFloat(location.latitude.toFixed(4)),
      long: parseFloat(location.longitude.toFixed(4)),
    };
  }, [location?.latitude, location?.longitude]);

  const { data: proximityProviders, isLoading: loadingProximityProviders } = useQuery({
    
    queryKey: ['nearProviders', session?.user?.id, stableLoc?.lat, stableLoc?.long],

    queryFn: () => {
      if (!stableLoc) return []; // Sécurité typescript
      return fetchProximityProviders({
        userId: session?.user?.id, 
        lat: location?.latitude, 
        long: location?.longitude,
      });
    },
    enabled: !!location && !!stableLoc,
    staleTime: 1000 * 60 * 1,
    refetchOnWindowFocus: false, 
  });

  // --- CONSTANTES DE DIMENSIONS ---
  const AVATAR_SIZE = 64; // Taille des petites bulles
  const CENTRAL_AVATAR_SIZE = 96; // Taille avatar central

  // Rayon min: moitié de l'avatar central + moitié de l'avatar provider + marge
  const MIN_RADIUS = CENTRAL_AVATAR_SIZE / 2 + AVATAR_SIZE / 2 + 15;
  // Rayon max: ajusté pour rester dans l'écran
  const MAX_RADIUS = 160;

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setContainerSize({ w: width, h: height });
  }, []);

  const providers = Array.isArray(proximityProviders) ? proximityProviders : [];


   const { data: recentProviders, isLoading: recentProviderIsLoading } = useQuery({
     queryKey: ['recentsProviders', session?.user?.id],
     queryFn: () => fetchYourRecentProviders({ userId: session?.user.id }),
     enabled: !!session,
   });
  return (
    <View className="flex-1 flex-col items-center justify-center">
      <View
        className="relative m-2 h-[60vh] w-full flex-col items-center justify-center"
        onLayout={onLayout}>
        {/* Central Avatar (Ripple effect inside) */}
        {loadingProximityProviders && <Ripple />}

        <View className="absolute left-1/2 top-[47%] z-20 -translate-x-1/2 -translate-y-1/2 items-center">
          <Avatar
            alt="user-avatar"
            style={{ width: CENTRAL_AVATAR_SIZE, height: CENTRAL_AVATAR_SIZE }}>
            <AvatarImage source={{ uri: session?.user?.image }} />
            <AvatarFallback />
          </Avatar>
          <Text className="mt-2 text-sm font-medium">{session?.user?.name ?? 'Vous'}</Text>
        </View>

        {/* Providers Mapping */}
        <AnimatePresence>
          {providers.map((item: ProviderData, idx: number) => {
            // --- LOGIQUE MATHÉMATIQUE CORRIGÉE (Spirale) ---

            // 1. Calcul du rayon basé sur l'index (plus l'index est grand, plus c'est loin)
            // On utilise une racine carrée ou linéaire pour répartir la distance
            const total = providers.length > 1 ? providers.length - 1 : 1;
            const radiusRatio = idx / total;
            const currentRadius = MIN_RADIUS + radiusRatio * (MAX_RADIUS - MIN_RADIUS);

            // 2. Calcul de l'angle (Angle d'or ~137.5 degrés pour éviter les alignements)
            // Cela crée une distribution naturelle "fleur de tournesol"
            const goldenAngle = 137.5 * (Math.PI / 180);
            const angleRad = idx * goldenAngle;

            // 3. Position X/Y
            const x = Math.cos(angleRad) * currentRadius;
            const y = Math.sin(angleRad) * currentRadius;

            return (
              <MotiView
                key={item.id}
                from={{ opacity: 0, scale: 0, translateX: 0, translateY: 0 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  // On centre l'élément par rapport au point (0,0) du conteneur relatif
                  translateX: x - AVATAR_SIZE / 2,
                  translateY: y - AVATAR_SIZE / 2,
                }}
                transition={{
                  type: 'spring',
                  damping: 15,
                  stiffness: 100,
                  delay: idx * 100, // Délai progressif selon l'index
                }}
                style={{
                  position: 'absolute',
                  left: '50%', // Point d'ancrage au centre
                  top: '47%', // Doit correspondre au top du user central
                  width: AVATAR_SIZE,
                  height: AVATAR_SIZE,
                  zIndex: 30 - idx, // Les éléments proches (petit idx) passent devant si besoin
                }}>
                <TouchableOpacity onPress={() => setProviderCard(item)} activeOpacity={0.8}>
                  <View className="flex-col items-center justify-center gap-0.5">
                    <Avatar
                      alt={`avatar-${idx}`}
                      style={{
                        width: AVATAR_SIZE,
                        height: AVATAR_SIZE,
                        borderWidth: 2,
                        borderColor: 'white',
                      }}>
                      <AvatarImage source={{ uri: item.user?.image }} />
                      <AvatarFallback />
                    </Avatar>
                    {/* Petit label profession optionnel pour éviter trop de bruit visuel */}
                    <View className="absolute -bottom-5 rounded-full bg-white/80 px-2 py-0.5">
                      <Text
                        className="max-w-[80px] text-center text-[10px] font-bold text-black"
                        numberOfLines={1}>
                        {item.profession}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              </MotiView>
            );
          })}
        </AnimatePresence>

        <AnimatePresence>
          {providerCard !== null && (
            <View className="absolute z-50 h-[110vh] w-full bg-black/10 px-2">
              <View className="flex-1 items-center justify-center">
                <ProviderCard provider={providerCard} setProviderCard={setProviderCard} />
              </View>
            </View>
          )}
        </AnimatePresence>

        <View className="absolute bottom-2 items-center">
          <Text className="text-2xl font-bold tracking-tighter">Près de chez vous</Text>
          {loadingProximityProviders ? (
            <Text className="mt-2 text-sm text-muted-foreground">Recherche…</Text>
          ) : locationError ? (
            <Text className="mt-2 text-sm text-red-500">{locationError}</Text>
          ) : (
            <Text className="mt-2 text-sm">{providers.length} prestataires à proximité</Text>
          )}
        </View>
      </View>

      {session?.user && (
        <Recent
          data={recentProviders}
          isLoading={recentProviderIsLoading}
          setProviderCard={setProviderCard}
          provider={providerCard}
        />
      )}
    </View>
  );
}

export default ClientCheckRadar;
