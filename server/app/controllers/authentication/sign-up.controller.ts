/* eslint-disable no-unused-vars */
import type { FastifyReply, FastifyRequest } from 'fastify';
import { Controller, getInstanceByToken, POST } from 'fastify-decorators';

import SignUpUseCase from '@use-case/authentication/sign-up.use-case';
import { AuthenticationSignUpSchema } from '@validators/authentication.validator';

@Controller({
  route: 'authentication',
})
export default class AuthenticationSignUpController {
  constructor(
    private readonly useCase: SignUpUseCase = getInstanceByToken(SignUpUseCase),
  ) {}

  @POST({
    url: '/sign-up',
    options: {
      schema: {
        tags: ['Authentication'],
        summary: 'Cadastro de usuário',
        description: 'Cria uma nova conta de usuário com nome, email e senha',
        body: {
          type: 'object',
          required: ['name', 'email', 'password'],
          properties: {
            name: {
              type: 'string',
              description: 'Nome completo do usuário',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Endereço de email do usuário',
            },
            password: {
              type: 'string',
              description:
                'Senha do usuário (mín. 8 caracteres, deve conter: 1 maiúscula, 1 número, 1 caractere especial)',
              minLength: 8,
            },
          },
        },
        response: {
          201: {
            description: 'Usuário criado com sucesso',
            type: 'object',
            properties: {
              message: { type: 'string', enum: ['Usuário criado com sucesso'] },
            },
          },
          400: {
            description: 'Requisição inválida - Erro de validação',
            type: 'object',
            properties: {
              message: {
                type: 'string',
                description: 'Mensagem de erro de validação',
              },
              code: { type: 'number', enum: [400] },
              cause: { type: 'string', enum: ['INVALID_PARAMETERS'] },
            },
            examples: [
              {
                message: 'Falha na validação',
                code: 400,
                cause: 'INVALID_PARAMETERS',
              },
            ],
          },
          409: {
            description: 'Conflito - Usuário já existe',
            type: 'object',
            properties: {
              message: {
                type: 'string',
                description: 'Mensagem de erro de conflito',
              },
              code: { type: 'number', enum: [409] },
              cause: {
                type: 'string',
                enum: ['USER_ALREADY_EXISTS'],
              },
            },
            examples: [
              {
                message: 'Usuário já existe',
                code: 409,
                cause: 'USER_ALREADY_EXISTS',
              },
            ],
          },
          500: {
            description: 'Erro interno do servidor',
            type: 'object',
            properties: {
              message: { type: 'string', enum: ['Erro interno do servidor'] },
              code: { type: 'number', enum: [500] },
              cause: { type: 'string', enum: ['SIGN_UP_ERROR'] },
            },
            examples: [
              {
                message: 'Erro interno do servidor',
                code: 500,
                cause: 'SIGN_UP_ERROR',
              },
            ],
          },
        },
      },
    },
  })
  async handle(request: FastifyRequest, response: FastifyReply): Promise<void> {
    const payload = AuthenticationSignUpSchema.parse(request.body);

    const result = await this.useCase.execute(payload);

    if (result.isLeft()) {
      const error = result.value;
      return response.status(error.code).send({
        message: error.message,
        code: error.code,
        cause: error.cause,
      });
    }

    return response.status(201).send();
  }
}
