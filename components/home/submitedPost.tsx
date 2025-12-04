import { authClient } from '@/lib/auth-client';
import { View, Text } from 'react-native';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Provider, User } from '@/prisma/generated/prisma';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

type Props = {
  providerData: (Provider & { user: User }) | undefined;
};
function SubmitedPosts({ providerData }: Props) {
  const { data: session } = authClient.useSession();

  const fetchData = async () => {
    const res = await fetch(
      `${process.env.EXPO_PUBLIC_SERVER_URL}/api/user/${session?.user.id}/provider/${providerData?.id}/submitedPost`
    );
    const data = await res.json();
    return data;
  };

  const { data: submitedPosts, isLoading } = useQuery({
    queryKey: ['submitedPost', session?.user?.id],
    queryFn: fetchData,
    enabled: !!session,
  });

  if (!session) {
    return null;
  }
  return (
    <View className="absolute bottom-0 right-1">
      <View className="flex-col items-center justify-center gap-2">
        {submitedPosts && submitedPosts.length > 0 && (
          <Text className="text-center text-xs">Vos prestataire</Text>
        )}
        {isLoading ? (
          <View className="flex-col items-end gap-2">
            {Array.from({ length: 3 }).map((_, idx) => (
              <Skeleton key={idx} className="h-12 w-12 rounded-full" />
            ))}
          </View>
        ) : (
          <View>
            {' '}
            {Array.isArray(submitedPosts) &&
              submitedPosts?.map((item) => (
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
    </View>
  );
}
export default SubmitedPosts;
