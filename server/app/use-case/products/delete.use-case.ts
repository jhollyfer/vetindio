import { Service } from 'fastify-decorators';
import type z from 'zod';

import { prisma } from '@config/database.config';
import { left, right, type Either } from '@core/either.core';
import ApplicationException from '@exceptions/application.exception';
import type { ProductDeleteParamSchema } from '@validators/product.validator';

type Response = Either<ApplicationException, null>;
type Payload = z.infer<typeof ProductDeleteParamSchema>;

@Service()
export default class ProductDeleteUseCase {
  async execute(payload: Payload): Promise<Response> {
    try {
      const product = await prisma.product.findFirst({
        where: {
          id: payload.id,
          trashed: false,
        },
      });

      if (!product)
        return left(
          ApplicationException.NotFound(
            'Este produto não foi encontrado.',
            'PRODUCT_NOT_FOUND',
          ),
        );

      await prisma.product.update({
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
          'DELETE_PRODUCT_ERROR',
        ),
      );
    }
  }
}