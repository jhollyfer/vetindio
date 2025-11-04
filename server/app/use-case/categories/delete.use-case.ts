import { Service } from 'fastify-decorators';
import type z from 'zod';

import { prisma } from '@config/database.config';
import { left, right, type Either } from '@core/either.core';
import ApplicationException from '@exceptions/application.exception';
import type { CategoryDeleteParamSchema } from '@validators/category.validator';

type Response = Either<ApplicationException, null>;
type Payload = z.infer<typeof CategoryDeleteParamSchema>;

@Service()
export default class CategoryDeleteUseCase {
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

      await prisma.category.update({
        where: {
          id: payload.id,
        },
        data: {
          trashed: true,
          trashedAt: new Date(),
        },
      });

      return right(null);
    } catch (error) {
      console.error(error);
      return left(
        ApplicationException.InternalServerError(
          'Erro interno do servidor',
          'DELETE_CATEGORY_ERROR',
        ),
      );
    }
  }
}
