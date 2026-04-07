import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@eam/components/ui/card';
import { Button } from '@eam/components/ui/button';
import { Input } from '@eam/components/ui/input';
import { Label } from '@eam/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@eam/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@eam/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@eam/components/ui/tabs';
import { Badge } from '@eam/components/ui/badge';
import { Progress } from '@eam/components/ui/progress';
import { MapPin, Navigation, Clock, AlertTriangle, CheckCircle, XCircle, Search, Filter, Download, Eye, History, Map } from 'lucide-react';

interface TrackedAsset {
  id: string;
  assetId: string;
  name: string;
  category: string;
  currentLocation: string;
  previousLocation: string;
  assignedTo: string;
  status: 'active' | 'inactive' | 'maintenance' | 'lost' | 'disposed';
  lastSeen: string;
  batteryLevel: number;
  signalStrength: number;
  movementHistory: MovementRecord[];
  locationHistory: LocationRecord[];
}

interface MovementRecord {
  id: string;
  timestamp: string;
  fromLocation: string;
  toLocation: string;
  reason: string;
  authorizedBy: string;
  distance: number;
}

interface LocationRecord {
  id: string;
  timestamp: string;
  latitude: number;
  longitude: number;
  location: string;
  accuracy: number;
}

const mockTrackedAssets: TrackedAsset[] = [
  {
    id: '1',
    assetId: 'AST-0001',
    name: 'Port Harcourt Refinery Unit 1',
    category: 'Refinery Equipment',
    currentLocation: 'Port Harcourt Refinery - Unit 1',
    previousLocation: 'Port Harcourt Refinery - Storage',
    assignedTo: 'John Smith',
    status: 'active',
    lastSeen: '2024-01-15T10:30:00Z',
    batteryLevel: 85,
    signalStrength: 95,
    movementHistory: [
      {
        id: '1',
        timestamp: '2024-01-15T08:00:00Z',
        fromLocation: 'Port Harcourt Refinery - Storage',
        toLocation: 'Port Harcourt Refinery - Unit 1',
        reason: 'Scheduled maintenance',
        authorizedBy: 'Maintenance Manager',
        distance: 0.5
      }
    ],
    locationHistory: [
      {
        id: '1',
        timestamp: '2024-01-15T10:30:00Z',
        latitude: 4.8156,
        longitude: 7.0498,
        location: 'Port Harcourt Refinery - Unit 1',
        accuracy: 5
      }
    ]
  },
  {
    id: '2',
    assetId: 'AST-0002',
    name: 'Pipeline Network System',
    category: 'Infrastructure',
    currentLocation: 'Pipeline Station Alpha',
    previousLocation: 'Pipeline Station Beta',
    assignedTo: 'Sarah Johnson',
    status: 'active',
    lastSeen: '2024-01-15T09:45:00Z',
    batteryLevel: 92,
    signalStrength: 88,
    movementHistory: [
      {
        id: '2',
        timestamp: '2024-01-14T16:00:00Z',
        fromLocation: 'Pipeline Station Beta',
        toLocation: 'Pipeline Station Alpha',
        reason: 'Routine inspection',
        authorizedBy: 'Operations Manager',
        distance: 2.3
      }
    ],
    locationHistory: [
      {
        id: '2',
        timestamp: '2024-01-15T09:45:00Z',
        latitude: 4.8200,
        longitude: 7.0500,
        location: 'Pipeline Station Alpha',
        accuracy: 3
      }
    ]
  },
  {
    id: '3',
    assetId: 'AST-0003',
    name: 'Control Room Equipment',
    category: 'Electronics',
    currentLocation: 'Main Control Room',
    previousLocation: 'Main Control Room',
    assignedTo: 'Mike Wilson',
    status: 'maintenance',
    lastSeen: '2024-01-15T07:20:00Z',
    batteryLevel: 45,
    signalStrength: 75,
    movementHistory: [],
    locationHistory: [
      {
        id: '3',
        timestamp: '2024-01-15T07:20:00Z',
        latitude: 4.8150,
        longitude: 7.0495,
        location: 'Main Control Room',
        accuracy: 2
      }
    ]
  }
];

