import slugify from 'slugify';
import z from 'zod';

export const CategoryCreateBodySchema = z
  .object({
    name: z.string().trim(),
    description: z.string().trim().optional(),
    slug: z.string().trim().optional(),
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
