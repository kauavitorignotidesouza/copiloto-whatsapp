import { z } from "zod/v4";

export const loginSchema = z.object({
  email: z.email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Nome é obrigatório"),
  email: z.email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  companyName: z.string().min(2, "Nome da empresa é obrigatório"),
});

export const contactSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  waId: z.string().min(10, "Número WhatsApp inválido"),
  email: z.email("Email inválido").optional().or(z.literal("")),
  company: z.string().optional(),
  funnelStage: z.string().optional(),
  notes: z.string().optional(),
});

export const productSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
  sku: z.string().optional(),
  price: z.number().positive("Preço deve ser positivo"),
  category: z.string().optional(),
  stockQuantity: z.number().int().min(0).optional(),
});

export const sendMessageSchema = z.object({
  content: z.string().min(1, "Mensagem não pode ser vazia"),
  type: z.enum(["text", "template", "image", "document"]).default("text"),
  templateName: z.string().optional(),
});
