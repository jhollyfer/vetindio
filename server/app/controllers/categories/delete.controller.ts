/* eslint-disable no-unused-vars */
import type { FastifyReply, FastifyRequest } from 'fastify';
import { Controller, DELETE, getInstanceByToken } from 'fastify-decorators';

import CategoryDeleteUseCase from '@use-case/categories/delete.use-case';
import { CategoryDeleteParamSchema } from '@validators/category.validator';

@Controller({
  route: 'categories',
})
export default class CategoryDeleteController {
  constructor(
    private readonly useCase: CategoryDeleteUseCase = getInstanceByToken(
      CategoryDeleteUseCase,
    ),
  ) {}

  @DELETE({
    url: '/:id',
  })
  async handle(request: FastifyRequest, response: FastifyReply): Promise<void> {
    const payload = CategoryDeleteParamSchema.parse(request.params);
    const result = await this.useCase.execute(payload);

    if (result.isLeft()) {
      const error = result.value;

      return response.status(error.code).send({
        message: error.message,
        code: error.code,
        cause: error.cause,
      });
    }

    return response.status(200).send();
  }
}
