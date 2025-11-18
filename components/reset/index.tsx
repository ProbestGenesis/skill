import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { Link, Stack } from 'expo-router';
import { MoonStarIcon, StarIcon, SunIcon } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import * as React from 'react';
import { Image, type ImageStyle, View } from 'react-native';

const LOGO = {
  light: require('@/assets/images/react-native-reusables-light.png'),
  dark: require('@/assets/images/react-native-reusables-dark.png'),
};


export default function Screen() {
  const { colorScheme } = useColorScheme();
 
 
  return (
    <View className='mx-2'>
      <Button onPress={() => {}}> 
        <Text>Add me </Text> 
      </Button>
   </View>
  );
}

const THEME_ICONS = {
  light: SunIcon,
  dark: MoonStarIcon,
};
