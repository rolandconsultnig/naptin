import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { 
  Download, 
  Calendar,
  BarChart3,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  Package,
  Wrench,
  Building,
  Users,
  FileText,
  Filter,
  Search,
  Eye,
  Settings,
  RefreshCw,
  Printer,
  Share2,
  Plus,
  Activity,
  Zap,
  Shield,
  MapPin,
  Hash
} from "lucide-react";

interface ReportData {
  id: string;
  name: string;
  type: 'asset' | 'maintenance' | 'workorder' | 'inventory' | 'cost' | 'performance';
  description: string;
  lastGenerated: Date;
  data: any;
  format: 'pdf' | 'excel' | 'csv';
  schedule: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'manual';
}

const mockReports: ReportData[] = [
  {
    id: "RPT-001",
    name: "Asset Performance Report",
    type: "asset",
    description: "Comprehensive analysis of asset performance, uptime, and efficiency metrics.",
    lastGenerated: new Date("2024-01-20"),
    data: {
      totalAssets: 150,
      activeAssets: 142,
      criticalAssets: 25,
      averageUptime: 94.5,
      totalDowntime: 45.2,
      performanceScore: 87.3
    },
    format: "pdf",
    schedule: "monthly"
  },
  {
    id: "RPT-002",
    name: "Maintenance Cost Analysis",
    type: "cost",
    description: "Detailed breakdown of maintenance costs by asset, category, and time period.",
    lastGenerated: new Date("2024-01-19"),
    data: {
      totalCost: 125000,
      preventiveCost: 45000,
      correctiveCost: 80000,
      laborCost: 75000,
      materialCost: 50000,
      costPerAsset: 833.33
    },
    format: "excel",
    schedule: "monthly"
  },
  {
    id: "RPT-003",
    name: "Work Order Summary",
    type: "workorder",
    description: "Summary of work orders by status, priority, and completion metrics.",
    lastGenerated: new Date("2024-01-18"),
    data: {
      totalWorkOrders: 45,
      completed: 38,
      inProgress: 5,
      pending: 2,
      averageCompletionTime: 3.2,
      onTimeCompletion: 89.5
    },
    format: "pdf",
    schedule: "weekly"
  },
  {
    id: "RPT-004",
    name: "Inventory Status Report",
    type: "inventory",
    description: "Current inventory levels, reorder points, and stock value analysis.",
    lastGenerated: new Date("2024-01-17"),
    data: {
      totalItems: 1250,
      inStock: 1180,
      lowStock: 45,
      outOfStock: 25,
      totalValue: 450000,
      reorderValue: 25000
    },
    format: "excel",
    schedule: "weekly"
  },
  {
    id: "RPT-005",
    name: "Equipment Reliability Report",
    type: "performance",
    description: "MTBF, MTTR, and reliability metrics for critical equipment.",
    lastGenerated: new Date("2024-01-16"),
    data: {
      averageMTBF: 1250,
      averageMTTR: 4.5,
      reliability: 96.8,
      availability: 94.2,
      criticalFailures: 3,
      plannedMaintenance: 85
    },
    format: "pdf",
    schedule: "monthly"
  },
  {
    id: "RPT-006",
    name: "Preventive Maintenance Schedule",
    type: "maintenance",
    description: "Upcoming preventive maintenance tasks and schedule compliance.",
    lastGenerated: new Date("2024-01-15"),
    data: {
      scheduledTasks: 28,
      completed: 25,
      overdue: 3,
      complianceRate: 89.3,
      nextWeekTasks: 8,
      criticalTasks: 2
    },
    format: "pdf",
    schedule: "weekly"
  }
];

