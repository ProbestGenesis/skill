import { ScrollView, Text, View, Pressable } from 'react-native';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { AnimatePresence, MotiView } from 'moti';
import { Button } from '@/components/ui/button';
import { Link } from 'expo-router';
import { useRouter } from 'expo-router';

const services = {
  services_btp: [
    'Maçon',
    'Charpentier',
    'Électricien',
    'Coffreur-ferrailleur',
    'Terrassier',
    'Peintre en bâtiment',
    'Poseur de revêtement',
    'Plâtrier-staffeur',
    'Poseur de faux plafonds',
    'Décorateur intérieur',
    'Plombier',
    'Frigoriste / Climaticien',
    'Installateur solaire',
    'Technicien domotique',
    'Menuisier (aluminium / bois / PVC)',
    'Soudeur / ferronnier',
    'Poseur de clôtures / portails',
    'Paysagiste',
    'Agent VRD',
  ],
};
type Props = {};
function JobsList({}: Props) {
  const router = useRouter();
  const [showAll, setShowAll] = useState(false);
  return (
    <View className="flex-col gap-2">
      <View className="flex-row flex-wrap items-center justify-between">
        <Text className="text-xl leading-tight text-blue-800">Métier</Text>
      </View>
      <AnimatePresence>
        {' '}
        {!showAll && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            keyboardShouldPersistTaps={'handled'}>
            <MotiView
              from={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ type: 'timing' }}
              className="flex-row items-center gap-4">
              {services.services_btp.map((item, idx) => {
                if (!showAll && idx <= 3) {
                  return (
                    <Badge key={idx.toString()}>
                      <Pressable
                        onPress={() =>
                          router.push({
                            pathname: '/(tabs)/(home)/(provider)',
                            params: { query: item },
                          })
                        }
                        android_ripple={{ color: 'rgba(255,255,255,0.2)' }}
                        style={{ paddingHorizontal: 8, paddingVertical: 2 }}>
                        <Text className="text-xs font-bold leading-tight text-white">{item}</Text>
                      </Pressable>
                    </Badge>
                  );
                }
              })}

              <Button variant="ghost" size={'sm'} onPress={() => setShowAll(true)}>
                <Text>voir plus </Text>
              </Button>
            </MotiView>
          </ScrollView>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAll && (
          <MotiView
            from={{
              opacity: 0,
              translateY: -20,
              scale: 0.95,
            }}
            animate={{
              opacity: 1,
              translateY: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              translateY: 20,
              scale: 0.95,
            }}
            transition={{
              type: 'spring',
              duration: 400,
            }}
            className="flex-row flex-wrap items-center gap-2">
            {services.services_btp.map((item, idx) => (
              <Badge key={idx.toString()}>
                <Pressable
                  onPress={() =>
                    router.push({
                      pathname: '/(tabs)/(home)/(provider)',
                      params: { query: item },
                    })
                  }
                  android_ripple={{ color: 'rgba(255,255,255,0.2)', radius: 5 }}
                  style={{ paddingHorizontal: 8, paddingVertical: 2 }}>
                  <MotiView
                    from={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{
                      type: 'spring',
                      damping: 12,
                      mass: 0.8,
                      delay: idx * 20, // effet cascade
                    }}>
                    <Text className="text-xs font-bold leading-tight text-white">{item}</Text>
                  </MotiView>
                </Pressable>
              </Badge>
            ))}
            <Button variant="ghost" size="sm" onPress={() => setShowAll(false)}>
              <Text>voir moins</Text>
            </Button>
          </MotiView>
        )}
      </AnimatePresence>
    </View>
  );
}
export default JobsList;
