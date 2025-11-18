import { ScrollView, View, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@/components/ui/text';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signInForm } from '@/lib/zodSchema';
import { z } from 'zod';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useRouter } from 'expo-router';
import { authClient } from '@/lib/auth-client';
import { useState } from 'react';
import { ActivityIndicator } from 'react-native';
import clsx from 'clsx';
type FormSchema = z.infer<typeof signInForm>;
type Props = {};
function index({}: Props) {
  const { data: session } = authClient.useSession();
  const router = useRouter();

  const [isSuccess, setIsSuccess] = useState<{
    type: string;
    message: string | undefined;
    status: number | null;
    error: boolean;
  }>({ type: '', message: '', status: null, error: false });
  const [isLoading, setIsLoading] = useState(false);
  const clearSuccessState = () => {
    setIsSuccess({ type: '', message: '', status: null, error: false });
  };
  const { handleSubmit, control } = useForm({
    resolver: zodResolver(signInForm),
  });

  const onSubmit = async (data: FormSchema) => {
    setIsLoading(true)
    const { data: opt, error } = await authClient.signIn.phoneNumber({
      phoneNumber: data.phone, // required
      password: data.password, // required
      rememberMe: true,
    });

    if (error?.status === 401) {
      setIsSuccess({
        type: 'signIn',
        message: 'Numéro ou mot de passe incorrect',
        status: error.status,
        error: true,
      });
    }

    if (error && error?.status !== 401) {
      setIsSuccess({
        type: 'signIn',
        message: "Une erreur s'est produite",
        status: error.status,
        error: true,
      });
    }

    setIsSuccess({
      type: 'signIn',
      message: 'Vous êtes connectés',
      status: 200,
      error: false,
    });

    setTimeout(() => {
      router.push('/(tabs)/(home)');
      clearSuccessState();
    }, 1500);
  };
  return (
    <SafeAreaView className="flex-1">
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        <KeyboardAvoidingView
          keyboardVerticalOffset={Platform.OS == 'ios' ? 60 : 40}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="h-screen flex-1 flex-col bg-blue-900 ">
          <View className="flex-1"></View>

          <View className="max-h-[60%] flex-auto flex-col gap-6 rounded-t-3xl bg-white p-2 py-6">
            <View className="flex-col gap-0.5">
              <Text className="text-left text-3xl font-bold tracking-widest">SKILLMAP</Text>

              <Text className="text-muted">La plateforme idéal pour trouver un prestataire</Text>
            </View>

            <View className="gap-4.5 flex-col">
              <Controller
                name="phone"
                control={control}
                render={({ field: { onChange, value }, fieldState: { error } }) => (
                  <View className="flex-col gap-0.5">
                    <Label>Numéro de téléphone</Label>
                    <Input
                      className="rounded-lg"
                      onChangeText={onChange}
                      value={value}
                      placeholder="+228"
                    />
                    {error?.message && <Text className="text-destructive">{error.message}</Text>}
                  </View>
                )}
              />
            </View>

            <View className="flex-col gap-1.5">
              <Controller
                name="password"
                control={control}
                render={({ field: { onChange, value }, fieldState: { error } }) => (
                  <View className="flex-col gap-0.5">
                    <Label>Mot de passe</Label>
                    <Input
                      className="rounded-lg"
                      onChangeText={onChange}
                      value={value}
                      placeholder="********"
                      secureTextEntry
                    />

                    {error?.message && <Text className="text-destructive">{error.message}</Text>}
                  </View>
                )}
              />
            </View>

            <View>
              <Button disabled={isLoading} onPress={handleSubmit(onSubmit)}>
                {isLoading ? (
                  <ActivityIndicator size={24} color={'white'} />
                ) : (
                  <Text>Se connecter</Text>
                )}
              </Button>
            </View>
            {isSuccess.status && (
              <Text
                className={clsx('font-bold', {
                  'text-green-5000': !isSuccess.error,
                  'text-destructive': isSuccess.error,
                })}>
                {isSuccess.message}
              </Text>
            )}

            <View className="my-2 flex-row items-center justify-center text-xs">
              <Text>Vous n'avez pas de compte?</Text>
              <Button variant={'link'} onPress={() => router.push('/(auth)/(register)')}>
                <Text>S'incrire</Text>
              </Button>
            </View>
            <View>
              <View className="flex-row items-center justify-center">
                <View></View>
                <Text className="text-muted">OU</Text>
                <View></View>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </ScrollView>
    </SafeAreaView>
  );
}
export default index;
