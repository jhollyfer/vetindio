import 'dotenv/config';
import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  PORT: z.coerce.number().default(3333),

  JWT_PUBLIC_KEY: z.string().trim(),
  JWT_PRIVATE_KEY: z.string().trim(),

  COOKIE_SECRET: z.string().trim(),

  // ADMIN_PASSWORD: z.string().trim(),
  // ADMIN_EMAIL: z.string().trim(),

  DATABASE_URL: z.string().trim(),

  DB_HOST: z.string().trim().default('localhost'),
  DB_PORT: z.coerce.number().default(5432),
  DB_USER: z.string().trim(),
  DB_PASSWORD: z.string().trim(),
  DB_DATABASE: z.string().trim(),
});

const validation = schema.safeParse(process.env);

if (!validation.success) {
  console.error('Invalid environment variables', validation.error.format());
  throw new Error('Invalid environment variables');
}

export const Env = validation.data;
