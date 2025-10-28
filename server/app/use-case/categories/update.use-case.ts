import type {
  CategoryUpdateBodySchema,
  CategoryUpdateParamSchema,
} from 'app/validators/category.validator';
import { Service } from 'fastify-decorators';
import type { Category } from 'generated/prisma/client';
import type z from 'zod';

import { prisma } from '@config/database.config';
import { left, right, type Either } from '@core/either.core';
import ApplicationException from '@exceptions/application.exception';

type Response = Either<ApplicationException, Category>;
type Payload = z.infer<typeof CategoryUpdateBodySchema> &
  z.infer<typeof CategoryUpdateParamSchema>;

@Service()
export default class CategoryUpdateUseCase {
  async execute(payload: Payload): Promise<Response> {
    const exist = await prisma.category.findUnique({
      where: {
        id: payload.id,
      },
    });

    if (!exist)
      return left(
        ApplicationException.NotFound(
          'Esta categoria não foi encontrada.',
          'CATEGORY_NOT_FOUND',
        ),
      );

    if (exist.slug !== payload.slug) {
      const exist = await prisma.category.findUnique({
        where: {
          slug: payload.slug,
        },
      });

      if (exist)
        return left(
          ApplicationException.Conflict(
            'Esta categoria já está em uso.',
            'CATEGORY_IN_USE',
          ),
        );
    }

    const updated = await prisma.category.update({
      where: {
        id: payload.id,
      },
      data: {
        ...payload,
      },
    });

    return right(updated);
  }
}
