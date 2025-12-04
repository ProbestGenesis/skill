import { authClient } from '@/lib/auth-client';
import { View, Text, TouchableHighlight, TouchableOpacity } from 'react-native';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Provider, User } from '@/prisma/generated/prisma';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import LatestPosts from './latestPost';

type Props = {
  data: Provider & { user: User }[];
  isLoading: Boolean;
  setProviderCard: any;
  provider: Provider & { user: User } | null;
};

function Recent({ data, isLoading, setProviderCard }: Props) {
  const { data: session, isPending } = authClient.useSession();

  const queryClient = useQueryClient();

  if (isPending) {
    return null;
  }
  if (!session) {
    return null;
  }
  return (
    <View className="absolute bottom-0 right-0 p-2">
      <View className="flex flex-col gap-2">
        <View className="flex-col items-center justify-center gap-2">
          {data && data.length > 0 && <Text className="text-center text-xs">Vos prestataire</Text>}
          {isLoading ? (
            <View className="flex-col items-end gap-2">
              {Array.from({ length: 3 }).map((_, idx) => (
                <Skeleton key={idx} className="h-12 w-12 rounded-full" />
              ))}
            </View>
          ) : (
            <View>
              {' '}
              {Array.isArray(data) &&
                  data?.map((item) => (
                  <TouchableOpacity onPress={() => {setProviderCard(item)}}>
                  <View className="flex-col items-center justify-center gap-0.5">
                    <Avatar alt="profil picture" className="h-12 w-12">
                      <AvatarImage source={{ uri: item.user.image }} />
                      <AvatarFallback></AvatarFallback>
                    </Avatar>

                    <Text className="text-wrap text-xs">{item.user.name}</Text>
                  </View>
                 </TouchableOpacity>))}{' '}
            </View>
          )}
        </View>

        <LatestPosts />
      </View>
    </View>
  );
}
export default Recent;
