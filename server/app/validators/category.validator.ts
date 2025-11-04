import { CategoryStatusEnum } from 'generated/prisma/client';
import slugify from 'slugify';
import z from 'zod';

export const CategoryCreateBodySchema = z
  .object({
    name: z.string().trim().min(1, 'Nome é obrigatório'),
    description: z.string().trim().optional(),
    slug: z.string().trim().optional(),
    status: z.nativeEnum(CategoryStatusEnum).default(CategoryStatusEnum.ACTIVE),
  })
  .transform(function (value, context) {
    return {
      ...value,
      description: (value.description || context.value?.description) ?? null,
      slug: slugify(value.name ?? context.value?.name, {
        lower: true,
        trim: true,
      }),
    };
  });

export const CategoryShowParamSchema = z.object({
  id: z.uuid().trim(),
});

export const CategoryDeleteParamSchema = CategoryShowParamSchema.clone();

export const CategoryUpdateBodySchema = CategoryCreateBodySchema.clone();
export const CategoryUpdateParamSchema = CategoryShowParamSchema.clone();

export const CategoryListPaginatedSchema = z.object({
  page: z.coerce.number().default(1),
  perPage: z.coerce.number().default(50),
  search: z.string().trim().optional(),
  // sub: z.string().trim().optional(),
});
