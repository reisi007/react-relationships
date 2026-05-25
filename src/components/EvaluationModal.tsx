import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import questionsData from '../data/questions.json';
import { createDynamicFormSchema, QuestionSchema } from '../data/schemas';
import { z } from 'zod';

const allQuestions = z.array(QuestionSchema).parse(questionsData);

interface EvaluationModalProps {
  isOpen: boolean;
  contactName: string;
  sphere: 'PRIVAT' | 'BUSINESS';
  onClose: () => void;
  onSave: (formData: Record<string, string | number>) => void;
}

export default function EvaluationModal({ isOpen, contactName, sphere, onClose, onSave }: EvaluationModalProps) {
  const activeQuestions = allQuestions.filter(q => q.sphere === sphere && q.isActive);
  const activeIds = activeQuestions.map(q => q.id);

  const dynamicSchema = createDynamicFormSchema(activeIds);
  type FormValues = z.infer<typeof dynamicSchema>;

  const defaultValues = activeIds.reduce((acc, id) => {
    acc[id] = 3;
    return acc;
  }, {} as Record<string, string | number>);

  defaultValues['comment'] = '';
  defaultValues['interval'] = '6';

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(dynamicSchema),
    defaultValues
  });

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    onSave({
      ...data,
      sphere,
      timestamp: new Date().toISOString()
    });
  };

  if (!isOpen) return null;

  return (
      <div className="modal modal-open role-dialog">
        <div className="modal-box max-w-lg border border-base-300 shadow-2xl">
          <h3 className="text-xl font-bold mb-1">
            {sphere === 'PRIVAT' ? '🤗 Privates' : '💼 Business'} Netzwerk evaluieren
          </h3>
          <p className="text-sm text-base-content/70 mb-6">
            Kontakt: <span className="font-semibold text-base-content">{contactName}</span>
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {activeQuestions.map((question) => (
                <div key={question.id} className="form-control w-full bg-base-200/40 p-4 rounded-xl border border-base-300/60">
                  <label className="label font-semibold text-sm pb-1">
                    {question.label}
                  </label>
                  <p className="text-xs text-base-content/60 mb-3">
                    {question.sliderDescription}
                  </p>
                  <input
                      type="range"
                      min="1"
                      max="5"
                      step="1"
                      className={`range range-xs ${sphere === 'PRIVAT' ? 'range-primary' : 'range-secondary'}`}
                      {...register(question.id, { valueAsNumber: true })}
                  />
                  <div className="w-full flex justify-between text-xs px-1 font-medium mt-1 text-base-content/50">
                    <span>1 (Gering)</span>
                    <span>2</span>
                    <span>3</span>
                    <span>4</span>
                    <span>5 (Hoch)</span>
                  </div>
                </div>
            ))}

            <div className="form-control w-full">
              <label className="label font-semibold text-sm">
                Verlaufskommentar <span className="text-error">*</span>
              </label>
              <textarea
                  className={`textarea textarea-bordered h-24 ${errors.comment ? 'textarea-error' : ''}`}
                  placeholder="Geben Sie hier wichtige Kontextinfos, Notizen oder den aktuellen Stand der Beziehung ein..."
                  {...register('comment')}
              ></textarea>
              {errors.comment && (
                  <span className="text-error text-xs mt-1 font-medium">{String(errors.comment.message)}</span>
              )}
            </div>

            <div className="form-control w-full">
              <label className="label font-semibold text-sm">
                Erinnerungsintervall (Google Tasks)
              </label>
              <select
                  className="select select-bordered w-full"
                  {...register('interval')}
              >
                <option value="3">In 3 Monaten re-evaluieren</option>
                <option value="6">In 6 Monaten re-evaluieren (Standard)</option>
                <option value="12">In 12 Monaten re-evaluieren</option>
              </select>
            </div>

            <div className="modal-action border-t border-base-300 pt-4 gap-2">
              <button type="button" className="btn btn-ghost" onClick={onClose}>
                Abbrechen
              </button>
              <button
                  type="submit"
                  className={`btn ${sphere === 'PRIVAT' ? 'btn-primary' : 'btn-secondary'} px-6`}
              >
                Speichern & Task erstellen
              </button>
            </div>
          </form>
        </div>
      </div>
  );
}