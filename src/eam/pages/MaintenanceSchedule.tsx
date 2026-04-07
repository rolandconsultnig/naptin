import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@eam/components/ui/card";
import { Button } from "@eam/components/ui/button";
import { Badge } from "@eam/components/ui/badge";
import { Input } from "@eam/components/ui/input";
import { Label } from "@eam/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@eam/components/ui/select";
import { Textarea } from "@eam/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@eam/components/ui/tabs";
import { Separator } from "@eam/components/ui/separator";
import { Calendar } from "@eam/components/ui/calendar";
import { 
  Plus, 
  Calendar as CalendarIcon,
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
  Repeat,
  Settings,
  Bell,
  ChevronLeft,
  ChevronRight,
  Filter,
  Search,
  Building,
  Activity,
  Zap,
  Shield
} from "lucide-react";

interface MaintenanceSchedule {
  id: string;
  title: string;
  description: string;
  assetId: string;
  assetName: string;
  location: string;
  type: 'preventive' | 'predictive' | 'condition-based' | 'time-based';
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'semi-annual' | 'annual' | 'custom';
  interval: number;
  intervalUnit: 'days' | 'weeks' | 'months' | 'years';
  lastPerformed: Date | null;
  nextDue: Date;
  estimatedDuration: number;
  estimatedCost: number;
  assignedTo: string;
  assignedToName: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'paused' | 'completed' | 'overdue';
  checklist: Array<{
    id: string;
    task: string;
    required: boolean;
  }>;
  materials: Array<{
    id: string;
    name: string;
    quantity: number;
    unit: string;
  }>;
  notes: string;
  createdBy: string;
  createdAt: Date;
}

const mockSchedules: MaintenanceSchedule[] = [
  {
    id: "MS-001",
    title: "Monthly Pump Inspection",
    description: "Routine inspection and testing of all pump systems including oil levels, vibration analysis, and performance metrics.",
    assetId: "ASSET-001",
    assetName: "Pump Station A",
    location: "Warehouse A - Pump Room",
    type: "preventive",
    frequency: "monthly",
    interval: 1,
    intervalUnit: "months",
    lastPerformed: new Date("2024-01-01"),
    nextDue: new Date("2024-02-01"),
    estimatedDuration: 4,
    estimatedCost: 500,
    assignedTo: "TECH-001",
    assignedToName: "John Smith",
    priority: "medium",
    status: "active",
    checklist: [
      { id: "CHK-001", task: "Check oil levels", required: true },
      { id: "CHK-002", task: "Inspect for leaks", required: true },
      { id: "CHK-003", task: "Test vibration levels", required: true },
      { id: "CHK-004", task: "Record performance data", required: true },
      { id: "CHK-005", task: "Clean filters", required: false }
    ],
    materials: [
      { id: "MAT-001", name: "Oil", quantity: 2, unit: "L" },
      { id: "MAT-002", name: "Cleaning cloths", quantity: 5, unit: "pcs" }
    ],
    notes: "Ensure all safety protocols are followed during inspection.",
    createdBy: "admin",
    createdAt: new Date("2024-01-01")
  },
  {
    id: "MS-002",
    title: "Quarterly Compressor Maintenance",
    description: "Comprehensive maintenance including filter replacement, oil change, and performance optimization.",
    assetId: "ASSET-002",
    assetName: "Compressor Unit B",
    location: "Production Line B",
    type: "preventive",
    frequency: "quarterly",
    interval: 3,
    intervalUnit: "months",
    lastPerformed: new Date("2023-12-15"),
    nextDue: new Date("2024-03-15"),
    estimatedDuration: 8,
    estimatedCost: 1200,
    assignedTo: "TECH-002",
    assignedToName: "Sarah Johnson",
    priority: "high",
    status: "active",
    checklist: [
      { id: "CHK-006", task: "Replace air filters", required: true },
      { id: "CHK-007", task: "Change oil and oil filter", required: true },
      { id: "CHK-008", task: "Inspect belts and pulleys", required: true },
      { id: "CHK-009", task: "Test pressure settings", required: true },
      { id: "CHK-010", task: "Calibrate sensors", required: true }
    ],
    materials: [
      { id: "MAT-003", name: "Air Filter", quantity: 1, unit: "pcs" },
      { id: "MAT-004", name: "Oil Filter", quantity: 1, unit: "pcs" },
      { id: "MAT-005", name: "Compressor Oil", quantity: 5, unit: "L" }
    ],
    notes: "This is a critical maintenance task that must be completed on schedule.",
    createdBy: "admin",
    createdAt: new Date("2023-12-01")
  },
  {
    id: "MS-003",
    title: "Annual Valve Testing",
    description: "Annual testing and certification of all safety valves and control valves in the system.",
    assetId: "ASSET-003",
    assetName: "Valve Assembly C",
    location: "Pipeline Junction C",
    type: "preventive",
    frequency: "annual",
    interval: 1,
    intervalUnit: "years",
    lastPerformed: new Date("2023-06-01"),
    nextDue: new Date("2024-06-01"),
    estimatedDuration: 6,
    estimatedCost: 800,
    assignedTo: "",
    assignedToName: "",
    priority: "high",
    status: "active",
    checklist: [
      { id: "CHK-011", task: "Pressure test all valves", required: true },
      { id: "CHK-012", task: "Check valve seals", required: true },
      { id: "CHK-013", task: "Verify actuator operation", required: true },
      { id: "CHK-014", task: "Document test results", required: true }
    ],
    materials: [
      { id: "MAT-006", name: "Test pressure gauge", quantity: 1, unit: "pcs" },
      { id: "MAT-007", name: "Seal kit", quantity: 1, unit: "set" }
    ],
    notes: "Requires specialized testing equipment and certification.",
    createdBy: "admin",
    createdAt: new Date("2023-06-01")
  }
];

