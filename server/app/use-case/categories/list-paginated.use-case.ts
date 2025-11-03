import { prisma } from '@config/database.config';
import { Either, left, right } from '@core/either.core';
import { Paginated } from '@core/entity.core';
import ApplicationException from '@exceptions/application.exception';
import { CategoryListPaginatedSchema } from '@validators/category.validator';
import { Service } from 'fastify-decorators';
import { Category, Prisma } from 'generated/prisma/client';
import z from 'zod';

type Response = Either<ApplicationException, Paginated<Category>>;
type Payload = z.infer<typeof CategoryListPaginatedSchema>;

@Service()
export default class ListCategoryPaginatedUseCase {
  async execute(payload: Payload): Promise<Response> {
    try {
      const skip = (payload.page - 1) * payload.perPage;

      const where: Prisma.CategoryWhereInput = {};

      if (payload.search) {
        where.OR = [
          { name: { contains: payload.search, mode: 'insensitive' } },
          { description: { contains: payload.search, mode: 'insensitive' } },
        ];
      }

      const [categories, total] = await Promise.all([
        prisma.category.findMany({
          where,
          skip,
          take: payload.perPage,
          orderBy: { name: 'asc' },
        }),
        prisma.category.count({ where }),
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
        data: categories,
      });
    } catch (error) {
      console.error(error);
      return left(
        ApplicationException.InternalServerError(
          'Internal server error',
          'LIST_CATEGORY_PAGINATED_ERROR',
        ),
      );
    }
  }
}
