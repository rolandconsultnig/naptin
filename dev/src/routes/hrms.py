import json
from datetime import datetime

from flask import Blueprint, Response, jsonify, request, session

from src.models.user import (
    db,
    User,
    TenantMember,
    EmployeeRecord,
    JobPosting,
    Candidate,
    CandidateInterview,
    OnboardingTask,
    AttendanceRecord,
    LeaveRequest,
    PayrollRun,
    TenantAuditEvent,
)
from src.utils.tenant_access import resolve_user_tenant, is_segment_enabled_for_user

hrms_bp = Blueprint('hrms', __name__)


PIPELINE_STATUSES = {
    'applied',
    'screening',
    'interview',
    'offer',
    'hired',
    'rejected',
}


TASK_STATUSES = {'pending', 'in_progress', 'completed', 'blocked'}
LEAVE_STATUSES = {'pending', 'approved', 'rejected'}
PAYROLL_STATUSES = {'draft', 'processed', 'published'}

DEFAULT_LEAVE_POLICY = {
    'effective_from': None,
    'notes': None,
    'leave_types': {
        'annual': {
            'entitlement_days': 30,
            'accrual_schedule': 'monthly',
            'accrual_rate': 2.5,
            'carry_over_limit': 10,
        },
        'sick': {
            'entitlement_days': 15,
            'accrual_schedule': 'monthly',
            'accrual_rate': 1.25,
            'carry_over_limit': 0,
        },
        'study': {
            'entitlement_days': 10,
            'accrual_schedule': 'quarterly',
            'accrual_rate': 2.5,
            'carry_over_limit': 5,
        },
    },
}

DEFAULT_PAYROLL_POSTING_CONFIG = {
    'posting_mode': 'manual',
    'auto_post_on_publish': False,
    'journal_target': 'general-ledger',
    'last_posted_run_id': None,
    'last_posted_at': None,
}


def parse_score(value):
    if value is None:
        return None, None
    try:
        score = float(value)
    except (TypeError, ValueError):
        return None, 'score must be a number between 0 and 100'
    if score < 0 or score > 100:
        return None, 'score must be a number between 0 and 100'
    return score, None


def parse_rating(value):
    if value is None:
        return None, None
    try:
        rating = int(value)
    except (TypeError, ValueError):
        return None, 'rating must be an integer between 1 and 5'
    if rating < 1 or rating > 5:
        return None, 'rating must be an integer between 1 and 5'
    return rating, None


def require_auth():
    user_id = session.get('user_id')
    if not user_id:
        return None
    return User.query.get(user_id)


def require_hr_segment(user):
    if not is_segment_enabled_for_user(user.id, 'human-resource'):
        return jsonify({'error': 'Module disabled for tenant', 'segment': 'human-resource'}), 403
    return None


def has_hrms_config_write_access(user, tenant_id):
    if not user:
        return False
    if bool(getattr(user, 'is_admin', False)):
        return True

    membership = TenantMember.query.filter_by(tenant_id=tenant_id, user_id=user.id).first()
    role = (membership.role if membership else '') or ''
    normalized = str(role).strip().lower().replace('_', '-')
    allowed_roles = {'admin', 'owner', 'hr-admin', 'hr-manager'}
    return normalized in allowed_roles


def require_hrms_config_write_access(user, tenant):
    if has_hrms_config_write_access(user, tenant.id):
        return None
    return jsonify({'error': 'Insufficient role. HR policy/posting write access requires tenant admin/owner/hr-admin/hr-manager.'}), 403


def parse_date(value):
    if not value:
        return None
    try:
        return datetime.fromisoformat(value).date()
    except Exception:
        return None


def calc_duration_days(start_date, end_date):
    if not start_date or not end_date:
        return 1
    days = (end_date - start_date).days + 1
    return days if days > 0 else 1


def can_transition_payroll_status(current_status, next_status):
    allowed = {
        'draft': {'processed'},
        'processed': {'published'},
        'published': set(),
    }
    return next_status in allowed.get(current_status, set())


def normalized_leave_type(value):
    text = (value or '').strip().lower()
    if 'annual' in text:
        return 'annual'
    if 'sick' in text:
        return 'sick'
    if 'study' in text:
        return 'study'
    return 'other'


def overlap_days(start_a, end_a, start_b, end_b):
    start = max(start_a, start_b)
    end = min(end_a, end_b)
    if end < start:
        return 0
    return (end - start).days + 1


def calc_hours_and_overtime(clock_in_at, clock_out_at):
    if not clock_in_at or not clock_out_at:
        return None, 0
    if clock_out_at <= clock_in_at:
        return None, 0
    hours = round((clock_out_at - clock_in_at).total_seconds() / 3600, 2)
    overtime = round(max(0, hours - 8), 2)
    return hours, overtime


def parse_json_detail(value):
    if not value:
        return None
    try:
        return json.loads(value)
    except Exception:
        return None


def read_latest_tenant_config(tenant_id, action):
    row = TenantAuditEvent.query.filter_by(tenant_id=tenant_id, action=action).order_by(TenantAuditEvent.id.desc()).first()
    if not row:
        return None
    payload = parse_json_detail(row.detail)
    if not isinstance(payload, dict):
        return None
    return payload


def write_tenant_config(tenant_id, actor_user_id, action, payload):
    db.session.add(TenantAuditEvent(
        tenant_id=tenant_id,
        actor_user_id=actor_user_id,
        action=action,
        detail=json.dumps(payload),
    ))


def current_leave_policy(tenant_id):
    raw = read_latest_tenant_config(tenant_id, 'hrms_leave_policy_updated') or {}
    leave_types = raw.get('leave_types') if isinstance(raw.get('leave_types'), dict) else {}

    policy = {
        'effective_from': raw.get('effective_from'),
        'notes': raw.get('notes'),
        'leave_types': {},
    }
    for leave_key, defaults in DEFAULT_LEAVE_POLICY['leave_types'].items():
        source = leave_types.get(leave_key) if isinstance(leave_types.get(leave_key), dict) else {}
        policy['leave_types'][leave_key] = {
            'entitlement_days': int(source.get('entitlement_days', defaults['entitlement_days'])),
            'accrual_schedule': str(source.get('accrual_schedule', defaults['accrual_schedule'])).strip().lower(),
            'accrual_rate': float(source.get('accrual_rate', defaults['accrual_rate'])),
            'carry_over_limit': int(source.get('carry_over_limit', defaults['carry_over_limit'])),
        }
    return policy


def current_payroll_posting_config(tenant_id):
    raw = read_latest_tenant_config(tenant_id, 'hrms_payroll_posting_config_updated') or {}
    return {
        'posting_mode': str(raw.get('posting_mode', DEFAULT_PAYROLL_POSTING_CONFIG['posting_mode'])).strip().lower(),
        'auto_post_on_publish': bool(raw.get('auto_post_on_publish', DEFAULT_PAYROLL_POSTING_CONFIG['auto_post_on_publish'])),
        'journal_target': str(raw.get('journal_target', DEFAULT_PAYROLL_POSTING_CONFIG['journal_target'])).strip() or DEFAULT_PAYROLL_POSTING_CONFIG['journal_target'],
        'last_posted_run_id': raw.get('last_posted_run_id'),
        'last_posted_at': raw.get('last_posted_at'),
    }


def payroll_report_csv(rows):
    header = 'run_id,period_label,period_start,period_end,pay_date,status,staff_paid,gross_total,deductions_total,net_total\n'
    lines = [header]
    for row in rows:
        lines.append(
            f"{row.id},{row.period_label},{row.period_start},{row.period_end},{row.pay_date},{row.status},{row.staff_paid},{row.gross_total},{row.deductions_total},{row.net_total}\n"
        )
    return ''.join(lines)


def next_employee_number(tenant_id):
    count = EmployeeRecord.query.filter_by(tenant_id=tenant_id).count() + 1
    return f"EMP-{tenant_id:02d}-{count:05d}"


@hrms_bp.route('/hrms/summary', methods=['GET'])
def hrms_summary():
    user = require_auth()
    if not user:
        return jsonify({'error': 'Not authenticated'}), 401

    blocked = require_hr_segment(user)
    if blocked:
        return blocked

    tenant = resolve_user_tenant(user.id)
    if not tenant:
        return jsonify({'error': 'Tenant not found'}), 404

    total_employees = EmployeeRecord.query.filter_by(tenant_id=tenant.id).count()
    active_employees = EmployeeRecord.query.filter_by(tenant_id=tenant.id, employment_status='active').count()
    leave_employees = EmployeeRecord.query.filter_by(tenant_id=tenant.id, employment_status='leave').count()
    probation_employees = EmployeeRecord.query.filter_by(tenant_id=tenant.id, employment_status='probation').count()
    open_jobs = JobPosting.query.filter_by(tenant_id=tenant.id, status='open').count()
    total_candidates = Candidate.query.filter_by(tenant_id=tenant.id).count()
    hired_candidates = Candidate.query.filter_by(tenant_id=tenant.id, status='hired').count()

    return jsonify({
        'tenant': tenant.to_dict(),
        'summary': {
            'total_employees': total_employees,
            'active_employees': active_employees,
            'leave_employees': leave_employees,
            'probation_employees': probation_employees,
            'open_jobs': open_jobs,
            'total_candidates': total_candidates,
            'hired_candidates': hired_candidates,
        }
    })


