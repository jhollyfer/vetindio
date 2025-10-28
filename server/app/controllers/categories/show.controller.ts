/* eslint-disable no-unused-vars */
import type { FastifyReply, FastifyRequest } from 'fastify';
import { Controller, GET, getInstanceByToken } from 'fastify-decorators';

import CategoryShowUseCase from '@use-case/categories/show.use-case';
import { CategoryShowParamSchema } from '@validators/category.validator';

@Controller({
  route: 'categories',
})
export default class CategoryShowController {
  constructor(
    private readonly useCase: CategoryShowUseCase = getInstanceByToken(
      CategoryShowUseCase,
    ),
  ) {}

  @GET({
    url: '/:id',
  })
  async handle(request: FastifyRequest, response: FastifyReply): Promise<void> {
    const payload = CategoryShowParamSchema.parse(request.params);
    const result = await this.useCase.execute(payload);

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
