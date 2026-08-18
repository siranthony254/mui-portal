-- AUDIT LOGS FOR ADMIN ACTIONS
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID NOT NULL REFERENCES profiles(id),
  action TEXT NOT NULL, -- e.g., 'approve_mentor', 'revoke_student', 'promote_admin'
  target_id UUID REFERENCES profiles(id), -- The user being acted upon
  details JSONB, -- Optional extra context
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can see audit logs
CREATE POLICY "audit_logs_admin_read" ON audit_logs FOR SELECT USING (
  EXISTS(SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Only the system (via server actions) should write to this, but we'll allow admin inserts for now
CREATE POLICY "audit_logs_admin_insert" ON audit_logs FOR INSERT WITH CHECK (
  EXISTS(SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE INDEX idx_audit_logs_target ON audit_logs(target_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);
