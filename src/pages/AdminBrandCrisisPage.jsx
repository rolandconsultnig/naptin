import BrandScaffoldPage from '../admin/brand/BrandScaffoldPage'

export default function AdminBrandCrisisPage() {
  return (
    <BrandScaffoldPage
      title="Brand Crisis Management"
      description="Crisis initiation, team assignment, controlled message approval, and post-incident review records."
      points={[
        'Crisis trigger capture (manual or automated signal)',
        'Predefined team role assignment and alert status',
        'Message draft and approval chain before publication',
        'Post-mortem completion with lessons and effectiveness scoring',
      ]}
    />
  )
}
