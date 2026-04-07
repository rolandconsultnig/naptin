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
import { Calendar, Calculator, TrendingDown, DollarSign, BarChart3, FileText, Settings, RefreshCw } from 'lucide-react';

interface DepreciationAsset {
  id: string;
  assetId: string;
  name: string;
  category: string;
  purchaseDate: string;
  purchaseCost: number;
  salvageValue: number;
  usefulLife: number;
  depreciationMethod: string;
  currentValue: number;
  accumulatedDepreciation: number;
  depreciationRate: number;
  nextDepreciationDate: string;
  status: 'active' | 'depreciated' | 'disposed';
}

interface DepreciationSchedule {
  id: string;
  assetId: string;
  period: string;
  beginningValue: number;
  depreciationExpense: number;
  accumulatedDepreciation: number;
  endingValue: number;
  date: string;
}

const mockAssets: DepreciationAsset[] = [
  {
    id: '1',
    assetId: 'AST-0001',
    name: 'Port Harcourt Refinery Unit 1',
    category: 'Refinery Equipment',
    purchaseDate: '2020-01-15',
    purchaseCost: 50000000,
    salvageValue: 5000000,
    usefulLife: 20,
    depreciationMethod: 'Straight Line',
    currentValue: 42500000,
    accumulatedDepreciation: 7500000,
    depreciationRate: 5,
    nextDepreciationDate: '2024-12-31',
    status: 'active'
  },
  {
    id: '2',
    assetId: 'AST-0002',
    name: 'Pipeline Network System',
    category: 'Infrastructure',
    purchaseDate: '2019-06-20',
    purchaseCost: 75000000,
    salvageValue: 7500000,
    usefulLife: 25,
    depreciationMethod: 'Straight Line',
    currentValue: 63000000,
    accumulatedDepreciation: 12000000,
    depreciationRate: 4,
    nextDepreciationDate: '2024-12-31',
    status: 'active'
  },
  {
    id: '3',
    assetId: 'AST-0003',
    name: 'Control Room Equipment',
    category: 'Electronics',
    purchaseDate: '2021-03-10',
    purchaseCost: 15000000,
    salvageValue: 1500000,
    usefulLife: 8,
    depreciationMethod: 'Double Declining Balance',
    currentValue: 9375000,
    accumulatedDepreciation: 5625000,
    depreciationRate: 25,
    nextDepreciationDate: '2024-12-31',
    status: 'active'
  }
];

const mockSchedules: DepreciationSchedule[] = [
  {
    id: '1',
    assetId: 'AST-0001',
    period: '2024',
    beginningValue: 45000000,
    depreciationExpense: 2250000,
    accumulatedDepreciation: 7500000,
    endingValue: 42750000,
    date: '2024-12-31'
  },
  {
    id: '2',
    assetId: 'AST-0002',
    period: '2024',
    beginningValue: 66000000,
    depreciationExpense: 3000000,
    accumulatedDepreciation: 12000000,
    endingValue: 63000000,
    date: '2024-12-31'
  }
];

