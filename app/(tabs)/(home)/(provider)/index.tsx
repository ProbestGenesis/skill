import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Text,
} from "react-native";
import { Provider, Skills, User } from "@/prisma/generated/prisma";
import { ProviderCard } from "@/components/home/providers/providersCard";
import { Button } from "@/components/ui/button";
import { Search, Plus } from "lucide-react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { useFocusEffect } from '@react-navigation/native'
import { useCallback } from 'react'

type DataType = Provider & { user: User, skills: Skills[] };

function ProviderPage() {
  const { query } = useLocalSearchParams();

  const [isPending, setIsPending] = useState(true);
  const [data, setData] = useState<DataType[] | null>(null);
  const [error, setError] = useState<{
    message: string;
    status: number | null;
  }>({ message: "", status: null });

  const fetchData = async () => {
    const res = await fetch(
      `${process.env.EXPO_PUBLIC_SERVER_URL}/api/provider?query=${query}`
    );

    if(res.status === 200) {
      const data = await res.json();
      console.log(data)
      setData(data);
      setIsPending(false);
    } else {
      const { message, status } = await res.json();
      setError({ message, status });
      setIsPending(false);
    }
  };

useFocusEffect(
  useCallback(() => {
    fetchData()
  }, [])
)

  const [input, setInput] = useState();

  const handleInput = (text: string) => {
    setInput(input);
  };

  const handlePress = (provider: Provider) => {
    // ici tu peux naviguer vers le détail, ouvrir un modal, etc.
  };

  return (
    <View className="flex-1 relative">
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.select({ ios: "padding", android: "height" })}
        keyboardVerticalOffset={Platform.select({ ios: 60, android: 100 })}
      >
        {" "}
        <View className="m-4">
          <View className="flex-row gap-1">
            <Text>Filtre: </Text>

            <Text>{query}</Text>
          </View>
        </View>
        <ScrollView className="bg-gray-50 px-4 pt-4">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="font-bold text-lg">List des prestaires</Text>
          </View>
          {isPending ? (
            <View className="flex-1 items-center justify-center">
              <Text className="text-muted font-bold text-lg">
                Chargement ...
              </Text>{" "}
            </View>
          ) : (<View> {data && data.length > 0 ?
            <View className="flex-col gap-4 pb-[120px]">
              {" "}
              {data &&
                data.map((item) => (
                  <ProviderCard key={item.id} provider={item} />
                ))}
            </View> : <View className="flex-1 items-center justify-center ">
                      <Text className="text-muted font-bold tracking-wide text-center tex-xl"  >Aucun prestataire retourvé</Text>
               </View>}
          </View>)}
        </ScrollView> 
        <View className="absolute bottom-2 left-0 right-0 py-2 px-2">
          <View className="flex-row justify-end mb-2">
            <Button className="rounded-full w-12">
              <Plus stroke="white" />
            </Button>
          </View>
          <View className="flex-row gap-6 items-center w-full relative">
            <Input
              placeholder="A la recherche d'un service?"
              value={input}
              onChangeText={handleInput}
              className="flex-1 rounded-full h-12"
            />

            <Ionicons name="search" size={24} className="absolute right-2" />
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
export default ProviderPage;
