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
import { Calendar, AlertTriangle, CheckCircle, Clock, Search, Filter, Plus, FileText } from 'lucide-react';

interface CalibrationRecord {
  id: number;
  assetId: string;
  assetName: string;
  calibrationType: string;
  calibrationDate: string;
  nextCalibrationDate: string;
  calibratedBy: string;
  calibrationStandard: string;
  result: string;
  certificateNumber: string;
  daysUntilDue: number;
}

interface ComplianceRecord {
  id: number;
  assetId: string;
  assetName: string;
  complianceType: string;
  requirement: string;
  dueDate: string;
  completedDate: string | null;
  status: string;
  responsiblePerson: string;
  daysUntilDue: number;
}

export default function Calibration() {
  const [calibrations, setCalibrations] = useState<CalibrationRecord[]>([]);
  const [compliance, setCompliance] = useState<ComplianceRecord[]>([]);
  const [activeTab, setActiveTab] = useState('calibration');
  const [searchTerm, setSearchTerm] = useState('');
  const [isCalibrationDialogOpen, setIsCalibrationDialogOpen] = useState(false);
  const [isComplianceDialogOpen, setIsComplianceDialogOpen] = useState(false);

  // Mock data for demonstration
  useEffect(() => {
    setCalibrations([
      {
        id: 1,
        assetId: 'CAL-001',
        assetName: 'Pressure Gauge - Main Line',
        calibrationType: 'external',
        calibrationDate: '2024-01-01',
        nextCalibrationDate: '2024-07-01',
        calibratedBy: 'John Smith',
        calibrationStandard: 'ISO 17025',
        result: 'pass',
        certificateNumber: 'CAL-2024-001',
        daysUntilDue: 45,
      },
      {
        id: 2,
        assetId: 'CAL-002',
        assetName: 'Temperature Sensor - Reactor 1',
        calibrationType: 'internal',
        calibrationDate: '2024-01-15',
        nextCalibrationDate: '2024-04-15',
        calibratedBy: 'Sarah Johnson',
        calibrationStandard: 'Internal Procedure',
        result: 'pass',
        certificateNumber: 'INT-2024-002',
        daysUntilDue: -5,
      },
    ]);

    setCompliance([
      {
        id: 1,
        assetId: 'COMP-001',
        assetName: 'Safety Valve - Tank A',
        complianceType: 'OSHA',
        requirement: 'Annual safety inspection',
        dueDate: '2024-03-01',
        completedDate: null,
        status: 'pending',
        responsiblePerson: 'Mike Wilson',
        daysUntilDue: 15,
      },
      {
        id: 2,
        assetId: 'COMP-002',
        assetName: 'Fire Suppression System',
        complianceType: 'NFPA',
        requirement: 'Quarterly inspection',
        dueDate: '2024-01-31',
        completedDate: '2024-01-30',
        status: 'completed',
        responsiblePerson: 'Lisa Brown',
        daysUntilDue: -1,
      },
    ]);
  }, []);

  const getResultBadge = (result: string) => {
    const resultColors = {
      pass: 'bg-green-100 text-green-800',
      fail: 'bg-red-100 text-red-800',
      conditional: 'bg-yellow-100 text-yellow-800',
    };
    return <Badge className={resultColors[result as keyof typeof resultColors]}>{result}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      pending: 'bg-yellow-100 text-yellow-800',
      in_progress: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      overdue: 'bg-red-100 text-red-800',
    };
    return <Badge className={statusColors[status as keyof typeof statusColors]}>{status}</Badge>;
  };

  const getDueDateStatus = (daysUntilDue: number) => {
    if (daysUntilDue < 0) {
      return <Badge className="bg-red-100 text-red-800">Overdue</Badge>;
    } else if (daysUntilDue <= 30) {
      return <Badge className="bg-yellow-100 text-yellow-800">Due Soon</Badge>;
    } else {
      return <Badge className="bg-green-100 text-green-800">On Track</Badge>;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Calibration & Compliance</h1>
          <p className="text-muted-foreground">Manage equipment calibration and regulatory compliance</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <FileText className="w-4 h-4 mr-2" />
            Generate Reports
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Calibrations</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{calibrations.length}</div>
            <p className="text-xs text-muted-foreground">This year</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Due Soon</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {calibrations.filter(c => c.daysUntilDue <= 30 && c.daysUntilDue > 0).length}
            </div>
            <p className="text-xs text-muted-foreground">Next 30 days</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {calibrations.filter(c => c.daysUntilDue < 0).length}
            </div>
            <p className="text-xs text-muted-foreground">Requires attention</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94%</div>
            <p className="text-xs text-muted-foreground">+2% from last month</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="calibration">Calibration Records</TabsTrigger>
          <TabsTrigger value="compliance">Compliance Management</TabsTrigger>
        </TabsList>

        <TabsContent value="calibration" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Calibration Records</CardTitle>
                  <CardDescription>Track equipment calibration schedules and results</CardDescription>
                </div>
                <Dialog open={isCalibrationDialogOpen} onOpenChange={setIsCalibrationDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Calibration
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Add Calibration Record</DialogTitle>
                      <DialogDescription>Record equipment calibration</DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="asset">Equipment</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select equipment" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pressure-gauge">Pressure Gauge - Main Line</SelectItem>
                            <SelectItem value="temp-sensor">Temperature Sensor - Reactor 1</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="calibrationType">Calibration Type</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="internal">Internal</SelectItem>
                            <SelectItem value="external">External</SelectItem>
                            <SelectItem value="verification">Verification</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="calibrationDate">Calibration Date</Label>
                        <Input id="calibrationDate" type="date" />
                      </div>
                      <div>
                        <Label htmlFor="nextCalibrationDate">Next Calibration Date</Label>
                        <Input id="nextCalibrationDate" type="date" />
                      </div>
                      <div>
                        <Label htmlFor="calibratedBy">Calibrated By</Label>
                        <Input id="calibratedBy" placeholder="Technician name" />
                      </div>
                      <div>
                        <Label htmlFor="result">Result</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select result" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pass">Pass</SelectItem>
                            <SelectItem value="fail">Fail</SelectItem>
                            <SelectItem value="conditional">Conditional</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="certificateNumber">Certificate Number</Label>
                        <Input id="certificateNumber" placeholder="CAL-2024-XXX" />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsCalibrationDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button>Add Calibration</Button>
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
                    placeholder="Search calibrations..."
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
                    <TableHead>Equipment</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Calibration Date</TableHead>
                    <TableHead>Next Due</TableHead>
                    <TableHead>Result</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {calibrations.map((calibration) => (
                    <TableRow key={calibration.id}>
                      <TableCell>{calibration.assetId}</TableCell>
                      <TableCell>{calibration.assetName}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{calibration.calibrationType}</Badge>
                      </TableCell>
                      <TableCell>{calibration.calibrationDate}</TableCell>
                      <TableCell>
                        <div>
                          <div>{calibration.nextCalibrationDate}</div>
                          <div className="text-sm text-muted-foreground">
                            {calibration.daysUntilDue > 0 ? `${calibration.daysUntilDue} days` : `${Math.abs(calibration.daysUntilDue)} days overdue`}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getResultBadge(calibration.result)}</TableCell>
                      <TableCell>{getDueDateStatus(calibration.daysUntilDue)}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm">
                            <FileText className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Calendar className="w-4 h-4" />
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

        <TabsContent value="compliance" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Compliance Management</CardTitle>
                  <CardDescription>Track regulatory compliance requirements</CardDescription>
                </div>
                <Dialog open={isComplianceDialogOpen} onOpenChange={setIsComplianceDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Compliance Record
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Add Compliance Record</DialogTitle>
                      <DialogDescription>Add regulatory compliance requirement</DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="asset">Equipment</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select equipment" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="safety-valve">Safety Valve - Tank A</SelectItem>
                            <SelectItem value="fire-system">Fire Suppression System</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="complianceType">Compliance Type</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="OSHA">OSHA</SelectItem>
                            <SelectItem value="NFPA">NFPA</SelectItem>
                            <SelectItem value="ISO">ISO</SelectItem>
                            <SelectItem value="FDA">FDA</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-2">
                        <Label htmlFor="requirement">Requirement</Label>
                        <Textarea id="requirement" placeholder="Describe the compliance requirement" />
                      </div>
                      <div>
                        <Label htmlFor="dueDate">Due Date</Label>
                        <Input id="dueDate" type="date" />
                      </div>
                      <div>
                        <Label htmlFor="responsiblePerson">Responsible Person</Label>
                        <Input id="responsiblePerson" placeholder="Person name" />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsComplianceDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button>Add Compliance Record</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Asset ID</TableHead>
                    <TableHead>Equipment</TableHead>
                    <TableHead>Compliance Type</TableHead>
                    <TableHead>Requirement</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Responsible</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {compliance.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>{record.assetId}</TableCell>
                      <TableCell>{record.assetName}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{record.complianceType}</Badge>
                      </TableCell>
                      <TableCell>{record.requirement}</TableCell>
                      <TableCell>
                        <div>
                          <div>{record.dueDate}</div>
                          <div className="text-sm text-muted-foreground">
                            {record.daysUntilDue > 0 ? `${record.daysUntilDue} days` : `${Math.abs(record.daysUntilDue)} days overdue`}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{record.responsiblePerson}</TableCell>
                      <TableCell>{getStatusBadge(record.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm">
                            <FileText className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <CheckCircle className="w-4 h-4" />
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
      </Tabs>
    </div>
  );
} 