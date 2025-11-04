/* eslint-disable no-unused-vars */
import type { FastifyReply, FastifyRequest } from 'fastify';
import { Controller, getInstanceByToken, PUT } from 'fastify-decorators';

import ProductUpdateUseCase from '@use-case/products/update.use-case';
import {
  ProductUpdateBodySchema,
  ProductUpdateParamSchema,
} from '@validators/product.validator';

@Controller({
  route: 'products',
})
export default class ProductUpdateController {
  constructor(
    private readonly useCase: ProductUpdateUseCase = getInstanceByToken(
      ProductUpdateUseCase,
    ),
  ) {}

  @PUT({
    url: '/:id',
    options: {
      schema: {
        tags: ['Products'],
        summary: 'Atualizar produto',
        description: 'Atualiza um produto existente pelo seu ID',
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
        body: {
          type: 'object',
          required: ['name', 'price', 'stock', 'sku'],
          properties: {
            name: {
              type: 'string',
              minLength: 1,
              description: 'Nome do produto (obrigatório)',
            },
            description: {
              type: 'string',
              description: 'Descrição do produto (opcional)',
            },
            slug: {
              type: 'string',
              description:
                'Slug do produto (gerado automaticamente se não fornecido)',
            },
            price: {
              type: 'number',
              minimum: 0.01,
              description: 'Preço do produto (obrigatório)',
            },
            stock: {
              type: 'number',
              minimum: 0,
              description: 'Quantidade em estoque (obrigatório)',
            },
            sku: {
              type: 'string',
              minLength: 1,
              description: 'SKU único do produto (obrigatório)',
            },
          },
        },
        response: {
          200: {
            description: 'Produto atualizado com sucesso',
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
            description: 'Requisição inválida - Erro de validação',
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
          409: {
            description: 'Conflito - SKU do produto já existe',
            type: 'object',
            properties: {
              message: { type: 'string' },
              code: { type: 'number', enum: [409] },
              cause: { type: 'string', enum: ['PRODUCT_ALREADY_EXISTS'] },
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
    const params = ProductUpdateParamSchema.parse(request.params);
    const payload = ProductUpdateBodySchema.parse(request.body);
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