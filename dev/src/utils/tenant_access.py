from src.models.user import Tenant, TenantMember, TenantModulePolicy, db

DEFAULT_TENANTS = [
    {'key': 'naptin-hq', 'name': 'NAPTIN HQ'},
    {'key': 'lagos-campus', 'name': 'Lagos Campus'},
    {'key': 'kaduna-campus', 'name': 'Kaduna Campus'},
]

PORTAL_SEGMENTS = [
    'dashboard', 'intranet', 'collaboration', 'chat', 'meetings', 'profile',
    'human-resource', 'finance', 'training', 'procurement', 'asset-management',
    'documents', 'legal', 'corporate', 'ict', 'mande', 'integrations', 'security'
]


def ensure_default_tenants():
    changed = False
    for t in DEFAULT_TENANTS:
        if Tenant.query.filter_by(key=t['key']).first():
            continue
        db.session.add(Tenant(key=t['key'], name=t['name'], is_active=True))
        changed = True
    if changed:
        db.session.commit()


def get_default_tenant():
    ensure_default_tenants()
    tenant = Tenant.query.filter_by(key='naptin-hq').first()
    if tenant:
        return tenant
    return Tenant.query.order_by(Tenant.id.asc()).first()


def resolve_user_tenant(user_id):
    ensure_default_tenants()
    membership = TenantMember.query.filter_by(user_id=user_id).order_by(TenantMember.id.asc()).first()
    if membership and membership.tenant and membership.tenant.is_active:
        return membership.tenant

    default_tenant = get_default_tenant()
    if not default_tenant:
        return None

    db.session.add(TenantMember(tenant_id=default_tenant.id, user_id=user_id, role='member'))
    db.session.commit()
    return default_tenant


def is_segment_enabled_for_tenant(tenant_id, segment):
    row = TenantModulePolicy.query.filter_by(tenant_id=tenant_id, segment=segment).first()
    if not row:
        return True
    return bool(row.is_enabled)


def is_segment_enabled_for_user(user_id, segment):
    tenant = resolve_user_tenant(user_id)
    if not tenant:
        return True
    return is_segment_enabled_for_tenant(tenant.id, segment)


def get_tenant_policy_items(tenant_id):
    rows = TenantModulePolicy.query.filter_by(tenant_id=tenant_id).all()
    by_segment = {r.segment: r for r in rows}
    items = []
    for segment in PORTAL_SEGMENTS:
        row = by_segment.get(segment)
        items.append({
            'segment': segment,
            'is_enabled': True if not row else bool(row.is_enabled),
            'updated_at': row.updated_at.isoformat() if row and row.updated_at else None,
        })
    return items
