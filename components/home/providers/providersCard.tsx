// ProviderCard.tsx
import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'expo-router';
import { Badge } from '@/components/ui/badge';
import { Provider, Skills, User } from '@/prisma/generated/prisma';

type Props = {
  provider: Provider & { user: User; skills: Skills[] };
};

export function ProviderCard({ provider }: Props) {
  return (
    <Card className="flex-col gap-2 p-4 shadow-md">
      <View className="flex-row items-center">
        <Avatar alt="profil picture">
          <AvatarImage />
          <AvatarFallback>
            <Text>{provider.user.name?.slice(0, 2)}</Text>
          </AvatarFallback>
        </Avatar>
        <View className="ml-3 flex-1">
          <Text className="text-lg font-semibold">{provider.user.name}</Text>
          <Text className="text-sm text-gray-500">{provider.profession}</Text>
        </View>
        <View className="flex-row items-center">
          <Text className="mr-1 text-yellow-500">★</Text>
          <Text className="text-sm font-medium">{provider.rate.toFixed(1)}</Text>
        </View>
      </View>

      {provider.skills.length > 0 && (
        <View className="flex-col gap-2">
          <View className="">
            <Text className="mb-1 text-sm text-gray-600">Spécialités :</Text>
            <View className="flex-row flex-wrap gap-2">
              {provider.skills.map((item: any, idx: number) => (
                <Badge key={item.id}>
                  <Text className="text-xs text-white">{item.title}</Text>
                </Badge>
              ))}
            </View>
          </View>

          <View className="flex-1 flex-col">
            <Text className="text-sm text-gray-600">Services :</Text>

            <View className="flex-col gap-1">
              {' '}
              {provider.skills.map((svc) => (
                <View key={svc.title} className=" ">
                  <Link
                    href={{
                      pathname: '/[providerId]/services/[skillId]',
                      params: { providerId: svc.id },
                    }}>
                    <View className="w-full flex-col rounded-lg border border-gray-200 p-2">
                      <Text className="text-lg font-bold">{svc.title}</Text>
                      <Text className="text-md mb-1 text-gray-500">{svc.description}</Text>
                      <Text className="font-semibold text-primary">
                        prix de base: {svc.average_price.toLocaleString()} fcf
                      </Text>
                    </View>
                  </Link>
                </View>
              ))}
            </View>
          </View>
        </View>
      )}
      <View className="mt-2 flex-row items-center justify-between">
        <Text className="text-sm text-gray-500">Missions: {provider.mission_nb}</Text>
        <Text className="text-sm text-gray-500">
          Moyen: {provider.average_price?.toLocaleString()} fcf
        </Text>
      </View>
    </Card>
  );
}
