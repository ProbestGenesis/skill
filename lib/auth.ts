import { betterAuth } from 'better-auth';
import { expo } from '@better-auth/expo';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { phoneNumber } from 'better-auth/plugins';
import { prisma } from './prisma';

export const auth = betterAuth({
  trustedOrigins: ['skillmap://', 'http://192.168.201.6:8081', 'exp://192.168.201.6:8081'],
  plugins: [
    expo(),
    phoneNumber({
      sendOTP: ({ phoneNumber, code }, request) => {
        // Implement sending OTP code via SMS
      },
      expiresIn: 60 * 100,
      otpLength: 4,
      requireVerification: true,
      allowedAttempts: 4
    }),
  ],
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  emailAndPassword: {
    enabled: true,
    changeEmail: true
  },
});
