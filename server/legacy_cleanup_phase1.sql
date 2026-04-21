BEGIN;

DO $$
DECLARE
  c BIGINT;
BEGIN
  IF to_regclass('public.candidate_interview') IS NOT NULL THEN
    EXECUTE 'SELECT COUNT(*) FROM public.candidate_interview' INTO c;
    IF c = 0 THEN
      EXECUTE 'DROP TABLE public.candidate_interview';
    ELSE
      RAISE EXCEPTION 'Refusing to drop public.candidate_interview: % row(s) found', c;
    END IF;
  END IF;
END $$;

DO $$
DECLARE
  c BIGINT;
BEGIN
  IF to_regclass('public.onboarding_task') IS NOT NULL THEN
    EXECUTE 'SELECT COUNT(*) FROM public.onboarding_task' INTO c;
    IF c = 0 THEN
      EXECUTE 'DROP TABLE public.onboarding_task';
    ELSE
      RAISE EXCEPTION 'Refusing to drop public.onboarding_task: % row(s) found', c;
    END IF;
  END IF;
END $$;

DO $$
DECLARE
  c BIGINT;
BEGIN
  IF to_regclass('public.candidate') IS NOT NULL THEN
    EXECUTE 'SELECT COUNT(*) FROM public.candidate' INTO c;
    IF c = 0 THEN
      EXECUTE 'DROP TABLE public.candidate';
    ELSE
      RAISE EXCEPTION 'Refusing to drop public.candidate: % row(s) found', c;
    END IF;
  END IF;
END $$;

DO $$
DECLARE
  c BIGINT;
BEGIN
  IF to_regclass('public.job_posting') IS NOT NULL THEN
    EXECUTE 'SELECT COUNT(*) FROM public.job_posting' INTO c;
    IF c = 0 THEN
      EXECUTE 'DROP TABLE public.job_posting';
    ELSE
      RAISE EXCEPTION 'Refusing to drop public.job_posting: % row(s) found', c;
    END IF;
  END IF;
END $$;

DO $$
DECLARE
  c BIGINT;
BEGIN
  IF to_regclass('public.attendance_record') IS NOT NULL THEN
    EXECUTE 'SELECT COUNT(*) FROM public.attendance_record' INTO c;
    IF c = 0 THEN
      EXECUTE 'DROP TABLE public.attendance_record';
    ELSE
      RAISE EXCEPTION 'Refusing to drop public.attendance_record: % row(s) found', c;
    END IF;
  END IF;
END $$;

DO $$
DECLARE
  c BIGINT;
BEGIN
  IF to_regclass('public.leave_request') IS NOT NULL THEN
    EXECUTE 'SELECT COUNT(*) FROM public.leave_request' INTO c;
    IF c = 0 THEN
      EXECUTE 'DROP TABLE public.leave_request';
    ELSE
      RAISE EXCEPTION 'Refusing to drop public.leave_request: % row(s) found', c;
    END IF;
  END IF;
END $$;

DO $$
DECLARE
  c BIGINT;
BEGIN
  IF to_regclass('public.employee_record') IS NOT NULL THEN
    EXECUTE 'SELECT COUNT(*) FROM public.employee_record' INTO c;
    IF c = 0 THEN
      EXECUTE 'DROP TABLE public.employee_record';
    ELSE
      RAISE EXCEPTION 'Refusing to drop public.employee_record: % row(s) found', c;
    END IF;
  END IF;
END $$;

DO $$
DECLARE
  c BIGINT;
BEGIN
  IF to_regclass('public.office_integration') IS NOT NULL THEN
    EXECUTE 'SELECT COUNT(*) FROM public.office_integration' INTO c;
    IF c = 0 THEN
      EXECUTE 'DROP TABLE public.office_integration';
    ELSE
      RAISE EXCEPTION 'Refusing to drop public.office_integration: % row(s) found', c;
    END IF;
  END IF;
END $$;

DO $$
DECLARE
  c BIGINT;
BEGIN
  IF to_regclass('public.payroll_run') IS NOT NULL THEN
    EXECUTE 'SELECT COUNT(*) FROM public.payroll_run' INTO c;
    IF c = 0 THEN
      EXECUTE 'DROP TABLE public.payroll_run';
    ELSE
      RAISE EXCEPTION 'Refusing to drop public.payroll_run: % row(s) found', c;
    END IF;
  END IF;
END $$;

COMMIT;
