import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { authClient } from '@/lib/auth-client';
import { useRouter } from 'expo-router';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Props = {};
function index({ }: Props) {
  const { data:session } = authClient.useSession()
  const router = useRouter();
  if (session && !session.user.phoneNumberVerified) {
    router.push('/(auth)/(register)/opt')
  }
  return (
    <SafeAreaView>
      <View>
        <Button onPress={() => router.push('/(auth)')}>
          <Text>Se connecter</Text>
        </Button>
      </View>
    </SafeAreaView>
  );
}
export default index;
