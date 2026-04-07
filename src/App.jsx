import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { NotificationProvider } from './context/NotificationContext'
import { getHomePathForUser } from './auth/departmentAccess'
import RequireRole from './auth/RequireRole'
import AppSegmentGate from './auth/AppSegmentGate'
import RequirePolicyEditor from './auth/RequirePolicyEditor'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import AppLayout from './components/layout/AppLayout'
import DashboardPage from './pages/DashboardPage'
import IntranetPage from './pages/IntranetPage'
import HRPage from './pages/HRPage'
import SelfServicePage from './pages/SelfServicePage'
import FinanceLayout from './components/layout/FinanceLayout'
import FinanceSectionPage from './pages/finance/FinanceSectionPage'
import MeetingsPage from './pages/MeetingsPage'
import ChatPage from './pages/ChatPage'
import TrainingPage from './pages/TrainingPage'
import ProcurementPage from './pages/ProcurementPage'
import PublicAffairsPage from './pages/PublicAffairsPage'
import SERVICOMPage from './pages/SERVICOMPage'
import ACTUPage from './pages/ACTUPage'
import WhistleblowerPortalPage from './pages/WhistleblowerPortalPage'
import AdminOperationsPage from './pages/AdminOperationsPage'
import AdminOverviewPage from './pages/AdminOverviewPage'
import AdminModulesPage from './pages/AdminModulesPage'
import AdminPermissionsPage from './pages/AdminPermissionsPage'
import AdminRolesPage from './pages/AdminRolesPage'
import AdminUsersPage from './pages/AdminUsersPage'
import AdminAuditPage from './pages/AdminAuditPage'
import AdminBrandAssetsPage from './pages/AdminBrandAssetsPage'
import AdminBrandCompliancePage from './pages/AdminBrandCompliancePage'
import AdminBrandArchitecturePage from './pages/AdminBrandArchitecturePage'
import AdminBrandHealthPage from './pages/AdminBrandHealthPage'
import AdminBrandCrisisPage from './pages/AdminBrandCrisisPage'
import AdminBrandCompetitorsPage from './pages/AdminBrandCompetitorsPage'
import AdminBrandUsagePage from './pages/AdminBrandUsagePage'
import AdminBrandApprovalsPage from './pages/AdminBrandApprovalsPage'
import AdminWorkflowInboxPage from './pages/AdminWorkflowInboxPage'
import CollaborationPage from './pages/CollaborationPage'
import DirectoryPage from './pages/DirectoryPage'
import ProfilePage from './pages/ProfilePage'
import IntegrationsPage from './pages/IntegrationsPage'
import SecurityPage from './pages/SecurityPage'
import HRErpPage from './pages/HRErpPage'
import EnterpriseHRMSPage from './pages/EnterpriseHRMSPage'
import CorporateSuitePage from './pages/CorporateSuitePage'
import LegalBoardPage from './pages/LegalBoardPage'
import ICTPage from './pages/ICTPage'
import MandePage from './pages/MandePage'
import PlanningPage from './pages/PlanningPage'
import PlanningWorkbenchPage from './pages/PlanningWorkbenchPage'
import ResearchStatisticsPage from './pages/ResearchStatisticsPage'
import ICTWorkbenchPage from './pages/ICTWorkbenchPage'
import ProcessMakerPage from './pages/ProcessMakerPage'
import DGPortalPage from './pages/DGPortalPage'
import MarketingPage from './pages/MarketingPage'
import ClientOpsMarketsPage from './pages/ClientOpsMarketsPage'
import DocumentCenterPage from './pages/DocumentCenterPage'
import ForbiddenPage from './pages/ForbiddenPage'
import AdminHostGuard from './auth/AdminHostGuard'
import RequireAdminConsoleRole from './auth/RequireAdminConsoleRole'
import AdminStandaloneLayout from './components/layout/AdminStandaloneLayout'
import HumanResourceLayout, { HumanResourceHomeRedirect } from './components/layout/HumanResourceLayout'

function Protected({ children }) {
  const { user, bootstrapped } = useAuth()
  if (!bootstrapped) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7FAF8] text-slate-500 text-sm font-medium">
        Restoring session…
      </div>
    )
  }
  return user ? children : <Navigate to="/login" replace />
}

