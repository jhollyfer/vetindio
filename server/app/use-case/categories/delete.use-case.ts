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
    const category = await prisma.category.findUnique({
      where: {
        id: payload.id,
      },
    });

    if (!category)
      return left(
        ApplicationException.NotFound(
          'Esta categoria não foi encontrada.',
          'CATEGORY_NOT_FOUND',
        ),
      );

    // TODO: VERIFICAR SE REALMENTE É NECESSÁRIO EXCLUIR A CATEGORIA

    // await prisma.category.delete({
    //   where: {
    //     id: payload.id,
    //   },
    // });

    return right(null);
  }
}
