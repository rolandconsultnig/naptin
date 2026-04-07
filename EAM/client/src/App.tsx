import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import AssetRegister from "@/pages/AssetRegister";
import WorkOrders from "@/pages/WorkOrders";
import MaintenanceSchedule from "@/pages/MaintenanceSchedule";
import Inventory from "@/pages/Inventory";
import AssetMap from "@/pages/AssetMap";
import Procurement from "@/pages/Procurement";
import FleetManagement from "@/pages/FleetManagement";
import Calibration from "@/pages/Calibration";
import EnergyManagement from "@/pages/EnergyManagement";
import Documents from "@/pages/Documents";
import Reports from "@/pages/Reports";
import Layout from "@/components/Layout";
import NotFound from "@/pages/not-found";
import BarcodeGenerator from "@/pages/BarcodeGenerator";
import HardwareManagement from "@/pages/HardwareManagement";
import IndustrialIoT from "@/pages/IndustrialIoT";
import UserManagement from "@/pages/UserManagement";
import Settings from "@/pages/Settings";
import DatabaseManagement from "@/pages/DatabaseManagement";
import Legal from "@/pages/Legal";
import Depreciation from "@/pages/Depreciation";
import AssetTracking from "@/pages/AssetTracking";

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