@hrms_bp.route('/hrms/recruitment-analytics', methods=['GET'])
def hrms_recruitment_analytics():
    user = require_auth()
    if not user:
        return jsonify({'error': 'Not authenticated'}), 401

    blocked = require_hr_segment(user)
    if blocked:
        return blocked

    tenant = resolve_user_tenant(user.id)
    if not tenant:
        return jsonify({'error': 'Tenant not found'}), 404

    total_jobs = JobPosting.query.filter_by(tenant_id=tenant.id).count()
    open_jobs = JobPosting.query.filter_by(tenant_id=tenant.id, status='open').count()
    paused_jobs = JobPosting.query.filter_by(tenant_id=tenant.id, status='paused').count()
    closed_jobs = JobPosting.query.filter_by(tenant_id=tenant.id, status='closed').count()

    pipeline = {}
    for status in sorted(PIPELINE_STATUSES):
        pipeline[status] = Candidate.query.filter_by(tenant_id=tenant.id, status=status).count()

    total_candidates = sum(pipeline.values())
    total_tasks = OnboardingTask.query.filter_by(tenant_id=tenant.id).count()
    completed_tasks = OnboardingTask.query.filter_by(tenant_id=tenant.id, status='completed').count()
    completion_rate = 0
    if total_tasks > 0:
        completion_rate = round((completed_tasks / total_tasks) * 100, 2)

    return jsonify({
        'tenant': tenant.to_dict(),
        'analytics': {
            'total_jobs': total_jobs,
            'open_jobs': open_jobs,
            'paused_jobs': paused_jobs,
            'closed_jobs': closed_jobs,
            'total_candidates': total_candidates,
            'pipeline': pipeline,
            'onboarding_total_tasks': total_tasks,
            'onboarding_completed_tasks': completed_tasks,
            'onboarding_completion_rate': completion_rate,
        },
    })


@hrms_bp.route('/hrms/attendance-records', methods=['GET'])
def list_attendance_records():
    user = require_auth()
    if not user:
        return jsonify({'error': 'Not authenticated'}), 401

    blocked = require_hr_segment(user)
    if blocked:
        return blocked

    tenant = resolve_user_tenant(user.id)
    if not tenant:
        return jsonify({'error': 'Tenant not found'}), 404

    date_param = request.args.get('work_date')
    target_date = parse_date(date_param) if date_param else None

    query = AttendanceRecord.query.filter_by(tenant_id=tenant.id)
    if target_date:
        query = query.filter_by(work_date=target_date)

    rows = query.order_by(AttendanceRecord.work_date.desc(), AttendanceRecord.created_at.desc()).limit(300).all()
    return jsonify({'items': [r.to_dict() for r in rows]})


@hrms_bp.route('/hrms/attendance-records', methods=['POST'])
def create_attendance_record():
    user = require_auth()
    if not user:
        return jsonify({'error': 'Not authenticated'}), 401

    blocked = require_hr_segment(user)
    if blocked:
        return blocked

    tenant = resolve_user_tenant(user.id)
    if not tenant:
        return jsonify({'error': 'Tenant not found'}), 404

    data = request.get_json(silent=True) or {}
    employee_name = (data.get('employee_name') or '').strip()
    work_date = parse_date(data.get('work_date'))
    if not employee_name or not work_date:
        return jsonify({'error': 'employee_name and work_date are required'}), 400

    status = (data.get('status') or 'present').strip().lower()
    if status not in {'present', 'late', 'absent', 'remote'}:
        return jsonify({'error': 'Invalid status. Allowed: present, late, absent, remote'}), 400

    hours_worked = data.get('hours_worked')
    if hours_worked is not None:
        try:
            hours_worked = float(hours_worked)
        except (TypeError, ValueError):
            return jsonify({'error': 'hours_worked must be a number'}), 400

    employee_id = data.get('employee_id')
    employee = None
    if employee_id:
        employee = EmployeeRecord.query.filter_by(id=employee_id, tenant_id=tenant.id).first()
        if not employee:
            return jsonify({'error': 'Employee record not found'}), 404

    clock_in_at = parse_datetime(data.get('clock_in_at'))
    clock_out_at = parse_datetime(data.get('clock_out_at'))
    if data.get('clock_in_at') and not clock_in_at:
        return jsonify({'error': 'clock_in_at must be an ISO datetime string'}), 400
    if data.get('clock_out_at') and not clock_out_at:
        return jsonify({'error': 'clock_out_at must be an ISO datetime string'}), 400

    computed_hours, _ = calc_hours_and_overtime(clock_in_at, clock_out_at)
    if hours_worked is None:
        hours_worked = computed_hours

    row = AttendanceRecord(
        tenant_id=tenant.id,
        employee_id=employee.id if employee else None,
        employee_name=employee.full_name if employee else employee_name,
        department=(employee.department if employee else (data.get('department') or '').strip() or None),
        work_date=work_date,
        clock_in_at=clock_in_at,
        clock_out_at=clock_out_at,
        status=status,
        source=(data.get('source') or '').strip() or 'manual',
        hours_worked=hours_worked,
    )

    db.session.add(row)
    db.session.commit()
    return jsonify({'message': 'Attendance record created', 'item': row.to_dict()}), 201


@hrms_bp.route('/hrms/attendance-records/clock-in', methods=['POST'])
def attendance_clock_in():
    user = require_auth()
    if not user:
        return jsonify({'error': 'Not authenticated'}), 401

    blocked = require_hr_segment(user)
    if blocked:
        return blocked

    tenant = resolve_user_tenant(user.id)
    if not tenant:
        return jsonify({'error': 'Tenant not found'}), 404

    data = request.get_json(silent=True) or {}
    employee_id = data.get('employee_id')
    employee_name = (data.get('employee_name') or '').strip()
    work_date = parse_date(data.get('work_date')) or datetime.utcnow().date()
    clock_in_at = parse_datetime(data.get('clock_in_at')) or datetime.utcnow()

    employee = None
    if employee_id:
        employee = EmployeeRecord.query.filter_by(id=employee_id, tenant_id=tenant.id).first()
        if not employee:
            return jsonify({'error': 'Employee record not found'}), 404

    if not employee and not employee_name:
        return jsonify({'error': 'employee_name or employee_id is required'}), 400

    query = AttendanceRecord.query.filter_by(tenant_id=tenant.id, work_date=work_date)
    if employee:
        row = query.filter_by(employee_id=employee.id).first()
    else:
        row = query.filter_by(employee_name=employee_name).first()

    if not row:
        row = AttendanceRecord(
            tenant_id=tenant.id,
            employee_id=employee.id if employee else None,
            employee_name=employee.full_name if employee else employee_name,
            department=(employee.department if employee else (data.get('department') or '').strip() or None),
            work_date=work_date,
            status='present',
            source='clock_in',
            clock_in_at=clock_in_at,
        )
        db.session.add(row)
    else:
        row.clock_in_at = clock_in_at
        row.status = row.status if row.status in {'remote', 'absent'} else 'present'
        row.source = 'clock_in'
        if employee and not row.employee_id:
            row.employee_id = employee.id
            row.employee_name = employee.full_name
            row.department = employee.department

    db.session.commit()
    return jsonify({'message': 'Clock-in recorded', 'item': row.to_dict()})


@hrms_bp.route('/hrms/attendance-records/clock-out', methods=['POST'])
def attendance_clock_out():
    user = require_auth()
    if not user:
        return jsonify({'error': 'Not authenticated'}), 401

    blocked = require_hr_segment(user)
    if blocked:
        return blocked

    tenant = resolve_user_tenant(user.id)
    if not tenant:
        return jsonify({'error': 'Tenant not found'}), 404

    data = request.get_json(silent=True) or {}
    employee_id = data.get('employee_id')
    employee_name = (data.get('employee_name') or '').strip()
    work_date = parse_date(data.get('work_date')) or datetime.utcnow().date()
    clock_out_at = parse_datetime(data.get('clock_out_at')) or datetime.utcnow()

    query = AttendanceRecord.query.filter_by(tenant_id=tenant.id, work_date=work_date)
    row = None
    if employee_id:
        row = query.filter_by(employee_id=employee_id).first()
    if not row and employee_name:
        row = query.filter_by(employee_name=employee_name).first()
    if not row:
        return jsonify({'error': 'Attendance record not found for employee/work_date'}), 404

    row.clock_out_at = clock_out_at
    hours_worked, overtime_hours = calc_hours_and_overtime(row.clock_in_at, row.clock_out_at)
    if hours_worked is not None:
        row.hours_worked = hours_worked
    row.source = 'clock_out'

    db.session.commit()
    return jsonify({
        'message': 'Clock-out recorded',
        'item': row.to_dict(),
        'overtime_hours': overtime_hours,
    })