export default function Reports() {
  const [reports, setReports] = useState<ReportData[]>(mockReports);
  const [selectedReport, setSelectedReport] = useState<ReportData | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState<string>("all");
  const [showCreateReport, setShowCreateReport] = useState(false);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'asset': return 'bg-blue-100 text-blue-800';
      case 'maintenance': return 'bg-green-100 text-green-800';
      case 'workorder': return 'bg-yellow-100 text-yellow-800';
      case 'inventory': return 'bg-purple-100 text-purple-800';
      case 'cost': return 'bg-red-100 text-red-800';
      case 'performance': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'asset': return <Building className="h-4 w-4" />;
      case 'maintenance': return <Wrench className="h-4 w-4" />;
      case 'workorder': return <FileText className="h-4 w-4" />;
      case 'inventory': return <Package className="h-4 w-4" />;
      case 'cost': return <DollarSign className="h-4 w-4" />;
      case 'performance': return <Activity className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || report.type === typeFilter;
    
    return matchesSearch && matchesType;
  });

  const generateReport = (reportId: string) => {
    // This would typically call an API to generate the report
    console.log(`Generating report: ${reportId}`);
  };

  const downloadReport = (report: ReportData) => {
    // This would typically download the generated report
    console.log(`Downloading ${report.format.toUpperCase()} report: ${report.name}`);
  };

  const scheduleReport = (reportId: string, schedule: string) => {
    // This would typically schedule the report generation
    console.log(`Scheduling report ${reportId} for ${schedule} generation`);
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <div className="flex items-center justify-between">
        <div>
            <h1 className="text-3xl font-bold mb-2">Reports & Analytics</h1>
            <p className="text-muted-foreground">
              Generate and view comprehensive EAM reports and analytics.
            </p>
          </div>
          <Button onClick={() => setShowCreateReport(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Report
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reports.length}</div>
            <p className="text-xs text-muted-foreground">
              Available reports
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled Reports</CardTitle>
            <Calendar className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {reports.filter(r => r.schedule !== 'manual').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Auto-generated
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Reports</CardTitle>
            <Clock className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {reports.filter(r => {
                const lastWeek = new Date();
                lastWeek.setDate(lastWeek.getDate() - 7);
                return r.lastGenerated >= lastWeek;
              }).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Last 7 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Report Types</CardTitle>
            <BarChart3 className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {new Set(reports.map(r => r.type)).size}
            </div>
            <p className="text-xs text-muted-foreground">
              Different categories
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="all">All Reports</TabsTrigger>
          <TabsTrigger value="asset">Asset Reports</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          <TabsTrigger value="workorder">Work Orders</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          {/* Filters */}
        <Card>
            <CardHeader>
              <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="search">Search Reports</Label>
                  <Input
                    id="search"
                    placeholder="Search by name or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="type-filter">Report Type</Label>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="asset">Asset Reports</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="workorder">Work Orders</SelectItem>
                      <SelectItem value="inventory">Inventory</SelectItem>
                      <SelectItem value="cost">Cost Analysis</SelectItem>
                      <SelectItem value="performance">Performance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="date-filter">Date Range</Label>
                  <Select value={dateRange} onValueChange={setDateRange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="week">This Week</SelectItem>
                      <SelectItem value="month">This Month</SelectItem>
                      <SelectItem value="quarter">This Quarter</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button variant="outline" className="w-full">
                    <Filter className="h-4 w-4 mr-2" />
                    Apply Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reports Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredReports.map((report) => (
              <Card key={report.id} className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setSelectedReport(report)}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      {getTypeIcon(report.type)}
                      <Badge className={getTypeColor(report.type)}>
                        {report.type}
                      </Badge>
                    </div>
                    <div className="flex space-x-1">
                      <Button variant="ghost" size="sm" onClick={(e) => {
                        e.stopPropagation();
                        generateReport(report.id);
                      }}>
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={(e) => {
                        e.stopPropagation();
                        downloadReport(report);
                      }}>
                        <Download className="h-4 w-4" />
            </Button>
                    </div>
                  </div>
                  <CardTitle className="text-lg">{report.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{report.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span>Last Generated:</span>
                      <span>{report.lastGenerated.toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Format:</span>
                      <Badge variant="outline">{report.format.toUpperCase()}</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Schedule:</span>
                      <span className="capitalize">{report.schedule}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="asset" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Asset Performance Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Total Assets</span>
                    <span className="font-semibold">150</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Active Assets</span>
                    <span className="font-semibold text-green-600">142</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Critical Assets</span>
                    <span className="font-semibold text-red-600">25</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Average Uptime</span>
                    <span className="font-semibold text-blue-600">94.5%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Performance Score</span>
                    <span className="font-semibold text-green-600">87.3%</span>
                  </div>
            </div>
          </CardContent>
        </Card>

        <Card>
              <CardHeader>
                <CardTitle>Asset Health Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Excellent</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={65} className="w-20 h-2" />
                      <span className="text-sm">65%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Good</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={25} className="w-20 h-2" />
                      <span className="text-sm">25%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Fair</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={8} className="w-20 h-2" />
                      <span className="text-sm">8%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Poor</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={2} className="w-20 h-2" />
                      <span className="text-sm">2%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Maintenance Cost Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Total Cost</span>
                    <span className="font-semibold">$125,000</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Preventive Maintenance</span>
                    <span className="font-semibold text-green-600">$45,000</span>
              </div>
                  <div className="flex items-center justify-between">
                    <span>Corrective Maintenance</span>
                    <span className="font-semibold text-red-600">$80,000</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Labor Cost</span>
                    <span className="font-semibold text-blue-600">$75,000</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Material Cost</span>
                    <span className="font-semibold text-purple-600">$50,000</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Maintenance Schedule Compliance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Scheduled Tasks</span>
                    <span className="font-semibold">28</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Completed</span>
                    <span className="font-semibold text-green-600">25</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Overdue</span>
                    <span className="font-semibold text-red-600">3</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Compliance Rate</span>
                    <span className="font-semibold text-blue-600">89.3%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Next Week Tasks</span>
                    <span className="font-semibold text-yellow-600">8</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
        </TabsContent>

        <TabsContent value="workorder" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
              <CardHeader>
                <CardTitle>Work Order Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Total Work Orders</span>
                    <span className="font-semibold">45</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Completed</span>
                    <span className="font-semibold text-green-600">38</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>In Progress</span>
                    <span className="font-semibold text-yellow-600">5</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Pending</span>
                    <span className="font-semibold text-blue-600">2</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Average Completion Time</span>
                    <span className="font-semibold">3.2 days</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>On-Time Completion</span>
                    <span className="font-semibold text-green-600">89.5%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Work Order Priority Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Critical</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={15} className="w-20 h-2" />
                      <span className="text-sm">15%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>High</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={35} className="w-20 h-2" />
                      <span className="text-sm">35%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Medium</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={40} className="w-20 h-2" />
                      <span className="text-sm">40%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Low</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={10} className="w-20 h-2" />
                      <span className="text-sm">10%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Inventory Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Total Items</span>
                    <span className="font-semibold">1,250</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>In Stock</span>
                    <span className="font-semibold text-green-600">1,180</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Low Stock</span>
                    <span className="font-semibold text-yellow-600">45</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Out of Stock</span>
                    <span className="font-semibold text-red-600">25</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Total Value</span>
                    <span className="font-semibold text-blue-600">$450,000</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Reorder Value</span>
                    <span className="font-semibold text-purple-600">$25,000</span>
              </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Inventory Turnover</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Fast Moving</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={60} className="w-20 h-2" />
                      <span className="text-sm">60%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Medium Moving</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={30} className="w-20 h-2" />
                      <span className="text-sm">30%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Slow Moving</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={10} className="w-20 h-2" />
                      <span className="text-sm">10%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Equipment Reliability Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Average MTBF</span>
                    <span className="font-semibold">1,250 hours</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Average MTTR</span>
                    <span className="font-semibold">4.5 hours</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Reliability</span>
                    <span className="font-semibold text-green-600">96.8%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Availability</span>
                    <span className="font-semibold text-blue-600">94.2%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Critical Failures</span>
                    <span className="font-semibold text-red-600">3</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Planned Maintenance</span>
                    <span className="font-semibold text-purple-600">85%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
              <CardHeader>
                <CardTitle>Cost Trend Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Monthly Average</span>
                    <span className="font-semibold">$12,500</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Year-to-Date</span>
                    <span className="font-semibold">$125,000</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Budget Variance</span>
                    <span className="font-semibold text-green-600">+5.2%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Cost per Asset</span>
                    <span className="font-semibold">$833</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>ROI</span>
                    <span className="font-semibold text-blue-600">3.2x</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Report Details Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  {getTypeIcon(selectedReport.type)}
                  {selectedReport.name}
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setSelectedReport(null)}>
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label>Type</Label>
                  <Badge className={`mt-1 ${getTypeColor(selectedReport.type)}`}>
                    {selectedReport.type}
                  </Badge>
                </div>
                <div>
                  <Label>Format</Label>
                  <Badge variant="outline" className="mt-1">
                    {selectedReport.format.toUpperCase()}
                  </Badge>
                </div>
                <div>
                  <Label>Schedule</Label>
                  <p className="mt-1 capitalize">{selectedReport.schedule}</p>
                </div>
                <div>
                  <Label>Last Generated</Label>
                  <p className="mt-1">{selectedReport.lastGenerated.toLocaleDateString()}</p>
                </div>
              </div>

              <Separator />

              <div>
                <Label>Description</Label>
                <p className="mt-1 text-muted-foreground">{selectedReport.description}</p>
              </div>

              <Separator />

              <div>
                <Label>Report Data</Label>
                <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                  <pre className="text-sm overflow-x-auto">
                    {JSON.stringify(selectedReport.data, null, 2)}
                  </pre>
            </div>
      </div>

              <div className="flex gap-2">
                <Button className="flex-1" onClick={() => generateReport(selectedReport.id)}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Generate Report
            </Button>
                <Button variant="outline" className="flex-1" onClick={() => downloadReport(selectedReport)}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
            </Button>
                <Button variant="outline" className="flex-1">
                  <Printer className="h-4 w-4 mr-2" />
                  Print
            </Button>
                <Button variant="outline" className="flex-1">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
            </Button>
          </div>
        </CardContent>
      </Card>
        </div>
      )}
    </div>
  );
}
