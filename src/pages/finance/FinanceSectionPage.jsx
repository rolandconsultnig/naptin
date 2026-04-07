import { useParams, Navigate } from 'react-router-dom'
import {
  FinanceOverviewView,
  FinanceLedgerView,
  FinancePayablesView,
  FinanceReceivablesView,
  FinanceBankView,
  FinanceCurrencyView,
  FinanceFixedAssetsView,
  FinanceExpensesView,
  FinanceCashFlowView,
  FinanceProjectsView,
  FinanceTaxView,
  FinanceAuditComplianceView,
  FinanceBudgetView,
  FinanceReportsView,
  FinanceAnalyticsView,
  FinancePlatformView,
} from './FinanceSuiteViews'
import {
  FinanceBudgetWorkbenchView,
  FinanceExpenditureWorkbenchView,
  FinanceFiscalReportingView,
} from './FinanceWorkbenchViews'

const REGISTRY = {
  overview: FinanceOverviewView,
  ledger: FinanceLedgerView,
  payables: FinancePayablesView,
  receivables: FinanceReceivablesView,
  bank: FinanceBankView,
  currency: FinanceCurrencyView,
  'fixed-assets': FinanceFixedAssetsView,
  expenses: FinanceExpensesView,
  'cash-flow': FinanceCashFlowView,
  projects: FinanceProjectsView,
  tax: FinanceTaxView,
  'audit-compliance': FinanceAuditComplianceView,
  budget: FinanceBudgetView,
  reports: FinanceReportsView,
  analytics: FinanceAnalyticsView,
  platform: FinancePlatformView,
  'budget-workbench': FinanceBudgetWorkbenchView,
  'expenditure-workbench': FinanceExpenditureWorkbenchView,
  'fiscal-reporting': FinanceFiscalReportingView,
}

export default function FinanceSectionPage() {
  const { section } = useParams()
  const key = section || 'overview'
  const View = REGISTRY[key]
  if (!View) return <Navigate to="/app/finance" replace />
  return <View />
}