@hrms_bp.route('/hrms/attendance-summary', methods=['GET'])
def attendance_summary():
    user = require_auth()
    if not user:
        return jsonify({'error': 'Not authenticated'}), 401

    blocked = require_hr_segment(user)
    if blocked:
        return blocked

    tenant = resolve_user_tenant(user.id)
    if not tenant:
        return jsonify({'error': 'Tenant not found'}), 404

    work_date = parse_date(request.args.get('work_date')) or datetime.utcnow().date()
    rows = AttendanceRecord.query.filter_by(tenant_id=tenant.id, work_date=work_date).all()
    if not rows:
        return jsonify({'work_date': work_date.isoformat(), 'items': [], 'overtime_hours': 0})

    overtime_hours = round(sum(max(0, float(row.hours_worked or 0) - 8) for row in rows), 2)

    by_department = {}
    for row in rows:
        dept = row.department or 'Unassigned'
        if dept not in by_department:
            by_department[dept] = {'expected': 0, 'present': 0}
        by_department[dept]['expected'] += 1
        if row.status in {'present', 'late', 'remote'}:
            by_department[dept]['present'] += 1

    items = []
    for dept, stats in by_department.items():
        expected = stats['expected']
        present = stats['present']
        rate = 0 if expected == 0 else round((present / expected) * 100, 1)
        items.append({'site': dept, 'present': present, 'expected': expected, 'rate': rate})

    items.sort(key=lambda i: i['site'])
    return jsonify({'work_date': work_date.isoformat(), 'items': items, 'overtime_hours': overtime_hours})


@hrms_bp.route('/hrms/leave-balances', methods=['GET'])
def leave_balances():
    user = require_auth()
    if not user:
        return jsonify({'error': 'Not authenticated'}), 401

    blocked = require_hr_segment(user)
    if blocked:
        return blocked

    tenant = resolve_user_tenant(user.id)
    if not tenant:
        return jsonify({'error': 'Tenant not found'}), 404

    year = request.args.get('year', type=int) or datetime.utcnow().year
    year_start = datetime(year, 1, 1).date()
    year_end = datetime(year, 12, 31).date()
    employee_id_filter = request.args.get('employee_id', type=int)

    employee_query = EmployeeRecord.query.filter_by(tenant_id=tenant.id)
    if employee_id_filter:
        employee_query = employee_query.filter_by(id=employee_id_filter)
    employees = employee_query.order_by(EmployeeRecord.full_name.asc()).all()

    if not employees:
        return jsonify({'year': year, 'items': [], 'summary': {'employees': 0}})

    entitlements = {'annual': 30, 'sick': 15, 'study': 10, 'other': 5}
    by_employee = {
        e.id: {
            'employee_id': e.id,
            'employee_number': e.employee_number,
            'employee_name': e.full_name,
            'department': e.department,
            'entitlements': dict(entitlements),
            'used': {'annual': 0, 'sick': 0, 'study': 0, 'other': 0},
        }
        for e in employees
    }

    leave_query = LeaveRequest.query.filter_by(tenant_id=tenant.id, status='approved')
    if employee_id_filter:
        leave_query = leave_query.filter_by(employee_id=employee_id_filter)
    leave_rows = leave_query.all()

    for row in leave_rows:
        if not row.employee_id or row.employee_id not in by_employee:
            continue
        days = overlap_days(row.start_date, row.end_date, year_start, year_end)
        if days <= 0:
            continue
        key = normalized_leave_type(row.leave_type)
        by_employee[row.employee_id]['used'][key] += days

    items = []
    for payload in by_employee.values():
        remaining = {}
        for key, entitled in payload['entitlements'].items():
            used = payload['used'][key]
            remaining[key] = max(0, entitled - used)
        payload['remaining'] = remaining
        payload['total_used'] = sum(payload['used'].values())
        payload['total_remaining'] = sum(remaining.values())
        items.append(payload)

    return jsonify({
        'year': year,
        'items': items,
        'summary': {
            'employees': len(items),
            'total_used_days': sum(i['total_used'] for i in items),
            'total_remaining_days': sum(i['total_remaining'] for i in items),
        }
    })


@hrms_bp.route('/hrms/leave-policy', methods=['GET'])
def get_leave_policy():
    user = require_auth()
    if not user:
        return jsonify({'error': 'Not authenticated'}), 401

    blocked = require_hr_segment(user)
    if blocked:
        return blocked

    tenant = resolve_user_tenant(user.id)
    if not tenant:
        return jsonify({'error': 'Tenant not found'}), 404

    return jsonify({'policy': current_leave_policy(tenant.id)})


@hrms_bp.route('/hrms/leave-policy', methods=['PUT'])
def update_leave_policy():
    user = require_auth()
    if not user:
        return jsonify({'error': 'Not authenticated'}), 401

    blocked = require_hr_segment(user)
    if blocked:
        return blocked

    tenant = resolve_user_tenant(user.id)
    if not tenant:
        return jsonify({'error': 'Tenant not found'}), 404

    unauthorized = require_hrms_config_write_access(user, tenant)
    if unauthorized:
        return unauthorized

    data = request.get_json(silent=True) or {}
    base = current_leave_policy(tenant.id)

    effective_from = parse_date(data.get('effective_from')) if data.get('effective_from') else None
    if data.get('effective_from') and not effective_from:
        return jsonify({'error': 'effective_from must be an ISO date string'}), 400
    base['effective_from'] = effective_from.isoformat() if effective_from else base.get('effective_from')
    if 'notes' in data:
        base['notes'] = (data.get('notes') or '').strip() or None

    incoming_types = data.get('leave_types') if isinstance(data.get('leave_types'), dict) else {}
    allowed_schedules = {'monthly', 'quarterly', 'yearly'}
    for leave_key in base['leave_types'].keys():
        payload = incoming_types.get(leave_key)
        if not isinstance(payload, dict):
            continue

        if 'entitlement_days' in payload:
            try:
                entitlement = int(payload.get('entitlement_days'))
            except (TypeError, ValueError):
                return jsonify({'error': f'{leave_key}.entitlement_days must be an integer'}), 400
            if entitlement < 0:
                return jsonify({'error': f'{leave_key}.entitlement_days must be >= 0'}), 400
            base['leave_types'][leave_key]['entitlement_days'] = entitlement

        if 'accrual_schedule' in payload:
            schedule = str(payload.get('accrual_schedule') or '').strip().lower()
            if schedule not in allowed_schedules:
                return jsonify({'error': f'{leave_key}.accrual_schedule must be one of monthly, quarterly, yearly'}), 400
            base['leave_types'][leave_key]['accrual_schedule'] = schedule

        if 'accrual_rate' in payload:
            try:
                rate = float(payload.get('accrual_rate'))
            except (TypeError, ValueError):
                return jsonify({'error': f'{leave_key}.accrual_rate must be numeric'}), 400
            if rate < 0:
                return jsonify({'error': f'{leave_key}.accrual_rate must be >= 0'}), 400
            base['leave_types'][leave_key]['accrual_rate'] = rate

        if 'carry_over_limit' in payload:
            try:
                carry = int(payload.get('carry_over_limit'))
            except (TypeError, ValueError):
                return jsonify({'error': f'{leave_key}.carry_over_limit must be an integer'}), 400
            if carry < 0:
                return jsonify({'error': f'{leave_key}.carry_over_limit must be >= 0'}), 400
            base['leave_types'][leave_key]['carry_over_limit'] = carry

    write_tenant_config(tenant.id, user.id, 'hrms_leave_policy_updated', base)
    db.session.commit()
    return jsonify({'message': 'Leave policy updated', 'policy': base})


@hrms_bp.route('/hrms/leave-accrual-preview', methods=['GET'])
def leave_accrual_preview():
    user = require_auth()
    if not user:
        return jsonify({'error': 'Not authenticated'}), 401

    blocked = require_hr_segment(user)
    if blocked:
        return blocked

    tenant = resolve_user_tenant(user.id)
    if not tenant:
        return jsonify({'error': 'Tenant not found'}), 404

    policy = current_leave_policy(tenant.id)
    year = request.args.get('year', type=int) or datetime.utcnow().year
    as_of = parse_date(request.args.get('as_of')) or datetime.utcnow().date()
    as_of = min(as_of, datetime(year, 12, 31).date())
    year_start = datetime(year, 1, 1).date()
    elapsed_days = max(0, (as_of - year_start).days + 1)
    year_days = 366 if (year % 4 == 0 and (year % 100 != 0 or year % 400 == 0)) else 365
    accrued_fraction = min(1, elapsed_days / year_days)

    balances = leave_balances().get_json(silent=True) if hasattr(leave_balances(), 'get_json') else None
    used_by_employee = {}
    if isinstance(balances, dict):
        for row in balances.get('items', []):
            used_by_employee[row.get('employee_id')] = row.get('used', {})

    rows = EmployeeRecord.query.filter_by(tenant_id=tenant.id).order_by(EmployeeRecord.full_name.asc()).all()
    items = []
    for employee in rows:
        used = used_by_employee.get(employee.id, {})
        by_type = {}
        for leave_key, cfg in policy['leave_types'].items():
            accrued = round(float(cfg.get('entitlement_days', 0)) * accrued_fraction, 2)
            consumed = float(used.get(leave_key, 0) or 0)
            by_type[leave_key] = {
                'accrued': accrued,
                'used': consumed,
                'available': round(max(0, accrued - consumed), 2),
                'schedule': cfg.get('accrual_schedule'),
            }
        items.append({
            'employee_id': employee.id,
            'employee_name': employee.full_name,
            'department': employee.department,
            'as_of': as_of.isoformat(),
            'accrual': by_type,
        })

    return jsonify({'year': year, 'as_of': as_of.isoformat(), 'items': items, 'policy': policy})


