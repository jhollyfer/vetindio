/* eslint-disable no-unused-vars */
import type { FastifyReply, FastifyRequest } from 'fastify';
import { Controller, GET, getInstanceByToken } from 'fastify-decorators';

import ProductShowUseCase from '@use-case/products/show.use-case';
import { ProductShowParamSchema } from '@validators/product.validator';

@Controller({
  route: 'products',
})
export default class ProductShowController {
  constructor(
    private readonly useCase: ProductShowUseCase = getInstanceByToken(
      ProductShowUseCase,
    ),
  ) {}

  @GET({
    url: '/:id',
    options: {
      schema: {
        tags: ['Products'],
        summary: 'Buscar produto por ID',
        description: 'Retorna um produto específico pelo seu ID',
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
            description: 'Produto encontrado com sucesso',
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              name: { type: 'string' },
              description: { type: 'string', nullable: true },
              slug: { type: 'string' },
              price: { type: 'number' },
              stock: { type: 'number' },
              sku: { type: 'string' },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
              trashed: { type: 'boolean' },
              trashedAt: { type: 'string', format: 'date-time', nullable: true },
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
    const payload = ProductShowParamSchema.parse(request.params);
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