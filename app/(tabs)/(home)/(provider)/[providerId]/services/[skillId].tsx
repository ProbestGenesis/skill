import { useState, useEffect } from "react";
import { View, Text, Image, TouchableOpacity, ScrollView } from "react-native";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
//import AskServicePage from "@/components/utils/providers/service/askServicePage";
import { Provider, Skills, User } from '@/prisma/generated/prisma';
import { Link, useLocalSearchParams } from "expo-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { createSerciveDemand } from "@/lib/zodSchema";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { z } from "zod";
import { useRouter, Redirect } from "expo-router";
import clsx from "clsx";
import * as Location from "expo-location";
import { Platform } from "react-native";
import { isSuccesReqDialogComp } from "@/components/state/dialogState";
import { Check, AlertCircle, XCircle } from "lucide-react-native";
import { useQuery, useQueryClient } from "@tanstack/react-query";

type Props = {};

type Data = Skills & { provider: Provider & { user: User; skills: Skills[] } };

function AskService({}: Props) {
  const router = useRouter();
  const queryClient = useQueryClient()
  const { skillId, providerId } = useLocalSearchParams();

  const { data:session } = authClient.useSession()
  const [dialogIsOpen, setDialogIsOpen] = useState(false)
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<{
    message: string | undefined;
    status: number | null;
  }>({ message: "", status: null });
  const [error, setError] = useState<{
    message: string;
    status: number | null;
  }>({ message: "", status: 400 });
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);


  const closeDialog = () => {
    setDialogIsOpen(false)
  }

  const openDialog = ({type}: {type?: string | undefined}) => {
    setDialogIsOpen(true)
  }

  useEffect(() => {
    async function getCurrentLocation() {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    }

    getCurrentLocation();
  }, []);
  
 
  const fetchData = async () => {
    const res = await fetch(
      `${process.env.EXPO_PUBLIC_SERVER_URL}/api/user/${session?.user?.id}/provider/${providerId}/service/${skillId}`
    );
   const data = await res.json()
   return data
  }

  
  const { data, isPending } = useQuery({
    queryKey: ["skills", session?.user?.id],
    queryFn: fetchData
  })

  const { control, handleSubmit } = useForm({
    resolver: zodResolver(createSerciveDemand),
  });

  const onSubmit = async (data: { description: string; district?: string }) => {
    setLoading(true);
    const response = await fetch(
      `${process.env.EXPO_PUBLIC_SERVER_URL}/api/user/${session?.user?.id}/provider/${providerId}/service/${skillId}`,
      {
        method: "POST",
        body: JSON.stringify({
          description: data.description,
          district: data.district,
          id: session?.user?.id,
          location: location,
        }),
      }
    );

    const result = await response.json();
    if (result.status !== 201) {
      setSuccess({ message: result.message, status: result.status }); 
      openDialog({type: "success"})
      setLoading(false);
    } else {
      setSuccess({ message: result.message, status: result.status });
      openDialog({type: "error"})
      setLoading(false);
      control._reset()
    }
  };

  if (!session) {
    router.push("/(auth)");
  }

  return (
    <View className="h-full">
      {isPending ? (
        <View className="h-full items-center justify-center">
          <Text className="text-muted font-bold text-xl">Chargement...</Text>
        </View>
      ) : (
        <View>
          {" "}
          {data ? (
            <View className="relative p-2">
              <ScrollView showsVerticalScrollIndicator={false} className="">
                <View className="flex-col gap-2 pb-[120px]">
                  <View className="flex-col gap-1 ">
                    <View className="flex-row items-center">
                      <Avatar alt="profil picture" className="h-24 w-24">
                        <AvatarImage 
                        //@ts-ignore
                        source={{ uri:data?.provider.user?.image }} />
                        <AvatarFallback>
                          <Text>{data?.provider.user?.name?.slice(0, 2)}</Text>
                        </AvatarFallback>
                      </Avatar>
                      <View className="ml-3 flex-1">
                        <Text className="text-lg font-bold">
                           {`${data.provider.user.name}`}
                        </Text>
                        <Text className="text-sm text-gray-500">
                          {data.provider.profession}
                        </Text>
                      </View>
                      <View className="flex-row items-center">
                        <Text className="text-yellow-500 mr-1">★</Text>
                        <Text className="text-sm font-medium">
                          {data.provider.rate.toFixed(1)}
                        </Text>
                      </View>
                    </View>

                  {/*  <View className="mt-2">
                      <View className="flex-row flex-wrap gap-2">
                        {data.provider.skills.map((item: any, idx: number) => (
                          <Badge key={item.id}>
                            <Text className="text-xs text-white">
                              {item.title}
                            </Text>
                          </Badge>
                        ))}
                      </View>
                    </View>*/}
                  </View>

                  <View className="mt-8 flex-col gap-8">
                    <View className="flex-col gap-2">
                      <View className="flex-row items-center gap-0.5 flex-wrap">
                        <Text className="font-bold text-2xl text-primary ">
                          Travaux recherché:
                        </Text>

                        <Badge>
                          <Text className="text-white">{data.title}</Text>
                        </Badge>
                      </View>

                      <View className="flex-col gap-0.5 mt-2">
                        <Text>Description</Text>
                        <Text className="text-lg ">{data.description}</Text>
                      </View>

                      <Text className="text-lg font-bold text-blue-500">
                        Prix de base: {data.average_price} fcfa
                      </Text>
                    </View>

                    <Separator />

                    <View className="flex-col gap-4 px-2">
                      <Controller
                        name="description"
                        control={control}
                        render={({
                          field: { onChange, onBlur, value },
                          fieldState: { error },
                        }) => (
                          <View className="flex-col gap-2 px-2">
                            <Label>
                              <Text className="text-xl tracking-tight">
                                Décrivez vos besoins
                              </Text>
                            </Label>

                            <Textarea
                              value={value}
                              onChangeText={onChange}
                              placeholder="Écrivez une courte description de vos besoins"
                              className="min-h-[200px]"
                              onBlur={onBlur}
                            />

                            {error && (
                              <Text className="text-destructive">
                                {error.message}
                              </Text>
                            )}
                          </View>
                        )}
                      />

                      <Controller
                        control={control}
                        name="district"
                        render={({
                          field: { onChange, onBlur, value },
                          fieldState: { error },
                        }) => (
                          <View className="flex-col gap-2 px-2">
                            <Label>
                              <Text className="text-xl tracking-tight">
                                Votre quartier
                              </Text>
                            </Label>
                            <Input
                              placeholder="Ex: Be-kpota"
                              onBlur={onBlur}
                              onChangeText={onChange}
                              value={value}
                            />
                            {error && (
                              <Text className="text-destructive">
                                {error.message}
                              </Text>
                            )}
                          </View>
                        )}
                      />
                    </View>

                    <Separator />
                    <View>
                      <Text className="text-muted">
                        Lorem ipsum dolor sit amet consectetur adipisicing elit.
                        Dicta dolores quam, ullam facilis sint earum a harum
                        error aperiam! Debitis, quisquam. Repudiandae ut nihil
                        modi consequatur sequi, animi eaque facilis? Lorem ipsum
                        dolor sit amet consectetur adipisicing elit. Vel eius,
                        animi a libero totam illo mollitia maiores magnam. Minus
                        odio sint distinctio consequatur repellat expedita eum
                        ipsa optio molestias consequuntur.
                      </Text>
                    </View>
                  </View>
                </View>
              </ScrollView>

              <View className="absolute bottom-2 w-full ">
                <View className="">
                  <View className="flex-row items-center gap-2 justify-end">
                    <Button
                      size={"lg"}
                      className="rounded-full"
                      variant={"outline"}
                    >
                      <Text className="font-bold text-lg">Reserver</Text>
                    </Button>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size={"lg"} className="rounded-full">
                          <Text className="text-white font-bold text-lg">
                            Faire appelle à lui
                          </Text>
                        </Button>
                      </DialogTrigger>

                      <DialogContent>
                        <DialogHeader className="w-full">
                       {!success.status ? <DialogTitle className="text-primary font-bold">
                            <Text>
                              Traitement de la demande
                            </Text>
                          </DialogTitle>  :   <DialogTitle className="text-primary font-bold">
                            <Text>
                              {`Faire appelle à  ${data.provider.user.name}`}{" "}
                            </Text>
                          </DialogTitle>}

                          {!success.status ? (
                            <DialogDescription>
                              <Text className="text-lg tracking-widest leading-tight">
                                Votre localisation actuelle sera envoyé au
                                prestataire de service
                              </Text>
                            </DialogDescription>
                          ) : (
                            <View>
                              {success.status === 201 ? (
                                <DialogDescription className="flex-col w-full items-center justify-center"> 
                                 <View className="flex-col items-center justify-center w-full">
                                  <Check stroke={"green"} strokeWidth={2.5} size={64} /> 
                                <Text className="text-green-600 text-lg">Vos demandes a été envoyé</Text>
                                  </View> 
                                </DialogDescription>
                              ) : (
                                <DialogDescription className="flex-col items-center w-full justify-center">
                                   <View className="flex-col items-center justify-center w-full">
                                    <XCircle stroke={"red"} strokeWidth={2.5} size={64} /> 
                                    <Text className="text-red-600 text-lg">Une erreur s'est produite, réesayer </Text>
                                   </View>
                                   </DialogDescription>
                              )}
                            </View>
                          )}
                        </DialogHeader>

                        <View></View>
                          
                        
                        <DialogFooter>
                          {!success.status ? (
                            <View className="flex-row items-end justify-end gap-2">
                              <DialogClose asChild>
                                <Button
                                  className="rounded-full"
                                  variant="ghost"
                                >
                                  <Text>Annuler</Text>
                                </Button>
                              </DialogClose>

                              <Button
                                className="rounded-full"
                                disabled={loading}
                                onPress={handleSubmit(onSubmit)}
                              >
                                <Text className="font-bold text-white">
                                  Continue
                                </Text>
                              </Button>
                            </View>
                          ) : (
                            <View className="w-full">
                              {success.status === 201 ? (
                                <View className="flex-rox items-end justify-end">
                                  {" "}
                                  <DialogClose asChild>
                                    <Link asChild href='/(tabs)/(services)' >
                                    <Button className="rounded-full">
                                      <Text className="font-bold text-white">
                                        fermer
                                      </Text>
                                    </Button>
                                    </Link>
                                  </DialogClose>{" "}
                                </View>
                              ) : (
                                <View>
                                   <DialogClose asChild>
                                    <Button className="rounded-full" variant={"destructive"}>
                                      <Text className="font-bold text-white">
                                        fermer
                                      </Text>
                                    </Button>
                                  </DialogClose>
                                </View>
                              )}
                            </View>
                          )}
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    
                  </View>
                </View>
              </View>
            </View>
          ) : (
            <View className="flex-1 h-full items-center justify-center">
              {" "}
              <Text className="text-destructive font-bold text-xl">
                {" "}
                {error.message}{" "}
              </Text>{" "}
            </View>
          )}
        </View>
      )}
    </View>
  );
}
export default AskService;
