import { authClient } from '@/lib/auth-client';
import { View, Text } from 'react-native';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Provider, User } from '@/prisma/generated/prisma';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

type Props = {
  data: Provider & { user: User }[];
  isLoading: Boolean;
};
function LatestPosts() {
  const { data: session, isPending } = authClient.useSession();

  const queryClient = useQueryClient();

  if (isPending) {
    return null;
  }
  if (!session) {
    return null;
  }

    const getData = async () => {
        const res = await fetch(`${process.env.EXPO_PUBLIC_SERVER_URL}/api/user/${session?.user.id}/posts/latest`)  
        const data = await res.json()
        return data
    }
    const { data, isLoading } = useQuery({
    queryKey: ['latestPost', session?.user.id],
    queryFn: getData
  })
  return (
      <View className="flex-col items-center justify-center gap-2">
        {data && data.length > 0 && <Text className="text-center text-xs">Vos Demandes</Text>}
        {isLoading ? (
          <View className="flex-col items-end gap-2">
            {Array.from({ length: 1 }).map((_, idx) => (
              <Skeleton key={idx} className="h-12 w-12 rounded-full" />
            ))}
          </View>
        ) : (
          <View>
            {' '}
            {Array.isArray(data) &&
              data?.map((item) => (
                <View className="flex-col items-center justify-center gap-0.5">
                  <Avatar alt="profil picture" className="h-12 w-12">
                    <AvatarImage source={{ uri: item.user.image }} />
                    <AvatarFallback></AvatarFallback>
                  </Avatar>

                  <Text className="text-wrap text-xs">{item.user.name}</Text>
                </View>
              ))}{' '}
          </View>
        )}
      </View>
  );
}
export default LatestPosts;
