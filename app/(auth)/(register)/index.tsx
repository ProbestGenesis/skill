import { authClient } from '@/lib/auth-client';
import { ActivityIndicator, ScrollView, View, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signInForm } from '@/lib/zodSchema';
import { z } from 'zod';
import { Text } from '@/components/ui/text';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { registerForm } from '@/lib/zodSchema';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import clsx from 'clsx';
import RegisterNameandEmail from '@/components/auth/username';

type FormSchema = z.infer<typeof registerForm>;
type Props = {};
function registerPage({}: Props) {
  const { data: session, isPending } = authClient.useSession();
  const username = session?.user.name;
  const isVerfied = session?.user.phoneNumberVerified;
  const router = useRouter();

  const [step, setStep] = useState(1);

  useEffect(() => {
    if (session && !isVerfied) {
      setStep(2);
    } else if (session && username && /^\d+$/.test(username)) {
      setStep(3);
    }
  }, []);
  const [isSuccess, setIsSuccess] = useState<{
    type: string;
    message: string | undefined;
    status: number | null;
    error: boolean;
  }>({ type: '', message: '', status: null, error: false });
  const [isLoading, setIsLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpInput, setOtpInput] = useState<string[]>([]);
  const [otp, setOtp] = useState('');
  const { handleSubmit, control } = useForm({
    resolver: zodResolver(registerForm),
  });
  const clearSuccessState = () => {
    setIsSuccess({ type: '', message: '', status: null, error: false });
  };

  const clearOptData = () => {
    setOtpInput([]);
    setOtp('');
  };
  const register = async (data: FormSchema) => {
    clearSuccessState();
    setIsLoading(true);
    await authClient.signUp.email(
      {
        email: `${data.phone}@gmail.com`,
        name: data.phone,
        password: data.password,
        phoneNumber: data.phone,
      },
      {
        onRequest: (ctx) => {
          setIsLoading(true);
        },
        onSuccess: async () => {
          setPhoneNumber(data.phone);
          const { data: otp, error } = await authClient.phoneNumber.sendOtp({
            phoneNumber: data.phone, // required
          });
          console.log(otp?.message);
          if (error) {
            setIsSuccess({
              type: 'register',
              message: error?.message,
              status: error?.status,
              error: true,
            });
            setIsLoading(false);
          } else {
            setIsSuccess({
              type: 'register',
              message: 'Vous êtes inscrit',
              status: 201,
              error: false,
            });

            setTimeout(() => {
              clearSuccessState();
              setStep(2);
            }, 100);
          }
        },
        onError: (ctx) => {
          console.log('auth', ctx.error);
          if (ctx.error.status === 504 || ctx.error.statusText === '504') {
            setIsSuccess({
              type: 'register',
              message: 'Veuillez reéssayer plustard',
              status: ctx.error.status,
              error: true,
            });
          }
          setIsSuccess({
            type: 'register',
            message: ctx.error.message,
            status: ctx.error.status,
            error: true,
          });
          setIsLoading(false);
        },
      }
    );
  };

  const sendOpt = async () => {
    const { data, error } = await authClient.phoneNumber.sendOtp({
      phoneNumber: session?.user.phoneNumber as string,
    });

    if (error?.status === 403) {
      setIsSuccess({
        message: 'trop de tentative,Réeasayer plustard',
        status: 403,
        error: true,
        type: 'optConfirm',
      });
    }

    if (error?.status === 401) {
      setIsSuccess({
        message: 'Votre code a expiré',
        status: 403,
        error: true,
        type: 'optConfirm',
      });
    }
  };
  const [resendDisabled, setResendDisabled] = useState(false);
  useEffect(() => {
    // start disabled, enable after 9 seconds
    setResendDisabled(true);
    const timer = setTimeout(() => {
      setResendDisabled(false);
    }, 9000);

    return () => clearTimeout(timer);
  }, []);

  const handleOtp = ({ text, idx }: { text: string; idx: number }) => {
    setOtpInput((prv) => {
      const newOtp = [...prv];
      newOtp[idx] = text;
      return newOtp;
    });
  };

  const handleSubmitOtp = async () => {
    const otp = otpInput.join('');
    setOtp(otp);

    setIsLoading(true);
    const { data, error } = await authClient.phoneNumber.verify({
      phoneNumber: phoneNumber,
      code: otp,
      disableSession: false,
    });

    if (data?.status) {
      setIsSuccess({
        message: 'Votre numéro a été vérifié avec success',
        status: 200,
        error: false,
        type: 'optConfirm',
      });
      setTimeout(() => {
        clearSuccessState();
        setStep(3);
      }, 1000);
    }

    if (error?.status === 400) {
      setIsSuccess({
        message: 'Code éroné, vueillez saisir un nouveau code',
        status: 400,
        error: true,
        type: 'optConfirm',
      });
    }

    if (error?.status === 403) {
      setIsSuccess({
        message: 'Votre code a expiré',
        status: 403,
        error: true,
        type: 'optConfirm',
      });
    }

    setOtpInput([]);
    setOtp('');
    setIsLoading(false);
  };

  return (
    <SafeAreaView className="flex-1">
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        <KeyboardAvoidingView
          keyboardVerticalOffset={Platform.OS == 'ios' ? 60 : 40}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="h-screen flex-1 flex-col bg-blue-900">
          <View className="flex-1"></View>

          <View className="max-h-[70%] flex-auto flex-col gap-6 rounded-t-3xl bg-white p-2 py-6">
            {step === 1 && (
              <View className="flex-col gap-6">
                <View className="flex-col gap-0.5">
                  <Text className="text-left text-3xl font-bold tracking-widest">SKILLMAP</Text>

                  <Text className="text-muted">
                    La plateforme idéal pour trouver un prestataire
                  </Text>
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
                        {error?.message && (
                          <Text className="text-destructive">{error.message}</Text>
                        )}
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

                        {error?.message && (
                          <Text className="text-destructive">{error.message}</Text>
                        )}
                      </View>
                    )}
                  />
                </View>

                <View className="flex-col gap-1.5">
                  <Controller
                    name="confirmPassword"
                    control={control}
                    render={({ field: { onChange, value }, fieldState: { error } }) => (
                      <View className="flex-col gap-0.5">
                        <Label>Confirmer votre mot de passe</Label>
                        <Input
                          className="rounded-lg"
                          onChangeText={onChange}
                          value={value}
                          placeholder="********"
                          secureTextEntry
                        />

                        {error?.message && (
                          <Text className="text-destructive">{error.message}</Text>
                        )}
                      </View>
                    )}
                  />
                </View>

                <View>
                  <Button onPress={handleSubmit(register)} disabled={isLoading}>
                    {isLoading ? (
                      <ActivityIndicator size={24} color={'white'} />
                    ) : (
                      <Text>S'inscrire</Text>
                    )}
                  </Button>
                </View>

                {isSuccess.status && (
                  <View className="flex-row items-center justify-center">
                    <Text
                      className={clsx('font-bold', {
                        'text-green-500': !isSuccess.error,
                        'text-destructive': isSuccess.error,
                      })}>
                      {isSuccess.message}
                    </Text>
                  </View>
                )}

                <View className="my-2 flex-row items-center justify-center text-xs">
                  <Text>Vous avez déjà un compte?</Text>
                  <Button variant={'link'} onPress={() => router.push('/(auth)/(register)')}>
                    <Text>Se connecter</Text>
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
            )}
            {step === 2 && (
              <View className="flex-col items-center justify-center gap-8 py-12">
                <View>
                  <Text className="text-center text-2xl font-bold">Code de verification</Text>
                  <Text className="text-left text-muted">
                    Un code de vérification à 4 chiffre a été envoyé a votre numéro
                  </Text>
                </View>

                <View className="flex-row items-center gap-3">
                  {Array.from({ length: 4 }).map((_, idx) => (
                    <Input
                      className="h-16 w-16"
                      keyboardType="numeric"
                      key={idx}
                      onChangeText={(text) => handleOtp({ text, idx })}
                      value={otpInput[idx]}
                      maxLength={1}
                    />
                  ))}
                </View>

                <Button
                  className="w-full"
                  disabled={isLoading}
                  onPress={() => {
                    handleSubmitOtp();
                  }}>
                  {isLoading ? (
                    <ActivityIndicator size={24} color={'white'} />
                  ) : (
                    <Text>Valider</Text>
                  )}
                </Button>

                {isSuccess.status && (
                  <View className="flex-row items-center justify-center">
                    <Text
                      className={clsx('font-bold', {
                        'text-green-500': !isSuccess.error,
                        'text-destructive': isSuccess.error,
                      })}>
                      {isSuccess.message}
                    </Text>
                  </View>
                )}

                <View className="flex-row justify-start">
                  <Text className="text-xs text-muted-foreground">
                    Vous n'avez pas reçu votre code?{' '}
                  </Text>
                  <Button
                    variant={'link'}
                    size={'sm'}
                    disabled={resendDisabled}
                    onPress={() => {
                      sendOpt();
                    }}>
                    <Text className="">renvoyer</Text>
                  </Button>
                </View>
              </View>
            )}
            {step === 3 && <RegisterNameandEmail />}{' '}
          </View>
        </KeyboardAvoidingView>
      </ScrollView>
    </SafeAreaView>
  );
}
export default registerPage;
