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
            'Este produto não foi encontrado',
            'PRODUCT_NOT_FOUND',
          ),
        );

      return right(product);
    } catch (error) {
      console.error(error);
      return left(
        ApplicationException.InternalServerError(
          'Erro interno do servidor',
          'SHOW_PRODUCT_ERROR',
        ),
      );
    }
  }
}