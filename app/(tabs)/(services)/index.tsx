import React, { useState } from 'react';
import { View, Text, FlatList, KeyboardAvoidingView, Platform, Linking, ActivityIndicator } from 'react-native';
import { clsx } from 'clsx';
import { CalendarClock, Check, Locate, UserIcon, QrCode, AlertCircle } from 'lucide-react-native';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import { authClient } from '@/lib/auth-client';
import { Redirect } from 'expo-router';
import { Service, Provider, Skills, User } from '@/prisma/generated/prisma';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';
import { secretCode } from '@/lib/zodSchema';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { services } from '@/lib/fetching/services';

// --- TYPES ---
type DataType = Service & { provider: Provider & { user: User } } & {
  skills: Skills;
};

// Type pour savoir quel dialogue ouvrir
type DialogType = 'CARE' | 'CANCEL' | 'FINISH' | 'RATE' | null;

// --- COMPOSANTS UI REUTILISABLES ---
const StatusIcon = ({ status }: { status: 'success' | 'error' | 'idle' }) => {
  if (status === 'success') return <Check stroke={'green'} strokeWidth={2.5} size={48} />;
  if (status === 'error') return <AlertCircle stroke={'red'} strokeWidth={2.5} size={48} />;
  return null;
};

export default function ServiceListScreen() {
  const queryClient = useQueryClient();
  const { data: session, isPending: sessionPending } = authClient.useSession();

  // --- ÉTAT GLOBAL DU DIALOGUE ---
  // On stocke l'item séléctionné et le type d'action
  const [selectedItem, setSelectedItem] = useState<DataType | null>(null);
  const [activeDialog, setActiveDialog] = useState<DialogType>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // --- REACT QUERY & MUTATIONS ---
  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['services'],
    queryFn: () => services(session?.user?.id),
    enabled: !!session,
  });

  // Helper pour ouvrir un dialog
  const openDialog = (item: DataType, type: DialogType) => {
    setSelectedItem(item);
    setActiveDialog(type);
    setDialogOpen(true);
  };

  // Reset lors de la fermeture
  const handleCloseDialog = () => {
    setDialogOpen(false);
    // On attend un peu avant de reset l'item pour éviter un glitch visuel pendant l'animation de fermeture
    setTimeout(() => {
      setActiveDialog(null);
      setSelectedItem(null);
      resetForm(); // Reset du formulaire finish
    }, 300);
  };

  // 1. Mutation: Prise en charge
  const careMutation = useMutation({
    mutationFn: async (serviceId: string) => {
      const res = await fetch(
        `${process.env.EXPO_PUBLIC_SERVER_URL}/api/user/provider/service/${serviceId}/careService`,
        { method: 'PUT' }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['services'] }),
  });

  // 2. Mutation: Annulation
  const cancelMutation = useMutation({
    mutationFn: async (serviceId: string) => {
      const res = await fetch(
        `${process.env.EXPO_PUBLIC_SERVER_URL}/api/user/provider/service/${serviceId}/CancelService`,
        { method: 'PUT' }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['services'] }),
  });

  // 3. Mutation: Terminer (Code)
  const {
    control,
    handleSubmit,
    reset: resetForm,
  } = useForm({
    resolver: zodResolver(secretCode),
  });

  const finishMutation = useMutation({
    mutationFn: async ({ code, serviceId }: { code: string; serviceId: string }) => {
      const res = await fetch(
        `${process.env.EXPO_PUBLIC_SERVER_URL}/api/user/provider/service/${serviceId}/finishService`,
        {
          method: 'POST',
          body: JSON.stringify({ code, id: session?.user?.id }),
        }
      );
      const data = await res.json();
      if (!res.ok || res.status !== 200) throw new Error(data.message || 'Code invalide');
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['services'] }),
  });

  if (!sessionPending && !session) return <Redirect href="/signIn" />;

  // --- RENDER ITEM (UI PURE) ---
  const renderItem = ({ item }: { item: DataType }) => {
    const role = item.providerId === session?.user?.id ? 'Provider' : 'Customer';

    return (
      <Card className="mx-2 my-2">
        <CardHeader className='p'>
          <View className="absolute left-1 top-1 mb-1">
            <Text className="font-bold">
              {role === 'Customer' ? '🧑‍💼 Client' : '👷 Prestataire'}
            </Text>
          </View>
          <CardTitle className="mt-8">
            <Text>{item.skills?.title || item.title}</Text>
          </CardTitle>
          <CardDescription>
            <Text>{item.description}</Text>
          </CardDescription>
        </CardHeader>

        <CardContent className="flex-col gap-2 py-0">
          {/* Info Location */}
          <View className="flex-row flex-wrap items-center gap-2">
            <View className="flex-row items-center">
              <Locate size={16} className="mr-1" />
              <Text>{item.district ? item.district : `Quartier non ajouté`}</Text>
            </View>
            {role === 'Provider' && item.status === 'in_progress' && item.location && (
              <Button
                variant="link"
                size="sm"
                className="h-auto p-0"
                onPress={() =>
                  Linking.openURL(
                    `http://maps.google.com/?q=${item.location?.latitude},${item.location?.longitude}`
                  )
                }>
                <Text className="text-primary underline">Voir la carte</Text>
              </Button>
            )}
          </View>

          {/* Info Date & User */}
          <View className="flex-row items-center gap-2">
            <CalendarClock size={16} />
            <Text className="text-xs text-muted-foreground">
              {new Date(item.createdAt).toLocaleDateString()} à{' '}
              {new Date(item.createdAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </View>

          <View className="flex-row items-center gap-2">
            <UserIcon size={16} />
            <Text className="text-sm">
              {role === 'Provider'
                ? `Client: ${item.provider.user.name}`
                : `Prestataire: ${item.provider.user.name}`}
            </Text>
          </View>

          {role === 'Customer' && item.code && (
            <View className="mt-1 flex-row items-center rounded-md bg-muted/30 p-2">
              <Text className="mr-2 text-sm">Code secret:</Text>
              <Text className="text-lg font-bold tracking-widest">{item.code}</Text>
            </View>
          )}

          <Text
            className={clsx('mt-1 font-medium', {
              'text-destructive': item.status === 'pending',
              'text-yellow-600': item.status === 'in_progress',
              'text-green-600': item.status === 'finished',
            })}>
            Statut: {item.status === 'in_progress' ? 'En cours' : item.status}
          </Text>
        </CardContent>

        <CardFooter className="flex-row justify-end gap-2">
          {/* Logique des Boutons déclencheurs */}
          {role === 'Provider' && item.status === 'pending' && (
            <Button className="rounded-full" onPress={() => openDialog(item, 'CARE')}>
              <Text className="text-white">Prendre en charge</Text>
            </Button>
          )}

          {role === 'Provider' && item.status === 'in_progress' && (
            <Button className="rounded-full" onPress={() => openDialog(item, 'FINISH')}>
              <Text className="text-white">Terminer la mission</Text>
            </Button>
          )}

          {/* Bouton Annuler (Pour les deux si pending) */}
          {item.status === 'pending' && (
            <Button
              variant="destructive"
              className="rounded-full"
              onPress={() => openDialog(item, 'CANCEL')}>
              <Text className="text-white">Annuler</Text>
            </Button>
          )}

          {item.status === 'finished' && (
            <Button
              className="rounded-full"
              variant="outline"
              onPress={() => openDialog(item, 'RATE')}>
              <Text>Noter</Text>
            </Button>
          )}
        </CardFooter>
      </Card>
    );
  };

  // --- RENDER DIALOG CONTENT (Logique conditionnelle propre) ---
  const renderDialogContent = () => {
    if (!selectedItem) return null;

    // 1. DIALOGUE FINISH (AVEC INPUT)
    if (activeDialog === 'FINISH') {
      const isSuccess = finishMutation.isSuccess;
      const isError = finishMutation.isError;

      if (isSuccess) {
        return (
          <>
            <DialogHeader className="items-center">
              <StatusIcon status="success" />
              <DialogTitle className="mt-2 text-center text-primary">Service terminé !</DialogTitle>
              <DialogDescription className="text-center">
                {finishMutation.data?.message}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button className="w-full rounded-full" onPress={handleCloseDialog}>
                <Text className="text-white">Fermer</Text>
              </Button>
            </DialogFooter>
          </>
        );
      }

      return (
        <>
          <DialogHeader>
            <DialogTitle>Terminer la mission</DialogTitle>
            <DialogDescription>Demandez le code secret au client pour valider.</DialogDescription>
          </DialogHeader>

          <View className="flex-row items-center justify-center gap-2 py-4">
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
              <Controller
                control={control}
                name="code"
                render={({ field: { onChange, value }, fieldState: { error } }) => (
                  <View>
                    <Input
                      placeholder="123456"
                      className="w-[150px] text-center text-lg tracking-widest"
                      keyboardType="number-pad"
                      onChangeText={onChange}
                      value={value}
                    />
                    {error && (
                      <Text className="mt-1 text-center text-xs text-destructive">
                        {error.message}
                      </Text>
                    )}
                    {isError && (
                      <Text className="mt-1 text-center text-xs text-destructive">
                        {finishMutation.error?.message}
                      </Text>
                    )}
                  </View>
                )}
              />
            </KeyboardAvoidingView>
            <Button variant="outline" size="icon">
              <QrCode size={20} />
            </Button>
          </View>

          <DialogFooter className="flex-row justify-end gap-2">
            <Button variant="ghost" onPress={handleCloseDialog}>
              <Text>Annuler</Text>
            </Button>
            <Button
              className="rounded-full"
              disabled={finishMutation.isPending}
              onPress={handleSubmit((data) =>
                finishMutation.mutate({ code: data.code, serviceId: selectedItem.id })
              )}>
              <Text className="text-white">
                {finishMutation.isPending ? (
                  <ActivityIndicator size={24} color={'white'} />
                ) : (
                  'Confirmer'
                )}
              </Text>
            </Button>
          </DialogFooter>
        </>
      );
    }

    // 2. DIALOGUE CARE (PRISE EN CHARGE)
    if (activeDialog === 'CARE') {
      const isSuccess = careMutation.isSuccess;
      if (isSuccess) {
        return (
          <>
            <DialogHeader className="items-center">
              <StatusIcon status="success" />
              <DialogTitle className="text-center text-primary">
                Prise en charge confirmée
              </DialogTitle>
              <DialogDescription className="text-center">
                Vous pouvez maintenant voir la localisation du client.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex-col gap-2">
              <Button
                className="w-full rounded-full"
                onPress={() => {
                  handleCloseDialog();
                  if (selectedItem.location) {
                    Linking.openURL(
                      `http://maps.google.com/?q=${selectedItem.location.latitude},${selectedItem.location.longitude}`
                    );
                  }
                }}>
                <Text className="text-white">Voir la localisation</Text>
              </Button>
              <Button variant="ghost" onPress={handleCloseDialog}>
                <Text>Fermer</Text>
              </Button>
            </DialogFooter>
          </>
        );
      }
      return (
        <>
          <DialogHeader>
            <DialogTitle>Confirmer la prise en charge ?</DialogTitle>
            <DialogDescription>
              Assurez-vous d'être disponible. Une annulation ultérieure affectera votre note.
            </DialogDescription>
          </DialogHeader>
          {careMutation.isError && (
            <Text className="text-center text-destructive">{careMutation.error?.message}</Text>
          )}
          <DialogFooter className="flex-row justify-end gap-2">
            <Button variant="ghost" onPress={handleCloseDialog}>
              <Text>Annuler</Text>
            </Button>
            <Button
              className="rounded-full"
              disabled={careMutation.isPending}
              onPress={() => careMutation.mutate(selectedItem.id)}>
              <Text className="text-white">
                {careMutation.isPending ? (
                  <ActivityIndicator size={24} color={'white'} />
                ) : (
                  'Accepter'
                )}
              </Text>
            </Button>
          </DialogFooter>
        </>
      );
    }

    // 3. DIALOGUE CANCEL (ANNULATION)
    if (activeDialog === 'CANCEL') {
      const isSuccess = cancelMutation.isSuccess;
      if (isSuccess) {
        return (
          <>
            <DialogHeader className="items-center">
              <StatusIcon status="success" />
              <DialogTitle>Service annulé</DialogTitle>
            </DialogHeader>
            <DialogFooter>
              <Button className="w-full" onPress={handleCloseDialog}>
                <Text>Fermer</Text>
              </Button>
            </DialogFooter>
          </>
        );
      }
      return (
        <>
          <DialogHeader className="items-center">
            <AlertCircle className="mb-2 text-destructive" stroke="red" size={48} />
            <DialogTitle className="text-destructive">Annuler le service ?</DialogTitle>
            <DialogDescription className="text-center">
              Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          {cancelMutation.isError && (
            <Text className="text-center text-destructive">{cancelMutation.error?.message}</Text>
          )}
          <DialogFooter className="flex-row justify-end gap-2">
            <Button variant="ghost" onPress={handleCloseDialog}>
              <Text>Retour</Text>
            </Button>
            <Button
              variant="destructive"
              className="rounded-full"
              disabled={cancelMutation.isPending}
              onPress={() => cancelMutation.mutate(selectedItem.id)}>
              <Text className="text-white">
                {cancelMutation.isPending ? <ActivityIndicator size={24} color={"white"} /> : "Confirmer l'annulation"}
              </Text>
            </Button>
          </DialogFooter>
        </>
      );
    }

    // 4. RATE (Exemple simple)
    if (activeDialog === 'RATE') {
      return (
        <>
          <DialogHeader>
            <DialogTitle>Notez le service</DialogTitle>
            <DialogDescription>Fonctionnalité à venir...</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onPress={handleCloseDialog}>
              <Text className="text-white">Fermer</Text>
            </Button>
          </DialogFooter>
        </>
      );
    }

    return null;
  };

  return (
    <View className="flex-1 bg-background">
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-xl font-bold text-muted-foreground">Chargement ...</Text>
        </View>
      ) : (
        <>
          {data && data?.length > 0 ? (
            <View className="flex-1 p-2">
              <FlatList
                data={data}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={{ paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
                refreshing={isRefetching}
                onRefresh={refetch}
              />
            </View>
          ) : (
            <View className="flex-1 items-center justify-center gap-6">
              <Text className="font-lg text-xl text-muted-foreground">
                Vous n'avez aucun service en cours
              </Text>
              <Button variant="outline" onPress={() => refetch()}>
                <Text>Actualiser</Text>
              </Button>
            </View>
          )}

          {/* --- LE DIALOGUE GLOBAL --- */}
          {/* Il est rendu HORS de la liste, une seule fois */}
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent className="w-[90%] rounded-2xl">{renderDialogContent()}</DialogContent>
          </Dialog>
        </>
      )}
    </View>
  );
}
