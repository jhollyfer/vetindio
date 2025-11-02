import slugify from 'slugify';
import z from 'zod';

export const ProductCreateBodySchema = z
  .object({
    name: z.string().trim(),
    description: z.string().trim().optional(),
    slug: z.string().trim().optional(),
    price: z.number().positive(),
    stock: z.number().positive(),
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

export const ProductShowParamSchema = z.object({
  id: z.uuid().trim(),
});

export const ProductDeleteParamSchema = ProductShowParamSchema.clone();

export const ProductUpdateBodySchema = ProductCreateBodySchema.clone();
export const ProductUpdateParamSchema = ProductShowParamSchema.clone();
