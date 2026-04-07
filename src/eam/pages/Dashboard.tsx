import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@eam/components/ui/card";
import { Button } from "@eam/components/ui/button";
import { Badge } from "@eam/components/ui/badge";
import { 
  ArrowUp, ArrowDown, Box, Wrench, PieChart, DollarSign, Plus, Calendar, 
  FileText, Package, TrendingUp, AlertTriangle, CheckCircle, Clock, 
  Activity, BarChart3, Target, Users, Zap, Shield, Gauge
} from "lucide-react";
import { useAuth } from "@eam/hooks/useAuth";
import { useEffect } from "react";
import { useToast } from "@eam/hooks/use-toast";
import { isUnauthorizedError } from "@eam/lib/authUtils";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart as RechartsPieChart, Pie, Cell, BarChart, Bar, LineChart, Line,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';

interface DashboardStats {
  totalAssets: number;
  activeWorkOrders: number;
  assetsByStatus?: Array<{ status: string; count: number }>;
  assetsByType?: Array<{ type: string; count: number }>;
  workOrdersByStatus?: Array<{ status: string; count: number }>;
  maintenanceCosts?: Array<{ month: string; cost: number }>;
  assetUtilization?: Array<{ month: string; utilization: number }>;
}

interface WorkOrder {
  id: string;
  workOrderId: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  createdAt: string;
  dueDate?: string;
  type: string;
}

interface MaintenanceSchedule {
  id: string;
  title: string;
  scheduledDate: string;
  description?: string;
  scheduleType?: string;
}

interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  currentStock?: number;
  minStock?: number;
}

// Sample data for charts
const assetStatusData = [
  { name: 'Operational', value: 65, color: '#10B981' },
  { name: 'Maintenance', value: 20, color: '#F59E0B' },
  { name: 'Out of Service', value: 10, color: '#EF4444' },
  { name: 'Idle', value: 5, color: '#6B7280' }
];

const workOrderStatusData = [
  { name: 'Completed', value: 45, color: '#10B981' },
  { name: 'In Progress', value: 30, color: '#3B82F6' },
  { name: 'Pending', value: 20, color: '#F59E0B' },
  { name: 'Overdue', value: 5, color: '#EF4444' }
];

const monthlyMaintenanceCosts = [
  { month: 'Jan', cost: 42000 },
  { month: 'Feb', cost: 38000 },
  { month: 'Mar', cost: 45000 },
  { month: 'Apr', cost: 52000 },
  { month: 'May', cost: 48000 },
  { month: 'Jun', cost: 55000 }
];

const assetUtilizationData = [
  { month: 'Jan', utilization: 82 },
  { month: 'Feb', utilization: 85 },
  { month: 'Mar', utilization: 88 },
  { month: 'Apr', utilization: 87 },
  { month: 'May', utilization: 90 },
  { month: 'Jun', utilization: 92 }
];

const performanceMetrics = [
  { metric: 'Uptime', value: 99.2, target: 99.5 },
  { metric: 'Efficiency', value: 87.5, target: 90 },
  { metric: 'Safety', value: 100, target: 100 },
  { metric: 'Quality', value: 94.8, target: 95 }
];

