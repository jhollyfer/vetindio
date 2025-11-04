import { Service } from 'fastify-decorators';
import type { Category } from 'generated/prisma/client';
import type z from 'zod';

import { prisma } from '@config/database.config';
import { left, right, type Either } from '@core/either.core';
import ApplicationException from '@exceptions/application.exception';
import type { CategoryShowParamSchema } from '@validators/category.validator';

type Response = Either<ApplicationException, Category>;
type Payload = z.infer<typeof CategoryShowParamSchema>;

@Service()
export default class CategoryShowUseCase {
  async execute(payload: Payload): Promise<Response> {
    try {
      const category = await prisma.category.findFirst({
        where: {
          id: payload.id,
          trashed: false,
        },
      });

      if (!category)
        return left(
          ApplicationException.NotFound(
            'Esta categoria não foi encontrada.',
            'CATEGORY_NOT_FOUND',
          ),
        );

      return right(category);
    } catch (error) {
      console.error(error);
      return left(
        ApplicationException.InternalServerError(
          'Erro interno do servidor',
          'SHOW_CATEGORY_ERROR',
        ),
      );
    }
  }
}
