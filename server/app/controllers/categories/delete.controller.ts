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
    options: {
      schema: {
        tags: ['Categories'],
        summary: 'Deletar categoria (soft delete)',
        description:
          'Marca uma categoria como removida (soft delete) pelo seu ID',
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'ID único da categoria',
            },
          },
        },
        response: {
          200: {
            description: 'Categoria removida com sucesso (soft delete)',
            type: 'object',
            properties: {
              message: {
                type: 'string',
                enum: ['Categoria deletada com sucesso'],
              },
            },
          },
          400: {
            description: 'Requisição inválida - ID inválido',
            type: 'object',
            properties: {
              message: { type: 'string' },
              code: { type: 'number', enum: [400] },
              cause: { type: 'string', enum: ['INVALID_PARAMETERS'] },
            },
          },
          404: {
            description: 'Categoria não encontrada',
            type: 'object',
            properties: {
              message: { type: 'string' },
              code: { type: 'number', enum: [404] },
              cause: { type: 'string', enum: ['CATEGORY_NOT_FOUND'] },
            },
          },
          500: {
            description: 'Erro interno do servidor',
            type: 'object',
            properties: {
              message: { type: 'string' },
              code: { type: 'number', enum: [500] },
              cause: { type: 'string' },
            },
          },
        },
      },
    },
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

    return response.status(200).send({
      message: 'Categoria deletada com sucesso',
    });
  }
}
