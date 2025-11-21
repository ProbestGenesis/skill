import { authClient } from '@/lib/auth-client';
import {
  ActivityIndicator,
  ScrollView,
  View,
  KeyboardAvoidingView,
  Platform,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Text } from '@/components/ui/text';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { registerForm } from '@/lib/zodSchema';
import { useRouter, usePathname } from 'expo-router';
import { useState, useEffect, useRef } from 'react';
import clsx from 'clsx';
import RegisterNameandEmail from '@/components/auth/username';

type FormSchema = z.infer<typeof registerForm>;

function RegisterPage() {
  const pathname = usePathname();
  const { data: session } = authClient.useSession();
  const router = useRouter();

  // États
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);


  const [currentPhone, setCurrentPhone] = useState<string>('');

  const [otpInput, setOtpInput] = useState<string[]>(['', '', '', '']);
  const [statusState, setStatusState] = useState<{
    message: string | undefined;
    type: 'success' | 'error' | '';
  }>({ message: '', type: '' });

  // Refs pour l'auto-focus des inputs OTP
  const inputRefs = useRef<Array<TextInput | null>>([]);

  // Timer pour le renvoi du code
  const [timer, setTimer] = useState(0);

  const { handleSubmit, control } = useForm({
    resolver: zodResolver(registerForm),
  });

  // Gestion de la session existante
  useEffect(() => {
    if (session) {
      const user = session.user;
      if (!user.phoneNumberVerified) {
        setCurrentPhone(user.phoneNumber || '');
        sendOtp()
        setStep(2);
      } else if (user.name && /^\d+$/.test(user.name)) {
        // Cas spécifique où le nom est encore des chiffres (pas encore configuré)
        setStep(3);
      }
    }
  }, [pathname]);

  // Décrémentation du timer
  useEffect(() => {
    let interval: any;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const clearStatus = () => setStatusState({ message: '', type: '' });

  // --- ETAPE 1 : Inscription ---
  const register = async (data: FormSchema) => {
    clearStatus();
    setIsLoading(true);

    await authClient.signUp.email(
      {
        email: `${data.phone}@skillmap.com`, // Mieux vaut utiliser un domaine fictif propre ou gérer ça côté back
        name: data.phone,
        password: data.password,
        phoneNumber: data.phone,
      },
      {
        onSuccess: async () => {
          setCurrentPhone(data.phone);
          const { error } = await authClient.phoneNumber.sendOtp({
            phoneNumber: data.phone,
          });

          if (error) {
            setStatusState({ message: error.message, type: 'error' });
            setIsLoading(false);
          } else {
            setStatusState({ message: 'Votre compte à été crée avec success!', type: 'success' });
            setTimeout(() => {
              clearStatus();
              setStep(2);
              setTimer(60); // Démarrer le timer
              setIsLoading(false);
            }, 1000);
          }
        },
        onError: (ctx) => {
          setStatusState({
            message: ctx.error.message || 'Une erreur est survenue',
            type: 'error',
          });
          setIsLoading(false);
        },
      }
    );
  };

  // --- ETAPE 2 : Gestion OTP ---

  // Gestion de la saisie OTP avec Focus automatique
  const handleOtpChange = (text: string, idx: number) => {
    const newOtp = [...otpInput];
    newOtp[idx] = text;
    setOtpInput(newOtp);

    // Si l'utilisateur tape un chiffre, on passe au suivant
    if (text && idx < 3) {
      inputRefs.current[idx + 1]?.focus();
    }
    // Si l'utilisateur efface, on reste sur le focus actuel (ou précédent si besoin)
    if (!text && idx > 0) {
      // Optionnel : inputRefs.current[idx - 1]?.focus();
    }
  };

  const sendOtp = async () => {
    clearStatus();
    // Priorité au numéro du state local, sinon celui de la session
    const phoneToSend = currentPhone || session?.user.phoneNumber;

    if (!phoneToSend) {
      setStatusState({ message: 'Numéro de téléphone introuvable', type: 'error' });
      return;
    }

    const { error } = await authClient.phoneNumber.sendOtp({
      phoneNumber: phoneToSend,
    });

    if (error) {
      setStatusState({ message: error.message, type: 'error' });
    } else {
      setStatusState({ message: 'Code renvoyé avec succès', type: 'success' });
      setTimer(60); // Reset timer 60s
    }
  };

  const handleSubmitOtp = async () => {
    const otpCode = otpInput.join('');
    const phoneToVerify = currentPhone || session?.user.phoneNumber;

    if (otpCode.length !== 4) {
      setStatusState({ message: 'Veuillez entrer les 4 chiffres', type: 'error' });
      return;
    }

    if (!phoneToVerify) {
      setStatusState({ message: 'Erreur de session, veuillez vous reconnecter', type: 'error' });
      return;
    }

    setIsLoading(true);
    const { data, error } = await authClient.phoneNumber.verify({
      phoneNumber: phoneToVerify,
      code: otpCode,
    });

    setIsLoading(false);

    if (error) {
      setStatusState({ message: error.message || 'Code invalide', type: 'error' });
      return;
    }

    if (data) {
      setStatusState({ message: 'Numéro vérifié !', type: 'success' });
      setTimeout(() => {
        clearStatus();
        setOtpInput(['', '', '', '']);
        setStep(3);
      }, 1000);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-blue-900">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1">
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
          <View className="flex-1" />

          <View className="min-h-[70%] w-full rounded-t-3xl bg-white p-2 pb-10">
            {step === 1 && (
              <View className="gap-6">
                <View>
                  <Text className="text-left text-3xl font-bold tracking-widest text-primary">
                    SKILLMAP
                  </Text>
                  <Text className="mt-1 text-muted-foreground">
                    La plateforme idéale pour trouver un prestataire
                  </Text>
                </View>

                {/* Formulaire Inscription */}
                <View className="gap-4">
                  <Controller
                    name="phone"
                    control={control}
                    render={({ field: { onChange, value }, fieldState: { error } }) => (
                      <View className="gap-1">
                        <Label>Numéro de téléphone</Label>
                        <Input
                          className="rounded-lg"
                          onChangeText={onChange}
                          value={value}
                          placeholder="+228"
                          keyboardType="phone-pad"
                        />
                        {error && <Text className="text-sm text-destructive">{error.message}</Text>}
                      </View>
                    )}
                  />

                  <Controller
                    name="password"
                    control={control}
                    render={({ field: { onChange, value }, fieldState: { error } }) => (
                      <View className="gap-1">
                        <Label>Mot de passe</Label>
                        <Input
                          className="rounded-lg"
                          onChangeText={onChange}
                          value={value}
                          placeholder="********"
                          secureTextEntry
                        />
                        {error && <Text className="text-sm text-destructive">{error.message}</Text>}
                      </View>
                    )}
                  />

                  <Controller
                    name="confirmPassword"
                    control={control}
                    render={({ field: { onChange, value }, fieldState: { error } }) => (
                      <View className="gap-1">
                        <Label>Confirmer votre mot de passe</Label>
                        <Input
                          className="rounded-lg"
                          onChangeText={onChange}
                          value={value}
                          placeholder="********"
                          secureTextEntry
                        />
                        {error && <Text className="text-sm text-destructive">{error.message}</Text>}
                      </View>
                    )}
                  />
                </View>

                <Button onPress={handleSubmit(register)} disabled={isLoading} className="mt-2">
                  {isLoading ? <ActivityIndicator color="white" /> : <Text>S'inscrire</Text>}
                </Button>

                {statusState.message && (
                  <Text
                    className={clsx(
                      'text-center font-medium',
                      statusState.type === 'error' ? 'text-destructive' : 'text-green-600'
                    )}>
                    {statusState.message}
                  </Text>
                )}

                <View className="flex-row items-center justify-center gap-1">
                  <Text className="text-sm text-muted-foreground">Vous avez déjà un compte?</Text>
                  <Button
                    variant="link"
                    className="h-auto p-0"
                    onPress={() => router.push('/(auth)/(register)')}>
                    <Text className="font-bold">Se connecter</Text>
                  </Button>
                </View>
              </View>
            )}

            {step === 2 && (
              <View className="items-center gap-8 py-8">
                <View className="w-full">
                  <Text className="mb-2 text-center text-2xl font-bold">Vérification</Text>
                  <Text className="text-center text-muted-foreground">
                    Entrez le code à 4 chiffres envoyé au{' '}
                    <Text className="font-bold text-black">
                      {currentPhone || session?.user.phoneNumber}
                    </Text>
                  </Text>
                </View>

                {/* Inputs OTP Améliorés */}
                <View className="flex-row gap-4">
                  {otpInput.map((digit, idx) => (
                    <Input
                      key={idx}
                      // @ts-ignore - Assignation de ref dynamique
                      ref={(ref) => (inputRefs.current[idx] = ref)}
                      className="h-14 w-14 text-center text-2xl font-bold"
                      keyboardType="number-pad"
                      maxLength={1}
                      value={digit}
                      onChangeText={(text) => handleOtpChange(text, idx)}
                      onKeyPress={({ nativeEvent }) => {
                        // Gestion du retour arrière pour reculer le focus
                        if (nativeEvent.key === 'Backspace' && !digit && idx > 0) {
                          inputRefs.current[idx - 1]?.focus();
                        }
                      }}
                    />
                  ))}
                </View>

                <View className="w-full gap-4">
                  <Button className="w-full" onPress={handleSubmitOtp} disabled={isLoading}>
                    {isLoading ? <ActivityIndicator color="white" /> : <Text>Valider</Text>}
                  </Button>

                  {statusState.message && (
                    <Text
                      className={clsx(
                        'text-center font-medium',
                        statusState.type === 'error' ? 'text-destructive' : 'text-green-600'
                      )}>
                      {statusState.message}
                    </Text>
                  )}
                </View>

                <View className="flex-row items-center gap-2">
                  <Text className="text-sm text-muted-foreground">Code non reçu ?</Text>
                  <Button
                    variant="link"
                    className="h-auto p-0"
                    disabled={timer > 0} // Désactivé SI le timer est > 0
                    onPress={sendOtp}>
                    <Text
                      className={clsx(
                        timer > 0 ? 'text-muted-foreground' : 'font-bold text-primary'
                      )}>
                      {timer > 0 ? `Renvoyer dans ${timer}s` : 'Renvoyer le code'}
                    </Text>
                  </Button>
                </View>
              </View>
            )}

            {step === 3 && <RegisterNameandEmail />}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export default RegisterPage;
