/* eslint-disable no-unused-vars */
import type { FastifyReply, FastifyRequest } from 'fastify';
import { Controller, DELETE, getInstanceByToken } from 'fastify-decorators';

import ProductDeleteUseCase from '@use-case/products/delete.use-case';
import { ProductDeleteParamSchema } from '@validators/product.validator';

@Controller({
  route: 'products',
})
export default class ProductDeleteController {
  constructor(
    private readonly useCase: ProductDeleteUseCase = getInstanceByToken(
      ProductDeleteUseCase,
    ),
  ) {}

  @DELETE({
    url: '/:id',
    options: {
      schema: {
        tags: ['Products'],
        summary: 'Deletar produto (soft delete)',
        description:
          'Marca um produto como removido (soft delete) pelo seu ID',
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'ID único do produto',
            },
          },
        },
        response: {
          200: {
            description: 'Produto removido com sucesso (soft delete)',
            type: 'object',
            properties: {
              message: {
                type: 'string',
                enum: ['Produto deletado com sucesso'],
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
            description: 'Produto não encontrado',
            type: 'object',
            properties: {
              message: { type: 'string' },
              code: { type: 'number', enum: [404] },
              cause: { type: 'string', enum: ['PRODUCT_NOT_FOUND'] },
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
    const payload = ProductDeleteParamSchema.parse(request.params);
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
      message: 'Produto deletado com sucesso',
    });
  }
}