import { createAuthClient } from 'better-auth/react';
import { expoClient } from '@better-auth/expo/client';
import * as SecureStore from 'expo-secure-store';
import { phoneNumberClient } from 'better-auth/client/plugins';

export const authClient = createAuthClient({
  baseURL: 'http://192.168.201.6:8081', // Base URL of your Better Auth backend.
  plugins: [
    expoClient({
      scheme: 'skillmap',
      storagePrefix: 'skillmap',
      storage: SecureStore,
    }),
    phoneNumberClient(),
  ],
});
