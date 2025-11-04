/* eslint-disable no-unused-vars */

import type { FastifyReply, FastifyRequest } from 'fastify';
import { Controller, GET, getInstanceByToken } from 'fastify-decorators';

import ProductListPaginatedUseCase from '@use-case/products/list-paginated.use-case';
import { ProductListPaginatedSchema } from '@validators/product.validator';

@Controller({
  route: '/products',
})
export default class ProductPaginatedController {
  constructor(
    private readonly useCase: ProductListPaginatedUseCase = getInstanceByToken(
      ProductListPaginatedUseCase,
    ),
  ) {}

  @GET({
    url: '/paginated',
    options: {
      schema: {
        tags: ['Products'],
        summary: 'Listar produtos paginados',
        description:
          'Retorna uma lista paginada de produtos com opções de busca',
        querystring: {
          type: 'object',
          properties: {
            page: {
              type: 'number',
              minimum: 1,
              default: 1,
              description: 'Número da página (inicia em 1)',
            },
            perPage: {
              type: 'number',
              minimum: 1,
              maximum: 100,
              default: 50,
              description: 'Quantidade de itens por página (máx. 100)',
            },
            search: {
              type: 'string',
              description: 'Termo de busca para filtrar produtos por nome, descrição ou SKU',
            },
          },
        },
        response: {
          200: {
            description: 'Lista de produtos paginados',
            type: 'object',
            properties: {
              data: {
                type: 'array',
                items: {
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
                    trashedAt: {
                      type: 'string',
                      format: 'date-time',
                      nullable: true,
                    },
                  },
                },
              },
              meta: {
                type: 'object',
                properties: {
                  total: { type: 'number' },
                  perPage: { type: 'number' },
                  currentPage: { type: 'number' },
                  lastPage: { type: 'number' },
                  firstPage: { type: 'number' },
                },
              },
            },
          },
          400: {
            description: 'Requisição inválida - Parâmetros de query inválidos',
            type: 'object',
            properties: {
              message: { type: 'string' },
              code: { type: 'number', enum: [400] },
              cause: { type: 'string', enum: ['INVALID_PARAMETERS'] },
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
    const query = ProductListPaginatedSchema.parse(request.query);

    const result = await this.useCase.execute({
      ...query,
      // sub: request?.user?.sub,
    });

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