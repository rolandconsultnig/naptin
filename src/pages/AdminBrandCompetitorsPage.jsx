import BrandScaffoldPage from '../admin/brand/BrandScaffoldPage'

export default function AdminBrandCompetitorsPage() {
  return (
    <BrandScaffoldPage
      title="Competitor Monitoring & Battle Cards"
      description="Watch competitor branding moves, ingest signals, and update sales-ready battle cards with response strategy."
      points={[
        'Competitor watch list and tracked keyword management',
        'Detected signal feed from integrated sources',
        'Battle card editor with old/new positioning and response strategy',
        'Distribution workflow to sales and MBD channels',
      ]}
    />
  )
}
