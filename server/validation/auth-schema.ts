import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    username: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
    name: z.string().min(2).max(50),
    email: z.string().email(),
    password: z.string().min(6).max(100),
  })
});

export const loginSchema = z.object({
  body: z.object({
    username: z.string(),
    password: z.string(),
  })
});

export const adminLoginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string(),
  })
});

export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(50).optional(),
    email: z.string().email().optional(),
    password: z.string().min(6).max(100).optional(),
  }).refine(data => data.name || data.email || data.password, {
    message: "At least one field must be provided for update",
  })
});
