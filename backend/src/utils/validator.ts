import { z } from 'zod';
import { AppError } from './errorHandler';

export const validateRequest = (schema: z.ZodSchema) => {
  return async (req: any, res: any, next: any) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        next(new AppError(error.errors[0].message, 400));
      } else {
        next(error);
      }
    }
  };
};

// Common validation schemas
export const schemas = {
  user: {
    create: z.object({
      body: z.object({
        name: z.string().min(2).max(50),
        email: z.string().email(),
        password: z.string().min(6),
        role: z.enum(['admin', 'user']).default('user'),
      }),
    }),
    update: z.object({
      body: z.object({
        name: z.string().min(2).max(50).optional(),
        email: z.string().email().optional(),
        role: z.enum(['admin', 'user']).optional(),
      }),
    }),
  },
  auth: {
    login: z.object({
      body: z.object({
        email: z.string().email(),
        password: z.string(),
      }),
    }),
  },
  content: {
    create: z.object({
      body: z.object({
        title: z.string().min(1).max(100),
        content: z.string().min(1),
        type: z.enum(['page', 'post']),
        status: z.enum(['draft', 'published']).default('draft'),
      }),
    }),
    update: z.object({
      body: z.object({
        title: z.string().min(1).max(100).optional(),
        content: z.string().min(1).optional(),
        type: z.enum(['page', 'post']).optional(),
        status: z.enum(['draft', 'published']).optional(),
      }),
    }),
  },
}; 