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
import { Switch } from "@/components/ui/switch";
import { 
  Plus, 
  Search, 
  Filter, 
  User, 
  Users,
  Shield,
  Activity,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit,
  Eye,
  Trash2,
  Lock,
  Unlock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Settings,
  Download,
  Upload,
  MoreHorizontal,
  Building,
  Clock,
  Zap
} from "lucide-react";

interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'manager' | 'technician' | 'operator' | 'viewer';
  department: string;
  position: string;
  phone: string;
  location: string;
  isActive: boolean;
  lastLogin: Date | null;
  createdAt: Date;
  permissions: string[];
  assignedAssets: string[];
  workOrders: number;
  completedTasks: number;
}

const mockUsers: User[] = [
  {
    id: "USR-001",
    username: "admin",
    email: "admin@nnpc.com",
    firstName: "System",
    lastName: "Administrator",
    role: "admin",
    department: "IT",
    position: "System Administrator",
    phone: "+234-801-234-5678",
    location: "Headquarters",
    isActive: true,
    lastLogin: new Date("2024-01-20T10:30:00"),
    createdAt: new Date("2024-01-01"),
    permissions: ["all"],
    assignedAssets: ["ASSET-001", "ASSET-002"],
    workOrders: 15,
    completedTasks: 12
  },
  {
    id: "USR-002",
    username: "john.smith",
    email: "john.smith@nnpc.com",
    firstName: "John",
    lastName: "Smith",
    role: "manager",
    department: "Maintenance",
    position: "Maintenance Manager",
    phone: "+234-802-345-6789",
    location: "Refinery A",
    isActive: true,
    lastLogin: new Date("2024-01-19T14:20:00"),
    createdAt: new Date("2024-01-05"),
    permissions: ["assets:read", "assets:write", "workorders:read", "workorders:write", "reports:read"],
    assignedAssets: ["ASSET-003", "ASSET-004", "ASSET-005"],
    workOrders: 28,
    completedTasks: 25
  },
  {
    id: "USR-003",
    username: "sarah.johnson",
    email: "sarah.johnson@nnpc.com",
    firstName: "Sarah",
    lastName: "Johnson",
    role: "technician",
    department: "Maintenance",
    position: "Senior Technician",
    phone: "+234-803-456-7890",
    location: "Refinery B",
    isActive: true,
    lastLogin: new Date("2024-01-20T08:15:00"),
    createdAt: new Date("2024-01-10"),
    permissions: ["assets:read", "workorders:read", "workorders:write"],
    assignedAssets: ["ASSET-006", "ASSET-007"],
    workOrders: 42,
    completedTasks: 38
  },
  {
    id: "USR-004",
    username: "mike.davis",
    email: "mike.davis@nnpc.com",
    firstName: "Mike",
    lastName: "Davis",
    role: "operator",
    department: "Operations",
    position: "Plant Operator",
    phone: "+234-804-567-8901",
    location: "Terminal C",
    isActive: true,
    lastLogin: new Date("2024-01-18T16:45:00"),
    createdAt: new Date("2024-01-15"),
    permissions: ["assets:read", "workorders:read"],
    assignedAssets: ["ASSET-008"],
    workOrders: 8,
    completedTasks: 7
  },
  {
    id: "USR-005",
    username: "lisa.wilson",
    email: "lisa.wilson@nnpc.com",
    firstName: "Lisa",
    lastName: "Wilson",
    role: "viewer",
    department: "Finance",
    position: "Financial Analyst",
    phone: "+234-805-678-9012",
    location: "Headquarters",
    isActive: false,
    lastLogin: new Date("2024-01-15T11:30:00"),
    createdAt: new Date("2024-01-20"),
    permissions: ["assets:read", "reports:read"],
    assignedAssets: [],
    workOrders: 0,
    completedTasks: 0
  }
];

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showPermissions, setShowPermissions] = useState(false);

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'manager': return 'bg-blue-100 text-blue-800';
      case 'technician': return 'bg-green-100 text-green-800';
      case 'operator': return 'bg-yellow-100 text-yellow-800';
      case 'viewer': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Shield className="h-4 w-4" />;
      case 'manager': return <Users className="h-4 w-4" />;
      case 'technician': return <Zap className="h-4 w-4" />;
      case 'operator': return <Activity className="h-4 w-4" />;
      case 'viewer': return <Eye className="h-4 w-4" />;
      default: return <User className="h-4 w-4" />;
    }
  };

  const getStatusIcon = (isActive: boolean) => {
    return isActive ? 
      <CheckCircle className="h-4 w-4 text-green-600" /> : 
      <XCircle className="h-4 w-4 text-red-600" />;
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    const matchesStatus = statusFilter === "all" || 
                         (statusFilter === "active" && user.isActive) ||
                         (statusFilter === "inactive" && !user.isActive);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getActiveUsers = () => {
    return users.filter(user => user.isActive);
  };

  const getInactiveUsers = () => {
    return users.filter(user => !user.isActive);
  };

  const toggleUserStatus = (userId: string) => {
    setUsers(prev => prev.map(user => {
      if (user.id === userId) {
        return { ...user, isActive: !user.isActive };
      }
      return user;
    }));
  };

  const deleteUser = (userId: string) => {
    setUsers(prev => prev.filter(user => user.id !== userId));
  };

  const getPermissionsForRole = (role: string) => {
    switch (role) {
      case 'admin':
        return ['all'];
      case 'manager':
        return ['assets:read', 'assets:write', 'workorders:read', 'workorders:write', 'reports:read', 'users:read'];
      case 'technician':
        return ['assets:read', 'workorders:read', 'workorders:write', 'inventory:read'];
      case 'operator':
        return ['assets:read', 'workorders:read'];
      case 'viewer':
        return ['assets:read', 'reports:read'];
      default:
        return [];
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">User Management</h1>
            <p className="text-muted-foreground">
              Manage users, roles, permissions, and access control.
            </p>
          </div>
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
            <p className="text-xs text-muted-foreground">
              {getActiveUsers().length} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {getActiveUsers().length}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive Users</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {getInactiveUsers().length}
            </div>
            <p className="text-xs text-muted-foreground">
              Disabled accounts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Roles</CardTitle>
            <Shield className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {new Set(users.map(u => u.role)).size}
            </div>
            <p className="text-xs text-muted-foreground">
              Different roles
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Users</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="inactive">Inactive</TabsTrigger>
          <TabsTrigger value="roles">Roles & Permissions</TabsTrigger>
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
                  <Label htmlFor="search">Search Users</Label>
                  <Input
                    id="search"
                    placeholder="Search by name, email, or username..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="role-filter">Role</Label>
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="technician">Technician</SelectItem>
                      <SelectItem value="operator">Operator</SelectItem>
                      <SelectItem value="viewer">Viewer</SelectItem>
                    </SelectContent>
                  </Select>
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
                      <SelectItem value="inactive">Inactive</SelectItem>
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

          {/* Users List */}
          <div className="space-y-4">
            {filteredUsers.map((user) => (
              <Card key={user.id} className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setSelectedUser(user)}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-gray-600" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="text-lg font-semibold">
                            {user.firstName} {user.lastName}
                          </h3>
                          {getStatusIcon(user.isActive)}
                          <Badge className={getRoleColor(user.role)}>
                            {user.role}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground">{user.email}</p>
                        <p className="text-sm text-muted-foreground">
                          {user.department} • {user.position}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="text-right">
                        <p className="text-sm font-medium">{user.username}</p>
                        <p className="text-xs text-muted-foreground">
                          Last login: {user.lastLogin ? user.lastLogin.toLocaleDateString() : 'Never'}
                        </p>
                      </div>
                      <div className="flex space-x-1">
                        <Button variant="outline" size="sm" onClick={(e) => {
                          e.stopPropagation();
                          toggleUserStatus(user.id);
                        }}>
                          {user.isActive ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                        </Button>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={(e) => {
                          e.stopPropagation();
                          deleteUser(user.id);
                        }}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          {getActiveUsers().map((user) => (
            <Card key={user.id} className="cursor-pointer hover:shadow-md transition-shadow border-green-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-lg font-semibold text-green-600">
                          {user.firstName} {user.lastName}
                        </h3>
                        <Badge className={getRoleColor(user.role)}>
                          {user.role}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground">{user.email}</p>
                      <p className="text-sm text-muted-foreground">
                        {user.department} • {user.position}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{user.username}</p>
                    <p className="text-xs text-muted-foreground">
                      Last login: {user.lastLogin ? user.lastLogin.toLocaleDateString() : 'Never'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="inactive" className="space-y-4">
          {getInactiveUsers().map((user) => (
            <Card key={user.id} className="cursor-pointer hover:shadow-md transition-shadow border-red-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-red-600" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-lg font-semibold text-red-600">
                          {user.firstName} {user.lastName}
                        </h3>
                        <Badge className={getRoleColor(user.role)}>
                          {user.role}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground">{user.email}</p>
                      <p className="text-sm text-muted-foreground">
                        {user.department} • {user.position}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{user.username}</p>
                    <p className="text-xs text-muted-foreground">
                      Last login: {user.lastLogin ? user.lastLogin.toLocaleDateString() : 'Never'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="roles" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Role Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['admin', 'manager', 'technician', 'operator', 'viewer'].map((role) => {
                    const count = users.filter(u => u.role === role).length;
                    const percentage = (count / users.length) * 100;
                    
                    return (
                      <div key={role} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {getRoleIcon(role)}
                          <span className="capitalize">{role}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 h-2 bg-gray-200 rounded-full">
                            <div 
                              className="h-2 rounded-full" 
                              style={{ 
                                width: `${percentage}%`,
                                backgroundColor: role === 'admin' ? '#ef4444' :
                                               role === 'manager' ? '#3b82f6' :
                                               role === 'technician' ? '#22c55e' :
                                               role === 'operator' ? '#eab308' : '#6b7280'
                              }}
                            ></div>
                          </div>
                          <span className="text-sm text-muted-foreground">{count}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Permission Matrix</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['admin', 'manager', 'technician', 'operator', 'viewer'].map((role) => (
                    <div key={role} className="border rounded-lg p-3">
                      <div className="flex items-center space-x-2 mb-2">
                        {getRoleIcon(role)}
                        <span className="font-medium capitalize">{role}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-1 text-xs">
                        {getPermissionsForRole(role).map((permission) => (
                          <div key={permission} className="flex items-center space-x-1">
                            <CheckCircle className="h-3 w-3 text-green-600" />
                            <span>{permission}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  {selectedUser.firstName} {selectedUser.lastName}
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setSelectedUser(null)}>
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label>Status</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    {getStatusIcon(selectedUser.isActive)}
                    <span className={selectedUser.isActive ? 'text-green-600' : 'text-red-600'}>
                      {selectedUser.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                <div>
                  <Label>Role</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    {getRoleIcon(selectedUser.role)}
                    <Badge className={getRoleColor(selectedUser.role)}>
                      {selectedUser.role}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label>Department</Label>
                  <p className="mt-1">{selectedUser.department}</p>
                </div>
                <div>
                  <Label>Position</Label>
                  <p className="mt-1">{selectedUser.position}</p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <Label>Contact Information</Label>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedUser.email}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedUser.phone}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedUser.location}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <Label>Account Information</Label>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>Username: {selectedUser.username}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>Created: {selectedUser.createdAt.toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>Last Login: {selectedUser.lastLogin ? selectedUser.lastLogin.toLocaleDateString() : 'Never'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <Label>Permissions</Label>
                <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-2">
                  {selectedUser.permissions.map((permission) => (
                    <div key={permission} className="flex items-center space-x-2 p-2 border rounded">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">{permission}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{selectedUser.assignedAssets.length}</div>
                  <div className="text-sm text-muted-foreground">Assigned Assets</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{selectedUser.workOrders}</div>
                  <div className="text-sm text-muted-foreground">Work Orders</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{selectedUser.completedTasks}</div>
                  <div className="text-sm text-muted-foreground">Completed Tasks</div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button className="flex-1" onClick={() => toggleUserStatus(selectedUser.id)}>
                  {selectedUser.isActive ? <Lock className="h-4 w-4 mr-2" /> : <Unlock className="h-4 w-4 mr-2" />}
                  {selectedUser.isActive ? 'Deactivate' : 'Activate'} User
                </Button>
                <Button variant="outline" className="flex-1">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit User
                </Button>
                <Button variant="outline" className="flex-1">
                  <Settings className="h-4 w-4 mr-2" />
                  Manage Permissions
                </Button>
                <Button variant="outline" className="flex-1">
                  <Download className="h-4 w-4 mr-2" />
                  Export Data
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
} 