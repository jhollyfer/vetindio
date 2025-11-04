import { Service } from 'fastify-decorators';
import type { Category } from 'generated/prisma/client';
import type z from 'zod';

import { prisma } from '@config/database.config';
import { left, right, type Either } from '@core/either.core';
import ApplicationException from '@exceptions/application.exception';
import type { CategoryCreateBodySchema } from '@validators/category.validator';

type Response = Either<ApplicationException, Category>;
type Payload = z.infer<typeof CategoryCreateBodySchema>;

@Service()
export default class CategoryCreateUseCase {
  async execute(payload: Payload): Promise<Response> {
    try {
      const exist = await prisma.category.findFirst({
        where: {
          slug: payload.slug,
          trashed: false,
        },
      });

      if (exist)
        return left(
          ApplicationException.Conflict(
            'Esta categoria já está em uso.',
            'CATEGORY_IN_USE',
          ),
        );

      const created = await prisma.category.create({
        data: {
          name: payload.name,
          slug: payload.slug,
          description: payload.description,
          status: payload.status,
        },
      });

      return right(created);
    } catch (error) {
      console.error(error);
      return left(
        ApplicationException.InternalServerError(
          'Erro interno do servidor',
          'CREATE_CATEGORY_ERROR',
        ),
      );
    }
  }
}
