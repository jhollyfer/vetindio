import 'reflect-metadata';

import cookie from '@fastify/cookie';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import swagger from '@fastify/swagger';
import scalar from '@scalar/fastify-api-reference';
import type {
  FastifyBaseLogger,
  FastifyInstance,
  RawReplyDefaultExpression,
  RawRequestDefaultExpression,
  RawServerDefault,
} from 'fastify';
import fastify from 'fastify';
import { bootstrap } from 'fastify-decorators';
import { resolve } from 'path';
import { ZodError } from 'zod';

import ApplicationException from '@exceptions/application.exception';

import { Env } from './env';

export type FastifyTypedInstance = FastifyInstance<
  RawServerDefault,
  RawRequestDefaultExpression,
  RawReplyDefaultExpression,
  FastifyBaseLogger
>;

const kernel = fastify({
  logger: false,
});

kernel.register(cors, {
  origin: (origin, callback) => {
    const allowedOrigins = ['http://localhost:5173'];

    // Permitir requisições sem origin (ex: Postman, mobile apps)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error('Not allowed by CORS'), false);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  credentials: true,
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'Cookie',
    'X-Requested-With',
    'Accept',
    'Origin',
    'Access-Control-Request-Method',
    'Access-Control-Request-Headers',
    'X-Timezone',
  ],
  exposedHeaders: ['Set-Cookie'],
  optionsSuccessStatus: 200,
  preflightContinue: false,
  preflight: true,
});

kernel.register(cookie, {
  secret: Env.COOKIE_SECRET,
});

const expiresIn = 60 * 60 * 24 * 1; // 1 day

kernel.register(jwt, {
  secret: {
    private: Buffer.from(Env.JWT_PRIVATE_KEY, 'base64'),
    public: Buffer.from(Env.JWT_PUBLIC_KEY, 'base64'),
  },
  sign: { expiresIn: expiresIn, algorithm: 'RS256' },
  verify: { algorithms: ['RS256'] },
  cookie: {
    signed: false,
    cookieName: 'accessToken',
  },
});

kernel.setErrorHandler((error, request, response) => {
  console.error(JSON.stringify(error, null, 2));
  if (error instanceof ApplicationException) {
    return response.status(Number(error.code || 500)).send({
      message: error.message || 'Internal Server Error',
      cause: error.cause || 'SERVER_ERROR',
      code: Number(error.code || 500),
    });
  }

  if (error instanceof ZodError) {
    const errors = error?.issues?.map((issue) => ({
      message: issue.message,
    }));
    return response.status(400).send({ errors });
  }

  return response.status(500).send({ message: 'Internal server error' });
});

kernel.register(swagger, {
  openapi: {
    info: {
      title: 'VetIndio API',
      version: '1.0.0',
      description: 'VetIndio API with JWT cookie-based authentication',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
      // {
      //   url: 'https://api.demo.VetIndio.org',
      //   description: 'Demo server',
      // },
      // {
      //   url: 'https://api.develop.VetIndio.org',
      //   description: 'Develop server',
      // },
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'accessToken',
        },
      },
    },
  },
});

kernel.register(scalar, {
  routePrefix: '/documentation',
  configuration: {
    title: 'VetIndio API',
    description: 'VetIndio API Documentation',
    version: '1.0.0',
    theme: 'default',
  },
});

kernel.register(bootstrap, {
  directory: resolve(__dirname, '..', 'app', 'controllers'),
  mask: /\.controller\.(t|j)s$/,
});

kernel.get('/openapi.json', async () => {
  return kernel.swagger();
});

export { kernel };