const Depreciation: React.FC = () => {
  const [assets, setAssets] = useState<DepreciationAsset[]>(mockAssets);
  const [schedules, setSchedules] = useState<DepreciationSchedule[]>(mockSchedules);
  const [selectedAsset, setSelectedAsset] = useState<DepreciationAsset | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const calculateDepreciation = (asset: DepreciationAsset) => {
    const { purchaseCost, salvageValue, usefulLife, depreciationMethod } = asset;
    
    if (depreciationMethod === 'Straight Line') {
      return (purchaseCost - salvageValue) / usefulLife;
    } else if (depreciationMethod === 'Double Declining Balance') {
      const rate = (2 / usefulLife) * 100;
      return (purchaseCost * rate) / 100;
    }
    return 0;
  };

  const getDepreciationStatus = (asset: DepreciationAsset) => {
    const depreciationPercentage = (asset.accumulatedDepreciation / (asset.purchaseCost - asset.salvageValue)) * 100;
    
    if (depreciationPercentage >= 100) return 'Fully Depreciated';
    if (depreciationPercentage >= 75) return 'Near End of Life';
    if (depreciationPercentage >= 50) return 'Mid Life';
    return 'Early Life';
  };

  const totalAssetValue = assets.reduce((sum, asset) => sum + asset.currentValue, 0);
  const totalDepreciation = assets.reduce((sum, asset) => sum + asset.accumulatedDepreciation, 0);
  const averageDepreciationRate = assets.reduce((sum, asset) => sum + asset.depreciationRate, 0) / assets.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Depreciation Management</h1>
          <p className="text-muted-foreground">
            Track asset depreciation, calculate values, and manage asset lifecycle
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Recalculate
          </Button>
          <Button size="sm">
            <Calculator className="h-4 w-4 mr-2" />
            Calculate Depreciation
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Asset Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalAssetValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Current market value
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accumulated Depreciation</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalDepreciation.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Total depreciation to date
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Depreciation Rate</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageDepreciationRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Annual depreciation rate
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Assets</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assets.filter(a => a.status === 'active').length}</div>
            <p className="text-xs text-muted-foreground">
              Currently depreciating
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="assets" className="space-y-4">
        <TabsList>
          <TabsTrigger value="assets">Asset Depreciation</TabsTrigger>
          <TabsTrigger value="schedules">Depreciation Schedules</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="assets" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Asset Depreciation Overview</CardTitle>
              <CardDescription>
                View and manage depreciation for all assets
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Asset ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Purchase Cost</TableHead>
                    <TableHead>Current Value</TableHead>
                    <TableHead>Accumulated Depreciation</TableHead>
                    <TableHead>Depreciation Rate</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assets.map((asset) => (
                    <TableRow key={asset.id}>
                      <TableCell className="font-medium">{asset.assetId}</TableCell>
                      <TableCell>{asset.name}</TableCell>
                      <TableCell>${asset.purchaseCost.toLocaleString()}</TableCell>
                      <TableCell>${asset.currentValue.toLocaleString()}</TableCell>
                      <TableCell>${asset.accumulatedDepreciation.toLocaleString()}</TableCell>
                      <TableCell>{asset.depreciationRate}%</TableCell>
                      <TableCell>
                        <Badge variant={
                          getDepreciationStatus(asset) === 'Fully Depreciated' ? 'destructive' :
                          getDepreciationStatus(asset) === 'Near End of Life' ? 'secondary' :
                          'default'
                        }>
                          {getDepreciationStatus(asset)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedAsset(asset)}
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedules" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Depreciation Schedules</CardTitle>
              <CardDescription>
                Detailed depreciation schedules for each asset
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Asset ID</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Beginning Value</TableHead>
                    <TableHead>Depreciation Expense</TableHead>
                    <TableHead>Accumulated Depreciation</TableHead>
                    <TableHead>Ending Value</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {schedules.map((schedule) => (
                    <TableRow key={schedule.id}>
                      <TableCell className="font-medium">{schedule.assetId}</TableCell>
                      <TableCell>{schedule.period}</TableCell>
                      <TableCell>${schedule.beginningValue.toLocaleString()}</TableCell>
                      <TableCell>${schedule.depreciationExpense.toLocaleString()}</TableCell>
                      <TableCell>${schedule.accumulatedDepreciation.toLocaleString()}</TableCell>
                      <TableCell>${schedule.endingValue.toLocaleString()}</TableCell>
                      <TableCell>{schedule.date}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Depreciation by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['Refinery Equipment', 'Infrastructure', 'Electronics'].map((category) => {
                    const categoryAssets = assets.filter(a => a.category === category);
                    const totalValue = categoryAssets.reduce((sum, asset) => sum + asset.currentValue, 0);
                    const totalDep = categoryAssets.reduce((sum, asset) => sum + asset.accumulatedDepreciation, 0);
                    
                    return (
                      <div key={category} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{category}</span>
                          <span>${totalValue.toLocaleString()}</span>
                        </div>
                        <Progress value={(totalDep / (totalValue + totalDep)) * 100} className="h-2" />
                        <div className="text-xs text-muted-foreground">
                          Depreciation: ${totalDep.toLocaleString()}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Depreciation Methods</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['Straight Line', 'Double Declining Balance'].map((method) => {
                    const methodAssets = assets.filter(a => a.depreciationMethod === method);
                    const count = methodAssets.length;
                    
                    return (
                      <div key={method} className="flex justify-between items-center">
                        <span className="text-sm">{method}</span>
                        <Badge variant="outline">{count} assets</Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Depreciation Settings</CardTitle>
              <CardDescription>
                Configure depreciation calculation parameters
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="defaultMethod">Default Depreciation Method</Label>
                  <Select defaultValue="straight-line">
                    <SelectTrigger>
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="straight-line">Straight Line</SelectItem>
                      <SelectItem value="double-declining">Double Declining Balance</SelectItem>
                      <SelectItem value="sum-of-years">Sum of Years Digits</SelectItem>
                      <SelectItem value="units-of-production">Units of Production</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fiscalYear">Fiscal Year End</Label>
                  <Input type="date" id="fiscalYear" defaultValue="2024-12-31" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salvagePercentage">Default Salvage Value (%)</Label>
                  <Input type="number" id="salvagePercentage" defaultValue="10" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="calculationFrequency">Calculation Frequency</Label>
                  <Select defaultValue="monthly">
                    <SelectTrigger>
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="annually">Annually</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button className="w-full">
                <Settings className="h-4 w-4 mr-2" />
                Save Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Asset Detail Modal */}
      {selectedAsset && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Asset Depreciation Details</CardTitle>
            <CardDescription>{selectedAsset.name}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
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
                      <span>Purchase Date:</span>
                      <span>{selectedAsset.purchaseDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Useful Life:</span>
                      <span>{selectedAsset.usefulLife} years</span>
                    </div>
                  </div>
                </div>
                <div>
                  <Label>Financial Information</Label>
                  <div className="mt-2 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Purchase Cost:</span>
                      <span className="font-medium">${selectedAsset.purchaseCost.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Salvage Value:</span>
                      <span>${selectedAsset.salvageValue.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Current Value:</span>
                      <span className="font-medium">${selectedAsset.currentValue.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Accumulated Depreciation:</span>
                      <span>${selectedAsset.accumulatedDepreciation.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <Label>Depreciation Progress</Label>
                  <div className="mt-4 space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Depreciation Progress</span>
                        <span>{((selectedAsset.accumulatedDepreciation / (selectedAsset.purchaseCost - selectedAsset.salvageValue)) * 100).toFixed(1)}%</span>
                      </div>
                      <Progress 
                        value={(selectedAsset.accumulatedDepreciation / (selectedAsset.purchaseCost - selectedAsset.salvageValue)) * 100} 
                        className="h-2" 
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Remaining Value</span>
                        <span>{((selectedAsset.currentValue / selectedAsset.purchaseCost) * 100).toFixed(1)}%</span>
                      </div>
                      <Progress 
                        value={(selectedAsset.currentValue / selectedAsset.purchaseCost) * 100} 
                        className="h-2" 
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <Label>Next Actions</Label>
                  <div className="mt-2 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Next Depreciation Date:</span>
                      <span>{selectedAsset.nextDepreciationDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Annual Depreciation:</span>
                      <span>${calculateDepreciation(selectedAsset).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <Badge variant={
                        getDepreciationStatus(selectedAsset) === 'Fully Depreciated' ? 'destructive' :
                        getDepreciationStatus(selectedAsset) === 'Near End of Life' ? 'secondary' :
                        'default'
                      }>
                        {getDepreciationStatus(selectedAsset)}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <Button variant="outline" onClick={() => setSelectedAsset(null)}>
                Close
              </Button>
              <Button>
                <Calculator className="h-4 w-4 mr-2" />
                Recalculate Depreciation
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Depreciation; 