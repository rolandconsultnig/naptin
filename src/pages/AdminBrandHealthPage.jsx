import BrandScaffoldPage from '../admin/brand/BrandScaffoldPage'

export default function AdminBrandHealthPage() {
  return (
    <BrandScaffoldPage
      title="Brand Health Dashboard"
      description="KPI tracking for awareness, consideration, preference, NPS, and trust with threshold alerts and RCA workflows."
      points={[
        'KPI tiles with benchmark thresholds and target values',
        'Trend and segment charts across configured periods',
        'Alert queue for threshold breaches',
        'Root cause analysis workflow assignment and closure tracking',
      ]}
    />
  )
}
