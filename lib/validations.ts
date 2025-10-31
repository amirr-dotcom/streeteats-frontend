import { z } from 'zod';

/**
 * Validation schemas using Zod
 */

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['vendor', 'admin']),
});

export const shopSchema = z.object({
  name: z.string().min(1, 'Shop name is required'),
  description: z.string().optional(),
  location: z.string().optional(),
  imageUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  qrCodeUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
});

export const menuItemSchema = z.object({
  name: z.string().min(1, 'Menu item name is required'),
  description: z.string().optional(),
  price: z.number().min(0.01, 'Price must be greater than 0'),
  isVeg: z.boolean(),
  imageUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  shopId: z.string().uuid('Invalid shop ID'),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ShopInput = z.infer<typeof shopSchema>;
export type MenuItemInput = z.infer<typeof menuItemSchema>;

