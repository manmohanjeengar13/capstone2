// lib/auth.ts
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { prisma } from '@/lib/prisma';
import { encrypt } from '@/lib/crypto';
import { logger } from '@/lib/logger';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY!;

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
    usePlural: false,
  }),
  secret: process.env.BETTER_AUTH_SECRET!,
  baseURL: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
  user: {
    additionalFields: {
      avatarUrl: {
        type: 'string',
        required: false,
        fieldName: 'avatarUrl',
      },
      githubToken: {
        type: 'string',
        required: false,
        fieldName: 'githubToken',
      },
      githubLogin: {
        type: 'string',
        required: false,
        fieldName: 'githubLogin',
      },
    },
    mapFields: {
      image: 'avatarUrl',
    },
  },
  socialProviders: {
  github: {
    clientId: process.env.GITHUB_CLIENT_ID!,
    clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    scope: ['read:user', 'user:email', 'repo'],
    pkce: false,  // add this line
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  },
},
  callbacks: {
    async onOAuthSuccess({ user, account }: { user: { id: string; name?: string; image?: string }; account: { provider: string; accessToken?: string } }) {
      if (account.provider === 'github' && account.accessToken) {
        try {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              githubToken: encrypt(account.accessToken, ENCRYPTION_KEY),
              githubLogin: user.name ?? undefined,
              avatarUrl: user.image ?? undefined,
            },
          });
        } catch (error) {
          logger.error('Failed to store GitHub token', { userId: user.id, error: error instanceof Error ? error.message : 'Unknown' });
        }
      }
    },
  },
  session: { expiresIn: 30 * 24 * 60 * 60, updateAge: 24 * 60 * 60 },
  rateLimit: { enabled: true, window: 60, max: 20 },
});