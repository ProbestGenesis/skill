import { Star } from 'lucide-react-native';
import { View, Text, ActivityIndicator, Pressable } from 'react-native';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Post, Provider, User } from '@/prisma/generated/prisma';
import { useRouter } from 'expo-router';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { fetchSkills } from '@/lib/fetching/user';
import { authClient } from '@/lib/auth-client';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { providerAvaragePriceSchema } from '@/lib/zodSchema';
import { useState } from 'react';
import { Input } from '@/components/ui/input';


type Props = {
  post: (Post & { user: User }) | null;
  setPostCard: any;
};
const PostCardComponent = ({ post, setPostCard }: Props) => {
  const { data: session } = authClient.useSession();
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState<{
    message: string | undefined;
    status: number | null;
  }>({ message: '', status: null });
  const router = useRouter();

  const { control, handleSubmit } = useForm({
    resolver: zodResolver(providerAvaragePriceSchema),
  });

  const onSubmit = async (data: z.infer<typeof providerAvaragePriceSchema>) => {
    setSuccess({ message: '', status: null });
    setSending(true);
    const res = await fetch(
      `${process.env.EXPO_PUBLIC_SERVER_URL}/api/post/${post?.id}/provider/${session?.user?.id}/apply`,
      {
        method: 'PUT',
        body: JSON.stringify({ average_price: data.avarage_price }),
      }
    );
    const { message, status } = await res.json();
    setSuccess({ message: message, status: status });
    setSending(false);
  };

  if (post) {
    return (
      <Card className="w-80 mx-1">
        <CardHeader>
          <View className="flex-row gap-2">
            <Avatar alt="" className="h-16 w-16">
              <AvatarImage source={{ uri: post?.user.image }} />
              <AvatarFallback>{post?.user.name.slice(0, 2)}</AvatarFallback>
            </Avatar>

            <View className="flex-col items-start gap-0.5">
              <Text className="font-bold leading-tight">{post?.user.name}</Text>
              <Badge>
                <Text className="text-white">{}</Text>
              </Badge>
            </View>
          </View>
        </CardHeader>

        <CardContent className="flex-col gap-2">
          <Text className="text-lg">Description du services</Text>

          <Text className="leading-snug tracking-tighter">{post.body}</Text>

          {success.status !== 200 && (
            <View>
              <Text className="text-xs font-bold text-muted">
                {' '}
                *Fixer une prise de base avant de prendre en charge
              </Text>
              <Controller
                name="avarage_price"
                control={control}
                render={({ field: { onChange, value }, fieldState }) => (
                  <View className="gap-.5 flex-col">
                    <Input
                      keyboardType="numeric"
                      placeholder="Prix de base"
                      onChangeText={onChange}
                      value={value?.toString()}
                      className="text-sm"
                    />

                    <Text className="text-xs text-red-600"> {fieldState.error?.message} </Text>
                  </View>
                )}
              />
            </View>
          )}
        </CardContent>

        <CardFooter className="w-full flex-col">
          <View className="w-full flex-row content-end justify-end gap-2">
            <Button
              className="rounded-full"
              size={'sm'}
              variant={'outline'}
              onPress={() => {
                setPostCard(null);
              }}>
              <Text> Fermer </Text>
            </Button>

            {success.status !== 200 && (
              <Button
                className="rounded-full"
                size={'sm'}
                onPress={handleSubmit(onSubmit)}
                disabled={sending}>
                <Text className="text-white">Prendre en charge</Text>
              </Button>
            )}
          </View>

          {success.message && (
            <View>
              {success.status === 200 ? (
                <Text className="mt-2 font-bold text-green-600"> {success.message} </Text>
              ) : (
                <Text className="mt-2 font-bold text-red-600"> {success.message} </Text>
              )}
            </View>
          )}
        </CardFooter>
      </Card>
    );
  }
};
export default PostCardComponent;
