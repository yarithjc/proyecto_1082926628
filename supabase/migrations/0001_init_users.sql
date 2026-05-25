CREATE TABLE IF NOT EXISTS users (
  id                   UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  name                 VARCHAR(100) NOT NULL,
  email                VARCHAR(255) UNIQUE NOT NULL,
  password_hash        TEXT         NOT NULL,
  role                 VARCHAR(10)  NOT NULL DEFAULT 'cajero'
                       CHECK (role IN ('cajero', 'admin')),
  is_active            BOOLEAN      DEFAULT true,
  must_change_password BOOLEAN      DEFAULT false,
  last_login_at        TIMESTAMPTZ,
  created_at           TIMESTAMPTZ  DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS service_role_all ON users;
CREATE POLICY service_role_all ON users FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS _migrations (
  id         SERIAL       PRIMARY KEY,
  filename   VARCHAR(255) UNIQUE NOT NULL,
  applied_at TIMESTAMPTZ  DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS _audit (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID,
  user_email  VARCHAR(255),
  user_role   VARCHAR(10),
  action      VARCHAR(50) NOT NULL,
  entity      VARCHAR(20) NOT NULL,
  entity_id   VARCHAR(64),
  summary     TEXT,
  metadata    JSONB,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_audit_created_at ON _audit(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_user ON _audit(user_id);

ALTER TABLE _audit ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS service_role_all ON _audit;
CREATE POLICY service_role_all ON _audit FOR ALL TO service_role USING (true) WITH CHECK (true);
