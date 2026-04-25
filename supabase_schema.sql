-- ═══════════════════════════════════════════════════════════════════════════
-- HR Workflow Designer — Complete Supabase Schema
-- Run this entire file in: Supabase Dashboard → SQL Editor → New Query
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── Enable UUID generation ────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── 1. workflows ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS workflows (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT        NOT NULL,
  description TEXT        NOT NULL DEFAULT '',
  status      TEXT        NOT NULL DEFAULT 'draft'
                          CHECK (status IN ('draft', 'active', 'archived')),
  nodes_data  JSONB       NOT NULL DEFAULT '[]',
  edges_data  JSONB       NOT NULL DEFAULT '[]',
  node_count  INT         GENERATED ALWAYS AS (jsonb_array_length(nodes_data)) STORED,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS workflows_updated_at ON workflows;
CREATE TRIGGER workflows_updated_at
  BEFORE UPDATE ON workflows
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── 2. workflow_versions ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS workflow_versions (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id    UUID        NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
  version_number INT         NOT NULL,
  change_note    TEXT        NOT NULL DEFAULT '',
  nodes_data     JSONB       NOT NULL DEFAULT '[]',
  edges_data     JSONB       NOT NULL DEFAULT '[]',
  is_published   BOOLEAN     NOT NULL DEFAULT false,
  published_at   TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (workflow_id, version_number)
);

-- ─── 3. automations ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS automations (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  label       TEXT        NOT NULL,
  description TEXT        NOT NULL DEFAULT '',
  params      TEXT[]      NOT NULL DEFAULT '{}',
  category    TEXT        NOT NULL DEFAULT 'General',
  icon        TEXT        NOT NULL DEFAULT 'Zap',
  is_active   BOOLEAN     NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── 4. simulation_logs ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS simulation_logs (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID        REFERENCES workflows(id) ON DELETE SET NULL,
  success     BOOLEAN     NOT NULL DEFAULT false,
  steps       JSONB       NOT NULL DEFAULT '[]',
  errors      TEXT[]      NOT NULL DEFAULT '{}',
  duration_ms INT         NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── 5. activity_logs ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS activity_logs (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  action_type   TEXT        NOT NULL
                            CHECK (action_type IN ('created','modified','deployed','approved','warning')),
  workflow_id   UUID        REFERENCES workflows(id) ON DELETE SET NULL,
  workflow_name TEXT,
  user_name     TEXT        NOT NULL DEFAULT 'System',
  description   TEXT        NOT NULL DEFAULT '',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════════════════
-- Row Level Security — allow public access (no auth in this demo)
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE workflows         ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE automations       ENABLE ROW LEVEL SECURITY;
ALTER TABLE simulation_logs   ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs     ENABLE ROW LEVEL SECURITY;

-- Drop old policies if they exist (safe re-run)
DROP POLICY IF EXISTS "public read workflows"           ON workflows;
DROP POLICY IF EXISTS "public write workflows"          ON workflows;
DROP POLICY IF EXISTS "public read workflow_versions"   ON workflow_versions;
DROP POLICY IF EXISTS "public write workflow_versions"  ON workflow_versions;
DROP POLICY IF EXISTS "public read automations"         ON automations;
DROP POLICY IF EXISTS "public read simulation_logs"     ON simulation_logs;
DROP POLICY IF EXISTS "public write simulation_logs"    ON simulation_logs;
DROP POLICY IF EXISTS "public read activity_logs"       ON activity_logs;
DROP POLICY IF EXISTS "public write activity_logs"      ON activity_logs;

-- Create policies
CREATE POLICY "public read workflows"          ON workflows         FOR SELECT USING (true);
CREATE POLICY "public write workflows"         ON workflows         FOR ALL    USING (true);
CREATE POLICY "public read workflow_versions"  ON workflow_versions FOR SELECT USING (true);
CREATE POLICY "public write workflow_versions" ON workflow_versions FOR ALL    USING (true);
CREATE POLICY "public read automations"        ON automations       FOR SELECT USING (true);
CREATE POLICY "public read simulation_logs"    ON simulation_logs   FOR SELECT USING (true);
CREATE POLICY "public write simulation_logs"   ON simulation_logs   FOR INSERT WITH CHECK (true);
CREATE POLICY "public read activity_logs"      ON activity_logs     FOR SELECT USING (true);
CREATE POLICY "public write activity_logs"     ON activity_logs     FOR INSERT WITH CHECK (true);

-- ═══════════════════════════════════════════════════════════════════════════
-- Seed: default automation actions
-- ═══════════════════════════════════════════════════════════════════════════
INSERT INTO automations (label, description, params, category, icon) VALUES
  ('Send Email',       'Send an email to a recipient',              ARRAY['to','subject','body'],            'Communication', 'Mail'),
  ('Send Slack',       'Post a message to a Slack channel',         ARRAY['channel','message'],              'Communication', 'MessageSquare'),
  ('Create Jira Ticket','Open a ticket in Jira',                    ARRAY['project','summary','priority'],   'Project Mgmt',  'Ticket'),
  ('Generate Document','Generate a document from a template',       ARRAY['template','recipient'],           'Documents',     'FileText'),
  ('Update Record',    'Update a field in the database',            ARRAY['table','field','value'],          'Data',          'Database'),
  ('Schedule Meeting', 'Schedule a calendar meeting',               ARRAY['attendees','title','duration'],   'Calendar',      'CalendarCheck'),
  ('Trigger Webhook',  'Fire an HTTP webhook to an external system',ARRAY['url','method'],                   'Integration',   'Webhook')
ON CONFLICT DO NOTHING;