export default function Dashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: dashboardStats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
    retry: false,
  });

  const { data: recentWorkOrders, isLoading: workOrdersLoading } = useQuery<WorkOrder[]>({
    queryKey: ["/api/work-orders"],
    retry: false,
  });

  const { data: upcomingMaintenance } = useQuery<MaintenanceSchedule[]>({
    queryKey: ["/api/maintenance-schedules", "upcoming=true"],
    retry: false,
  });

  const { data: lowStockItems } = useQuery<InventoryItem[]>({
    queryKey: ["/api/inventory", "lowStock=true"],
    retry: false,
  });

  const { data: assets } = useQuery({
    queryKey: ["/api/assets"],
    retry: false,
  });

  if (statsLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="mb-8">
          <h2 className="heading-responsive font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-2">
            Dashboard Overview
          </h2>
          <p className="text-gray-600 dark:text-gray-400">Welcome back! Here's what's happening with your assets today.</p>
        </div>
        <div className="dashboard-grid">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="card-enhanced">
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational': return 'status-operational';
      case 'maintenance': return 'status-maintenance';
      case 'out_of_service': return 'status-out_of_service';
      case 'idle': return 'status-idle';
      default: return 'status-idle';
    }
  };

  const getWorkOrderStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'wo-status-pending';
      case 'in_progress': return 'wo-status-in_progress';
      case 'completed': return 'wo-status-completed';
      case 'overdue': return 'wo-status-overdue';
      default: return 'wo-status-pending';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'priority-critical';
      case 'high': return 'priority-high';
      case 'medium': return 'priority-medium';
      case 'low': return 'priority-low';
      default: return 'priority-low';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 dark:text-white">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Dashboard Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="heading-responsive font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-2">
              Executive Dashboard
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-responsive">
              Real-time insights and analytics for your enterprise asset management.
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse-slow"></div>
            <span className="text-sm text-gray-500 dark:text-gray-400">Live Updates</span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="dashboard-grid">
        <Card className="card-enhanced group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Assets</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                  {dashboardStats?.totalAssets || 0}
                </p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600 dark:text-green-400">+5.2% from last month</span>
                </div>
              </div>
              <div className="gradient-primary p-4 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Box className="text-white text-2xl" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-enhanced group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Work Orders</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-orange-800 bg-clip-text text-transparent">
                  {dashboardStats?.activeWorkOrders || 0}
                </p>
                <div className="flex items-center mt-2">
                  <Clock className="w-4 h-4 text-yellow-500 mr-1" />
                  <span className="text-sm text-yellow-600 dark:text-yellow-400">-2.1% from last week</span>
                </div>
              </div>
              <div className="gradient-warning p-4 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Wrench className="text-white text-2xl" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-enhanced group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Asset Utilization</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">
                  87.3%
                </p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600 dark:text-green-400">+1.8% from last month</span>
                </div>
              </div>
              <div className="gradient-success p-4 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Gauge className="text-white text-2xl" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-enhanced group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Maintenance Costs</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">
                  $45.2K
                </p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600 dark:text-green-400">-8.3% from last month</span>
                </div>
              </div>
              <div className="gradient-error p-4 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <DollarSign className="text-white text-2xl" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Button className="btn-primary-enhanced group">
          <Plus className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform duration-300" />
          New Asset
        </Button>
        <Button variant="outline" className="group hover:bg-blue-50 dark:hover:bg-blue-900/20">
          <Wrench className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-300" />
          Create Work Order
        </Button>
        <Button variant="outline" className="group hover:bg-green-50 dark:hover:bg-green-900/20">
          <Calendar className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-300" />
          Schedule Maintenance
        </Button>
        <Button variant="outline" className="group hover:bg-orange-50 dark:hover:bg-orange-900/20">
          <Package className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-300" />
          Check Inventory
        </Button>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Asset Status Distribution */}
        <Card className="card-enhanced">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <PieChart className="w-5 h-5 mr-2 text-blue-600" />
              Asset Status Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={assetStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {assetStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Work Order Status */}
        <Card className="card-enhanced">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-green-600" />
              Work Order Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={workOrderStatusData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" fill="#8884d8">
                    {workOrderStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Maintenance Costs Trend */}
        <Card className="card-enhanced">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-purple-600" />
              Maintenance Costs Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyMaintenanceCosts}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="cost" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Asset Utilization Trend */}
        <Card className="card-enhanced">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <Activity className="w-5 h-5 mr-2 text-orange-600" />
              Asset Utilization Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={assetUtilizationData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="utilization" stroke="#8884d8" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Radar Chart */}
      <Card className="card-enhanced">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <Target className="w-5 h-5 mr-2 text-indigo-600" />
            Performance Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={performanceMetrics}>
                <PolarGrid />
                <PolarAngleAxis dataKey="metric" />
                <PolarRadiusAxis />
                <Radar name="Current" dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
                <Radar name="Target" dataKey="target" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.3} />
                <Tooltip content={<CustomTooltip />} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Work Orders */}
        <div className="lg:col-span-2">
          <Card className="card-enhanced">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                  Recent Work Orders
                </CardTitle>
                <Badge variant="secondary" className="gradient-primary text-white">
                  {recentWorkOrders?.length || 0} Active
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {workOrdersLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : recentWorkOrders && recentWorkOrders.length > 0 ? (
                <div className="space-y-4">
                  {recentWorkOrders.slice(0, 5).map((workOrder: WorkOrder) => (
                    <div key={workOrder.id} className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 dark:text-white">{workOrder.title}</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{workOrder.description}</p>
                        <div className="flex items-center mt-2 space-x-2">
                          <Badge className={getWorkOrderStatusColor(workOrder.status)}>
                            {workOrder.status.replace('_', ' ')}
                          </Badge>
                          <Badge className={getPriorityColor(workOrder.priority)}>
                            {workOrder.priority}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {workOrder.workOrderId}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDate(workOrder.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">No work orders found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="space-y-6">
          {/* Upcoming Maintenance */}
          <Card className="card-enhanced">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                Upcoming Maintenance
              </CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingMaintenance && upcomingMaintenance.length > 0 ? (
                <div className="space-y-3">
                  {upcomingMaintenance.slice(0, 3).map((maintenance: MaintenanceSchedule) => (
                    <div key={maintenance.id} className="flex items-center space-x-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{maintenance.title}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(maintenance.scheduledDate)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">No upcoming maintenance</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Low Stock Alerts */}
          <Card className="card-enhanced">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2 text-orange-600" />
                Low Stock Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              {lowStockItems && lowStockItems.length > 0 ? (
                <div className="space-y-3">
                  {lowStockItems.slice(0, 3).map((item: InventoryItem) => (
                    <div key={item.id} className="flex items-center space-x-3 p-3 rounded-lg bg-orange-50 dark:bg-orange-900/20">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{item.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Qty: {item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">All items in stock</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