@hrms_bp.route('/hrms/leave-requests', methods=['GET'])
def list_leave_requests():
    user = require_auth()
    if not user:
        return jsonify({'error': 'Not authenticated'}), 401

    blocked = require_hr_segment(user)
    if blocked:
        return blocked

    tenant = resolve_user_tenant(user.id)
    if not tenant:
        return jsonify({'error': 'Tenant not found'}), 404

    rows = LeaveRequest.query.filter_by(tenant_id=tenant.id).order_by(LeaveRequest.created_at.desc()).limit(300).all()
    return jsonify({'items': [r.to_dict() for r in rows]})


@hrms_bp.route('/hrms/leave-requests', methods=['POST'])
def create_leave_request():
    user = require_auth()
    if not user:
        return jsonify({'error': 'Not authenticated'}), 401

    blocked = require_hr_segment(user)
    if blocked:
        return blocked

    tenant = resolve_user_tenant(user.id)
    if not tenant:
        return jsonify({'error': 'Tenant not found'}), 404

    data = request.get_json(silent=True) or {}
    leave_type = (data.get('leave_type') or '').strip()
    start_date = parse_date(data.get('start_date'))
    end_date = parse_date(data.get('end_date'))

    if not leave_type or not start_date or not end_date:
        return jsonify({'error': 'leave_type, start_date, and end_date are required'}), 400
    if end_date < start_date:
        return jsonify({'error': 'end_date cannot be before start_date'}), 400

    employee_id = data.get('employee_id')
    employee = None
    if employee_id:
        employee = EmployeeRecord.query.filter_by(id=employee_id, tenant_id=tenant.id).first()
        if not employee:
            return jsonify({'error': 'Employee record not found'}), 404

    row = LeaveRequest(
        tenant_id=tenant.id,
        employee_id=employee.id if employee else None,
        leave_type=leave_type,
        start_date=start_date,
        end_date=end_date,
        duration_days=calc_duration_days(start_date, end_date),
        reason=(data.get('reason') or '').strip() or None,
        status='pending',
    )

    db.session.add(row)
    db.session.commit()
    return jsonify({'message': 'Leave request submitted', 'item': row.to_dict()}), 201


@hrms_bp.route('/hrms/leave-requests/<int:leave_request_id>/status', methods=['PUT'])
def update_leave_request_status(leave_request_id):
    user = require_auth()
    if not user:
        return jsonify({'error': 'Not authenticated'}), 401

    blocked = require_hr_segment(user)
    if blocked:
        return blocked

    tenant = resolve_user_tenant(user.id)
    if not tenant:
        return jsonify({'error': 'Tenant not found'}), 404

    row = LeaveRequest.query.filter_by(id=leave_request_id, tenant_id=tenant.id).first()
    if not row:
        return jsonify({'error': 'Leave request not found'}), 404

    data = request.get_json(silent=True) or {}
    status = (data.get('status') or '').strip().lower()
    if status not in LEAVE_STATUSES:
        return jsonify({'error': 'Invalid status. Allowed: pending, approved, rejected'}), 400

    row.status = status
    row.reviewed_by = user.id
    row.reviewed_at = datetime.utcnow()
    db.session.commit()
    return jsonify({'message': 'Leave request status updated', 'item': row.to_dict()})


@hrms_bp.route('/hrms/payroll-runs', methods=['GET'])
def list_payroll_runs():
    user = require_auth()
    if not user:
        return jsonify({'error': 'Not authenticated'}), 401

    blocked = require_hr_segment(user)
    if blocked:
        return blocked

    tenant = resolve_user_tenant(user.id)
    if not tenant:
        return jsonify({'error': 'Tenant not found'}), 404

    rows = PayrollRun.query.filter_by(tenant_id=tenant.id).order_by(PayrollRun.pay_date.desc(), PayrollRun.created_at.desc()).all()
    return jsonify({'items': [r.to_dict() for r in rows]})


@hrms_bp.route('/hrms/payroll-runs', methods=['POST'])
def create_payroll_run():
    user = require_auth()
    if not user:
        return jsonify({'error': 'Not authenticated'}), 401

    blocked = require_hr_segment(user)
    if blocked:
        return blocked

    tenant = resolve_user_tenant(user.id)
    if not tenant:
        return jsonify({'error': 'Tenant not found'}), 404

    data = request.get_json(silent=True) or {}
    period_label = (data.get('period_label') or '').strip()
    period_start = parse_date(data.get('period_start'))
    period_end = parse_date(data.get('period_end'))
    pay_date = parse_date(data.get('pay_date'))
    if not period_label or not period_start or not period_end or not pay_date:
        return jsonify({'error': 'period_label, period_start, period_end, and pay_date are required'}), 400
    if period_end < period_start:
        return jsonify({'error': 'period_end cannot be before period_start'}), 400

    staff_paid = data.get('staff_paid', 0)
    gross_total = data.get('gross_total', 0)
    deductions_total = data.get('deductions_total', 0)
    net_total = data.get('net_total', 0)

    try:
        staff_paid = int(staff_paid)
        gross_total = float(gross_total)
        deductions_total = float(deductions_total)
        net_total = float(net_total)
    except (TypeError, ValueError):
        return jsonify({'error': 'staff_paid, gross_total, deductions_total, and net_total must be numeric'}), 400

    status = (data.get('status') or 'processed').strip().lower()
    if status not in PAYROLL_STATUSES:
        return jsonify({'error': 'Invalid status. Allowed: draft, processed, published'}), 400

    row = PayrollRun(
        tenant_id=tenant.id,
        period_label=period_label,
        period_start=period_start,
        period_end=period_end,
        pay_date=pay_date,
        status=status,
        staff_paid=staff_paid,
        gross_total=gross_total,
        deductions_total=deductions_total,
        net_total=net_total,
        notes=(data.get('notes') or '').strip() or None,
        created_by=user.id,
    )

    db.session.add(row)
    db.session.commit()
    return jsonify({'message': 'Payroll run created', 'item': row.to_dict()}), 201


@hrms_bp.route('/hrms/payroll-runs/rollup', methods=['POST'])
def rollup_payroll_run():
    user = require_auth()
    if not user:
        return jsonify({'error': 'Not authenticated'}), 401

    blocked = require_hr_segment(user)
    if blocked:
        return blocked

    tenant = resolve_user_tenant(user.id)
    if not tenant:
        return jsonify({'error': 'Tenant not found'}), 404

    data = request.get_json(silent=True) or {}
    period_label = (data.get('period_label') or '').strip()
    period_start = parse_date(data.get('period_start'))
    period_end = parse_date(data.get('period_end'))
    pay_date = parse_date(data.get('pay_date'))

    if not period_label or not period_start or not period_end or not pay_date:
        return jsonify({'error': 'period_label, period_start, period_end, and pay_date are required'}), 400
    if period_end < period_start:
        return jsonify({'error': 'period_end cannot be before period_start'}), 400

    try:
        daily_rate = float(data.get('daily_rate', 25000))
        overtime_hourly_rate = float(data.get('overtime_hourly_rate', 3000))
        overtime_multiplier = float(data.get('overtime_multiplier', 1.5))
        deduction_rate = float(data.get('deduction_rate', 0.15))
    except (TypeError, ValueError):
        return jsonify({'error': 'daily_rate, overtime_hourly_rate, overtime_multiplier, and deduction_rate must be numeric'}), 400

    employee_rows = EmployeeRecord.query.filter_by(tenant_id=tenant.id).all()
    tracked_employee_ids = {e.id for e in employee_rows}

    attendance_rows = AttendanceRecord.query.filter(
        AttendanceRecord.tenant_id == tenant.id,
        AttendanceRecord.work_date >= period_start,
        AttendanceRecord.work_date <= period_end,
    ).all()

    attendance_by_employee = {}
    for row in attendance_rows:
        key = row.employee_id or f"name:{(row.employee_name or '').strip().lower()}"
        if key not in attendance_by_employee:
            attendance_by_employee[key] = {'days': set(), 'overtime_hours': 0}
        if row.status in {'present', 'late', 'remote'}:
            attendance_by_employee[key]['days'].add(row.work_date.isoformat())
        overtime = max(0, float(row.hours_worked or 0) - 8)
        attendance_by_employee[key]['overtime_hours'] += overtime

    leave_rows = LeaveRequest.query.filter_by(tenant_id=tenant.id, status='approved').all()
    leave_days_by_employee = {}
    for row in leave_rows:
        if not row.employee_id or row.employee_id not in tracked_employee_ids:
            continue
        days = overlap_days(row.start_date, row.end_date, period_start, period_end)
        if days <= 0:
            continue
        leave_days_by_employee[row.employee_id] = leave_days_by_employee.get(row.employee_id, 0) + days

    breakdown = []
    gross_total = 0
    deductions_total = 0
    net_total = 0
    staff_paid = 0

    for employee in employee_rows:
        key = employee.id
        att = attendance_by_employee.get(key) or attendance_by_employee.get(f"name:{(employee.full_name or '').strip().lower()}") or {'days': set(), 'overtime_hours': 0}
        attendance_days = len(att['days'])
        approved_leave_days = leave_days_by_employee.get(employee.id, 0)
        payable_days = attendance_days + approved_leave_days
        overtime_hours = round(att['overtime_hours'], 2)

        gross_pay = round((payable_days * daily_rate) + (overtime_hours * overtime_hourly_rate * overtime_multiplier), 2)
        deductions = round(gross_pay * deduction_rate, 2)
        net_pay = round(gross_pay - deductions, 2)

        if gross_pay > 0:
            staff_paid += 1

        gross_total += gross_pay
        deductions_total += deductions
        net_total += net_pay

        breakdown.append({
            'employee_id': employee.id,
            'employee_name': employee.full_name,
            'attendance_days': attendance_days,
            'approved_leave_days': approved_leave_days,
            'payable_days': payable_days,
            'overtime_hours': overtime_hours,
            'gross_pay': gross_pay,
            'deductions': deductions,
            'net_pay': net_pay,
        })

    payroll_run = PayrollRun(
        tenant_id=tenant.id,
        period_label=period_label,
        period_start=period_start,
        period_end=period_end,
        pay_date=pay_date,
        status='draft',
        staff_paid=staff_paid,
        gross_total=round(gross_total, 2),
        deductions_total=round(deductions_total, 2),
        net_total=round(net_total, 2),
        notes='Auto rollup from attendance and approved leave',
        created_by=user.id,
    )

    db.session.add(payroll_run)
    db.session.commit()

    breakdown.sort(key=lambda item: item['employee_name'] or '')
    return jsonify({
        'message': 'Payroll rollup completed',
        'item': payroll_run.to_dict(),
        'inputs': {
            'daily_rate': daily_rate,
            'overtime_hourly_rate': overtime_hourly_rate,
            'overtime_multiplier': overtime_multiplier,
            'deduction_rate': deduction_rate,
        },
        'breakdown': breakdown,
    }), 201