export default function MaintenanceSchedule() {
  const [schedules, setSchedules] = useState<MaintenanceSchedule[]>(mockSchedules);
  const [selectedSchedule, setSelectedSchedule] = useState<MaintenanceSchedule | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [frequencyFilter, setFrequencyFilter] = useState<string>("all");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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

  const getFrequencyIcon = (frequency: string) => {
    switch (frequency) {
      case 'daily': return <Clock className="h-4 w-4" />;
      case 'weekly': return <CalendarIcon className="h-4 w-4" />;
      case 'monthly': return <CalendarIcon className="h-4 w-4" />;
      case 'quarterly': return <CalendarIcon className="h-4 w-4" />;
      case 'semi-annual': return <CalendarIcon className="h-4 w-4" />;
      case 'annual': return <CalendarIcon className="h-4 w-4" />;
      default: return <Repeat className="h-4 w-4" />;
    }
  };

  const filteredSchedules = schedules.filter(schedule => {
    const matchesSearch = schedule.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         schedule.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         schedule.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || schedule.status === statusFilter;
    const matchesFrequency = frequencyFilter === "all" || schedule.frequency === frequencyFilter;
    
    return matchesSearch && matchesStatus && matchesFrequency;
  });

  const getOverdueSchedules = () => {
    const now = new Date();
    return schedules.filter(schedule => 
      schedule.nextDue < now && schedule.status !== 'completed'
    );
  };

  const getUpcomingSchedules = () => {
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    return schedules.filter(schedule => 
      schedule.nextDue >= now && schedule.nextDue <= nextWeek && schedule.status !== 'completed'
    );
  };

  const getSchedulesForDate = (date: Date) => {
    return schedules.filter(schedule => {
      const scheduleDate = new Date(schedule.nextDue);
      return scheduleDate.toDateString() === date.toDateString();
    });
  };

  const calculateNextDue = (schedule: MaintenanceSchedule) => {
    if (!schedule.lastPerformed) return schedule.nextDue;
    
    const lastDate = new Date(schedule.lastPerformed);
    const nextDate = new Date(lastDate);
    
    switch (schedule.intervalUnit) {
      case 'days':
        nextDate.setDate(lastDate.getDate() + schedule.interval);
        break;
      case 'weeks':
        nextDate.setDate(lastDate.getDate() + (schedule.interval * 7));
        break;
      case 'months':
        nextDate.setMonth(lastDate.getMonth() + schedule.interval);
        break;
      case 'years':
        nextDate.setFullYear(lastDate.getFullYear() + schedule.interval);
        break;
    }
    
    return nextDate;
  };

  const markAsCompleted = (scheduleId: string) => {
    setSchedules(prev => prev.map(schedule => {
      if (schedule.id === scheduleId) {
        const nextDue = calculateNextDue(schedule);
        return {
          ...schedule,
          lastPerformed: new Date(),
          nextDue: nextDue,
          status: 'completed' as const
        };
      }
      return schedule;
    }));
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <div className="flex items-center justify-between">
        <div>
            <h1 className="text-3xl font-bold mb-2">Maintenance Schedule</h1>
            <p className="text-muted-foreground">
              Manage preventive maintenance schedules and recurring tasks.
            </p>
          </div>
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Schedule
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Schedules</CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{schedules.length}</div>
            <p className="text-xs text-muted-foreground">
              {schedules.filter(s => s.status === 'active').length} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {getUpcomingSchedules().length}
            </div>
            <p className="text-xs text-muted-foreground">
              Due this week
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
              {getOverdueSchedules().length}
            </div>
            <p className="text-xs text-muted-foreground">
              Past due date
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {schedules.filter(s => s.status === 'completed').length}
            </div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="calendar" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="overdue">Overdue</TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Calendar */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Maintenance Calendar</CardTitle>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        <ChevronLeft className="h-4 w-4" />
        </Button>
                      <Button variant="outline" size="sm">
                        <ChevronRight className="h-4 w-4" />
        </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="rounded-md border"
                  />
                </CardContent>
              </Card>
            </div>

            {/* Schedule Details for Selected Date */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>
                    {selectedDate ? selectedDate.toLocaleDateString() : 'Select Date'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedDate && getSchedulesForDate(selectedDate).length > 0 ? (
                    <div className="space-y-3">
                      {getSchedulesForDate(selectedDate).map((schedule) => (
                        <div key={schedule.id} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{schedule.title}</h4>
                            <Badge className={getPriorityColor(schedule.priority)}>
                              {schedule.priority}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {schedule.assetName}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">
                              {schedule.estimatedDuration}h • ${schedule.estimatedCost}
                            </span>
                            <Button size="sm" onClick={() => markAsCompleted(schedule.id)}>
                              Complete
        </Button>
      </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-4">
                      No maintenance scheduled for this date
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="list" className="space-y-6">
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
                    placeholder="Search schedules..."
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
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="paused">Paused</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="frequency-filter">Frequency</Label>
                  <Select value={frequencyFilter} onValueChange={setFrequencyFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Frequencies</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="semi-annual">Semi-Annual</SelectItem>
                      <SelectItem value="annual">Annual</SelectItem>
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

          {/* Schedules List */}
          <div className="space-y-4">
            {filteredSchedules.map((schedule) => (
              <Card key={schedule.id} className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setSelectedSchedule(schedule)}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold">{schedule.title}</h3>
                        <Badge variant="outline">{schedule.id}</Badge>
                        <Badge className={getPriorityColor(schedule.priority)}>
                          {schedule.priority}
                        </Badge>
                        <Badge className={getStatusColor(schedule.status)}>
                          {schedule.status}
                        </Badge>
                      </div>
                      
                      <p className="text-muted-foreground mb-3">{schedule.description}</p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <Building className="h-4 w-4 text-muted-foreground" />
                          <span>{schedule.assetName}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>{schedule.location}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Repeat className="h-4 w-4 text-muted-foreground" />
                          <span className="capitalize">{schedule.frequency}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                          <span>Due: {schedule.nextDue.toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span>Duration: {schedule.estimatedDuration}h</span>
                          <span>Cost: ${schedule.estimatedCost}</span>
                          <span>Assigned: {schedule.assignedToName || 'Unassigned'}</span>
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm" onClick={(e) => {
                            e.stopPropagation();
                            markAsCompleted(schedule.id);
                          }}>
                            Complete
                          </Button>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        </TabsContent>

        <TabsContent value="overdue" className="space-y-4">
          {getOverdueSchedules().map((schedule) => (
            <Card key={schedule.id} className="cursor-pointer hover:shadow-md transition-shadow border-red-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-red-600">{schedule.title}</h3>
                    <p className="text-muted-foreground">{schedule.assetName}</p>
                    <p className="text-sm text-red-600">
                      Overdue by {Math.ceil((new Date().getTime() - schedule.nextDue.getTime()) / (1000 * 60 * 60 * 24))} days
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="destructive">
                      Escalate
                    </Button>
                    <Button size="sm" onClick={() => markAsCompleted(schedule.id)}>
                      Complete
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
      </Tabs>

      {/* Schedule Details Modal */}
      {selectedSchedule && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="h-5 w-5" />
                  {selectedSchedule.title}
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setSelectedSchedule(null)}>
                  <XCircle className="h-4 w-4" />
                </Button>
                </div>
              </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label>Status</Label>
                  <Badge className={`mt-1 ${getStatusColor(selectedSchedule.status)}`}>
                    {selectedSchedule.status}
                    </Badge>
                  </div>
                <div>
                  <Label>Priority</Label>
                  <Badge className={`mt-1 ${getPriorityColor(selectedSchedule.priority)}`}>
                    {selectedSchedule.priority}
                    </Badge>
                </div>
                <div>
                  <Label>Frequency</Label>
                  <div className="flex items-center gap-2 mt-1">
                    {getFrequencyIcon(selectedSchedule.frequency)}
                    <span className="capitalize">{selectedSchedule.frequency}</span>
                  </div>
                </div>
                <div>
                  <Label>Next Due</Label>
                  <p className="mt-1">{selectedSchedule.nextDue.toLocaleDateString()}</p>
                      </div>
                    </div>

              <Separator />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <Label>Description</Label>
                  <p className="mt-1 text-muted-foreground">{selectedSchedule.description}</p>
                    </div>
                <div>
                  <Label>Asset Information</Label>
                  <div className="mt-1 space-y-1">
                    <p><strong>Asset:</strong> {selectedSchedule.assetName}</p>
                    <p><strong>Location:</strong> {selectedSchedule.location}</p>
                    <p><strong>Assigned To:</strong> {selectedSchedule.assignedToName || 'Unassigned'}</p>
                  </div>
                </div>
                      </div>

              <Separator />

              <div>
                <Label>Checklist</Label>
                <div className="mt-2 space-y-2">
                  {selectedSchedule.checklist.map((item) => (
                    <div key={item.id} className="flex items-center space-x-2 p-2 border rounded">
                      <input type="checkbox" />
                      <span>{item.task}</span>
                      {item.required && <Badge variant="outline" className="text-xs">Required</Badge>}
                    </div>
                  ))}
                      </div>
                    </div>

              <Separator />

              <div>
                <Label>Required Materials</Label>
                <div className="mt-2 space-y-2">
                  {selectedSchedule.materials.map((material) => (
                    <div key={material.id} className="flex items-center justify-between p-2 border rounded">
                      <span>{material.name}</span>
                      <span className="text-muted-foreground">
                        {material.quantity} {material.unit}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button className="flex-1" onClick={() => markAsCompleted(selectedSchedule.id)}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark as Completed
                </Button>
                <Button variant="outline" className="flex-1">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Schedule
                </Button>
                <Button variant="outline" className="flex-1">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                </div>
              </CardContent>
            </Card>
        </div>
      )}
    </div>
  );
}