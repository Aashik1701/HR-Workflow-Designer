import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect, useRef } from 'react';
import { useWorkflowStore } from '../../store/workflowStore';
import type { ApprovalNodeData } from '../../types/workflow';

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  approverRole: z.enum(['Manager', 'HRBP', 'Director']),
  autoApproveThreshold: z.coerce.number().min(0).max(100),
});

type FormValues = z.input<typeof schema>;
interface Props { nodeId: string; data: ApprovalNodeData; }

export function ApprovalNodeForm({ nodeId, data }: Props) {
  const { updateNodeData } = useWorkflowStore();
  const latestDataRef = useRef(data);
  const { register, control, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: data.title,
      approverRole: data.approverRole ?? 'Manager',
      autoApproveThreshold: data.autoApproveThreshold ?? 0,
    },
    mode: 'onChange',
  });
  const watchedValues = useWatch({ control });

  useEffect(() => {
    latestDataRef.current = data;
  }, [data]);

  useEffect(() => {
    const parsedValues = schema.safeParse(watchedValues);
    if (!parsedValues.success) return;

    const currentData = latestDataRef.current;
    const nextValues = parsedValues.data;

    if (
      currentData.title === nextValues.title &&
      currentData.approverRole === nextValues.approverRole &&
      currentData.autoApproveThreshold === nextValues.autoApproveThreshold
    ) {
      return;
    }

    updateNodeData(nodeId, {
      ...currentData,
      ...nextValues,
    });
  }, [watchedValues, nodeId, updateNodeData]);

  const inputClass = "w-full text-xs border border-slate-200 rounded px-2 py-1.5 focus:ring-1 ring-indigo-400 outline-none";
  const labelClass = "block text-xs font-medium text-slate-600 mb-1";

  return (
    <div className="space-y-3">
      <div>
        <label className={labelClass}>Title *</label>
        <input {...register('title')} className={inputClass} placeholder="Manager Approval" />
        {errors.title && <p className="text-[10px] text-red-500">{errors.title.message}</p>}
      </div>
      <div>
        <label className={labelClass}>Approver Role</label>
        <select {...register('approverRole')} className={inputClass}>
          <option value="Manager">Manager</option>
          <option value="HRBP">HRBP</option>
          <option value="Director">Director</option>
        </select>
      </div>
      <div>
        <label className={labelClass}>Auto-Approve Threshold (%)</label>
        <input
          type="number"
          {...register('autoApproveThreshold')}
          className={inputClass}
          min={0} max={100}
          placeholder="0"
        />
        <p className="text-[10px] text-slate-400 mt-0.5">Score above this triggers auto-approval. 0 = disabled.</p>
      </div>
    </div>
  );
}
