import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  User, 
  MapPin, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Wrench,
  FileText,
  Download,
  Edit,
  Eye,
  Trash2,
  Play,
  Pause,
  Square,
  Users,
  Building,
  Zap,
  Shield,
  Activity
} from "lucide-react";

interface WorkOrder {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'assigned' | 'in-progress' | 'on-hold' | 'completed' | 'cancelled';
  type: 'preventive' | 'corrective' | 'emergency' | 'inspection';
  assetId: string;
  assetName: string;
  location: string;
  assignedTo: string;
  assignedToName: string;
  createdBy: string;
  createdDate: Date;
  dueDate: Date;
  estimatedHours: number;
  actualHours: number;
  cost: number;
  materials: Array<{
    id: string;
    name: string;
    quantity: number;
    unit: string;
    cost: number;
  }>;
  tasks: Array<{
    id: string;
    description: string;
    completed: boolean;
    assignedTo: string;
  }>;
  attachments: Array<{
    id: string;
    name: string;
    type: string;
    url: string;
  }>;
  notes: Array<{
    id: string;
    text: string;
    author: string;
    timestamp: Date;
  }>;
}

const mockWorkOrders: WorkOrder[] = [
  {
    id: "WO-001",
    title: "Pump Station A Maintenance",
    description: "Routine maintenance and inspection of Pump Station A including oil change, filter replacement, and performance testing.",
    priority: "high",
    status: "in-progress",
    type: "preventive",
    assetId: "ASSET-001",
    assetName: "Pump Station A",
    location: "Warehouse A - Pump Room",
    assignedTo: "TECH-001",
    assignedToName: "John Smith",
    createdBy: "admin",
    createdDate: new Date("2024-01-15"),
    dueDate: new Date("2024-01-20"),
    estimatedHours: 8,
    actualHours: 4.5,
    cost: 1250.00,
    materials: [
      { id: "MAT-001", name: "Oil Filter", quantity: 2, unit: "pcs", cost: 45.00 },
      { id: "MAT-002", name: "Synthetic Oil", quantity: 5, unit: "L", cost: 120.00 },
      { id: "MAT-003", name: "Gasket Set", quantity: 1, unit: "set", cost: 85.00 }
    ],
    tasks: [
      { id: "TASK-001", description: "Drain old oil", completed: true, assignedTo: "TECH-001" },
      { id: "TASK-002", description: "Replace oil filter", completed: true, assignedTo: "TECH-001" },
      { id: "TASK-003", description: "Add new oil", completed: false, assignedTo: "TECH-001" },
      { id: "TASK-004", description: "Performance test", completed: false, assignedTo: "TECH-001" }
    ],
    attachments: [
      { id: "ATT-001", name: "Pump Manual.pdf", type: "pdf", url: "#" },
      { id: "ATT-002", name: "Maintenance Checklist.xlsx", type: "excel", url: "#" }
    ],
    notes: [
      { id: "NOTE-001", text: "Started work order as scheduled", author: "John Smith", timestamp: new Date("2024-01-15T08:00:00") },
      { id: "NOTE-002", text: "Oil filter replaced successfully", author: "John Smith", timestamp: new Date("2024-01-15T10:30:00") }
    ]
  },
  {
    id: "WO-002",
    title: "Compressor Unit B Repair",
    description: "Emergency repair of Compressor Unit B due to unusual vibration and noise. Requires immediate attention.",
    priority: "critical",
    status: "assigned",
    type: "emergency",
    assetId: "ASSET-002",
    assetName: "Compressor Unit B",
    location: "Production Line B",
    assignedTo: "TECH-002",
    assignedToName: "Sarah Johnson",
    createdBy: "operator",
    createdDate: new Date("2024-01-16"),
    dueDate: new Date("2024-01-16"),
    estimatedHours: 6,
    actualHours: 0,
    cost: 0,
    materials: [
      { id: "MAT-004", name: "Bearing Set", quantity: 1, unit: "set", cost: 350.00 },
      { id: "MAT-005", name: "Vibration Dampener", quantity: 2, unit: "pcs", cost: 180.00 }
    ],
    tasks: [
      { id: "TASK-005", description: "Inspect vibration source", completed: false, assignedTo: "TECH-002" },
      { id: "TASK-006", description: "Replace bearings if needed", completed: false, assignedTo: "TECH-002" },
      { id: "TASK-007", description: "Test operation", completed: false, assignedTo: "TECH-002" }
    ],
    attachments: [],
    notes: [
      { id: "NOTE-003", text: "Emergency work order created due to critical equipment failure", author: "System", timestamp: new Date("2024-01-16T14:30:00") }
    ]
  },
  {
    id: "WO-003",
    title: "Valve Assembly C Inspection",
    description: "Annual inspection of Valve Assembly C to ensure proper operation and identify any potential issues.",
    priority: "medium",
    status: "pending",
    type: "inspection",
    assetId: "ASSET-003",
    assetName: "Valve Assembly C",
    location: "Pipeline Junction C",
    assignedTo: "",
    assignedToName: "",
    createdBy: "scheduler",
    createdDate: new Date("2024-01-14"),
    dueDate: new Date("2024-01-25"),
    estimatedHours: 4,
    actualHours: 0,
    cost: 0,
    materials: [],
    tasks: [
      { id: "TASK-008", description: "Visual inspection", completed: false, assignedTo: "" },
      { id: "TASK-009", description: "Pressure testing", completed: false, assignedTo: "" },
      { id: "TASK-010", description: "Document findings", completed: false, assignedTo: "" }
    ],
    attachments: [
      { id: "ATT-003", name: "Inspection Checklist.pdf", type: "pdf", url: "#" }
    ],
    notes: []
  }
];

