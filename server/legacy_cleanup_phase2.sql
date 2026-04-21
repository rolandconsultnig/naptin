BEGIN;

CREATE TABLE IF NOT EXISTS adm_legacy_backup_registry (
  id BIGSERIAL PRIMARY KEY,
  backup_path TEXT NOT NULL UNIQUE,
  manifest_sha256 TEXT,
  table_count INT,
  non_empty_table_count INT,
  approved_by TEXT NOT NULL DEFAULT 'system@naptin.gov.ng',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DO $$
DECLARE
  backup_count BIGINT;
BEGIN
  SELECT COUNT(*) INTO backup_count
  FROM adm_legacy_backup_registry;

  IF backup_count = 0 THEN
    RAISE EXCEPTION
      'Phase 2 blocked: no backup manifest registered in adm_legacy_backup_registry. Run manifest registration first.';
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass('public.group_log') IS NOT NULL THEN
    EXECUTE 'DROP TABLE public.group_log';
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass('public.meeting_message') IS NOT NULL THEN
    EXECUTE 'DROP TABLE public.meeting_message';
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass('public.meeting_slide') IS NOT NULL THEN
    EXECUTE 'DROP TABLE public.meeting_slide';
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass('public.presentation_recording') IS NOT NULL THEN
    EXECUTE 'DROP TABLE public.presentation_recording';
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass('public.media') IS NOT NULL THEN
    EXECUTE 'DROP TABLE public.media';
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass('public.call') IS NOT NULL THEN
    EXECUTE 'DROP TABLE public.call';
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass('public.message') IS NOT NULL THEN
    EXECUTE 'DROP TABLE public.message';
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass('public.group_member') IS NOT NULL THEN
    EXECUTE 'DROP TABLE public.group_member';
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass('public.group') IS NOT NULL THEN
    EXECUTE 'DROP TABLE public.group';
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass('public.meeting_participant') IS NOT NULL THEN
    EXECUTE 'DROP TABLE public.meeting_participant';
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass('public.meeting') IS NOT NULL THEN
    EXECUTE 'DROP TABLE public.meeting';
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass('public.tenant_audit_event') IS NOT NULL THEN
    EXECUTE 'DROP TABLE public.tenant_audit_event';
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass('public.tenant_member') IS NOT NULL THEN
    EXECUTE 'DROP TABLE public.tenant_member';
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass('public.tenant_module_policy') IS NOT NULL THEN
    EXECUTE 'DROP TABLE public.tenant_module_policy';
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass('public.user') IS NOT NULL THEN
    EXECUTE 'DROP TABLE public.user';
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass('public.tenant') IS NOT NULL THEN
    EXECUTE 'DROP TABLE public.tenant';
  END IF;
END $$;

COMMIT;
