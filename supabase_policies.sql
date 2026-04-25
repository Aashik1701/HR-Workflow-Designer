-- Disable Row Level Security temporarily to verify if data exists
ALTER TABLE workflows DISABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_versions DISABLE ROW LEVEL SECURITY;
ALTER TABLE automations DISABLE ROW LEVEL SECURITY;
ALTER TABLE simulation_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs DISABLE ROW LEVEL SECURITY;

-- If you want to keep RLS ON but allow public access, run these instead:
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE automations ENABLE ROW LEVEL SECURITY;
ALTER TABLE simulation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public read workflows" ON workflows;
DROP POLICY IF EXISTS "public write workflows" ON workflows;
DROP POLICY IF EXISTS "public read workflow_versions" ON workflow_versions;
DROP POLICY IF EXISTS "public write workflow_versions" ON workflow_versions;
DROP POLICY IF EXISTS "public read automations" ON automations;
DROP POLICY IF EXISTS "public read simulation_logs" ON simulation_logs;
DROP POLICY IF EXISTS "public write simulation_logs" ON simulation_logs;
DROP POLICY IF EXISTS "public read activity_logs" ON activity_logs;
DROP POLICY IF EXISTS "public write activity_logs" ON activity_logs;

CREATE POLICY "public read workflows"  ON workflows       FOR SELECT USING (true);
CREATE POLICY "public write workflows" ON workflows       FOR ALL    USING (true);
CREATE POLICY "public read workflow_versions"  ON workflow_versions FOR SELECT USING (true);
CREATE POLICY "public write workflow_versions" ON workflow_versions FOR ALL    USING (true);
CREATE POLICY "public read automations"  ON automations     FOR SELECT USING (true);
CREATE POLICY "public read simulation_logs"  ON simulation_logs FOR SELECT USING (true);
CREATE POLICY "public write simulation_logs" ON simulation_logs FOR INSERT USING (true);
CREATE POLICY "public read activity_logs"  ON activity_logs   FOR SELECT USING (true);
CREATE POLICY "public write activity_logs" ON activity_logs   FOR INSERT USING (true);