const mockTechnicians = [
  { id: "TECH-001", name: "John Smith", specialization: "Mechanical", status: "available" },
  { id: "TECH-002", name: "Sarah Johnson", specialization: "Electrical", status: "busy" },
  { id: "TECH-003", name: "Mike Davis", specialization: "HVAC", status: "available" },
  { id: "TECH-004", name: "Lisa Wilson", specialization: "Instrumentation", status: "available" }
];

const mockAssets = [
  { id: "ASSET-001", name: "Pump Station A", location: "Warehouse A - Pump Room" },
  { id: "ASSET-002", name: "Compressor Unit B", location: "Production Line B" },
  { id: "ASSET-003", name: "Valve Assembly C", location: "Pipeline Junction C" },
  { id: "ASSET-004", name: "Tank D", location: "Storage Area D" },
  { id: "ASSET-005", name: "Pipeline E", location: "Distribution Network" }
];

export default function WorkOrders() {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(mockWorkOrders);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrder | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-gray-500';
      case 'assigned': return 'bg-blue-500';
      case 'in-progress': return 'bg-yellow-500';
      case 'on-hold': return 'bg-orange-500';
      case 'completed': return 'bg-green-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'assigned': return <User className="h-4 w-4" />;
      case 'in-progress': return <Activity className="h-4 w-4" />;
      case 'on-hold': return <Pause className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const filteredWorkOrders = workOrders.filter(wo => {
    const matchesSearch = wo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         wo.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         wo.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || wo.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || wo.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const updateWorkOrderStatus = (workOrderId: string, newStatus: WorkOrder['status']) => {
    setWorkOrders(prev => prev.map(wo => 
      wo.id === workOrderId ? { ...wo, status: newStatus } : wo
    ));
  };

  const calculateProgress = (workOrder: WorkOrder) => {
    if (workOrder.tasks.length === 0) return 0;
    const completedTasks = workOrder.tasks.filter(task => task.completed).length;
    return (completedTasks / workOrder.tasks.length) * 100;
  };

  const getOverdueWorkOrders = () => {
    const now = new Date();
    return workOrders.filter(wo => 
      wo.dueDate < now && wo.status !== 'completed' && wo.status !== 'cancelled'
    );
  };

  const getUpcomingWorkOrders = () => {
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    return workOrders.filter(wo => 
      wo.dueDate >= now && wo.dueDate <= nextWeek && wo.status !== 'completed' && wo.status !== 'cancelled'
    );
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <div className="flex items-center justify-between">
        <div>
            <h1 className="text-3xl font-bold mb-2">Work Orders</h1>
            <p className="text-muted-foreground">
              Manage maintenance work orders, assignments, and tracking.
            </p>
        </div>
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
              Create Work Order
            </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Work Orders</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{workOrders.length}</div>
            <p className="text-xs text-muted-foreground">
              {workOrders.filter(wo => wo.status === 'completed').length} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Activity className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {workOrders.filter(wo => wo.status === 'in-progress').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Active work orders
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {getOverdueWorkOrders().length}
            </div>
            <p className="text-xs text-muted-foreground">
              Past due date
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
            <Calendar className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {getUpcomingWorkOrders().length}
            </div>
            <p className="text-xs text-muted-foreground">
              Due this week
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All Orders</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="in-progress">In Progress</TabsTrigger>
          <TabsTrigger value="overdue">Overdue</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
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
                  <Label htmlFor="search">Search</Label>
                  <Input
                    id="search"
                    placeholder="Search work orders..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="status-filter">Status</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="assigned">Assigned</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="on-hold">On Hold</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="priority-filter">Priority</Label>
                  <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priorities</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
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

          {/* Work Orders List */}
          <div className="space-y-4">
            {filteredWorkOrders.map((workOrder) => (
              <Card key={workOrder.id} className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setSelectedWorkOrder(workOrder)}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold">{workOrder.title}</h3>
                        <Badge variant="outline">{workOrder.id}</Badge>
                        <Badge className={getPriorityColor(workOrder.priority)}>
                          {workOrder.priority}
                        </Badge>
                        <Badge className={getStatusColor(workOrder.status)}>
                          {getStatusIcon(workOrder.status)}
                          <span className="ml-1 capitalize">{workOrder.status}</span>
                        </Badge>
                      </div>
                      
                      <p className="text-muted-foreground mb-3">{workOrder.description}</p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <Building className="h-4 w-4 text-muted-foreground" />
                          <span>{workOrder.assetName}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>{workOrder.location}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span>{workOrder.assignedToName || 'Unassigned'}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>Due: {workOrder.dueDate.toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="mt-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Progress</span>
                          <span className="text-sm text-muted-foreground">
                            {workOrder.tasks.filter(t => t.completed).length}/{workOrder.tasks.length} tasks
                          </span>
                        </div>
                        <Progress value={calculateProgress(workOrder)} className="h-2" />
                      </div>
                    </div>

                    <div className="flex flex-col space-y-2 ml-4">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          {workOrders.filter(wo => wo.status === 'pending').map((workOrder) => (
            <Card key={workOrder.id} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">{workOrder.title}</h3>
                    <p className="text-muted-foreground">{workOrder.assetName}</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" onClick={() => updateWorkOrderStatus(workOrder.id, 'assigned')}>
                      Assign
                    </Button>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="in-progress" className="space-y-4">
          {workOrders.filter(wo => wo.status === 'in-progress').map((workOrder) => (
            <Card key={workOrder.id} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">{workOrder.title}</h3>
                    <p className="text-muted-foreground">Assigned to: {workOrder.assignedToName}</p>
                    <Progress value={calculateProgress(workOrder)} className="h-2 mt-2" />
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" onClick={() => updateWorkOrderStatus(workOrder.id, 'completed')}>
                      Complete
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => updateWorkOrderStatus(workOrder.id, 'on-hold')}>
                      Hold
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="overdue" className="space-y-4">
          {getOverdueWorkOrders().map((workOrder) => (
            <Card key={workOrder.id} className="cursor-pointer hover:shadow-md transition-shadow border-red-200">
              <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-red-600">{workOrder.title}</h3>
                    <p className="text-muted-foreground">Overdue by {Math.ceil((new Date().getTime() - workOrder.dueDate.getTime()) / (1000 * 60 * 60 * 24))} days</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="destructive">
                      Escalate
                    </Button>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
                  
        <TabsContent value="completed" className="space-y-4">
          {workOrders.filter(wo => wo.status === 'completed').map((workOrder) => (
            <Card key={workOrder.id} className="cursor-pointer hover:shadow-md transition-shadow border-green-200">
              <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-green-600">{workOrder.title}</h3>
                    <p className="text-muted-foreground">Completed by {workOrder.assignedToName}</p>
                    <p className="text-sm text-muted-foreground">Actual hours: {workOrder.actualHours}h | Cost: ${workOrder.cost}</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      {/* Work Order Details Modal */}
      {selectedWorkOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
                  <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="h-5 w-5" />
                  {selectedWorkOrder.title}
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setSelectedWorkOrder(null)}>
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label>Status</Label>
                  <div className="flex items-center gap-2 mt-1">
                    {getStatusIcon(selectedWorkOrder.status)}
                    <Badge className={getStatusColor(selectedWorkOrder.status)}>
                      {selectedWorkOrder.status}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label>Priority</Label>
                  <Badge className={`mt-1 ${getPriorityColor(selectedWorkOrder.priority)}`}>
                    {selectedWorkOrder.priority}
                  </Badge>
                </div>
                <div>
                  <Label>Type</Label>
                  <p className="mt-1 capitalize">{selectedWorkOrder.type}</p>
                </div>
                <div>
                  <Label>Due Date</Label>
                  <p className="mt-1">{selectedWorkOrder.dueDate.toLocaleDateString()}</p>
                    </div>
                  </div>

              <Separator />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <Label>Description</Label>
                  <p className="mt-1 text-muted-foreground">{selectedWorkOrder.description}</p>
                      </div>
                <div>
                  <Label>Asset Information</Label>
                  <div className="mt-1 space-y-1">
                    <p><strong>Asset:</strong> {selectedWorkOrder.assetName}</p>
                    <p><strong>Location:</strong> {selectedWorkOrder.location}</p>
                    <p><strong>Assigned To:</strong> {selectedWorkOrder.assignedToName || 'Unassigned'}</p>
                      </div>
                    </div>
                      </div>

              <Separator />

              <div>
                <Label>Tasks</Label>
                <div className="mt-2 space-y-2">
                  {selectedWorkOrder.tasks.map((task) => (
                    <div key={task.id} className="flex items-center space-x-2 p-2 border rounded">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => {
                          // Handle task completion
                        }}
                      />
                      <span className={task.completed ? 'line-through text-muted-foreground' : ''}>
                        {task.description}
                      </span>
                    </div>
                  ))}
                      </div>
                    </div>

              <Separator />

              <div>
                <Label>Materials</Label>
                <div className="mt-2 space-y-2">
                  {selectedWorkOrder.materials.map((material) => (
                    <div key={material.id} className="flex items-center justify-between p-2 border rounded">
                      <span>{material.name}</span>
                      <span className="text-muted-foreground">
                        {material.quantity} {material.unit} - ${material.cost}
                        </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button className="flex-1">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Work Order
                </Button>
                <Button variant="outline" className="flex-1">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <Button variant="outline" className="flex-1">
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Report
                </Button>
                </div>
              </CardContent>
            </Card>
        </div>
      )}
    </div>
  );
}
