import BrandScaffoldPage from '../admin/brand/BrandScaffoldPage'

export default function AdminBrandArchitecturePage() {
  return (
    <BrandScaffoldPage
      title="Brand Architecture & Naming"
      description="Product naming intake, naming rule validation, architecture placement, and multi-step approvals."
      points={[
        'Product naming intake with alternatives and audience context',
        'Automated conflict checks: internal naming, trademark, naming rules',
        'Hierarchy visualization for master/sub/endorsed/product relationships',
        'Approval path with SLA timers for Brand, Legal, and Leadership',
      ]}
    />
  )
}
