import type { WorkflowNode, WorkflowEdge } from '../types/workflow';

// ─── System Prompt ────────────────────────────────────────────────────────────
// Teaches Gemini our exact node schema so it returns a valid graph.

const SYSTEM_PROMPT = `
You are an AI workflow builder for an HR orchestration platform.
Your job is to parse a user's natural language prompt and return a valid JSON workflow graph.

## Node Types

You may only use the following node types. Produce ONLY valid JSON — no markdown, no explanation.

### 1. startNode
{
  "id": "start-1",
  "type": "startNode",
  "position": { "x": 250, "y": 80 },
  "data": {
    "type": "startNode",
    "title": "<descriptive title>",
    "metadata": [{ "key": "trigger", "value": "<reason>" }]
  }
}

### 2. taskNode (human task with an assignee)
{
  "id": "task-1",
  "type": "taskNode",
  "position": { "x": 250, "y": <y> },
  "data": {
    "type": "taskNode",
    "title": "<task name>",
    "description": "<what the person must do>",
    "assignee": "{{ hr.manager }}",
    "dueDate": "",
    "customFields": []
  }
}

### 3. approvalNode (manager / HRBP / Director sign-off)
{
  "id": "approval-1",
  "type": "approvalNode",
  "position": { "x": 250, "y": <y> },
  "data": {
    "type": "approvalNode",
    "title": "<approval title>",
    "approverRole": "Manager",
    "autoApproveThreshold": 0
  }
}

### 4. automatedStepNode (system actions)
Available actionIds: send_email, send_slack, create_ticket, generate_doc, update_record, schedule_meeting, trigger_webhook
{
  "id": "auto-1",
  "type": "automatedStepNode",
  "position": { "x": 250, "y": <y> },
  "data": {
    "type": "automatedStepNode",
    "title": "<action label>",
    "actionId": "<one of the actionIds above>",
    "actionParams": {
      "<param_key>": "<param_value or {{ variable }}>"
    }
  }
}
For send_email use params: to, subject, body
For send_slack use params: channel, message
For create_ticket use params: project, summary, priority
For generate_doc use params: template, recipient
For update_record use params: table, field, value
For schedule_meeting use params: attendees, title, duration
For trigger_webhook use params: url, method

### 5. splitNode (A/B split for testing two paths)
{
  "id": "split-1",
  "type": "splitNode",
  "position": { "x": 250, "y": <y> },
  "data": {
    "type": "splitNode",
    "title": "A/B Test",
    "pathALabel": "Path A",
    "pathBLabel": "Path B",
    "splitPercentage": 50
  }
}
IMPORTANT: When you use a splitNode, you MUST create two branches after it.
Path A nodes connect from split-1 using sourceHandle "pathA".
Path B nodes connect from split-1 using sourceHandle "pathB".
Both paths MUST eventually connect to the end node.

### 6. delayNode (pause/wait step)
{
  "id": "delay-1",
  "type": "delayNode",
  "position": { "x": 250, "y": <y> },
  "data": {
    "type": "delayNode",
    "title": "Wait",
    "duration": <number>,
    "unit": "minutes" | "hours" | "days"
  }
}

### 7. endNode (exactly one required)
{
  "id": "end-1",
  "type": "endNode",
  "position": { "x": 250, "y": <y> },
  "data": {
    "type": "endNode",
    "endMessage": "<completion message>",
    "summaryFlag": true
  }
}

### 8. webhookNode (alternative to startNode for external triggers)
{
  "id": "webhook-1",
  "type": "webhookNode",
  "position": { "x": 250, "y": 80 },
  "data": {
    "type": "webhookNode",
    "title": "Webhook Trigger",
    "webhookUrl": "/api/webhook/xyz123",
    "httpMethod": "POST",
    "payloadSchema": [{ "key": "data", "value": "string" }],
    "authType": "none",
    "authToken": ""
  }
}

### 9. aiActionNode (LLM processing step)
{
  "id": "ai-1",
  "type": "aiActionNode",
  "position": { "x": 250, "y": <y> },
  "data": {
    "type": "aiActionNode",
    "title": "AI Summary",
    "model": "gpt-4o",
    "prompt": "Summarize the data.",
    "inputVariables": ["data"],
    "outputVariable": "summary",
    "temperature": 0.7
  }
}

### 10. forkNode (Parallel execution)
{
  "id": "fork-1",
  "type": "forkNode",
  "position": { "x": 250, "y": <y> },
  "data": {
    "type": "forkNode",
    "title": "Parallel Paths",
    "mode": "fork",
    "branches": 2,
    "branchLabels": ["Branch A", "Branch B"]
  }
}
Note: Connect outgoing edges from fork using sourceHandles "branch-0" and "branch-1". To join them back, use a forkNode with mode "join" and identical "branches" count.

### 11. loopNode (Iterate over items)
{
  "id": "loop-1",
  "type": "loopNode",
  "position": { "x": 250, "y": <y> },
  "data": {
    "type": "loopNode",
    "title": "Iterate",
    "iteratorSource": "list",
    "maxIterations": 100,
    "currentItemVariable": "item"
  }
}

### 12. documentGenNode (Generate PDF/DOCX from template)
{
  "id": "docgen-1",
  "type": "documentGenNode",
  "position": { "x": 250, "y": <y> },
  "data": {
    "type": "documentGenNode",
    "title": "Generate Offer",
    "templateId": "offer_letter",
    "outputFileName": "offer.pdf",
    "outputFormat": "PDF",
    "mergeFields": [{ "key": "name", "value": "{{ candidate_name }}" }],
    "outputVariable": "generated_doc"
  }
}

## Edge Rules
- id: "e-<source>-<target>"
- source: node id
- target: node id
- type: "smoothstep"
- sourceHandle: only set for splitNode edges ("pathA" or "pathB"), omit for all others
- The first node is ALWAYS startNode. The last node is ALWAYS endNode.
- Every non-end node must have an outgoing edge.
- Every non-start node must have an incoming edge.

## Layout Rules
- Space nodes 160px apart vertically (y increments by 160 each step).
- For split branches, offset Path A to x=100 and Path B to x=400, then both rejoin at center x=250.
- Start at y=80. End node must have the highest y value.

## Output Format
Return ONLY this JSON object, nothing else:
{
  "nodes": [...],
  "edges": [...]
}
`.trim();

