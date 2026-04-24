import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect, useRef } from 'react';
import { useWorkflowStore } from '../../store/workflowStore';
import { KeyValueEditor } from '../ui/KeyValueEditor';
import type { TaskNodeData } from '../../types/workflow';

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional().default(''),
  assignee: z.string().optional().default(''),
  dueDate: z.string().optional().default(''),
});

type FormValues = z.input<typeof schema>;

interface Props { nodeId: string; data: TaskNodeData; }

export function TaskNodeForm({ nodeId, data }: Props) {
  const { updateNodeData } = useWorkflowStore();
  const latestDataRef = useRef(data);

  const { register, control, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: data.title,
      description: data.description,
      assignee: data.assignee,
      dueDate: data.dueDate,
    },
    mode: 'onChange',
  });
  const watchedValues = useWatch({ control });

  useEffect(() => {
    latestDataRef.current = data;
  }, [data]);

  // Live sync to store on every change.
  useEffect(() => {
    const parsedValues = schema.safeParse(watchedValues);
    if (!parsedValues.success) return;

    const currentData = latestDataRef.current;
    const nextValues = parsedValues.data;

    if (
      currentData.title === nextValues.title &&
      currentData.description === nextValues.description &&
      currentData.assignee === nextValues.assignee &&
      currentData.dueDate === nextValues.dueDate
    ) {
      return;
    }

    updateNodeData(nodeId, {
      ...currentData,
      ...nextValues,
    });
  }, [watchedValues, nodeId, updateNodeData]);

  const inputClass = "w-full text-xs border border-slate-200 rounded px-2 py-1.5 focus:ring-1 ring-indigo-400 outline-none";
  const errorClass = "text-[10px] text-red-500 mt-0.5";
  const labelClass = "block text-xs font-medium text-slate-600 mb-1";

  return (
    <div className="space-y-3">
      <div>
        <label className={labelClass}>Title *</label>
        <input {...register('title')} className={inputClass} placeholder="e.g., Collect Onboarding Documents" />
        {errors.title && <p className={errorClass}>{errors.title.message}</p>}
      </div>
      <div>
        <label className={labelClass}>Description</label>
        <textarea {...register('description')} rows={2} className={inputClass} placeholder="Task description..." />
      </div>
      <div>
        <label className={labelClass}>Assignee</label>
        <input {...register('assignee')} className={inputClass} placeholder="e.g., hr-team@company.com" />
      </div>
      <div>
        <label className={labelClass}>Due Date</label>
        <input type="date" {...register('dueDate')} className={inputClass} />
      </div>
      <KeyValueEditor
        value={data.customFields ?? []}
        onChange={pairs => updateNodeData(nodeId, { ...data, customFields: pairs })}
      />
    </div>
  );
}
