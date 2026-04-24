import fs from 'fs';
import { randomUUID } from 'crypto';

// Utilities
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomChoice = (arr) => arr[randomInt(0, arr.length - 1)];
const randomDate = (start, end) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

// Templates
const workflowNames = [
  'Employee Onboarding', 'Offboarding Process', 'Annual Performance Review', 
  'Q3 Promotion Cycle', 'Benefits Enrollment', 'Leave Request Approval',
  'Expense Reimbursement', 'IT Equipment Request', 'Contract Renewal',
  'Candidate Interview Loop', 'Background Check Flow', 'Salary Adjustment',
  'Compliance Training Tracker', 'Relocation Assistance', 'Maternity/Paternity Leave',
  'Grievance Reporting', 'Safety Incident Log', 'Travel Authorization',
  'Stock Option Grant', 'Bonus Distribution', 'Shift Swap Request',
  'Remote Work Agreement', 'Tuition Reimbursement', 'Visa Sponsorship',
  'Peer Recognition Award', 'Exit Interview', 'Return to Work Clearance',
  'Contractor Onboarding', 'Vendor Access Request', 'Facility Access Badge'
];

const actionTypes = ['created', 'modified', 'deployed', 'approved', 'warning'];
const users = ['System', 'Alex Rivera', 'Marcus Chen', 'Sarah Chen', 'Emma Watson', 'John Doe', 'HR Bot'];

// SQL String Builder
let sql = `
-- ─── WORKFLOWS ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS workflows (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name        TEXT NOT NULL DEFAULT 'Untitled Workflow',
  description TEXT DEFAULT '',
  status      TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived')),
  nodes_data  JSONB DEFAULT '[]',
  edges_data  JSONB DEFAULT '[]',
  node_count  INTEGER GENERATED ALWAYS AS (jsonb_array_length(nodes_data)) STORED,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS workflows_updated_at ON workflows;
CREATE TRIGGER workflows_updated_at
  BEFORE UPDATE ON workflows
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── AUTOMATIONS ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS automations (
  id          TEXT PRIMARY KEY,
  label       TEXT NOT NULL,
  description TEXT DEFAULT '',
  params      TEXT[] DEFAULT '{}',
  category    TEXT DEFAULT 'general',
  icon        TEXT DEFAULT 'zap',
  is_active   BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── SIMULATION LOGS ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS simulation_logs (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workflow_id  UUID REFERENCES workflows(id) ON DELETE CASCADE,
  success      BOOLEAN NOT NULL,
  steps        JSONB DEFAULT '[]',
  errors       TEXT[] DEFAULT '{}',
  duration_ms  INTEGER DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ─── ACTIVITY LOGS ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS activity_logs (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  action_type  TEXT NOT NULL,
  workflow_id  UUID REFERENCES workflows(id) ON DELETE SET NULL,
  workflow_name TEXT,
  user_name    TEXT DEFAULT 'System',
  description  TEXT NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Clear existing data if you are rerunning
TRUNCATE TABLE activity_logs CASCADE;
TRUNCATE TABLE simulation_logs CASCADE;
TRUNCATE TABLE automations CASCADE;
TRUNCATE TABLE workflows CASCADE;

-- ─── SEED AUTOMATIONS ─────────────────────────────────────────────────────────
INSERT INTO automations (id, label, description, params, category, icon) VALUES
  ('send_email',       'Send Email',          'Automated outreach via SMTP or internal mailer.',        ARRAY['to', 'subject', 'template_key'],   'communication', 'mail'),
  ('generate_doc',     'Generate Document',   'Create dynamic PDF/Docx from employee data.',           ARRAY['template', 'recipient', 'doc_type'], 'documents',     'file-text'),
  ('slack_notify',     'Slack Notification',  'Notify channels about workflow status changes.',         ARRAY['channel', 'message', 'webhook_url'], 'communication', 'message-square'),
  ('create_ticket',    'Create Ticket',       'Create a ticket in the issue tracking system.',          ARRAY['title', 'priority', 'assignee'],    'integrations',  'ticket'),
  ('update_record',    'Update Record',       'Direct mutations to the HCM database records.',          ARRAY['entry_uuid', 'patch_set'],          'database',      'database'),
  ('ad_profile_sync',  'AD Profile Sync',     'Synchronize employee profiles with Active Directory.',   ARRAY['user_id', 'attributes'],            'integrations',  'refresh-cw'),
  ('calendar_sync',    'Calendar Sync',       'Create or update calendar events for HR milestones.',    ARRAY['event_title', 'attendees', 'date'], 'productivity',  'calendar'),
  ('webhook_call',     'Webhook Call',        'Trigger any external system via HTTP webhook.',          ARRAY['url', 'method', 'payload'],         'integrations',  'globe'),
  ('sms_alert',        'SMS Alert',           'Send an urgent SMS to an employee.',                     ARRAY['phone', 'message'],                 'communication', 'smartphone'),
  ('docusign_req',     'DocuSign Request',    'Send document for e-signature.',                         ARRAY['document', 'signers'],              'documents',     'pen-tool'),
  ('jira_issue',       'Create Jira Issue',   'Log a task in Jira for engineering/IT.',                 ARRAY['project', 'summary', 'desc'],       'integrations',  'trello'),
  ('zoom_meeting',     'Create Zoom Link',    'Generate a meeting link automatically.',                 ARRAY['topic', 'duration'],                'productivity',  'video'),
  ('github_invite',    'GitHub Org Invite',   'Invite user to the company GitHub org.',                 ARRAY['username', 'team_id'],              'integrations',  'github'),
  ('db_query',         'Database Query',      'Execute a safe read query on the DB.',                   ARRAY['query', 'params'],                  'database',      'search');

-- ─── SEED WORKFLOWS ───────────────────────────────────────────────────────────
`;