@hrms_bp.route('/hrms/payroll-runs/<int:payroll_run_id>/status', methods=['PUT'])
def update_payroll_run_status(payroll_run_id):
    user = require_auth()
    if not user:
        return jsonify({'error': 'Not authenticated'}), 401

    blocked = require_hr_segment(user)
    if blocked:
        return blocked

    tenant = resolve_user_tenant(user.id)
    if not tenant:
        return jsonify({'error': 'Tenant not found'}), 404

    unauthorized = require_hrms_config_write_access(user, tenant)
    if unauthorized:
        return unauthorized

    row = PayrollRun.query.filter_by(id=payroll_run_id, tenant_id=tenant.id).first()
    if not row:
        return jsonify({'error': 'Payroll run not found'}), 404

    data = request.get_json(silent=True) or {}
    next_status = (data.get('status') or '').strip().lower()
    if next_status not in PAYROLL_STATUSES:
        return jsonify({'error': 'Invalid status. Allowed: draft, processed, published'}), 400

    current = (row.status or 'draft').strip().lower()
    if next_status == current:
        return jsonify({'message': 'Payroll status unchanged', 'item': row.to_dict()})

    if not can_transition_payroll_status(current, next_status):
        return jsonify({'error': f'Invalid payroll transition: {current} -> {next_status}. Allowed flow: draft -> processed -> published'}), 400

    row.status = next_status

    auto_posted = False
    if next_status == 'published':
        posting_cfg = current_payroll_posting_config(tenant.id)
        if posting_cfg.get('auto_post_on_publish'):
            posting_cfg['last_posted_run_id'] = row.id
            posting_cfg['last_posted_at'] = datetime.utcnow().isoformat()
            write_tenant_config(tenant.id, user.id, 'hrms_payroll_posting_config_updated', posting_cfg)
            write_tenant_config(tenant.id, user.id, 'hrms_payroll_run_posted', {
                'payroll_run_id': row.id,
                'period_label': row.period_label,
                'journal_target': posting_cfg.get('journal_target'),
                'posted_at': posting_cfg['last_posted_at'],
                'posting_mode': posting_cfg.get('posting_mode'),
            })
            auto_posted = True

    db.session.commit()
    return jsonify({'message': 'Payroll run status updated', 'item': row.to_dict(), 'auto_posted': auto_posted})


@hrms_bp.route('/hrms/payroll-posting-config', methods=['GET'])
def get_payroll_posting_config():
    user = require_auth()
    if not user:
        return jsonify({'error': 'Not authenticated'}), 401

    blocked = require_hr_segment(user)
    if blocked:
        return blocked

    tenant = resolve_user_tenant(user.id)
    if not tenant:
        return jsonify({'error': 'Tenant not found'}), 404

    return jsonify({'config': current_payroll_posting_config(tenant.id)})


@hrms_bp.route('/hrms/payroll-posting-config', methods=['PUT'])
def update_payroll_posting_config():
    user = require_auth()
    if not user:
        return jsonify({'error': 'Not authenticated'}), 401

    blocked = require_hr_segment(user)
    if blocked:
        return blocked

    tenant = resolve_user_tenant(user.id)
    if not tenant:
        return jsonify({'error': 'Tenant not found'}), 404

    unauthorized = require_hrms_config_write_access(user, tenant)
    if unauthorized:
        return unauthorized

    data = request.get_json(silent=True) or {}
    cfg = current_payroll_posting_config(tenant.id)

    if 'posting_mode' in data:
        mode = str(data.get('posting_mode') or '').strip().lower()
        if mode not in {'manual', 'auto'}:
            return jsonify({'error': 'posting_mode must be manual or auto'}), 400
        cfg['posting_mode'] = mode
    if 'auto_post_on_publish' in data:
        cfg['auto_post_on_publish'] = bool(data.get('auto_post_on_publish'))
    if 'journal_target' in data:
        cfg['journal_target'] = (str(data.get('journal_target') or '').strip() or 'general-ledger')

    write_tenant_config(tenant.id, user.id, 'hrms_payroll_posting_config_updated', cfg)
    db.session.commit()
    return jsonify({'message': 'Payroll posting config updated', 'config': cfg})


@hrms_bp.route('/hrms/payroll-runs/<int:payroll_run_id>/post', methods=['POST'])
def post_payroll_run(payroll_run_id):
    user = require_auth()
    if not user:
        return jsonify({'error': 'Not authenticated'}), 401

    blocked = require_hr_segment(user)
    if blocked:
        return blocked

    tenant = resolve_user_tenant(user.id)
    if not tenant:
        return jsonify({'error': 'Tenant not found'}), 404

    unauthorized = require_hrms_config_write_access(user, tenant)
    if unauthorized:
        return unauthorized

    run = PayrollRun.query.filter_by(id=payroll_run_id, tenant_id=tenant.id).first()
    if not run:
        return jsonify({'error': 'Payroll run not found'}), 404
    if run.status != 'published':
        return jsonify({'error': 'Payroll run must be published before posting'}), 400

    cfg = current_payroll_posting_config(tenant.id)
    posted_at = datetime.utcnow().isoformat()
    cfg['last_posted_run_id'] = run.id
    cfg['last_posted_at'] = posted_at

    write_tenant_config(tenant.id, user.id, 'hrms_payroll_posting_config_updated', cfg)
    write_tenant_config(tenant.id, user.id, 'hrms_payroll_run_posted', {
        'payroll_run_id': run.id,
        'period_label': run.period_label,
        'journal_target': cfg.get('journal_target'),
        'posted_at': posted_at,
        'posting_mode': cfg.get('posting_mode'),
    })
    db.session.commit()

    return jsonify({
        'message': 'Payroll run posted successfully',
        'item': run.to_dict(),
        'posting': {
            'journal_target': cfg.get('journal_target'),
            'posted_at': posted_at,
            'posting_mode': cfg.get('posting_mode'),
        },
    })


@hrms_bp.route('/hrms/payroll-runs/report', methods=['GET'])
def export_payroll_report():
    user = require_auth()
    if not user:
        return jsonify({'error': 'Not authenticated'}), 401

    blocked = require_hr_segment(user)
    if blocked:
        return blocked

    tenant = resolve_user_tenant(user.id)
    if not tenant:
        return jsonify({'error': 'Tenant not found'}), 404

    period_start = parse_date(request.args.get('period_start'))
    period_end = parse_date(request.args.get('period_end'))
    export_format = (request.args.get('format') or 'json').strip().lower()

    query = PayrollRun.query.filter_by(tenant_id=tenant.id)
    if period_start:
        query = query.filter(PayrollRun.period_start >= period_start)
    if period_end:
        query = query.filter(PayrollRun.period_end <= period_end)

    rows = query.order_by(PayrollRun.pay_date.desc(), PayrollRun.id.desc()).all()
    data_rows = [r.to_dict() for r in rows]

    if export_format == 'csv':
        csv_data = payroll_report_csv(rows)
        return Response(
            csv_data,
            mimetype='text/csv',
            headers={'Content-Disposition': f'attachment; filename=payroll_report_{tenant.key}.csv'}
        )

    if export_format not in {'json', 'csv'}:
        return jsonify({'error': 'format must be json or csv'}), 400

    return jsonify({
        'tenant': tenant.to_dict(),
        'count': len(data_rows),
        'items': data_rows,
        'summary': {
            'gross_total': round(sum(float(r.gross_total or 0) for r in rows), 2),
            'deductions_total': round(sum(float(r.deductions_total or 0) for r in rows), 2),
            'net_total': round(sum(float(r.net_total or 0) for r in rows), 2),
        },
    })


