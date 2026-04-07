CREATE TABLE IF NOT EXISTS adm_departments (
  id SERIAL PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS adm_roles (
  id SERIAL PRIMARY KEY,
  role_code TEXT NOT NULL UNIQUE,
  role_name TEXT NOT NULL,
  description TEXT,
  department_id INT REFERENCES adm_departments(id) ON DELETE SET NULL,
  role_level INT NOT NULL DEFAULT 4,
  supervisor_role_id INT REFERENCES adm_roles(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS adm_permissions (
  id SERIAL PRIMARY KEY,
  permission_code TEXT NOT NULL UNIQUE,
  module_code TEXT NOT NULL,
  feature_code TEXT NOT NULL,
  action_code TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS adm_role_permissions (
  id SERIAL PRIMARY KEY,
  role_id INT NOT NULL REFERENCES adm_roles(id) ON DELETE CASCADE,
  permission_id INT NOT NULL REFERENCES adm_permissions(id) ON DELETE CASCADE,
  granted BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (role_id, permission_id)
);

CREATE TABLE IF NOT EXISTS adm_modules (
  id SERIAL PRIMARY KEY,
  module_code TEXT NOT NULL UNIQUE,
  module_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  display_order INT NOT NULL DEFAULT 100,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS adm_module_features (
  id SERIAL PRIMARY KEY,
  module_id INT NOT NULL REFERENCES adm_modules(id) ON DELETE CASCADE,
  feature_code TEXT NOT NULL,
  feature_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (module_id, feature_code)
);

CREATE TABLE IF NOT EXISTS adm_users (
  id SERIAL PRIMARY KEY,
  employee_id TEXT NOT NULL UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  department_id INT REFERENCES adm_departments(id) ON DELETE SET NULL,
  primary_role_id INT REFERENCES adm_roles(id) ON DELETE SET NULL,
  supervisor_user_id INT REFERENCES adm_users(id) ON DELETE SET NULL,
  employment_status TEXT NOT NULL DEFAULT 'active',
  account_status TEXT NOT NULL DEFAULT 'active',
  mfa_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  account_expiry DATE,
  last_login_at TIMESTAMPTZ,
  password_changed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS adm_user_secondary_roles (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES adm_users(id) ON DELETE CASCADE,
  role_id INT NOT NULL REFERENCES adm_roles(id) ON DELETE CASCADE,
  starts_on DATE,
  ends_on DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, role_id)
);

CREATE TABLE IF NOT EXISTS adm_user_permission_overrides (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES adm_users(id) ON DELETE CASCADE,
  permission_id INT NOT NULL REFERENCES adm_permissions(id) ON DELETE CASCADE,
  effect TEXT NOT NULL,
  reason TEXT,
  created_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, permission_id)
);

CREATE TABLE IF NOT EXISTS adm_sod_rules (
  id SERIAL PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  left_permission_id INT NOT NULL REFERENCES adm_permissions(id) ON DELETE CASCADE,
  right_permission_id INT NOT NULL REFERENCES adm_permissions(id) ON DELETE CASCADE,
  severity TEXT NOT NULL DEFAULT 'high',
  description TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (left_permission_id <> right_permission_id)
);

CREATE TABLE IF NOT EXISTS adm_audit_log (
  id SERIAL PRIMARY KEY,
  actor_email TEXT,
  action_code TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  detail TEXT,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_adm_users_dept ON adm_users(department_id, account_status);
CREATE INDEX IF NOT EXISTS idx_adm_users_primary_role ON adm_users(primary_role_id, account_status);
CREATE INDEX IF NOT EXISTS idx_adm_roles_dept ON adm_roles(department_id, status);
CREATE INDEX IF NOT EXISTS idx_adm_permissions_module ON adm_permissions(module_code, feature_code, action_code);
CREATE INDEX IF NOT EXISTS idx_adm_role_permissions_role ON adm_role_permissions(role_id, granted);
CREATE INDEX IF NOT EXISTS idx_adm_user_secondary_roles_user ON adm_user_secondary_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_adm_audit_log_actor ON adm_audit_log(actor_email, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_adm_audit_log_entity ON adm_audit_log(entity_type, entity_id, created_at DESC);
