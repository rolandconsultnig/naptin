import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Plus, Search, Filter, Fuel, Car, Wrench, Calendar, MapPin, Gauge } from 'lucide-react';

interface FleetVehicle {
  id: number;
  assetId: string;
  vehicleType: string;
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  vin: string;
  fuelType: string;
  currentMileage: number;
  lastServiceMileage: number;
  assignedDriver: string;
  status: string;
  location: string;
}

interface FuelTransaction {
  id: number;
  vehicleId: number;
  vehicleName: string;
  transactionDate: string;
  fuelType: string;
  quantity: number;
  unitPrice: number;
  totalCost: number;
  odometerReading: number;
  station: string;
  driver: string;
}

export default function FleetManagement() {
  const [vehicles, setVehicles] = useState<FleetVehicle[]>([]);
  const [fuelTransactions, setFuelTransactions] = useState<FuelTransaction[]>([]);
  const [activeTab, setActiveTab] = useState('vehicles');
  const [searchTerm, setSearchTerm] = useState('');
  const [isVehicleDialogOpen, setIsVehicleDialogOpen] = useState(false);
  const [isFuelDialogOpen, setIsFuelDialogOpen] = useState(false);

  // Mock data for demonstration
  useEffect(() => {
    setVehicles([
      {
        id: 1,
        assetId: 'FLEET-001',
        vehicleType: 'Truck',
        make: 'Ford',
        model: 'F-150',
        year: 2022,
        licensePlate: 'ABC-123',
        vin: '1FTEW1EG8JFA12345',
        fuelType: 'Gasoline',
        currentMileage: 45000,
        lastServiceMileage: 40000,
        assignedDriver: 'John Smith',
        status: 'operational',
        location: 'Main Facility',
      },
      {
        id: 2,
        assetId: 'FLEET-002',
        vehicleType: 'Van',
        make: 'Chevrolet',
        model: 'Express',
        year: 2021,
        licensePlate: 'XYZ-789',
        vin: '1GCHG35R8Y1123456',
        fuelType: 'Diesel',
        currentMileage: 32000,
        lastServiceMileage: 30000,
        assignedDriver: 'Sarah Johnson',
        status: 'maintenance',
        location: 'Warehouse B',
      },
    ]);

    setFuelTransactions([
      {
        id: 1,
        vehicleId: 1,
        vehicleName: 'Ford F-150 (ABC-123)',
        transactionDate: '2024-01-15',
        fuelType: 'Gasoline',
        quantity: 15.5,
        unitPrice: 3.25,
        totalCost: 50.38,
        odometerReading: 45000,
        station: 'Shell Station',
        driver: 'John Smith',
      },
    ]);
  }, []);

  const getStatusBadge = (status: string) => {
    const statusColors = {
      operational: 'bg-green-100 text-green-800',
      maintenance: 'bg-yellow-100 text-yellow-800',
      out_of_service: 'bg-red-100 text-red-800',
      idle: 'bg-gray-100 text-gray-800',
    };
    return <Badge className={statusColors[status as keyof typeof statusColors]}>{status}</Badge>;
  };

  const getVehicleTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'truck':
        return <Car className="w-5 h-5" />;
      case 'van':
        return <Car className="w-5 h-5" />;
      case 'car':
        return <Car className="w-5 h-5" />;
      default:
        return <Car className="w-5 h-5" />;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Fleet Management</h1>
          <p className="text-muted-foreground">Manage vehicles, fuel consumption, and maintenance</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <MapPin className="w-4 h-4 mr-2" />
            Track Location
          </Button>
        </div>
      </div>

      {/* Fleet Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vehicles</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vehicles.length}</div>
            <p className="text-xs text-muted-foreground">Active fleet</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Operational</CardTitle>
            <Gauge className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {vehicles.filter(v => v.status === 'operational').length}
            </div>
            <p className="text-xs text-muted-foreground">Ready for use</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Maintenance</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {vehicles.filter(v => v.status === 'maintenance').length}
            </div>
            <p className="text-xs text-muted-foreground">Under service</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fuel Cost (Month)</CardTitle>
            <Fuel className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$2,450</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
          <TabsTrigger value="fuel">Fuel Management</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
        </TabsList>

        <TabsContent value="vehicles" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Fleet Vehicles</CardTitle>
                  <CardDescription>Manage and track all fleet vehicles</CardDescription>
                </div>
                <Dialog open={isVehicleDialogOpen} onOpenChange={setIsVehicleDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Vehicle
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Add New Vehicle</DialogTitle>
                      <DialogDescription>Enter vehicle information</DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="vehicleType">Vehicle Type</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="truck">Truck</SelectItem>
                            <SelectItem value="van">Van</SelectItem>
                            <SelectItem value="car">Car</SelectItem>
                            <SelectItem value="forklift">Forklift</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="make">Make</Label>
                        <Input id="make" placeholder="Ford" />
                      </div>
                      <div>
                        <Label htmlFor="model">Model</Label>
                        <Input id="model" placeholder="F-150" />
                      </div>
                      <div>
                        <Label htmlFor="year">Year</Label>
                        <Input id="year" type="number" placeholder="2024" />
                      </div>
                      <div>
                        <Label htmlFor="licensePlate">License Plate</Label>
                        <Input id="licensePlate" placeholder="ABC-123" />
                      </div>
                      <div>
                        <Label htmlFor="vin">VIN</Label>
                        <Input id="vin" placeholder="1FTEW1EG8JFA12345" />
                      </div>
                      <div>
                        <Label htmlFor="fuelType">Fuel Type</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select fuel type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="gasoline">Gasoline</SelectItem>
                            <SelectItem value="diesel">Diesel</SelectItem>
                            <SelectItem value="electric">Electric</SelectItem>
                            <SelectItem value="hybrid">Hybrid</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="assignedDriver">Assigned Driver</Label>
                        <Input id="assignedDriver" placeholder="John Smith" />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsVehicleDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button>Add Vehicle</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search vehicles..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <Button variant="outline">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Asset ID</TableHead>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>License Plate</TableHead>
                    <TableHead>Driver</TableHead>
                    <TableHead>Mileage</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vehicles.map((vehicle) => (
                    <TableRow key={vehicle.id}>
                      <TableCell>{vehicle.assetId}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getVehicleTypeIcon(vehicle.vehicleType)}
                          <div>
                            <div className="font-medium">{vehicle.make} {vehicle.model}</div>
                            <div className="text-sm text-muted-foreground">{vehicle.year}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{vehicle.licensePlate}</TableCell>
                      <TableCell>{vehicle.assignedDriver}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{vehicle.currentMileage.toLocaleString()} mi</div>
                          <div className="text-sm text-muted-foreground">
                            Last service: {vehicle.lastServiceMileage.toLocaleString()} mi
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(vehicle.status)}</TableCell>
                      <TableCell>{vehicle.location}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm">
                            <Wrench className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Fuel className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <MapPin className="w-4 h-4" />
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

        <TabsContent value="fuel" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Fuel Management</CardTitle>
                  <CardDescription>Track fuel consumption and costs</CardDescription>
                </div>
                <Dialog open={isFuelDialogOpen} onOpenChange={setIsFuelDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Fuel Transaction
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Add Fuel Transaction</DialogTitle>
                      <DialogDescription>Record fuel purchase</DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="vehicle">Vehicle</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select vehicle" />
                          </SelectTrigger>
                          <SelectContent>
                            {vehicles.map(vehicle => (
                              <SelectItem key={vehicle.id} value={vehicle.id.toString()}>
                                {vehicle.make} {vehicle.model} ({vehicle.licensePlate})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="fuelType">Fuel Type</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select fuel type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="gasoline">Gasoline</SelectItem>
                            <SelectItem value="diesel">Diesel</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="quantity">Quantity (gallons)</Label>
                        <Input id="quantity" type="number" step="0.1" />
                      </div>
                      <div>
                        <Label htmlFor="unitPrice">Unit Price ($)</Label>
                        <Input id="unitPrice" type="number" step="0.01" />
                      </div>
                      <div>
                        <Label htmlFor="odometer">Odometer Reading</Label>
                        <Input id="odometer" type="number" />
                      </div>
                      <div>
                        <Label htmlFor="station">Gas Station</Label>
                        <Input id="station" placeholder="Shell Station" />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsFuelDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button>Add Transaction</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Fuel Type</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Unit Price</TableHead>
                    <TableHead>Total Cost</TableHead>
                    <TableHead>Odometer</TableHead>
                    <TableHead>Station</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fuelTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>{transaction.transactionDate}</TableCell>
                      <TableCell>{transaction.vehicleName}</TableCell>
                      <TableCell>{transaction.fuelType}</TableCell>
                      <TableCell>{transaction.quantity} gal</TableCell>
                      <TableCell>${transaction.unitPrice}</TableCell>
                      <TableCell>${transaction.totalCost.toFixed(2)}</TableCell>
                      <TableCell>{transaction.odometerReading.toLocaleString()} mi</TableCell>
                      <TableCell>{transaction.station}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Maintenance Schedule</CardTitle>
                  <CardDescription>Track vehicle maintenance and service history</CardDescription>
                </div>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Schedule Maintenance
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {vehicles.map((vehicle) => (
                  <Card key={vehicle.id}>
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <div>
                          <CardTitle className="text-lg">{vehicle.make} {vehicle.model}</CardTitle>
                          <CardDescription>{vehicle.licensePlate} • {vehicle.assignedDriver}</CardDescription>
                        </div>
                        <Badge variant="outline">{vehicle.currentMileage.toLocaleString()} mi</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Miles since last service</span>
                          <span>{vehicle.currentMileage - vehicle.lastServiceMileage} mi</span>
                        </div>
                        <Progress 
                          value={((vehicle.currentMileage - vehicle.lastServiceMileage) / 5000) * 100} 
                          className="h-2"
                        />
                        <div className="text-xs text-muted-foreground">
                          Next service due at {vehicle.lastServiceMileage + 5000} mi
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 