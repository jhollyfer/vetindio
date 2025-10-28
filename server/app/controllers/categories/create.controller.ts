/* eslint-disable no-unused-vars */
import type { FastifyReply, FastifyRequest } from 'fastify';
import { Controller, getInstanceByToken, POST } from 'fastify-decorators';

import CategoryCreateUseCase from '@use-case/categories/create.use-case';
import { CategoryCreateBodySchema } from '@validators/category.validator';

@Controller({
  route: 'categories',
})
export default class CategoryCreateController {
  constructor(
    private readonly useCase: CategoryCreateUseCase = getInstanceByToken(
      CategoryCreateUseCase,
    ),
  ) {}

  @POST({
    url: '',
  })
  async handle(request: FastifyRequest, response: FastifyReply): Promise<void> {
    const payload = CategoryCreateBodySchema.parse(request.body);
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
