import { Service } from 'fastify-decorators';
import type { Product } from 'generated/prisma/client';
import type z from 'zod';

import { prisma } from '@config/database.config';
import { left, right, type Either } from '@core/either.core';
import ApplicationException from '@exceptions/application.exception';
import type { ProductCreateBodySchema } from '@validators/product.validator';

type Response = Either<ApplicationException, Product>;
type Payload = z.infer<typeof ProductCreateBodySchema>;

@Service()
export default class ProductCreateUseCase {
  async execute(payload: Payload): Promise<Response> {
    const exist = await prisma.product.findUnique({
      where: {
        slug: payload.slug,
      },
    });

    if (exist)
      return left(
        ApplicationException.Conflict(
          'Este produto já existe.',
          'PRODUCT_ALREADY_EXISTS',
        ),
      );

    const created = await prisma.product.create({
      data: {
        ...payload,
      },
    });

    return right(created);
  }
}