const workflows = [];
const now = new Date();
const pastDate = new Date();
pastDate.setFullYear(now.getFullYear() - 1);

// Generate 75 Workflows
for (let i = 0; i < 75; i++) {
  const id = randomUUID();
  const name = `${randomChoice(workflowNames)} - ${['NA', 'EMEA', 'APAC', 'LATAM', 'Global'][randomInt(0, 4)]} ${randomInt(2023, 2026)}`;
  const status = randomChoice(['active', 'active', 'active', 'draft', 'archived']);
  const createdAt = randomDate(pastDate, now);
  const updatedAt = randomDate(createdAt, now);

  const startId = `start-${randomUUID()}`;
  const taskId = `task-${randomUUID()}`;
  const autoId = `auto-${randomUUID()}`;
  const endId = `end-${randomUUID()}`;

  const nodes = [
    { id: startId, type: 'startNode', position: { x: 250, y: 100 }, data: { title: 'Entry', metadata: [] } },
    { id: taskId, type: 'taskNode', position: { x: 250, y: 250 }, data: { title: 'Review', assignee: randomChoice(['Manager', 'HR Partner']) } },
    { id: autoId, type: 'automatedStepNode', position: { x: 250, y: 400 }, data: { title: 'Update DB', actionId: 'update_record' } },
    { id: endId, type: 'endNode', position: { x: 250, y: 550 }, data: { endMessage: 'Done' } }
  ];

  const extraNodesCount = randomInt(0, 5);
  let lastNodeId = autoId;
  let currentY = 400;
  
  const edges = [
    { id: `e1-${id}`, source: startId, target: taskId, animated: true, style: { strokeWidth: 2, stroke: '#8b5cf6' } },
    { id: `e2-${id}`, source: taskId, target: autoId, animated: true, style: { strokeWidth: 2, stroke: '#8b5cf6' } }
  ];

  for(let j = 0; j < extraNodesCount; j++) {
    const newId = `node-${randomUUID()}`;
    currentY += 150;
    const type = randomChoice(['taskNode', 'approvalNode', 'automatedStepNode']);
    nodes.push({ id: newId, type, position: { x: 250, y: currentY }, data: { title: `Step ${j+1}` }});
    edges.push({ id: `e-${randomUUID()}`, source: lastNodeId, target: newId, animated: true, style: { strokeWidth: 2, stroke: '#8b5cf6' } });
    lastNodeId = newId;
  }
  
  nodes.find(n => n.id === endId).position.y = currentY + 150;
  edges.push({ id: `e-end-${id}`, source: lastNodeId, target: endId, animated: true, style: { strokeWidth: 2, stroke: '#8b5cf6' } });

  workflows.push({ id, name, status, nodes, edges, createdAt, updatedAt });

  const nodesJson = JSON.stringify(nodes).replace(/'/g, "''");
  const edgesJson = JSON.stringify(edges).replace(/'/g, "''");
  const safeName = name.replace(/'/g, "''");

  sql += `INSERT INTO workflows (id, name, description, status, nodes_data, edges_data, created_at, updated_at) VALUES ('${id}', '${safeName}', 'Automatically generated workflow.', '${status}', '${nodesJson}'::jsonb, '${edgesJson}'::jsonb, '${createdAt.toISOString()}', '${updatedAt.toISOString()}');\n`;
}

sql += `\n-- ─── SEED SIMULATION LOGS ───────────────────────────────────────────────────\n`;

for (let i = 0; i < 300; i++) {
  const wf = randomChoice(workflows);
  const success = Math.random() > 0.2;
  const duration = randomInt(150, 4500);
  const logDate = randomDate(wf.createdAt, now);
  
  const steps = wf.nodes.map(n => ({
    nodeId: n.id,
    nodeTitle: n.data.title || n.type,
    status: success ? 'success' : (Math.random() > 0.5 ? 'success' : 'error'),
    durationMs: randomInt(10, 500),
    message: 'Processed node'
  }));

  const errors = success ? [] : ['Validation failed at step', 'Network timeout'];
  const stepsJson = JSON.stringify(steps).replace(/'/g, "''");
  const errorsArray = success ? "'{}'" : `ARRAY['${errors.join("','")}']`;

  sql += `INSERT INTO simulation_logs (workflow_id, success, steps, errors, duration_ms, created_at) VALUES ('${wf.id}', ${success}, '${stepsJson}'::jsonb, ${errorsArray}, ${duration}, '${logDate.toISOString()}');\n`;
}

sql += `\n-- ─── SEED ACTIVITY LOGS ─────────────────────────────────────────────────────\n`;

for (let i = 0; i < 500; i++) {
  const wf = randomChoice(workflows);
  const action = randomChoice(actionTypes);
  const user = randomChoice(users);
  const logDate = randomDate(wf.createdAt, now);
  const safeName = wf.name.replace(/'/g, "''");

  let desc = '';
  switch(action) {
    case 'created': desc = `Created workflow "${safeName}"`; break;
    case 'modified': desc = `Modified nodes in "${safeName}"`; break;
    case 'deployed': desc = `Deployed "${safeName}" to production`; break;
    case 'approved': desc = `Approved changes for "${safeName}"`; break;
    case 'warning': desc = `Validation warning detected in "${safeName}"`; break;
  }

  sql += `INSERT INTO activity_logs (action_type, workflow_id, workflow_name, user_name, description, created_at) VALUES ('${action}', '${wf.id}', '${safeName}', '${user}', '${desc}', '${logDate.toISOString()}');\n`;
}

fs.writeFileSync('supabase_setup_massive.sql', sql);
console.log('Successfully generated supabase_setup_massive.sql with massive data payload.');
