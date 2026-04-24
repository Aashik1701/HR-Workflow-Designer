import { z } from 'zod';
import type { WorkflowPayload } from '../types/workflow';

const positionSchema = z.object({
  x: z.number(),
  y: z.number(),
});

const keyValuePairSchema = z.object({
  key: z.string(),
  value: z.string(),
});

const startNodeDataSchema = z.object({
  type: z.literal('startNode'),
  title: z.string(),
  metadata: z.array(keyValuePairSchema),
  hasError: z.boolean().optional(),
  errorMessage: z.string().optional(),
});

const taskNodeDataSchema = z.object({
  type: z.literal('taskNode'),
  title: z.string(),
  description: z.string(),
  assignee: z.string(),
  dueDate: z.string(),
  customFields: z.array(keyValuePairSchema),
  hasError: z.boolean().optional(),
  errorMessage: z.string().optional(),
});

const approvalNodeDataSchema = z.object({
  type: z.literal('approvalNode'),
  title: z.string(),
  approverRole: z.enum(['Manager', 'HRBP', 'Director']),
  autoApproveThreshold: z.number(),
  hasError: z.boolean().optional(),
  errorMessage: z.string().optional(),
});

const automatedStepNodeDataSchema = z.object({
  type: z.literal('automatedStepNode'),
  title: z.string(),
  actionId: z.string(),
  actionParams: z.record(z.string(), z.string()),
  hasError: z.boolean().optional(),
  errorMessage: z.string().optional(),
});

const endNodeDataSchema = z.object({
  type: z.literal('endNode'),
  endMessage: z.string(),
  summaryFlag: z.boolean(),
  hasError: z.boolean().optional(),
  errorMessage: z.string().optional(),
});

const baseNodeSchema = z
  .object({
    id: z.string().min(1),
    position: positionSchema,
  })
  .passthrough();

const workflowNodeSchema = z.discriminatedUnion('type', [
  baseNodeSchema.extend({
    type: z.literal('startNode'),
    data: startNodeDataSchema,
  }),
  baseNodeSchema.extend({
    type: z.literal('taskNode'),
    data: taskNodeDataSchema,
  }),
  baseNodeSchema.extend({
    type: z.literal('approvalNode'),
    data: approvalNodeDataSchema,
  }),
  baseNodeSchema.extend({
    type: z.literal('automatedStepNode'),
    data: automatedStepNodeDataSchema,
  }),
  baseNodeSchema.extend({
    type: z.literal('endNode'),
    data: endNodeDataSchema,
  }),
]);

const workflowEdgeSchema = z
  .object({
    id: z.string().min(1),
    source: z.string().min(1),
    target: z.string().min(1),
    sourceHandle: z.string().nullable().optional(),
    targetHandle: z.string().nullable().optional(),
    type: z.string().optional(),
    animated: z.boolean().optional(),
  })
  .passthrough();

export const workflowImportSchema = z.object({
  nodes: z.array(workflowNodeSchema),
  edges: z.array(workflowEdgeSchema),
});

export function parseWorkflowImport(raw: unknown): WorkflowPayload {
  return workflowImportSchema.parse(raw) as WorkflowPayload;
}
