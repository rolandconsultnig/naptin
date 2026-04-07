import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@eam/components/ui/card';
import { Button } from '@eam/components/ui/button';
import { Input } from '@eam/components/ui/input';
import { Label } from '@eam/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@eam/components/ui/select';
import { Badge } from '@eam/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@eam/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@eam/components/ui/dialog';
import { Progress } from '@eam/components/ui/progress';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { Plus, TrendingUp, TrendingDown, Zap, Droplets, Flame, Search, Filter } from 'lucide-react';

interface EnergyConsumption {
  id: number;
  assetId: string;
  assetName: string;
  energyType: string;
  readingDate: string;
  readingValue: number;
  unit: string;
  cost: number;
  meterNumber: string;
}

const energyData = [
  { month: 'Jan', electricity: 45000, gas: 12000, water: 8000, total: 65000 },
  { month: 'Feb', electricity: 42000, gas: 11000, water: 7500, total: 60500 },
  { month: 'Mar', electricity: 48000, gas: 13000, water: 8200, total: 69200 },
  { month: 'Apr', electricity: 46000, gas: 12500, water: 7800, total: 66300 },
  { month: 'May', electricity: 52000, gas: 14000, water: 8500, total: 74500 },
  { month: 'Jun', electricity: 55000, gas: 15000, water: 9000, total: 79000 },
];

const energyBreakdown = [
  { name: 'Electricity', value: 55, color: '#3b82f6' },
  { name: 'Natural Gas', value: 25, color: '#ef4444' },
  { name: 'Water', value: 15, color: '#06b6d4' },
  { name: 'Other', value: 5, color: '#8b5cf6' },
];

