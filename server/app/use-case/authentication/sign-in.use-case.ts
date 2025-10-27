import type { AuthenticationSignInSchema } from 'app/validators/authentication.validator';
import { compare } from 'bcryptjs';
import { Service } from 'fastify-decorators';
import type { User } from 'generated/prisma/client';
import type z from 'zod';

import { prisma } from '@config/database.config';
import { left, right, type Either } from '@core/either.core';
import ApplicationException from '@exceptions/application.exception';

type Response = Either<ApplicationException, User>;
type Payload = z.infer<typeof AuthenticationSignInSchema>;

@Service()
export default class SignInUseCase {
  async execute(payload: Payload): Promise<Response> {
    const user = await prisma.user.findUnique({
      where: {
        email: payload.email,
      },
    });

    if (!user)
      return left(
        ApplicationException.Unauthorized(
          'Credenciais inválidas',
          'INVALID_CREDENTIALS',
        ),
      );

    const passwordMatch = await compare(payload.password, user.password);

    if (!passwordMatch)
      return left(
        ApplicationException.Unauthorized(
          'Credenciais inválidas',
          'INVALID_CREDENTIALS',
        ),
      );

    return right(user);
  }
}