@hrms_bp.route('/hrms/audit-trail', methods=['GET'])
def hrms_audit_trail():
    user = require_auth()
    if not user:
        return jsonify({'error': 'Not authenticated'}), 401

    blocked = require_hr_segment(user)
    if blocked:
        return blocked

    tenant = resolve_user_tenant(user.id)
    if not tenant:
        return jsonify({'error': 'Tenant not found'}), 404

    limit = request.args.get('limit', type=int) or 50
    if limit < 1:
        limit = 1
    if limit > 200:
        limit = 200

    rows = TenantAuditEvent.query.filter(
        TenantAuditEvent.tenant_id == tenant.id,
        TenantAuditEvent.action.like('hrms_%'),
    ).order_by(TenantAuditEvent.created_at.desc(), TenantAuditEvent.id.desc()).limit(limit).all()

    items = []
    for row in rows:
        detail_json = parse_json_detail(row.detail)
        items.append({
            'id': row.id,
            'created_at': row.created_at.isoformat() if row.created_at else None,
            'actor_user_id': row.actor_user_id,
            'actor_username': row.actor.username if row.actor else None,
            'actor_email': row.actor.email if row.actor else None,
            'action': row.action,
            'detail': row.detail,
            'detail_json': detail_json,
        })

    return jsonify({'items': items, 'count': len(items)})


@hrms_bp.route('/hrms/workforce-analytics', methods=['GET'])
def workforce_analytics():
    user = require_auth()
    if not user:
        return jsonify({'error': 'Not authenticated'}), 401

    blocked = require_hr_segment(user)
    if blocked:
        return blocked

    tenant = resolve_user_tenant(user.id)
    if not tenant:
        return jsonify({'error': 'Tenant not found'}), 404

    today = datetime.utcnow().date()

    leave_pending = LeaveRequest.query.filter_by(tenant_id=tenant.id, status='pending').count()
    leave_approved = LeaveRequest.query.filter_by(tenant_id=tenant.id, status='approved').count()
    leave_rejected = LeaveRequest.query.filter_by(tenant_id=tenant.id, status='rejected').count()
    leave_total = leave_pending + leave_approved + leave_rejected
    leave_approval_rate = 0
    if leave_total > 0:
        leave_approval_rate = round((leave_approved / leave_total) * 100, 2)

    employees = EmployeeRecord.query.filter_by(tenant_id=tenant.id).all()
    attendance_today = AttendanceRecord.query.filter_by(tenant_id=tenant.id, work_date=today).all()
    attendance_expected = len(employees)
    attendance_present = sum(1 for row in attendance_today if row.status in {'present', 'late', 'remote'})
    overtime_hours = round(sum(max(0, float(row.hours_worked or 0) - 8) for row in attendance_today), 2)
    attendance_rate = 0
    if attendance_expected > 0:
        attendance_rate = round((attendance_present / attendance_expected) * 100, 2)

    payroll_rows = PayrollRun.query.filter_by(tenant_id=tenant.id).order_by(PayrollRun.pay_date.desc()).limit(12).all()
    payroll_total_runs = len(payroll_rows)
    payroll_total_net = round(sum(float(row.net_total or 0) for row in payroll_rows), 2)
    payroll_processed = sum(1 for row in payroll_rows if row.status == 'processed')
    payroll_published = sum(1 for row in payroll_rows if row.status == 'published')
    payroll_draft = sum(1 for row in payroll_rows if row.status == 'draft')

    return jsonify({
        'tenant': tenant.to_dict(),
        'analytics': {
            'as_of_date': today.isoformat(),
            'attendance': {
                'expected_today': attendance_expected,
                'present_today': attendance_present,
                'attendance_rate_today': attendance_rate,
            },
            'leave': {
                'pending_requests': leave_pending,
                'approved_requests': leave_approved,
                'rejected_requests': leave_rejected,
                'approval_rate': leave_approval_rate,
            },
            'payroll': {
                'runs_count': payroll_total_runs,
                'draft_runs': payroll_draft,
                'processed_runs': payroll_processed,
                'published_runs': payroll_published,
                'net_total_last_runs': payroll_total_net,
            },
        },
    })


@hrms_bp.route('/hrms/org-chart', methods=['GET'])
def hrms_org_chart():
    user = require_auth()
    if not user:
        return jsonify({'error': 'Not authenticated'}), 401

    blocked = require_hr_segment(user)
    if blocked:
        return blocked

    tenant = resolve_user_tenant(user.id)
    if not tenant:
        return jsonify({'error': 'Tenant not found'}), 404

    rows = EmployeeRecord.query.filter_by(tenant_id=tenant.id).order_by(EmployeeRecord.full_name.asc()).all()
    by_manager = {}

    for row in rows:
        manager_name = row.manager_name or 'Unassigned'
        if manager_name not in by_manager:
            by_manager[manager_name] = []
        by_manager[manager_name].append({
            'id': row.id,
            'employee_number': row.employee_number,
            'full_name': row.full_name,
            'department': row.department,
            'job_title': row.job_title,
            'employment_status': row.employment_status,
        })

    return jsonify({
        'tenant': tenant.to_dict(),
        'managers': [
            {
                'manager_name': manager,
                'direct_reports': reports,
                'direct_report_count': len(reports),
            }
            for manager, reports in by_manager.items()
        ]
    })


def parse_datetime(value):
    if not value:
        return None
    try:
        return datetime.fromisoformat(value)
    except Exception:
        return None


@hrms_bp.route('/hrms/employees', methods=['GET'])
def list_employees():
    user = require_auth()
    if not user:
        return jsonify({'error': 'Not authenticated'}), 401

    blocked = require_hr_segment(user)
    if blocked:
        return blocked

    tenant = resolve_user_tenant(user.id)
    if not tenant:
        return jsonify({'error': 'Tenant not found'}), 404

    rows = EmployeeRecord.query.filter_by(tenant_id=tenant.id).order_by(EmployeeRecord.full_name.asc()).all()
    return jsonify({'items': [r.to_dict() for r in rows]})


@hrms_bp.route('/hrms/employees', methods=['POST'])
def create_employee():
    user = require_auth()
    if not user:
        return jsonify({'error': 'Not authenticated'}), 401

    blocked = require_hr_segment(user)
    if blocked:
        return blocked

    tenant = resolve_user_tenant(user.id)
    if not tenant:
        return jsonify({'error': 'Tenant not found'}), 404

    data = request.get_json(silent=True) or {}
    required = ['employee_number', 'full_name']
    missing = [k for k in required if not data.get(k)]
    if missing:
        return jsonify({'error': f"Missing required fields: {', '.join(missing)}"}), 400

    existing = EmployeeRecord.query.filter_by(
        tenant_id=tenant.id,
        employee_number=data['employee_number'].strip()
    ).first()
    if existing:
        return jsonify({'error': 'Employee number already exists in this tenant'}), 400

    record = EmployeeRecord(
        tenant_id=tenant.id,
        user_id=data.get('user_id'),
        employee_number=data['employee_number'].strip(),
        full_name=data['full_name'].strip(),
        email=(data.get('email') or '').strip() or None,
        gender=(data.get('gender') or '').strip() or None,
        department=(data.get('department') or '').strip() or None,
        job_title=(data.get('job_title') or '').strip() or None,
        employment_status=(data.get('employment_status') or 'active').strip(),
        manager_name=(data.get('manager_name') or '').strip() or None,
        hire_date=parse_date(data.get('hire_date')),
    )

    db.session.add(record)
    db.session.commit()
    return jsonify({'message': 'Employee record created', 'item': record.to_dict()}), 201


@hrms_bp.route('/hrms/employees/<int:employee_id>', methods=['PUT'])
def update_employee(employee_id):
    user = require_auth()
    if not user:
        return jsonify({'error': 'Not authenticated'}), 401

    blocked = require_hr_segment(user)
    if blocked:
        return blocked

    tenant = resolve_user_tenant(user.id)
    if not tenant:
        return jsonify({'error': 'Tenant not found'}), 404

    row = EmployeeRecord.query.filter_by(id=employee_id, tenant_id=tenant.id).first()
    if not row:
        return jsonify({'error': 'Employee record not found'}), 404

    data = request.get_json(silent=True) or {}

    if 'full_name' in data and data['full_name']:
        row.full_name = data['full_name'].strip()
    if 'email' in data:
        row.email = (data.get('email') or '').strip() or None
    if 'gender' in data:
        row.gender = (data.get('gender') or '').strip() or None
    if 'department' in data:
        row.department = (data.get('department') or '').strip() or None
    if 'job_title' in data:
        row.job_title = (data.get('job_title') or '').strip() or None
    if 'employment_status' in data:
        row.employment_status = (data.get('employment_status') or '').strip() or row.employment_status
    if 'manager_name' in data:
        row.manager_name = (data.get('manager_name') or '').strip() or None
    if 'hire_date' in data:
        row.hire_date = parse_date(data.get('hire_date'))

    db.session.commit()
    return jsonify({'message': 'Employee record updated', 'item': row.to_dict()})