export default function EnergyManagement() {
  const [consumption, setConsumption] = useState<EnergyConsumption[]>([]);
  const [isReadingDialogOpen, setIsReadingDialogOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  // Mock data for demonstration
  useEffect(() => {
    setConsumption([
      {
        id: 1,
        assetId: 'ENERGY-001',
        assetName: 'Main Building - HVAC',
        energyType: 'electricity',
        readingDate: '2024-01-15',
        readingValue: 45000,
        unit: 'kWh',
        cost: 6750.00,
        meterNumber: 'MTR-001',
      },
      {
        id: 2,
        assetId: 'ENERGY-002',
        assetName: 'Production Line A',
        energyType: 'electricity',
        readingDate: '2024-01-15',
        readingValue: 28000,
        unit: 'kWh',
        cost: 4200.00,
        meterNumber: 'MTR-002',
      },
      {
        id: 3,
        assetId: 'ENERGY-003',
        assetName: 'Boiler System',
        energyType: 'gas',
        readingDate: '2024-01-15',
        readingValue: 12000,
        unit: 'm³',
        cost: 3600.00,
        meterNumber: 'MTR-003',
      },
    ]);
  }, []);

  const getEnergyTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'electricity':
        return <Zap className="w-4 h-4 text-blue-500" />;
      case 'gas':
        return <Flame className="w-4 h-4 text-red-500" />;
      case 'water':
        return <Droplets className="w-4 h-4 text-cyan-500" />;
      default:
        return <Zap className="w-4 h-4" />;
    }
  };

  const getEnergyTypeBadge = (type: string) => {
    const typeColors = {
      electricity: 'bg-blue-100 text-blue-800',
      gas: 'bg-red-100 text-red-800',
      water: 'bg-cyan-100 text-cyan-800',
      steam: 'bg-gray-100 text-gray-800',
    };
    return <Badge className={typeColors[type as keyof typeof typeColors]}>{type}</Badge>;
  };

  const totalCost = consumption.reduce((sum, item) => sum + item.cost, 0);
  const totalConsumption = consumption.reduce((sum, item) => sum + item.readingValue, 0);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Energy Management</h1>
          <p className="text-muted-foreground">Track energy consumption and sustainability metrics</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Week</SelectItem>
              <SelectItem value="month">Month</SelectItem>
              <SelectItem value="quarter">Quarter</SelectItem>
              <SelectItem value="year">Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Consumption</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalConsumption.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">kWh this month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalCost.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+5% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Efficiency Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">87%</div>
            <p className="text-xs text-muted-foreground">+2% improvement</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Carbon Footprint</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">245 tCO₂</div>
            <p className="text-xs text-muted-foreground">-8% from last month</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Energy Consumption Trends</CardTitle>
            <CardDescription>Monthly energy consumption by type</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={energyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="electricity" stroke="#3b82f6" name="Electricity" />
                <Line type="monotone" dataKey="gas" stroke="#ef4444" name="Natural Gas" />
                <Line type="monotone" dataKey="water" stroke="#06b6d4" name="Water" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Energy Distribution</CardTitle>
            <CardDescription>Breakdown by energy type</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={energyBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {energyBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Energy Consumption Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Energy Consumption Records</CardTitle>
              <CardDescription>Track energy readings and costs by asset</CardDescription>
            </div>
            <Dialog open={isReadingDialogOpen} onOpenChange={setIsReadingDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Reading
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add Energy Reading</DialogTitle>
                  <DialogDescription>Record energy consumption reading</DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="asset">Asset</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select asset" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hvac">Main Building - HVAC</SelectItem>
                        <SelectItem value="production">Production Line A</SelectItem>
                        <SelectItem value="boiler">Boiler System</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="energyType">Energy Type</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="electricity">Electricity</SelectItem>
                        <SelectItem value="gas">Natural Gas</SelectItem>
                        <SelectItem value="water">Water</SelectItem>
                        <SelectItem value="steam">Steam</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="readingDate">Reading Date</Label>
                    <Input id="readingDate" type="date" />
                  </div>
                  <div>
                    <Label htmlFor="readingValue">Reading Value</Label>
                    <Input id="readingValue" type="number" step="0.01" />
                  </div>
                  <div>
                    <Label htmlFor="unit">Unit</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kWh">kWh</SelectItem>
                        <SelectItem value="m³">m³</SelectItem>
                        <SelectItem value="gallons">Gallons</SelectItem>
                        <SelectItem value="therms">Therms</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="cost">Cost ($)</Label>
                    <Input id="cost" type="number" step="0.01" />
                  </div>
                  <div>
                    <Label htmlFor="meterNumber">Meter Number</Label>
                    <Input id="meterNumber" placeholder="MTR-XXX" />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsReadingDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button>Add Reading</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search consumption records..." className="pl-8" />
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
                <TableHead>Asset Name</TableHead>
                <TableHead>Energy Type</TableHead>
                <TableHead>Reading Date</TableHead>
                <TableHead>Reading Value</TableHead>
                <TableHead>Cost</TableHead>
                <TableHead>Meter</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {consumption.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>{record.assetId}</TableCell>
                  <TableCell>{record.assetName}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getEnergyTypeIcon(record.energyType)}
                      {getEnergyTypeBadge(record.energyType)}
                    </div>
                  </TableCell>
                  <TableCell>{record.readingDate}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{record.readingValue.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">{record.unit}</div>
                    </div>
                  </TableCell>
                  <TableCell>${record.cost.toLocaleString()}</TableCell>
                  <TableCell>{record.meterNumber}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm">
                        <TrendingUp className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Sustainability Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Energy Efficiency</CardTitle>
            <CardDescription>Current efficiency score</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Overall Efficiency</span>
                <span>87%</span>
              </div>
              <Progress value={87} className="h-2" />
              <div className="text-xs text-muted-foreground">
                Target: 90% • +2% improvement needed
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Carbon Reduction</CardTitle>
            <CardDescription>Environmental impact</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>CO₂ Emissions</span>
                <span>245 tCO₂</span>
              </div>
              <Progress value={75} className="h-2" />
              <div className="text-xs text-muted-foreground">
                -8% from last month • Target: 200 tCO₂
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cost Optimization</CardTitle>
            <CardDescription>Energy cost management</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Cost per kWh</span>
                <span>$0.12</span>
              </div>
              <Progress value={80} className="h-2" />
              <div className="text-xs text-muted-foreground">
                Industry average: $0.15 • 20% below average
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 