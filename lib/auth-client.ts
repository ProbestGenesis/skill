import { createAuthClient } from 'better-auth/react';
import { expoClient } from '@better-auth/expo/client';
import * as SecureStore from 'expo-secure-store';
import { phoneNumberClient } from 'better-auth/client/plugins';

export const authClient = createAuthClient({
  baseURL: 'http://10.10.11.177:8081', // Base URL of your Better Auth backend.
  plugins: [
    expoClient({
      scheme: 'skillmap',
      storagePrefix: 'skillmap',
      storage: SecureStore,
    }),
    phoneNumberClient(),
  ],
});
