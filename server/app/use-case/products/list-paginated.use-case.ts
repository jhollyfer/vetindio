import { Service } from 'fastify-decorators';
import { Product, Prisma } from 'generated/prisma/client';
import z from 'zod';

import { prisma } from '@config/database.config';
import { Either, left, right } from '@core/either.core';
import { Paginated } from '@core/entity.core';
import ApplicationException from '@exceptions/application.exception';
import { ProductListPaginatedSchema } from '@validators/product.validator';

type Response = Either<ApplicationException, Paginated<Product>>;
type Payload = z.infer<typeof ProductListPaginatedSchema>;

@Service()
export default class ProductListPaginatedUseCase {
  async execute(payload: Payload): Promise<Response> {
    try {
      const skip = (payload.page - 1) * payload.perPage;

      const where: Prisma.ProductWhereInput = {
        trashed: false,
      };

      if (payload.search) {
        where.OR = [
          { name: { contains: payload.search, mode: 'insensitive' } },
          { description: { contains: payload.search, mode: 'insensitive' } },
          { sku: { contains: payload.search, mode: 'insensitive' } },
        ];
      }

      const [products, total] = await Promise.all([
        prisma.product.findMany({
          where,
          skip,
          take: payload.perPage,
          orderBy: { name: 'asc' },
        }),
        prisma.product.count({ where }),
      ]);

      const lastPage = Math.ceil(total / payload.perPage);

      const meta = {
        total,
        perPage: payload.perPage,
        currentPage: payload.page,
        lastPage,
        firstPage: total > 0 ? 1 : 0,
      };

      return right({
        meta,
        data: products,
      });
    } catch (error) {
      console.error(error);
      return left(
        ApplicationException.InternalServerError(
          'Internal server error',
          'LIST_PRODUCT_PAGINATED_ERROR',
        ),
      );
    }
  }
}