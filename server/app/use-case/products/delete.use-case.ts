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
    const product = await prisma.product.findUnique({
      where: {
        id: payload.id,
      },
    });

    if (!product)
      return left(
        ApplicationException.NotFound(
          'Este produto não foi encontrado.',
          'PRODUCT_NOT_FOUND',
        ),
      );

    return right(null);
  }
}