@hrms_bp.route('/hrms/jobs', methods=['GET'])
def list_jobs():
    user = require_auth()
    if not user:
        return jsonify({'error': 'Not authenticated'}), 401

    blocked = require_hr_segment(user)
    if blocked:
        return blocked

    tenant = resolve_user_tenant(user.id)
    rows = JobPosting.query.filter_by(tenant_id=tenant.id).order_by(JobPosting.created_at.desc()).all()
    return jsonify({'items': [r.to_dict() for r in rows]})


@hrms_bp.route('/hrms/jobs', methods=['POST'])
def create_job():
    user = require_auth()
    if not user:
        return jsonify({'error': 'Not authenticated'}), 401

    blocked = require_hr_segment(user)
    if blocked:
        return blocked

    tenant = resolve_user_tenant(user.id)
    data = request.get_json(silent=True) or {}
    if not data.get('title'):
        return jsonify({'error': 'title is required'}), 400

    job = JobPosting(
        tenant_id=tenant.id,
        title=data['title'].strip(),
        department=(data.get('department') or '').strip() or None,
        location=(data.get('location') or '').strip() or None,
        employment_type=(data.get('employment_type') or '').strip() or None,
        status=(data.get('status') or 'open').strip(),
        description=(data.get('description') or '').strip() or None,
        created_by=user.id,
    )
    db.session.add(job)
    db.session.commit()
    return jsonify({'message': 'Job posting created', 'item': job.to_dict()}), 201


@hrms_bp.route('/hrms/jobs/<int:job_id>/status', methods=['PUT'])
def update_job_status(job_id):
    user = require_auth()
    if not user:
        return jsonify({'error': 'Not authenticated'}), 401

    blocked = require_hr_segment(user)
    if blocked:
        return blocked

    tenant = resolve_user_tenant(user.id)
    job = JobPosting.query.filter_by(id=job_id, tenant_id=tenant.id).first()
    if not job:
        return jsonify({'error': 'Job posting not found'}), 404

    data = request.get_json(silent=True) or {}
    status = (data.get('status') or '').strip().lower()
    allowed = {'open', 'paused', 'closed'}
    if status not in allowed:
        return jsonify({'error': f"Invalid status. Allowed: {', '.join(sorted(allowed))}"}), 400

    job.status = status
    if 'description' in data:
        job.description = (data.get('description') or '').strip() or None

    db.session.commit()
    return jsonify({'message': 'Job status updated', 'item': job.to_dict()})


@hrms_bp.route('/hrms/jobs/<int:job_id>/candidates', methods=['GET'])
def list_candidates(job_id):
    user = require_auth()
    if not user:
        return jsonify({'error': 'Not authenticated'}), 401

    blocked = require_hr_segment(user)
    if blocked:
        return blocked

    tenant = resolve_user_tenant(user.id)
    job = JobPosting.query.filter_by(id=job_id, tenant_id=tenant.id).first()
    if not job:
        return jsonify({'error': 'Job posting not found'}), 404

    rows = Candidate.query.filter_by(tenant_id=tenant.id, job_posting_id=job.id).order_by(Candidate.created_at.desc()).all()
    return jsonify({'job': job.to_dict(), 'items': [r.to_dict() for r in rows]})


@hrms_bp.route('/hrms/jobs/<int:job_id>/candidates', methods=['POST'])
def create_candidate(job_id):
    user = require_auth()
    if not user:
        return jsonify({'error': 'Not authenticated'}), 401

    blocked = require_hr_segment(user)
    if blocked:
        return blocked

    tenant = resolve_user_tenant(user.id)
    job = JobPosting.query.filter_by(id=job_id, tenant_id=tenant.id).first()
    if not job:
        return jsonify({'error': 'Job posting not found'}), 404

    data = request.get_json(silent=True) or {}
    if not data.get('full_name'):
        return jsonify({'error': 'full_name is required'}), 400

    score, score_error = parse_score(data.get('score'))
    if score_error:
        return jsonify({'error': score_error}), 400

    candidate = Candidate(
        tenant_id=tenant.id,
        job_posting_id=job.id,
        full_name=data['full_name'].strip(),
        email=(data.get('email') or '').strip() or None,
        phone=(data.get('phone') or '').strip() or None,
        status=(data.get('status') or 'applied').strip(),
        score=score,
        resume_url=(data.get('resume_url') or '').strip() or None,
        notes=(data.get('notes') or '').strip() or None,
    )

    if candidate.status not in PIPELINE_STATUSES:
        candidate.status = 'applied'

    db.session.add(candidate)
    db.session.commit()
    return jsonify({'message': 'Candidate created', 'item': candidate.to_dict()}), 201


@hrms_bp.route('/hrms/candidates/<int:candidate_id>/status', methods=['PUT'])
def update_candidate_status(candidate_id):
    user = require_auth()
    if not user:
        return jsonify({'error': 'Not authenticated'}), 401

    blocked = require_hr_segment(user)
    if blocked:
        return blocked

    tenant = resolve_user_tenant(user.id)
    row = Candidate.query.filter_by(id=candidate_id, tenant_id=tenant.id).first()
    if not row:
        return jsonify({'error': 'Candidate not found'}), 404

    data = request.get_json(silent=True) or {}
    next_status = (data.get('status') or '').strip()
    if next_status not in PIPELINE_STATUSES:
        return jsonify({'error': f"Invalid status. Allowed: {', '.join(sorted(PIPELINE_STATUSES))}"}), 400

    row.status = next_status
    if 'score' in data:
        score, score_error = parse_score(data.get('score'))
        if score_error:
            return jsonify({'error': score_error}), 400
        row.score = score
    if 'notes' in data:
        row.notes = (data.get('notes') or '').strip() or None

    db.session.commit()
    return jsonify({'message': 'Candidate status updated', 'item': row.to_dict()})


@hrms_bp.route('/hrms/candidates/<int:candidate_id>', methods=['PUT'])
def update_candidate(candidate_id):
    user = require_auth()
    if not user:
        return jsonify({'error': 'Not authenticated'}), 401

    blocked = require_hr_segment(user)
    if blocked:
        return blocked

    tenant = resolve_user_tenant(user.id)
    row = Candidate.query.filter_by(id=candidate_id, tenant_id=tenant.id).first()
    if not row:
        return jsonify({'error': 'Candidate not found'}), 404

    data = request.get_json(silent=True) or {}

    if 'full_name' in data and data['full_name']:
        row.full_name = data['full_name'].strip()
    if 'email' in data:
        row.email = (data.get('email') or '').strip() or None
    if 'phone' in data:
        row.phone = (data.get('phone') or '').strip() or None
    if 'status' in data:
        next_status = (data.get('status') or '').strip()
        if next_status in PIPELINE_STATUSES:
            row.status = next_status
    if 'score' in data:
        score, score_error = parse_score(data.get('score'))
        if score_error:
            return jsonify({'error': score_error}), 400
        row.score = score
    if 'resume_url' in data:
        row.resume_url = (data.get('resume_url') or '').strip() or None
    if 'notes' in data:
        row.notes = (data.get('notes') or '').strip() or None

    db.session.commit()
    return jsonify({'message': 'Candidate updated', 'item': row.to_dict()})


@hrms_bp.route('/hrms/candidates/<int:candidate_id>/interviews', methods=['GET'])
def list_candidate_interviews(candidate_id):
    user = require_auth()
    if not user:
        return jsonify({'error': 'Not authenticated'}), 401

    blocked = require_hr_segment(user)
    if blocked:
        return blocked

    tenant = resolve_user_tenant(user.id)
    candidate = Candidate.query.filter_by(id=candidate_id, tenant_id=tenant.id).first()
    if not candidate:
        return jsonify({'error': 'Candidate not found'}), 404

    rows = CandidateInterview.query.filter_by(tenant_id=tenant.id, candidate_id=candidate.id).order_by(CandidateInterview.scheduled_at.desc()).all()
    return jsonify({'candidate': candidate.to_dict(), 'items': [r.to_dict() for r in rows]})