function AppRoutes() {
  const { user, bootstrapped } = useAuth()
  if (!bootstrapped) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7FAF8] text-slate-500 text-sm font-medium">
        Restoring session…
      </div>
    )
  }
  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to={getHomePathForUser(user)} replace /> : <LandingPage />} />
      <Route path="/login" element={user ? <Navigate to={getHomePathForUser(user)} replace /> : <LoginPage />} />
      <Route path="/whistleblower-portal" element={<WhistleblowerPortalPage />} />
      <Route
        path="/admin"
        element={
          <Protected>
            <AdminHostGuard>
              <RequireAdminConsoleRole>
                <AdminStandaloneLayout />
              </RequireAdminConsoleRole>
            </AdminHostGuard>
          </Protected>
        }
      >
        <Route index element={<AdminOverviewPage />} />
        <Route path="operations" element={<AdminOperationsPage />} />
        <Route
          path="modules"
          element={
            <RequirePolicyEditor>
              <AdminModulesPage />
            </RequirePolicyEditor>
          }
        />
        <Route
          path="roles"
          element={
            <RequirePolicyEditor>
              <AdminRolesPage />
            </RequirePolicyEditor>
          }
        />
        <Route
          path="access"
          element={
            <RequirePolicyEditor>
              <AdminPermissionsPage />
            </RequirePolicyEditor>
          }
        />
        <Route
          path="users"
          element={
            <RequirePolicyEditor>
              <AdminUsersPage />
            </RequirePolicyEditor>
          }
        />
        <Route
          path="audit"
          element={
            <RequirePolicyEditor>
              <AdminAuditPage />
            </RequirePolicyEditor>
          }
        />
        <Route path="brand/assets" element={<AdminBrandAssetsPage />} />
        <Route path="brand/compliance" element={<AdminBrandCompliancePage />} />
        <Route path="brand/architecture" element={<AdminBrandArchitecturePage />} />
        <Route path="brand/health" element={<AdminBrandHealthPage />} />
        <Route path="brand/crisis" element={<AdminBrandCrisisPage />} />
        <Route path="brand/competitors" element={<AdminBrandCompetitorsPage />} />
        <Route path="brand/usage" element={<AdminBrandUsagePage />} />
        <Route path="brand/approvals" element={<AdminBrandApprovalsPage />} />
        <Route path="workflow/inbox" element={<AdminWorkflowInboxPage />} />
      </Route>
      <Route path="/app" element={<Protected><AppLayout /></Protected>}>
        <Route element={<AppSegmentGate />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="forbidden" element={<ForbiddenPage />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="intranet" element={<IntranetPage />} />
          <Route path="collaboration" element={<CollaborationPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="integrations" element={<RequireRole><IntegrationsPage /></RequireRole>} />
          <Route path="security" element={<RequireRole><SecurityPage /></RequireRole>} />
          <Route path="legal" element={<LegalBoardPage />} />
          <Route path="corporate" element={<CorporateSuitePage defaultTab="pr" />} />
          <Route path="ict" element={<ICTPage />} />
          <Route path="mande" element={<MandePage />} />
          <Route path="planning" element={<PlanningPage />} />
          <Route path="planning-workbench" element={<PlanningWorkbenchPage />} />
          <Route path="research-stats" element={<ResearchStatisticsPage />} />
          <Route path="ict-workbench" element={<ICTWorkbenchPage />} />
          <Route path="process-maker" element={<RequireRole><ProcessMakerPage /></RequireRole>} />
          <Route path="dg-portal" element={<RequireRole><DGPortalPage /></RequireRole>} />
          <Route path="marketing" element={<MarketingPage />} />
          <Route path="client-ops-markets" element={<ClientOpsMarketsPage />} />
          <Route path="documents" element={<RequireRole><DocumentCenterPage /></RequireRole>} />
          <Route path="finance" element={<FinanceLayout />}>
            <Route index element={<FinanceSectionPage />} />
            <Route path=":section" element={<FinanceSectionPage />} />
          </Route>
          <Route path="meetings" element={<MeetingsPage />} />
          <Route path="chat" element={<ChatPage />} />
          <Route path="training" element={<TrainingPage />} />
          <Route path="procurement" element={<ProcurementPage />} />
          <Route path="public-affairs" element={<PublicAffairsPage />} />
          <Route path="servicom" element={<SERVICOMPage />} />
          <Route path="actu" element={<ACTUPage />} />
          <Route path="admin" element={<Navigate to="/admin" replace />} />
          <Route path="human-resource" element={<HumanResourceLayout />}>
            <Route index element={<HumanResourceHomeRedirect />} />
            <Route path="people" element={<HRPage />} />
            <Route path="directory" element={<DirectoryPage />} />
            <Route path="operations" element={<HRErpPage />} />
            <Route path="enterprise" element={<EnterpriseHRMSPage />} />
            <Route path="self-service" element={<SelfServicePage />} />
          </Route>
          <Route path="directory" element={<Navigate to="/app/human-resource/directory" replace />} />
          <Route path="hr" element={<Navigate to="/app/human-resource/people" replace />} />
          <Route path="hr-erp" element={<Navigate to="/app/human-resource/operations" replace />} />
          <Route path="hrms" element={<Navigate to="/app/human-resource/enterprise" replace />} />
          <Route path="self-service" element={<Navigate to="/app/human-resource/self-service" replace />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <AppRoutes />
      </NotificationProvider>
    </AuthProvider>
  )
}
