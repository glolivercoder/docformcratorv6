import { z } from 'zod';

export const PersonRole = {
  VENDEDOR: 'vendedor',
  COMPRADOR: 'comprador',
  LOCADOR: 'locador',
  LOCATARIO: 'locatario',
} as const;

export type PersonRoleType = typeof PersonRole[keyof typeof PersonRole];

export const PersonSchema = z.object({
  id: z.string().optional(),
  role: z.enum([PersonRole.VENDEDOR, PersonRole.COMPRADOR, PersonRole.LOCADOR, PersonRole.LOCATARIO]),
  isSpouse: z.boolean(),
  name: z.string(),
  nationality: z.string(),
  civilState: z.string(),
  profession: z.string(),
  rg: z.string(),
  rgIssuer: z.string(),
  rgIssueDate: z.string(),
  cpf: z.string(),
  address: z.string(),
  city: z.string(),
  state: z.string(),
  phone: z.string().optional(),
  email: z.string().optional(),
  documentType: z.string(),
  documentNumber: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Person = z.infer<typeof PersonSchema>;

export interface OCRResult {
  text: string;
  fields: {
    [key: string]: {
      value: string;
      confidence: number;
    };
  };
  confidence: number;
}