@hrms_bp.route('/hrms/candidates/<int:candidate_id>/interviews', methods=['POST'])
def create_candidate_interview(candidate_id):
    user = require_auth()
    if not user:
        return jsonify({'error': 'Not authenticated'}), 401

    blocked = require_hr_segment(user)
    if blocked:
        return blocked

    tenant = resolve_user_tenant(user.id)
    candidate = Candidate.query.filter_by(id=candidate_id, tenant_id=tenant.id).first()
    if not candidate:
        return jsonify({'error': 'Candidate not found'}), 404

    data = request.get_json(silent=True) or {}
    if not data.get('interviewer_name') or not data.get('scheduled_at'):
        return jsonify({'error': 'interviewer_name and scheduled_at are required'}), 400

    scheduled_at = parse_datetime(data.get('scheduled_at'))
    if not scheduled_at:
        return jsonify({'error': 'scheduled_at must be an ISO datetime string'}), 400

    rating, rating_error = parse_rating(data.get('rating'))
    if rating_error:
        return jsonify({'error': rating_error}), 400

    interview = CandidateInterview(
        tenant_id=tenant.id,
        candidate_id=candidate.id,
        interviewer_name=data['interviewer_name'].strip(),
        scheduled_at=scheduled_at,
        feedback=(data.get('feedback') or '').strip() or None,
        rating=rating,
    )

    db.session.add(interview)
    db.session.commit()
    return jsonify({'message': 'Interview scheduled', 'item': interview.to_dict()}), 201


@hrms_bp.route('/hrms/interviews/<int:interview_id>', methods=['PUT'])
def update_interview_feedback(interview_id):
    user = require_auth()
    if not user:
        return jsonify({'error': 'Not authenticated'}), 401

    blocked = require_hr_segment(user)
    if blocked:
        return blocked

    tenant = resolve_user_tenant(user.id)
    row = CandidateInterview.query.filter_by(id=interview_id, tenant_id=tenant.id).first()
    if not row:
        return jsonify({'error': 'Interview not found'}), 404

    data = request.get_json(silent=True) or {}
    if 'interviewer_name' in data and data['interviewer_name']:
        row.interviewer_name = data['interviewer_name'].strip()
    if 'scheduled_at' in data:
        parsed = parse_datetime(data.get('scheduled_at'))
        if data.get('scheduled_at') and not parsed:
            return jsonify({'error': 'scheduled_at must be an ISO datetime string'}), 400
        row.scheduled_at = parsed or row.scheduled_at
    if 'feedback' in data:
        row.feedback = (data.get('feedback') or '').strip() or None
    if 'rating' in data:
        rating, rating_error = parse_rating(data.get('rating'))
        if rating_error:
            return jsonify({'error': rating_error}), 400
        row.rating = rating

    db.session.commit()
    return jsonify({'message': 'Interview updated', 'item': row.to_dict()})


@hrms_bp.route('/hrms/candidates/<int:candidate_id>/hire', methods=['POST'])
def hire_candidate(candidate_id):
    user = require_auth()
    if not user:
        return jsonify({'error': 'Not authenticated'}), 401

    blocked = require_hr_segment(user)
    if blocked:
        return blocked

    tenant = resolve_user_tenant(user.id)
    candidate = Candidate.query.filter_by(id=candidate_id, tenant_id=tenant.id).first()
    if not candidate:
        return jsonify({'error': 'Candidate not found'}), 404

    job = JobPosting.query.filter_by(id=candidate.job_posting_id, tenant_id=tenant.id).first()
    if not job:
        return jsonify({'error': 'Job posting not found for candidate'}), 404

    candidate.status = 'hired'

    full_name = (candidate.full_name or '').strip() or 'New Hire'
    existing_employee = EmployeeRecord.query.filter_by(tenant_id=tenant.id, full_name=full_name, email=candidate.email).first()
    if not existing_employee:
        employee = EmployeeRecord(
            tenant_id=tenant.id,
            employee_number=next_employee_number(tenant.id),
            full_name=full_name,
            email=(candidate.email or '').strip() or None,
            department=job.department,
            job_title=job.title,
            employment_status='active',
            manager_name=None,
            hire_date=datetime.utcnow().date(),
        )
        db.session.add(employee)

    existing_tasks = OnboardingTask.query.filter_by(tenant_id=tenant.id, candidate_id=candidate.id).count()
    if existing_tasks == 0:
        default_tasks = [
            ('Offer letter signed', 'HR Ops'),
            ('Create ICT account', 'ICT'),
            ('Issue staff ID card', 'Admin'),
            ('Benefits enrollment', 'HR Benefits'),
        ]
        for title, owner in default_tasks:
            db.session.add(OnboardingTask(
                tenant_id=tenant.id,
                candidate_id=candidate.id,
                title=title,
                owner=owner,
                status='pending',
            ))

    db.session.commit()
    return jsonify({
        'message': 'Candidate hired and onboarding initialized',
        'candidate': candidate.to_dict(),
    })


@hrms_bp.route('/hrms/candidates/<int:candidate_id>/onboarding-tasks', methods=['GET'])
def list_onboarding_tasks(candidate_id):
    user = require_auth()
    if not user:
        return jsonify({'error': 'Not authenticated'}), 401

    blocked = require_hr_segment(user)
    if blocked:
        return blocked

    tenant = resolve_user_tenant(user.id)
    candidate = Candidate.query.filter_by(id=candidate_id, tenant_id=tenant.id).first()
    if not candidate:
        return jsonify({'error': 'Candidate not found'}), 404

    rows = OnboardingTask.query.filter_by(tenant_id=tenant.id, candidate_id=candidate.id).order_by(OnboardingTask.created_at.desc()).all()
    return jsonify({'candidate': candidate.to_dict(), 'items': [r.to_dict() for r in rows]})


@hrms_bp.route('/hrms/candidates/<int:candidate_id>/onboarding-tasks', methods=['POST'])
def create_onboarding_task(candidate_id):
    user = require_auth()
    if not user:
        return jsonify({'error': 'Not authenticated'}), 401

    blocked = require_hr_segment(user)
    if blocked:
        return blocked

    tenant = resolve_user_tenant(user.id)
    candidate = Candidate.query.filter_by(id=candidate_id, tenant_id=tenant.id).first()
    if not candidate:
        return jsonify({'error': 'Candidate not found'}), 404

    data = request.get_json(silent=True) or {}
    if not data.get('title'):
        return jsonify({'error': 'title is required'}), 400

    task = OnboardingTask(
        tenant_id=tenant.id,
        candidate_id=candidate.id,
        title=data['title'].strip(),
        owner=(data.get('owner') or '').strip() or None,
        status=(data.get('status') or 'pending').strip(),
        due_date=parse_datetime(data.get('due_date')),
    )

    if task.status not in TASK_STATUSES:
        task.status = 'pending'

    if task.status == 'completed':
        task.completed_at = datetime.utcnow()

    db.session.add(task)
    db.session.commit()
    return jsonify({'message': 'Onboarding task created', 'item': task.to_dict()}), 201


@hrms_bp.route('/hrms/candidates/<int:candidate_id>/onboarding-tasks/bulk', methods=['POST'])
def bulk_update_onboarding_tasks(candidate_id):
    user = require_auth()
    if not user:
        return jsonify({'error': 'Not authenticated'}), 401

    blocked = require_hr_segment(user)
    if blocked:
        return blocked

    tenant = resolve_user_tenant(user.id)
    candidate = Candidate.query.filter_by(id=candidate_id, tenant_id=tenant.id).first()
    if not candidate:
        return jsonify({'error': 'Candidate not found'}), 404

    data = request.get_json(silent=True) or {}
    action = (data.get('action') or '').strip().lower()
    if action not in {'complete_all', 'complete_pending', 'reset_all'}:
        return jsonify({'error': 'Invalid action. Allowed: complete_all, complete_pending, reset_all'}), 400

    tasks = OnboardingTask.query.filter_by(tenant_id=tenant.id, candidate_id=candidate.id).all()
    updated = 0
    now = datetime.utcnow()

    for task in tasks:
        if action == 'complete_all':
            if task.status != 'completed':
                task.status = 'completed'
                task.completed_at = now
                updated += 1
        elif action == 'complete_pending':
            if task.status in {'pending', 'in_progress'}:
                task.status = 'completed'
                task.completed_at = now
                updated += 1
        elif action == 'reset_all':
            if task.status != 'pending' or task.completed_at is not None:
                task.status = 'pending'
                task.completed_at = None
                updated += 1

    db.session.commit()
    return jsonify({
        'message': 'Onboarding tasks updated',
        'updated_count': updated,
        'items': [t.to_dict() for t in tasks],
    })


@hrms_bp.route('/hrms/onboarding-tasks/<int:task_id>', methods=['PUT'])
def update_onboarding_task(task_id):
    user = require_auth()
    if not user:
        return jsonify({'error': 'Not authenticated'}), 401

    blocked = require_hr_segment(user)
    if blocked:
        return blocked

    tenant = resolve_user_tenant(user.id)
    task = OnboardingTask.query.filter_by(id=task_id, tenant_id=tenant.id).first()
    if not task:
        return jsonify({'error': 'Onboarding task not found'}), 404

    data = request.get_json(silent=True) or {}

    if 'title' in data and data['title']:
        task.title = data['title'].strip()
    if 'owner' in data:
        task.owner = (data.get('owner') or '').strip() or None
    if 'due_date' in data:
        task.due_date = parse_datetime(data.get('due_date'))
    if 'status' in data:
        status = (data.get('status') or '').strip()
        if status in TASK_STATUSES:
            task.status = status
            task.completed_at = datetime.utcnow() if status == 'completed' else None

    db.session.commit()
    return jsonify({'message': 'Onboarding task updated', 'item': task.to_dict()})
