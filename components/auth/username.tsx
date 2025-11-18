import { View } from 'react-native';
import { Text } from '../ui/text';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { personalDataForm } from '@/lib/zodSchema';
import { authClient } from '@/lib/auth-client';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { ActivityIndicator } from 'react-native';
import clsx from 'clsx';
 
type Props = {};
function RegisterNameandEmail({}: Props) {
  const { data: session } = authClient.useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState<{
    message: string | undefined;
    status: number | null;
    error: boolean | false;
  }>({ message: '', status: null, error: false });
  const { control, handleSubmit } = useForm({
    resolver: zodResolver(personalDataForm),
  });

  const onSubmit = async (data: z.infer<typeof personalDataForm>) => {
    setIsLoading(true);
    try {
      await authClient.updateUser({
        name: data.name,
      });

      if (data.email) {
        await authClient.changeEmail({
          newEmail: data.email,
        });
      }

      setIsSuccess({
        message: 'Vos informations ont été enregistré',
        status: 201,
        error: false,
      });

      setTimeout(() => {
        router.push('/');
      }, 1000);
    } catch (error) {
      setIsSuccess({
        message: "Une erreur s'est produite, réessayez plustard",
        status: 500,
        error: true,
      });
      setIsLoading(false);
    }
  };

  return (
    <View className="gap-6">
      <View className="flex-col gap-2">
        <Text className="text-left text-2xl font-bold">Completer votre profil</Text>
        <Text className="text-muted">Ravie de vous revoir sur BTPpro</Text>
      </View>
      <View className="gap-1.5">
        <Label className="font-bold">Votre nom</Label>
        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
            <View>
              <Input
                id="name"
                placeholder="Victor Kolma"
                returnKeyType="next"
                submitBehavior="submit"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
              />
              {error && <Text className="text-destructive">{error.message}</Text>}
            </View>
          )}
        />
      </View>
      <View className="gap-1.5">
        <Label className="font-bold">Votre email(optionel)</Label>
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
            <View>
              <Input
                id="email"
                placeholder="m@example.com"
                keyboardType="email-address"
                autoComplete="email"
                autoCapitalize="none"
                returnKeyType="next"
                submitBehavior="submit"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
              />
              {error && <Text className="text-destructive">{error.message}</Text>}
            </View>
          )}
        />
      </View>

      <Button className="w-full" disabled={isLoading} onPress={handleSubmit(onSubmit)}>
        {isLoading ? <ActivityIndicator size={24} color={'white'} /> : <Text>Valider</Text>}
      </Button>

      {isSuccess.status && (
        <Text
          className={clsx('font-bold', {
            'text-green-5000': !isSuccess.error,
            'text-destructive': isSuccess.error,
          })}>
          {isSuccess.message}
        </Text>
      )}
    </View>
  );
}
export default RegisterNameandEmail;
