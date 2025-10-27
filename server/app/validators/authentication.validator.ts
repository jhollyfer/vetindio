import z from 'zod';

export const AuthenticationSignUpSchema = z.object({
  name: z.string().trim(),
  email: z.email().trim(),
  password: z
    .string()
    .trim()
    .min(8, 'A senha deve conter ao menos 8 caracteres')
    .regex(/[A-Z]/, 'A senha deve conter ao menos 1 letra maiúscula')
    .regex(
      /[!@#$%^&*(),.?":{}|<>]/,
      'A senha deve conter ao menos 1 caractere especial',
    )
    .regex(/[0-9]/, 'A senha deve conter ao menos 1 número'),
});

export const AuthenticationSignInSchema = z.object({
  email: z.email().trim(),
  password: z.string().trim(),
});
