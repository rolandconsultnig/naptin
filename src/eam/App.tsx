import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@eam/components/ui/toaster";
import { TooltipProvider } from "@eam/components/ui/tooltip";
import { useAuth } from "@eam/hooks/useAuth";
import Landing from "@eam/pages/Landing";
import Login from "@eam/pages/Login";
import Dashboard from "@eam/pages/Dashboard";
import AssetRegister from "@eam/pages/AssetRegister";
import WorkOrders from "@eam/pages/WorkOrders";
import MaintenanceSchedule from "@eam/pages/MaintenanceSchedule";
import Inventory from "@eam/pages/Inventory";
import AssetMap from "@eam/pages/AssetMap";
import Procurement from "@eam/pages/Procurement";
import FleetManagement from "@eam/pages/FleetManagement";
import Calibration from "@eam/pages/Calibration";
import EnergyManagement from "@eam/pages/EnergyManagement";
import Documents from "@eam/pages/Documents";
import Reports from "@eam/pages/Reports";
import Layout from "@eam/components/Layout";
import NotFound from "@eam/pages/not-found";
import BarcodeGenerator from "@eam/pages/BarcodeGenerator";
import HardwareManagement from "@eam/pages/HardwareManagement";
import IndustrialIoT from "@eam/pages/IndustrialIoT";
import UserManagement from "@eam/pages/UserManagement";
import Settings from "@eam/pages/Settings";
import DatabaseManagement from "@eam/pages/DatabaseManagement";
import Legal from "@eam/pages/Legal";
import Depreciation from "@eam/pages/Depreciation";
import AssetTracking from "@eam/pages/AssetTracking";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Switch>
      {!isAuthenticated ? (
        <>
          <Route path="/" component={Landing} />
          <Route path="/login" component={Login} />
        </>
      ) : (
        <Layout>
          <Route path="/" component={Dashboard} />
          <Route path="/assets" component={AssetRegister} />
          <Route path="/barcode-generator" component={BarcodeGenerator} />
          <Route path="/hardware" component={HardwareManagement} />
          <Route path="/iot" component={IndustrialIoT} />
          <Route path="/asset-map" component={AssetMap} />
          <Route path="/work-orders" component={WorkOrders} />
          <Route path="/maintenance" component={MaintenanceSchedule} />
          <Route path="/inventory" component={Inventory} />
          <Route path="/procurement" component={Procurement} />
          <Route path="/fleet" component={FleetManagement} />
          <Route path="/calibration" component={Calibration} />
          <Route path="/energy" component={EnergyManagement} />
          <Route path="/documents" component={Documents} />
          <Route path="/reports" component={Reports} />
          <Route path="/legal" component={Legal} />
          <Route path="/users" component={UserManagement} />
          <Route path="/settings" component={Settings} />
          <Route path="/database" component={DatabaseManagement} />
          <Route path="/depreciation" component={Depreciation} />
          <Route path="/asset-tracking" component={AssetTracking} />
        </Layout>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
