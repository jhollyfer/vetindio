import { Service } from 'fastify-decorators';
import type { Product } from 'generated/prisma/client';
import type z from 'zod';

import { prisma } from '@config/database.config';
import { left, right, type Either } from '@core/either.core';
import ApplicationException from '@exceptions/application.exception';
import type {
  ProductUpdateBodySchema,
  ProductUpdateParamSchema,
} from '@validators/product.validator';

type Response = Either<ApplicationException, Product>;
type Payload = z.infer<typeof ProductUpdateBodySchema> &
  z.infer<typeof ProductUpdateParamSchema>;

@Service()
export default class ProductUpdateUseCase {
  async execute(payload: Payload): Promise<Response> {
    const exist = await prisma.product.findUnique({
      where: {
        id: payload.id,
      },
    });

    if (!exist)
      return left(
        ApplicationException.NotFound(
          'Esta categoria não foi encontrada.',
          'product_NOT_FOUND',
        ),
      );

    if (exist.slug !== payload.slug) {
      const exist = await prisma.product.findUnique({
        where: {
          slug: payload.slug,
        },
      });

      if (exist)
        return left(
          ApplicationException.Conflict(
            'Este product já existe',
            'PRODUCT_ALREADY_EXISTS',
          ),
        );
    }

    const updated = await prisma.product.update({
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
