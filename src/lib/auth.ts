import 'dotenv/config';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { PrismaClient } from '@prisma/client';
import { admin } from 'better-auth/plugins';

const prisma = new PrismaClient();
export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  user: {
    deleteUser: {
      enabled: true,
    },
  },
  secret: process.env.BETTER_AUTH_SECRET as string,
  baseURL: process.env.BETTER_AUTH_URL as string,
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  allowedOrigins: [
    'http://localhost:3000', 
    'http://localhost:3001',
    process.env.BETTER_AUTH_URL as string,
    'https://forum-tech.vercel.app',
    process.env.FRONTEND_URL as string,
  ].filter(Boolean),
  plugins: [admin({ adminUserIds: ['akgx2kOFFFkywZFqWY8PGIVebnMK8PRA'] })],
});

// npx @better-auth/cli migrate
