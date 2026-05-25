import { z } from 'zod';

export const SphereEnum = z.enum(['PRIVAT', 'BUSINESS'] as const);

export const QuestionSchema = z.object({
  id: z.string(),
  sphere: SphereEnum,
  isActive: z.boolean(),
  label: z.string(),
  sliderDescription: z.string(),
});

export const EvaluationHistoryItemSchema = z.object({
  timestamp: z.string().datetime({ message: 'Ungültiges Zeitstempel-Format.' }),
  score: z.number().min(0).max(100),
  tier: z.number().int().min(1).max(4),
  comment: z.string().optional(),
  taskId: z.string().optional(),
});

export const ContactCustomFieldsSchema = z.array(EvaluationHistoryItemSchema);

export function createDynamicFormSchema(activeQuestionIds: string[]) {
  const shape: Record<string, z.ZodTypeAny> = {};

  activeQuestionIds.forEach((id) => {
    shape[id] = z.coerce.number().int().min(1).max(5, { message: 'Wert muss zwischen 1 und 5 liegen.' });
  });

  shape['comment'] = z.string().optional();
  shape['interval'] = z.enum(['3', '6', '12'] as const, {
    error: 'Bitte wählen Sie ein gültiges Erinnerungsintervall.',
  });

  return z.object(shape);
}