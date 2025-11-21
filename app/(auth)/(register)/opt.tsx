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
import { useState, useEffect, useMemo } from 'react';
import clsx from 'clsx';

type FormSchema = z.infer<typeof registerForm>;
type Props = {};
function OptScreen({}: Props) {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();
  const [isSuccess, setIsSuccess] = useState<{
    type: string;
    message: string | undefined;
    status: number | null;
    error: boolean;
  }>({ type: '', message: '', status: null, error: false });
  const [isLoading, setIsLoading] = useState(false);
  const [otpInput, setOtpInput] = useState<string[]>([]);
  const [otp, setOtp] = useState('');
  const clearSuccessState = () => {
    setIsSuccess({ type: '', message: '', status: null, error: false });
  };

  const clearOptData = () => {
    setOtpInput([]);
    setOtp('');
  };

  const sendOpt = async () => {
    const { data, error } = await authClient.phoneNumber.sendOtp({
      phoneNumber: session?.user.phoneNumber as string,
    });

    if (error) {
      setIsSuccess({
        message: error?.message,
        status: error?.status,
        error: true,
        type: 'optConfirm',
      });
    }
  };

  useEffect(() => {
    sendOpt();
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
    if (session && session.user.phoneNumber) {
      const { data, error } = await authClient.phoneNumber.verify({
        phoneNumber: session.user.phoneNumber,
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
      clearOptData();
      setIsLoading(false);
    }
  };

  const [resendDisabled, setResendDisabled] = useState(false);

  useEffect(() => {
    // start disabled, enable after 90 seconds
    setResendDisabled(true);
    const timer = setTimeout(() => {
      setResendDisabled(false);
    }, 90000);

    return () => clearTimeout(timer);
  }, []);

  if (session && session.user.phoneNumberVerified) {
    router.push('/(tabs)/(home)');
  }

  return (
    <SafeAreaView className="flex-1">
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        <KeyboardAvoidingView
          keyboardVerticalOffset={Platform.OS == 'ios' ? 60 : 40}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="h-screen flex-1 flex-col items-center justify-center bg-blue-900 px-4">
          <View className="flex-col items-center justify-center gap-8 py-12">
            <View>
              <Text className="text-left text-2xl font-bold">Veuillez confirmer votre numéro</Text>
              <Text className="text-left text-muted">
                Un code de confirmation à 4 chiffre a été envoyé a votre numéro
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
              disabled={isLoading}
              onPress={() => {
                handleSubmitOtp();
              }}>
              {isLoading ? <ActivityIndicator size={24} color={'white'} /> : <Text>Valider</Text>}
            </Button>

            {isSuccess.status && (<View className='flex-row items-center justify-center'>
                    <Text
                      className={clsx('font-bold', {
                        'text-green-500': !isSuccess.error,
                        'text-destructive': isSuccess.error,
                      })}>
                      {isSuccess.message}
                    </Text>
                 </View> )}

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
                <Text className="text-white">renvoyer</Text>
              </Button>
            </View>
          </View>
        </KeyboardAvoidingView>
      </ScrollView>
    </SafeAreaView>
  );
}
export default OptScreen;
