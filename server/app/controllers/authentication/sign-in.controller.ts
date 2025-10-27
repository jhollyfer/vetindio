/* eslint-disable no-unused-vars */
import { AuthenticationSignInSchema } from 'app/validators/authentication.validator';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { Controller, getInstanceByToken, POST } from 'fastify-decorators';

import type { JWTPayload } from '@core/entity.core';
import { Env } from '@start/env';
import SignInUseCase from '@use-case/authentication/sign-in.use-case';

@Controller({
  route: 'authentication',
})
export default class SignInController {
  constructor(
    private readonly useCase: SignInUseCase = getInstanceByToken(SignInUseCase),
  ) {}

  @POST({
    url: '/sign-in',
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
