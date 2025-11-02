import { Service } from 'fastify-decorators';
import type { Product } from 'generated/prisma/client';
import type z from 'zod';

import { prisma } from '@config/database.config';
import { left, right, type Either } from '@core/either.core';
import ApplicationException from '@exceptions/application.exception';
import type { ProductShowParamSchema } from '@validators/product.validator';

type Response = Either<ApplicationException, Product>;
type Payload = z.infer<typeof ProductShowParamSchema>;

@Service()
export default class ProductShowUseCase {
  async execute(payload: Payload): Promise<Response> {
    const product = await prisma.product.findUnique({
      where: {
        id: payload.id,
      },
    });

    if (!product)
      return left(
        ApplicationException.NotFound(
          'Este produto não foi encontrado',
          'PRODUCT_NOT_FOUND',
        ),
      );

    return right(product);
  }
}
