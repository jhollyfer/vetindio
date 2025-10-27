import type { AuthenticationSignUpSchema } from 'app/validators/authentication.validator';
import { hash } from 'bcryptjs';
import { Service } from 'fastify-decorators';
import type { User } from 'generated/prisma/client';
import type z from 'zod';

import { prisma } from '@config/database.config';
import { left, right, type Either } from '@core/either.core';
import ApplicationException from '@exceptions/application.exception';

type Response = Either<ApplicationException, User>;
type Payload = z.infer<typeof AuthenticationSignUpSchema>;

@Service()
export default class SignUpUseCase {
  async execute(payload: Payload): Promise<Response> {
    const exist = await prisma.user.findUnique({
      where: {
        email: payload.email,
      },
    });

    if (exist)
      return left(
        ApplicationException.Conflict(
          'Este email já está em uso.',
          'EMAIL_IN_USE',
        ),
      );

    const passwordHash = await hash(payload.password, 6);

    const created = await prisma.user.create({
      data: {
        ...payload,
        password: passwordHash,
      },
    });

    return right(created);
  }
}
