import { View, Text, Platform, Pressable, KeyboardAvoidingView, ScrollView, ActivityIndicator } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createSkill } from '@/lib/zodSchema';
import { z } from 'zod';
import { AnimatePresence, MotiView } from 'moti';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/ui/button';
import { useState, useMemo } from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { authClient } from '@/lib/auth-client';
import { Redirect, useRouter, useLocalSearchParams } from 'expo-router';
import clsx from 'clsx';
import { useQueryClient, useMutation } from '@tanstack/react-query';

type FormData = z.infer<typeof createSkill>;


const LandingView = ({ onNext }: { onNext: () => void }) => (
  <MotiView
    key="landing"
    from={{ opacity: 0, scale: 0.9, translateY: 30 }}
    animate={{ opacity: 1, scale: 1, translateY: 0 }}
    exit={{ opacity: 0, scale: 0.9, translateY: -20 }}
    transition={{
      type: 'timing',
      duration: 300, // Un peu plus lent pour la fluidité
    }}
    className="flex-1 justify-between bg-white px-6 py-10" // bg-white important pour la perf
  >
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
        Complétons votre profil pour commencer
      </Text>

      <Pressable
        onPress={onNext}
        className="flex-row items-center justify-center gap-2 rounded-full bg-primary py-3 active:opacity-80">
        <Ionicons name="checkmark-circle" size={22} color="#fff" />
        <Text className="text-base font-medium text-white">Je complète mon profil !</Text>
      </Pressable>
    </View>
  </MotiView>
);

// COMPOSANT: FORMULAIRE 
const FormView = ({
  control,
  errors,
  onSubmit,
  isPending,
  success,
  handleSubmit,
}: {
  control: any;
  errors: any;
  onSubmit: (data: FormData) => void;
  isPending: boolean;
  success: { message: string | undefined; status: number | null };
  handleSubmit: any;
}) => {
  return (
    <MotiView
      key="form"
      from={{ opacity: 0, scale: 0.95 }} // Scale moins agressif
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{
        type: 'timing',
        duration: 250,
      }}
      className="flex-1 bg-white" // bg-white important
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1">
        <ScrollView contentContainerClassName="px-4 pt-10 pb-10 gap-3.5">
          {/* Title */}
          <Controller
            control={control}
            name="title"
            render={({ field: { onChange, value, onBlur } }) => (
              <View>
                <Label>
                  <Text className="font-bold">Nom du service</Text>
                </Label>
                <Input
                  className="rounded-md border border-gray-300 px-3 py-2 text-base"
                  placeholder="Ex: Installation d'antenne parabolique"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                />
                {errors.title && (
                  <Text className="mt-1 text-xs text-red-500">{errors.title.message}</Text>
                )}
              </View>
            )}
          />

          {/* Description */}
          <Controller
            control={control}
            name="description"
            render={({ field: { onChange, value, onBlur } }) => (
              <View>
                <Label>
                  <Text className="font-bold">Description</Text>{' '}
                </Label>
                <Textarea
                  placeholder="Décris ton service en détail..."
                  multiline
                  className="h-32" // Hauteur fixe pour éviter les sauts de layout
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                />
                {errors.description && (
                  <Text className="mt-1 text-xs text-red-500">{errors.description.message}</Text>
                )}
              </View>
            )}
          />

          {/* Average Price */}
          <Controller
            control={control}
            name="averagePrice"
            render={({ field: { onChange, value, onBlur } }) => (
              <View className="mb-2">
                <Text className="font-bold">Prix moyen</Text>
                <Input
                  className="rounded-md border border-gray-300 px-3 py-2 text-base"
                  placeholder="Ex: 150"
                  keyboardType="numeric"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                />
                <Text className="mt-1 text-xs text-gray-500 ">
                  *le prix de base est le cout pour un travail standard
                </Text>
                {errors.averagePrice && (
                  <Text className="mt-1 text-xs text-red-500">{errors.averagePrice.message}</Text>
                )}
              </View>
            )}
          />

          {/* Submit Button */}
          <Button onPress={handleSubmit(onSubmit)} disabled={isPending} className="mt-4">
            <Text className="font-bold text-white">
              {isPending ? <ActivityIndicator size={24} color={"white"}  /> : 'Ajouter le service'}
            </Text>
          </Button>

          {success.message && (
            <Text
              className={clsx('mt-4 text-center font-bold', {
                'text-green-600': success.status === 201,
                'text-destructive': success.status !== 201,
              })}>
              {success.message}
            </Text>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </MotiView>
  );
};

export default function AddSkills() {
  const queryClient = useQueryClient();
  const { data: session } = authClient.useSession();
  const router = useRouter();
  const { providerId } = useLocalSearchParams();

  const [isPending, setIsPending] = useState(false);
  const [success, setSuccess] = useState<{ message: string | undefined; status: number | null }>({
    message: '',
    status: 201,
  });

  const [showForm, setShowForm] = useState(false); 

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(createSkill),
  });

  const handleNext = () => {
    setShowForm(true);
  };

  const onSubmit = async (data: FormData) => {
    setIsPending(true);
    try {
      const res = await fetch(
        `${process.env.EXPO_PUBLIC_SERVER_URL}/api/user/${session?.user.id}/provider/${providerId}/skills`,
        {
          method: 'POST',
          body: JSON.stringify({
            title: data.title,
            description: data.description,
            averagePrice: parseFloat(data.averagePrice),
          }),
        }
      );
      const result = await res.json();

      if (result.status !== 201) {
        setSuccess({ message: result.message, status: result.status });
      } else {
        setSuccess({ message: result.message, status: result.status });
        setTimeout(() => {
          router.back();
        }, 1000);
      }
    } catch (error) {
      setSuccess({ message: 'Une erreur est survenue', status: 500 });
    } finally {
      setIsPending(false);
    }
  };

  const addSkillsMutation = useMutation({
    mutationFn: onSubmit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProviderInfo'] });
    },
  });

  if (!session) {
    return router.push('/(auth)');
  }


  return (
    <View className="flex-1 bg-white">
      {/* exitBeforeEnter est CRUCIAL ici.
            Il attend que le Landing disparaisse AVANT de monter le Formulaire.
            Cela évite de calculer le layout du formulaire pendant l'animation.
        */}
      <AnimatePresence exitBeforeEnter>
        {showForm ? (
          <FormView
            key="form-view" // Key unique nécessaire
            control={control}
            errors={errors}
            onSubmit={(data) => addSkillsMutation.mutate(data)}
            isPending={isPending}
            success={success}
            handleSubmit={handleSubmit}
          />
        ) : (
          <LandingView
            key="landing-view" // Key unique nécessaire
            onNext={handleNext}
          />
        )}
      </AnimatePresence>
    </View>
  );
}
