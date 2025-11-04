/* eslint-disable no-unused-vars */
import type { FastifyReply, FastifyRequest } from 'fastify';
import { Controller, getInstanceByToken, POST } from 'fastify-decorators';

import type { JWTPayload } from '@core/entity.core';
import { Env } from '@start/env';
import SignInUseCase from '@use-case/authentication/sign-in.use-case';
import { AuthenticationSignInSchema } from '@validators/authentication.validator';

@Controller({
  route: 'authentication',
})
export default class AuthenticationSignInController {
  constructor(
    private readonly useCase: SignInUseCase = getInstanceByToken(SignInUseCase),
  ) {}

  @POST({
    url: '/sign-in',
    options: {
      schema: {
        tags: ['Authentication'],
        summary: 'Login de usuário',
        description:
          'Autentica um usuário com email e senha, retornando tokens JWT via cookies',
        body: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              description: 'Endereço de email do usuário',
            },
            password: {
              type: 'string',
              description: 'Senha do usuário',
            },
          },
        },
        response: {
          200: {
            description:
              'Login realizado com sucesso - Tokens JWT definidos via cookies',
            type: 'object',
            properties: {
              message: {
                type: 'string',
                enum: ['Login realizado com sucesso'],
              },
            },
            headers: {
              'Set-Cookie': {
                type: 'array',
                items: { type: 'string' },
                description:
                  'Cookies contendo accessToken (1 dia) e refreshToken (7 dias)',
              },
            },
          },
          400: {
            description: 'Requisição inválida - Erro de validação',
            type: 'object',
            properties: {
              message: { type: 'string' },
              code: { type: 'number', enum: [400] },
              cause: { type: 'string', enum: ['INVALID_PARAMETERS'] },
            },
          },
          401: {
            description: 'Não autorizado - Credenciais inválidas',
            type: 'object',
            properties: {
              message: { type: 'string' },
              code: { type: 'number', enum: [401] },
              cause: { type: 'string', enum: ['INVALID_CREDENTIALS'] },
            },
          },
          500: {
            description: 'Erro interno do servidor',
            type: 'object',
            properties: {
              message: { type: 'string' },
              code: { type: 'number', enum: [500] },
              cause: { type: 'string' },
            },
          },
        },
      },
    },
  })
  async handle(request: FastifyRequest, response: FastifyReply): Promise<void> {
    const payload = AuthenticationSignInSchema.parse(request.body);
    const result = await this.useCase.execute(payload);

    if (result.isLeft()) {
      const error = result.value;

      return response.status(error.code).send({
        message: error.message,
        code: error.code,
        cause: error.cause,
      });
    }

    const jwt: JWTPayload = {
      email: result?.value?.email!,
      name: result?.value?.name,
      sub: result?.value?.id,
    };

    const accessToken = await response.jwtSign(jwt, {
      sub: result?.value?.id,
      expiresIn: '1d',
    });

    const refreshToken = await response.jwtSign(
      {
        sub: result?.value?.id,
        type: 'refresh',
      },
      {
        sub: result?.value?.id,
        expiresIn: '7d',
      },
    );

    const cookieOptions = {
      path: '/',
      secure: Env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      httpOnly: true,
    };

    response
      .setCookie('accessToken', accessToken, {
        ...cookieOptions,
        maxAge: 24 * 60 * 60 * 1000, // 24 horas / 1 dia
      })
      .setCookie('refreshToken', refreshToken, {
        ...cookieOptions,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias em ms
      });

    return response.status(200).send();
  }
}
