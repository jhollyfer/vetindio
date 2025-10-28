/* eslint-disable no-unused-vars */
import type { FastifyReply, FastifyRequest } from 'fastify';
import { Controller, getInstanceByToken, PUT } from 'fastify-decorators';

import CategoryUpdateUseCase from '@use-case/categories/update.use-case';
import {
  CategoryUpdateBodySchema,
  CategoryUpdateParamSchema,
} from '@validators/category.validator';

@Controller({
  route: 'categories',
})
export default class CategoryCreateController {
  constructor(
    private readonly useCase: CategoryUpdateUseCase = getInstanceByToken(
      CategoryUpdateUseCase,
    ),
  ) {}

  @PUT({
    url: '/:id',
  })
  async handle(request: FastifyRequest, response: FastifyReply): Promise<void> {
    const params = CategoryUpdateParamSchema.parse(request.params);
    const payload = CategoryUpdateBodySchema.parse(request.body);
    const result = await this.useCase.execute({ ...params, ...payload });

    if (result.isLeft()) {
      const error = result.value;

      return response.status(error.code).send({
        message: error.message,
        code: error.code,
        cause: error.cause,
      });
    }

    return response.status(200).send(result.value);
  }
}
