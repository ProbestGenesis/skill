import { ScrollView, View } from 'react-native';
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

type FormSchema = z.infer<typeof signInForm>;
type Props = {};
function index({ }: Props) {
  const router = useRouter()
  const { handleSubmit, control } = useForm({
    resolver: zodResolver(signInForm),
  });
  return (
    <SafeAreaView className="flex-1">
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        <View className="h-screen bg-blue-900">
          <View className="flex-1"></View>

          <View className="flex-auto max-h-[60%] flex-col gap-6 rounded-t-3xl bg-white p-2 py-6">
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
                    <Input className="rounded-lg" placeholder="+228" />
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
                    <Input className="rounded-lg" placeholder="********" />

                    {error?.message && <Text className="text-destructive">{error.message}</Text>}
                  </View>
                )}
              />
            </View>

            <View>
              <Button>
                <Text>Se connecter</Text>
              </Button>
            </View>
              
            <View className='flex-row items-center justify-center my-2 text-xs'>
                  <Text>Vous n'avez pas de compte?</Text>
                   <Button variant={"link"} onPress={() => router.push('/(auth)/(register)')}>
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
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
export default index;