const AssetTracking: React.FC = () => {
  const [assets, setAssets] = useState<TrackedAsset[]>(mockTrackedAssets);
  const [selectedAsset, setSelectedAsset] = useState<TrackedAsset | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');

  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset.assetId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || asset.status === statusFilter;
    const matchesLocation = locationFilter === 'all' || asset.currentLocation.includes(locationFilter);
    
    return matchesSearch && matchesStatus && matchesLocation;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'inactive': return 'secondary';
      case 'maintenance': return 'outline';
      case 'lost': return 'destructive';
      case 'disposed': return 'destructive';
      default: return 'default';
    }
  };

  const getBatteryColor = (level: number) => {
    if (level > 80) return 'text-green-600';
    if (level > 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSignalColor = (strength: number) => {
    if (strength > 90) return 'text-green-600';
    if (strength > 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const totalAssets = assets.length;
  const activeAssets = assets.filter(a => a.status === 'active').length;
  const maintenanceAssets = assets.filter(a => a.status === 'maintenance').length;
  const lostAssets = assets.filter(a => a.status === 'lost').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Asset Tracking</h1>
          <p className="text-muted-foreground">
            Real-time tracking and monitoring of asset locations and movements
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
          <Button size="sm">
            <Map className="h-4 w-4 mr-2" />
            View Map
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tracked Assets</CardTitle>
            <Navigation className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAssets}</div>
            <p className="text-xs text-muted-foreground">
              All tracked assets
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Assets</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeAssets}</div>
            <p className="text-xs text-muted-foreground">
              Currently active
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Under Maintenance</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{maintenanceAssets}</div>
            <p className="text-xs text-muted-foreground">
              In maintenance
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lost Assets</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{lostAssets}</div>
            <p className="text-xs text-muted-foreground">
              Missing or lost
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Label htmlFor="search">Search Assets</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by asset name or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="lost">Lost</SelectItem>
                  <SelectItem value="disposed">Disposed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All locations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  <SelectItem value="Port Harcourt">Port Harcourt</SelectItem>
                  <SelectItem value="Pipeline">Pipeline</SelectItem>
                  <SelectItem value="Control Room">Control Room</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Asset Overview</TabsTrigger>
          <TabsTrigger value="movements">Movement History</TabsTrigger>
          <TabsTrigger value="locations">Location Tracking</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tracked Assets</CardTitle>
              <CardDescription>
                Real-time status and location of all tracked assets
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Asset ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Current Location</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Seen</TableHead>
                    <TableHead>Battery</TableHead>
                    <TableHead>Signal</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAssets.map((asset) => (
                    <TableRow key={asset.id}>
                      <TableCell className="font-medium">{asset.assetId}</TableCell>
                      <TableCell>{asset.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          {asset.currentLocation}
                        </div>
                      </TableCell>
                      <TableCell>{asset.assignedTo}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(asset.status)}>
                          {asset.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          {new Date(asset.lastSeen).toLocaleString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className={`text-sm font-medium ${getBatteryColor(asset.batteryLevel)}`}>
                            {asset.batteryLevel}%
                          </div>
                          <Progress value={asset.batteryLevel} className="w-16 h-2" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className={`text-sm font-medium ${getSignalColor(asset.signalStrength)}`}>
                            {asset.signalStrength}%
                          </div>
                          <Progress value={asset.signalStrength} className="w-16 h-2" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedAsset(asset)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <History className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="movements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Movement History</CardTitle>
              <CardDescription>
                Track all asset movements and transfers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Asset ID</TableHead>
                    <TableHead>From Location</TableHead>
                    <TableHead>To Location</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Distance (km)</TableHead>
                    <TableHead>Authorized By</TableHead>
                    <TableHead>Timestamp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assets.flatMap(asset => 
                    asset.movementHistory.map(movement => (
                      <TableRow key={movement.id}>
                        <TableCell className="font-medium">{asset.assetId}</TableCell>
                        <TableCell>{movement.fromLocation}</TableCell>
                        <TableCell>{movement.toLocation}</TableCell>
                        <TableCell>{movement.reason}</TableCell>
                        <TableCell>{movement.distance}</TableCell>
                        <TableCell>{movement.authorizedBy}</TableCell>
                        <TableCell>
                          {new Date(movement.timestamp).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="locations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Location Tracking</CardTitle>
              <CardDescription>
                Real-time location data and GPS coordinates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {assets.map((asset) => (
                  <Card key={asset.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">{asset.name}</CardTitle>
                      <CardDescription>{asset.assetId}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{asset.currentLocation}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <div>Lat: {asset.locationHistory[0]?.latitude.toFixed(4)}</div>
                        <div>Lng: {asset.locationHistory[0]?.longitude.toFixed(4)}</div>
                        <div>Accuracy: ±{asset.locationHistory[0]?.accuracy}m</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={getStatusColor(asset.status)}>
                          {asset.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          Last seen: {new Date(asset.lastSeen).toLocaleTimeString()}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tracking Alerts</CardTitle>
              <CardDescription>
                Monitor alerts and notifications for tracked assets
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 border rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  <div className="flex-1">
                    <div className="font-medium">Low Battery Alert</div>
                    <div className="text-sm text-muted-foreground">
                      Control Room Equipment battery level is below 50%
                    </div>
                  </div>
                  <Badge variant="outline">Warning</Badge>
                </div>
                <div className="flex items-center gap-4 p-4 border rounded-lg">
                  <XCircle className="h-5 w-5 text-red-600" />
                  <div className="flex-1">
                    <div className="font-medium">Signal Loss</div>
                    <div className="text-sm text-muted-foreground">
                      Pipeline Network System signal strength is critically low
                    </div>
                  </div>
                  <Badge variant="destructive">Critical</Badge>
                </div>
                <div className="flex items-center gap-4 p-4 border rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div className="flex-1">
                    <div className="font-medium">Asset Movement Detected</div>
                    <div className="text-sm text-muted-foreground">
                      Port Harcourt Refinery Unit 1 has been moved to new location
                    </div>
                  </div>
                  <Badge variant="default">Info</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Asset Detail Modal */}
      {selectedAsset && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Asset Tracking Details</CardTitle>
            <CardDescription>{selectedAsset.name}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div>
                  <Label>Asset Information</Label>
                  <div className="mt-2 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Asset ID:</span>
                      <span className="font-medium">{selectedAsset.assetId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Category:</span>
                      <span>{selectedAsset.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Assigned To:</span>
                      <span>{selectedAsset.assignedTo}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <Badge variant={getStatusColor(selectedAsset.status)}>
                        {selectedAsset.status}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div>
                  <Label>Current Location</Label>
                  <div className="mt-2 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Location:</span>
                      <span className="font-medium">{selectedAsset.currentLocation}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Previous Location:</span>
                      <span>{selectedAsset.previousLocation}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Last Seen:</span>
                      <span>{new Date(selectedAsset.lastSeen).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <Label>Device Status</Label>
                  <div className="mt-2 space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Battery Level</span>
                        <span className={getBatteryColor(selectedAsset.batteryLevel)}>
                          {selectedAsset.batteryLevel}%
                        </span>
                      </div>
                      <Progress value={selectedAsset.batteryLevel} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Signal Strength</span>
                        <span className={getSignalColor(selectedAsset.signalStrength)}>
                          {selectedAsset.signalStrength}%
                        </span>
                      </div>
                      <Progress value={selectedAsset.signalStrength} className="h-2" />
                    </div>
                  </div>
                </div>
                <div>
                  <Label>Recent Movements</Label>
                  <div className="mt-2 space-y-2">
                    {selectedAsset.movementHistory.slice(0, 3).map((movement) => (
                      <div key={movement.id} className="text-sm p-2 border rounded">
                        <div className="font-medium">{movement.reason}</div>
                        <div className="text-muted-foreground">
                          {movement.fromLocation} → {movement.toLocation}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(movement.timestamp).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <Button variant="outline" onClick={() => setSelectedAsset(null)}>
                Close
              </Button>
              <Button>
                <Map className="h-4 w-4 mr-2" />
                View on Map
              </Button>
              <Button variant="outline">
                <History className="h-4 w-4 mr-2" />
                View Full History
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AssetTracking; 