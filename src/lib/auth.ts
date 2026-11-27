import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { admin } from 'better-auth/plugins/admin';
import { nextCookies } from 'better-auth/next-js';
import { db } from '@/db';
import * as authSchema from '@/db/schema/auth';

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL ?? 'http://127.0.0.1:3000',
  secret: process.env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: authSchema,
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  user: {
    additionalFields: {
      department: {
        type: 'string',
        required: false,
        defaultValue: '指挥部',
      },
      sectionScope: {
        type: 'string',
        required: false,
        defaultValue: 'all',
      },
    },
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
  },
  trustedOrigins: [
    'http://127.0.0.1:3000',
    'http://localhost:3000',
    'http://127.0.0.1:8088',
    'http://localhost:8088',
  ],
  plugins: [
    admin({
      defaultRole: 'viewer',
      adminRoles: ['admin'],
    }),
    nextCookies(),
  ],
});

export type AuthSession = typeof auth.$Infer.Session;
