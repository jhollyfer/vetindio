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
    options: {
      schema: {
        tags: ['Categories'],
        summary: 'Criar categoria',
        description: 'Cria uma nova categoria com nome e descrição opcional',
        body: {
          type: 'object',
          required: ['name'],
          properties: {
            name: {
              type: 'string',
              minLength: 1,
              description: 'Nome da categoria (obrigatório)',
            },
            description: {
              type: 'string',
              description: 'Descrição da categoria (opcional)',
            },
            slug: {
              type: 'string',
              description:
                'Slug da categoria (gerado automaticamente se não fornecido)',
            },
            status: {
              type: 'string',
              enum: ['ACTIVE', 'INACTIVE'],
              default: 'ACTIVE',
              description: 'Status da categoria (padrão: ACTIVE)',
            },
          },
        },
        response: {
          200: {
            description: 'Categoria criada com sucesso',
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              name: { type: 'string' },
              description: { type: 'string', nullable: true },
              slug: { type: 'string' },
              status: { type: 'string', enum: ['ACTIVE', 'INACTIVE'] },
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
          409: {
            description: 'Conflito - Categoria já existe',
            type: 'object',
            properties: {
              message: { type: 'string' },
              code: { type: 'number', enum: [409] },
              cause: { type: 'string', enum: ['CATEGORY_IN_USE'] },
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
