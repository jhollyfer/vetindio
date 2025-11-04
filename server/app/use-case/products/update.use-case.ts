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
    try {
      const exist = await prisma.product.findFirst({
        where: {
          id: payload.id,
          trashed: false,
        },
      });

      if (!exist)
        return left(
          ApplicationException.NotFound(
            'Este produto não foi encontrado.',
            'PRODUCT_NOT_FOUND',
          ),
        );

      if (exist.slug !== payload.slug) {
        const slugExists = await prisma.product.findFirst({
          where: {
            slug: payload.slug,
            trashed: false,
          },
        });

        if (slugExists)
          return left(
            ApplicationException.Conflict(
              'Este produto já existe',
              'PRODUCT_ALREADY_EXISTS',
            ),
          );
      }

      const updated = await prisma.product.update({
        where: {
          id: payload.id,
        },
        data: {
          name: payload.name,
          slug: payload.slug,
          description: payload.description,
          price: payload.price,
          stock: payload.stock,
          sku: payload.sku,
        },
      });

      return right(updated);
    } catch (error) {
      console.error(error);
      return left(
        ApplicationException.InternalServerError(
          'Erro interno do servidor',
          'UPDATE_PRODUCT_ERROR',
        ),
      );
    }
  }
}