// ─── Gemini API Call ──────────────────────────────────────────────────────────

export interface CopilotResult {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

export async function generateWorkflowFromPrompt(prompt: string): Promise<CopilotResult> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;

  if (!apiKey) {
    // Graceful fallback: keyword-based engine when no key is set
    return keywordFallback(prompt);
  }

  // ── Model cascade ─────────────────────────────────────────────────────────
  // We try each candidate in order until one succeeds.
  // Different API keys have access to different model versions.
  const CANDIDATES = [
    'v1beta/models/gemini-1.5-flash-latest',
    'v1beta/models/gemini-1.5-flash',
    'v1beta/models/gemini-1.5-flash-8b',
    'v1/models/gemini-1.5-flash-latest',
    'v1/models/gemini-1.5-flash',
    'v1beta/models/gemini-pro',
  ];

  const BASE = 'https://generativelanguage.googleapis.com';

  const payload = {
    contents: [
      {
        parts: [
          {
            text: `${SYSTEM_PROMPT}\n\n## User Prompt\n${prompt}`,
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 4096,
      responseMimeType: 'application/json',
    },
  };

  let lastError = '';

  for (const model of CANDIDATES) {
    const endpoint = `${BASE}/${model}:generateContent?key=${apiKey}`;

    let response: Response;
    try {
      response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch {
      // Network error — try next model
      continue;
    }

    if (response.status === 429) {
      console.warn(`[Copilot] ${model} rate-limited (429) — falling back to keyword engine.`);
      return Object.assign(keywordFallback(prompt), { _usedFallback: true });
    }

    if (response.status === 404) {
      // Model not available on this key — try next
      lastError = `${model} returned 404`;
      continue;
    }

    if (!response.ok) {
      const err = await response.text();
      lastError = `${model} error ${response.status}: ${err}`;
      continue;
    }

    // ── Parse response ───────────────────────────────────────────────────────
    const raw = await response.json() as {
      candidates?: Array<{
        content?: {
          parts?: Array<{ text?: string }>;
        };
      }>;
    };

    const text = raw?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      lastError = `${model} returned empty content`;
      continue;
    }

    const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();

    let parsed: CopilotResult;
    try {
      parsed = JSON.parse(cleaned) as CopilotResult;
    } catch {
      lastError = `${model} returned invalid JSON`;
      continue;
    }

    if (!Array.isArray(parsed.nodes) || parsed.nodes.length === 0) {
      lastError = `${model} returned empty node list`;
      continue;
    }

    // Success!
    console.info(`[Copilot] Used model: ${model}`);
    return parsed;
  }

  // All models failed — fall back silently to keyword engine
  console.warn('[Copilot] All Gemini models failed, using keyword engine. Last error:', lastError);
  return Object.assign(keywordFallback(prompt), { _usedFallback: true });
}

// ─── Keyword Fallback (no API key) ───────────────────────────────────────────

function keywordFallback(prompt: string): CopilotResult {
  const p = prompt.toLowerCase();

  const isWebhook = p.includes('webhook') || p.includes('api') || p.includes('trigger') || p.includes('ats');

  const nodes: WorkflowNode[] = [];
  if (isWebhook) {
    nodes.push({
      id: 'node-start',
      type: 'webhookNode',
      position: { x: 250, y: 80 },
      data: { type: 'webhookNode', title: 'Webhook Trigger', webhookUrl: '/api/webhook/test', httpMethod: 'POST', payloadSchema: [{ key: 'data', value: 'string' }], authType: 'none', authToken: '' },
    });
  } else {
    nodes.push({
      id: 'node-start',
      type: 'startNode',
      position: { x: 250, y: 80 },
      data: { type: 'startNode', title: 'Trigger', metadata: [] },
    });
  }
  const edges: WorkflowEdge[] = [];
  let currentY = 240;
  let prev = 'node-start';

  const push = (id: string, node: WorkflowNode['data'], nodeType: WorkflowNode['type']) => {
    nodes.push({ id, type: nodeType, position: { x: 250, y: currentY }, data: node });
    edges.push({ id: `e-${prev}-${id}`, source: prev, target: id, type: 'smoothstep' });
    prev = id;
    currentY += 160;
  };

  if (p.includes('approv') || p.includes('sign off') || p.includes('manager')) {
    push('node-approval', { type: 'approvalNode', title: 'Manager Approval', approverRole: 'Manager', autoApproveThreshold: 0 }, 'approvalNode');
  }

  if (p.includes('wait') || p.includes('delay') || p.includes('days') || p.includes('hours')) {
    const days = parseInt(p.match(/(\d+)\s*day/)?.[1] ?? '1', 10);
    push('node-delay', { type: 'delayNode', title: `Wait ${days} day${days > 1 ? 's' : ''}`, duration: days, unit: 'days' }, 'delayNode');
  }

  if (p.includes('task') || p.includes('assign') || p.includes('review')) {
    push('node-task', { type: 'taskNode', title: 'Review Task', description: 'Complete the required review', assignee: '{{ hr.manager }}', dueDate: '', customFields: [] }, 'taskNode');
  }

  if (p.includes('email')) {
    push('node-email', { type: 'automatedStepNode', title: 'Send Email', actionId: 'send_email', actionParams: { to: '{{ employee.email }}', subject: 'Action Required', body: 'Please review your onboarding steps.' } }, 'automatedStepNode');
  }

  if (p.includes('slack') || p.includes('message') || p.includes('notify')) {
    push('node-slack', { type: 'automatedStepNode', title: 'Send Slack Message', actionId: 'send_slack', actionParams: { channel: '#hr-general', message: '{{ employee.name }} is ready.' } }, 'automatedStepNode');
  }

  if (p.includes('jira') || p.includes('ticket') || p.includes('issue')) {
    push('node-ticket', { type: 'automatedStepNode', title: 'Create Jira Ticket', actionId: 'create_ticket', actionParams: { project: 'IT', summary: 'Onboarding: {{ employee.name }}', priority: 'Medium' } }, 'automatedStepNode');
  }

  if (p.includes('ai') || p.includes('summarize') || p.includes('llm')) {
    push('node-ai', { type: 'aiActionNode', title: 'AI Summary', model: 'gpt-4o', prompt: 'Summarize the input data.', inputVariables: ['data'], outputVariable: 'summary', temperature: 0.7 }, 'aiActionNode');
  }

  if (p.includes('document') || p.includes('contract') || p.includes('letter') || p.includes('pdf')) {
    push('node-docgen', { type: 'documentGenNode', title: 'Generate Document', templateId: 'offer_letter', outputFileName: 'document.pdf', outputFormat: 'PDF', mergeFields: [], outputVariable: 'doc' }, 'documentGenNode');
  }

  if (p.includes('loop') || p.includes('iterate') || p.includes('for each') || p.includes('every')) {
    push('node-loop', { type: 'loopNode', title: 'Loop Items', iteratorSource: 'items', maxIterations: 100, currentItemVariable: 'item' }, 'loopNode');
  }

  if (p.includes('meeting') || p.includes('schedule') || p.includes('calendar')) {
    push('node-meeting', { type: 'automatedStepNode', title: 'Schedule Meeting', actionId: 'schedule_meeting', actionParams: { attendees: '{{ employee.email }}, {{ hr.manager }}', title: 'Welcome Call', duration: '30' } }, 'automatedStepNode');
  }

  if (p.includes('fork') || p.includes('parallel') || p.includes('branch')) {
    const forkId = 'node-fork';
    const pathAId = 'node-forkA';
    const pathBId = 'node-forkB';
    const joinId = 'node-join';
    nodes.push({ id: forkId, type: 'forkNode', position: { x: 250, y: currentY }, data: { type: 'forkNode', title: 'Parallel Paths', mode: 'fork', branches: 2, branchLabels: ['IT', 'Facilities'] } });
    edges.push({ id: `e-${prev}-${forkId}`, source: prev, target: forkId, type: 'smoothstep' });
    currentY += 160;

    nodes.push({ id: pathAId, type: 'taskNode', position: { x: 100, y: currentY }, data: { type: 'taskNode', title: 'IT Setup', description: 'Provision laptop', assignee: 'IT Support', dueDate: '', customFields: [] } });
    edges.push({ id: `e-${forkId}-${pathAId}`, source: forkId, target: pathAId, type: 'smoothstep', sourceHandle: 'branch-0' } as WorkflowEdge);

    nodes.push({ id: pathBId, type: 'automatedStepNode', position: { x: 400, y: currentY }, data: { type: 'automatedStepNode', title: 'Ping Facilities', actionId: 'send_slack', actionParams: { channel: '#facilities', message: 'Set up desk' } } });
    edges.push({ id: `e-${forkId}-${pathBId}`, source: forkId, target: pathBId, type: 'smoothstep', sourceHandle: 'branch-1' } as WorkflowEdge);

    currentY += 160;
    nodes.push({ id: joinId, type: 'forkNode', position: { x: 250, y: currentY }, data: { type: 'forkNode', title: 'Wait Both', mode: 'join', branches: 2, branchLabels: [] } });
    edges.push({ id: `e-${pathAId}-${joinId}`, source: pathAId, target: joinId, type: 'smoothstep' });
    edges.push({ id: `e-${pathBId}-${joinId}`, source: pathBId, target: joinId, type: 'smoothstep' });
    
    prev = joinId;
    currentY += 160;
  }

  if (p.includes('split') || p.includes('a/b') || p.includes('test')) {
    const splitId = 'node-split';
    const pathAId = 'node-pathA';
    const pathBId = 'node-pathB';
    nodes.push({ id: splitId, type: 'splitNode', position: { x: 250, y: currentY }, data: { type: 'splitNode', title: 'A/B Test', pathALabel: 'Email', pathBLabel: 'Slack', splitPercentage: 50 } });
    edges.push({ id: `e-${prev}-${splitId}`, source: prev, target: splitId, type: 'smoothstep' });
    currentY += 160;

    nodes.push({ id: pathAId, type: 'automatedStepNode', position: { x: 100, y: currentY }, data: { type: 'automatedStepNode', title: 'Send Email (A)', actionId: 'send_email', actionParams: { to: '{{ employee.email }}', subject: 'Path A' } } });
    edges.push({ id: `e-${splitId}-${pathAId}`, source: splitId, target: pathAId, type: 'smoothstep', sourceHandle: 'pathA' } as WorkflowEdge);

    nodes.push({ id: pathBId, type: 'automatedStepNode', position: { x: 400, y: currentY }, data: { type: 'automatedStepNode', title: 'Slack Notify (B)', actionId: 'send_slack', actionParams: { channel: '#general', message: 'Path B' } } });
    edges.push({ id: `e-${splitId}-${pathBId}`, source: splitId, target: pathBId, type: 'smoothstep', sourceHandle: 'pathB' } as WorkflowEdge);

    prev = pathAId; // connect end from pathA (pathB also needs an end—handled below)
    currentY += 160;
  }

  const endId = 'node-end';
  nodes.push({ id: endId, type: 'endNode', position: { x: 250, y: currentY }, data: { type: 'endNode', endMessage: 'Pipeline Complete', summaryFlag: true } });
  edges.push({ id: `e-${prev}-${endId}`, source: prev, target: endId, type: 'smoothstep' });

  // If split was used, also connect pathB to end
  const hasPathB = nodes.find(n => n.id === 'node-pathB');
  if (hasPathB) {
    edges.push({ id: 'e-node-pathB-node-end', source: 'node-pathB', target: endId, type: 'smoothstep' });
  }

  return { nodes, edges };
}
