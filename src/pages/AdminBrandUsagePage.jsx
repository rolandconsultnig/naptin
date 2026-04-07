import BrandScaffoldPage from '../admin/brand/BrandScaffoldPage'

export default function AdminBrandUsagePage() {
  return (
    <BrandScaffoldPage
      title="Brand Asset Usage Analytics"
      description="Analyze asset adoption by channel, region, and department to optimize portfolio investment decisions."
      points={[
        'Top-used and underused asset summaries',
        'Usage trends by department, region, and period',
        'Quarterly optimization actions: archive, redesign, training',
        'Export-ready reports for leadership review cycles',
      ]}
    />
  )
}
