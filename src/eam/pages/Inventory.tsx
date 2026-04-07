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
import { Progress } from "@eam/components/ui/progress";
import { 
  Plus, 
  Search, 
  Filter, 
  Package, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Download,
  Edit,
  Eye,
  Trash2,
  TrendingUp,
  TrendingDown,
  Minus,
  Plus as PlusIcon,
  ShoppingCart,
  Truck,
  Warehouse,
  BarChart3,
  FileText,
  Calendar,
  DollarSign,
  Hash,
  MapPin,
  Building,
  Activity,
  Zap,
  Shield
} from "lucide-react";

interface InventoryItem {
  id: string;
  name: string;
  description: string;
  category: string;
  subcategory: string;
  sku: string;
  barcode: string;
  unit: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  reorderPoint: number;
  unitCost: number;
  totalValue: number;
  location: string;
  shelf: string;
  bin: string;
  supplier: string;
  supplierContact: string;
  leadTime: number;
  lastOrderDate: Date | null;
  lastReceivedDate: Date | null;
  expiryDate: Date | null;
  status: 'in-stock' | 'low-stock' | 'out-of-stock' | 'discontinued';
  condition: 'new' | 'refurbished' | 'used' | 'damaged';
  notes: string;
  createdBy: string;
  createdAt: Date;
  lastUpdated: Date;
}

const mockInventory: InventoryItem[] = [
  {
    id: "INV-001",
    name: "Oil Filter - Premium Grade",
    description: "High-quality oil filter for industrial pump systems, compatible with multiple pump models.",
    category: "Filters",
    subcategory: "Oil Filters",
    sku: "OF-PREM-001",
    barcode: "1234567890123",
    unit: "pcs",
    currentStock: 45,
    minStock: 20,
    maxStock: 100,
    reorderPoint: 25,
    unitCost: 15.50,
    totalValue: 697.50,
    location: "Warehouse A",
    shelf: "A-01",
    bin: "B-05",
    supplier: "Industrial Supply Co.",
    supplierContact: "John Smith - john@industrialsupply.com",
    leadTime: 7,
    lastOrderDate: new Date("2024-01-10"),
    lastReceivedDate: new Date("2024-01-15"),
    expiryDate: new Date("2026-12-31"),
    status: "in-stock",
    condition: "new",
    notes: "Critical component for pump maintenance",
    createdBy: "admin",
    createdAt: new Date("2024-01-01"),
    lastUpdated: new Date("2024-01-15")
  },
  {
    id: "INV-002",
    name: "Synthetic Oil - 5W-30",
    description: "Premium synthetic oil for compressor systems, 5W-30 grade, 5L containers.",
    category: "Lubricants",
    subcategory: "Synthetic Oils",
    sku: "SO-5W30-5L",
    barcode: "1234567890124",
    unit: "L",
    currentStock: 8,
    minStock: 10,
    maxStock: 50,
    reorderPoint: 12,
    unitCost: 25.00,
    totalValue: 200.00,
    location: "Warehouse A",
    shelf: "A-02",
    bin: "B-03",
    supplier: "Lubricant Solutions Ltd.",
    supplierContact: "Sarah Johnson - sarah@lubricantsolutions.com",
    leadTime: 5,
    lastOrderDate: new Date("2024-01-12"),
    lastReceivedDate: new Date("2024-01-18"),
    expiryDate: new Date("2027-06-30"),
    status: "low-stock",
    condition: "new",
    notes: "Reorder needed soon",
    createdBy: "admin",
    createdAt: new Date("2024-01-01"),
    lastUpdated: new Date("2024-01-18")
  },
  {
    id: "INV-003",
    name: "Bearing Set - SKF 6205",
    description: "Deep groove ball bearing, SKF 6205, for pump and motor applications.",
    category: "Bearings",
    subcategory: "Ball Bearings",
    sku: "BS-SKF-6205",
    barcode: "1234567890125",
    unit: "pcs",
    currentStock: 0,
    minStock: 5,
    maxStock: 20,
    reorderPoint: 8,
    unitCost: 45.00,
    totalValue: 0.00,
    location: "Warehouse A",
    shelf: "A-03",
    bin: "B-01",
    supplier: "Bearing World Inc.",
    supplierContact: "Mike Davis - mike@bearingworld.com",
    leadTime: 10,
    lastOrderDate: new Date("2024-01-20"),
    lastReceivedDate: null,
    expiryDate: null,
    status: "out-of-stock",
    condition: "new",
    notes: "Emergency order placed",
    createdBy: "admin",
    createdAt: new Date("2024-01-01"),
    lastUpdated: new Date("2024-01-20")
  },
  {
    id: "INV-004",
    name: "Gasket Set - Pump Assembly",
    description: "Complete gasket set for pump assembly, includes all necessary seals and gaskets.",
    category: "Seals & Gaskets",
    subcategory: "Gasket Sets",
    sku: "GS-PUMP-001",
    barcode: "1234567890126",
    unit: "set",
    currentStock: 12,
    minStock: 8,
    maxStock: 30,
    reorderPoint: 10,
    unitCost: 35.00,
    totalValue: 420.00,
    location: "Warehouse A",
    shelf: "A-04",
    bin: "B-02",
    supplier: "Seal Solutions",
    supplierContact: "Lisa Wilson - lisa@sealsolutions.com",
    leadTime: 7,
    lastOrderDate: new Date("2024-01-15"),
    lastReceivedDate: new Date("2024-01-22"),
    expiryDate: new Date("2028-12-31"),
    status: "in-stock",
    condition: "new",
    notes: "Standard maintenance item",
    createdBy: "admin",
    createdAt: new Date("2024-01-01"),
    lastUpdated: new Date("2024-01-22")
  },
  {
    id: "INV-005",
    name: "Vibration Sensor - Industrial Grade",
    description: "High-precision vibration sensor for monitoring pump and compressor vibration levels.",
    category: "Sensors",
    subcategory: "Vibration Sensors",
    sku: "VS-IND-001",
    barcode: "1234567890127",
    unit: "pcs",
    currentStock: 3,
    minStock: 5,
    maxStock: 15,
    reorderPoint: 6,
    unitCost: 120.00,
    totalValue: 360.00,
    location: "Warehouse A",
    shelf: "A-05",
    bin: "B-04",
    supplier: "Sensor Technologies",
    supplierContact: "David Brown - david@sensortech.com",
    leadTime: 14,
    lastOrderDate: new Date("2024-01-18"),
    lastReceivedDate: new Date("2024-01-25"),
    expiryDate: new Date("2029-12-31"),
    status: "low-stock",
    condition: "new",
    notes: "Critical for predictive maintenance",
    createdBy: "admin",
    createdAt: new Date("2024-01-01"),
    lastUpdated: new Date("2024-01-25")
  }
];

export default function Inventory() {
  const [inventory, setInventory] = useState<InventoryItem[]>(mockInventory);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showStockAdjustment, setShowStockAdjustment] = useState(false);
  const [adjustmentQuantity, setAdjustmentQuantity] = useState(0);
  const [adjustmentType, setAdjustmentType] = useState<'add' | 'remove'>('add');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in-stock': return 'bg-green-100 text-green-800';
      case 'low-stock': return 'bg-yellow-100 text-yellow-800';
      case 'out-of-stock': return 'bg-red-100 text-red-800';
      case 'discontinued': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'new': return 'bg-green-100 text-green-800';
      case 'refurbished': return 'bg-blue-100 text-blue-800';
      case 'used': return 'bg-orange-100 text-orange-800';
      case 'damaged': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStockLevel = (item: InventoryItem) => {
    const percentage = (item.currentStock / item.maxStock) * 100;
    if (item.currentStock <= item.minStock) return 'critical';
    if (item.currentStock <= item.reorderPoint) return 'low';
    if (percentage >= 80) return 'high';
    return 'normal';
  };

  const getStockLevelColor = (level: string) => {
    switch (level) {
      case 'critical': return 'text-red-600';
      case 'low': return 'text-yellow-600';
      case 'high': return 'text-blue-600';
      default: return 'text-green-600';
    }
  };

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.barcode.includes(searchTerm);
    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getLowStockItems = () => {
    return inventory.filter(item => item.status === 'low-stock' || item.status === 'out-of-stock');
  };

  const getTotalInventoryValue = () => {
    return inventory.reduce((total, item) => total + item.totalValue, 0);
  };

  const getCategories = () => {
    return [...new Set(inventory.map(item => item.category))];
  };

  const adjustStock = (itemId: string, quantity: number, type: 'add' | 'remove') => {
    setInventory(prev => prev.map(item => {
      if (item.id === itemId) {
        const newStock = type === 'add' ? item.currentStock + quantity : item.currentStock - quantity;
        const newTotalValue = newStock * item.unitCost;
        let newStatus = item.status;
        
        if (newStock <= 0) newStatus = 'out-of-stock';
        else if (newStock <= item.minStock) newStatus = 'low-stock';
        else if (newStock > item.reorderPoint) newStatus = 'in-stock';
        
        return {
          ...item,
          currentStock: Math.max(0, newStock),
          totalValue: newTotalValue,
          status: newStatus,
          lastUpdated: new Date()
        };
      }
      return item;
    }));
    
    setShowStockAdjustment(false);
    setAdjustmentQuantity(0);
  };

  const createReorderOrder = (item: InventoryItem) => {
    const orderQuantity = item.maxStock - item.currentStock;
    // This would typically create a purchase order
    console.log(`Creating reorder for ${item.name}: ${orderQuantity} ${item.unit}`);
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <div className="flex items-center justify-between">
        <div>
            <h1 className="text-3xl font-bold mb-2">Inventory Management</h1>
            <p className="text-muted-foreground">
              Manage spare parts, materials, and inventory tracking.
            </p>
        </div>
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inventory.length}</div>
            <p className="text-xs text-muted-foreground">
              {getCategories().length} categories
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${getTotalInventoryValue().toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Current inventory value
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {getLowStockItems().length}
            </div>
            <p className="text-xs text-muted-foreground">
              Needs reordering
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {inventory.filter(item => item.status === 'out-of-stock').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Critical items
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Items</TabsTrigger>
          <TabsTrigger value="low-stock">Low Stock</TabsTrigger>
          <TabsTrigger value="out-of-stock">Out of Stock</TabsTrigger>
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
                  <Label htmlFor="search">Search</Label>
                <Input
                    id="search"
                    placeholder="Search by name, SKU, or barcode..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
                <div>
                  <Label htmlFor="category-filter">Category</Label>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {getCategories().map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
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
                      <SelectItem value="in-stock">In Stock</SelectItem>
                      <SelectItem value="low-stock">Low Stock</SelectItem>
                      <SelectItem value="out-of-stock">Out of Stock</SelectItem>
                      <SelectItem value="discontinued">Discontinued</SelectItem>
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

          {/* Inventory List */}
          <div className="space-y-4">
            {filteredInventory.map((item) => (
              <Card key={item.id} className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setSelectedItem(item)}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold">{item.name}</h3>
                        <Badge variant="outline">{item.sku}</Badge>
                        <Badge className={getStatusColor(item.status)}>
                          {item.status.replace('-', ' ')}
                        </Badge>
                        <Badge className={getConditionColor(item.condition)}>
                          {item.condition}
                        </Badge>
                      </div>
                      
                      <p className="text-muted-foreground mb-3">{item.description}</p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <Hash className="h-4 w-4 text-muted-foreground" />
                          <span>Stock: {item.currentStock} {item.unit}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <span>Value: ${item.totalValue.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>{item.location} - {item.shelf}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Building className="h-4 w-4 text-muted-foreground" />
                          <span>{item.supplier}</span>
                        </div>
                      </div>

                      <div className="mt-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Stock Level</span>
                          <span className={`text-sm font-medium ${getStockLevelColor(getStockLevel(item))}`}>
                            {item.currentStock}/{item.maxStock} {item.unit}
                          </span>
                        </div>
                        <Progress 
                          value={(item.currentStock / item.maxStock) * 100} 
                          className="h-2"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col space-y-2 ml-4">
                      <Button variant="outline" size="sm" onClick={(e) => {
                        e.stopPropagation();
                        setSelectedItem(item);
                        setShowStockAdjustment(true);
                      }}>
                        <PlusIcon className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={(e) => {
                        e.stopPropagation();
                        setSelectedItem(item);
                        setShowStockAdjustment(true);
                      }}>
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="low-stock" className="space-y-4">
          {getLowStockItems().map((item) => (
            <Card key={item.id} className="cursor-pointer hover:shadow-md transition-shadow border-yellow-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-yellow-600">{item.name}</h3>
                    <p className="text-muted-foreground">{item.sku}</p>
                    <p className="text-sm text-yellow-600">
                      Current: {item.currentStock} {item.unit} | Min: {item.minStock} {item.unit} | Reorder: {item.reorderPoint} {item.unit}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" onClick={() => createReorderOrder(item)}>
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Reorder
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

        <TabsContent value="out-of-stock" className="space-y-4">
          {inventory.filter(item => item.status === 'out-of-stock').map((item) => (
            <Card key={item.id} className="cursor-pointer hover:shadow-md transition-shadow border-red-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                    <div>
                    <h3 className="text-lg font-semibold text-red-600">{item.name}</h3>
                    <p className="text-muted-foreground">{item.sku}</p>
                    <p className="text-sm text-red-600">
                      Out of stock | Last order: {item.lastOrderDate?.toLocaleDateString() || 'Never'}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="destructive" onClick={() => createReorderOrder(item)}>
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Emergency Order
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

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Inventory Value by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {getCategories().map(category => {
                    const categoryItems = inventory.filter(item => item.category === category);
                    const categoryValue = categoryItems.reduce((total, item) => total + item.totalValue, 0);
                    const percentage = (categoryValue / getTotalInventoryValue()) * 100;
                    
                    return (
                      <div key={category} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{category}</span>
                        <div className="flex items-center space-x-2">
                          <Progress value={percentage} className="w-20 h-2" />
                          <span className="text-sm text-muted-foreground">${categoryValue.toFixed(2)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Stock Level Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">In Stock</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 h-2 bg-green-200 rounded-full">
                        <div className="w-16 h-2 bg-green-500 rounded-full"></div>
                  </div>
                      <span className="text-sm text-muted-foreground">
                        {inventory.filter(item => item.status === 'in-stock').length}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Low Stock</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 h-2 bg-yellow-200 rounded-full">
                        <div className="w-8 h-2 bg-yellow-500 rounded-full"></div>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {inventory.filter(item => item.status === 'low-stock').length}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Out of Stock</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 h-2 bg-red-200 rounded-full">
                        <div className="w-4 h-2 bg-red-500 rounded-full"></div>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {inventory.filter(item => item.status === 'out-of-stock').length}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Stock Adjustment Modal */}
      {showStockAdjustment && selectedItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Adjust Stock Level</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Item</Label>
                <p className="text-sm text-muted-foreground">{selectedItem.name}</p>
              </div>
              <div>
                <Label>Current Stock</Label>
                <p className="text-sm text-muted-foreground">{selectedItem.currentStock} {selectedItem.unit}</p>
              </div>
              <div>
                <Label>Adjustment Type</Label>
                <Select value={adjustmentType} onValueChange={(value: 'add' | 'remove') => setAdjustmentType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="add">Add Stock</SelectItem>
                    <SelectItem value="remove">Remove Stock</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Quantity</Label>
                <Input
                  type="number"
                  value={adjustmentQuantity}
                  onChange={(e) => setAdjustmentQuantity(parseInt(e.target.value) || 0)}
                  min="0"
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  className="flex-1" 
                  onClick={() => adjustStock(selectedItem.id, adjustmentQuantity, adjustmentType)}
                >
                  Confirm
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setShowStockAdjustment(false)}
                >
                  Cancel
                </Button>
                      </div>
            </CardContent>
          </Card>
                    </div>
                  )}

      {/* Item Details Modal */}
      {selectedItem && !showStockAdjustment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  {selectedItem.name}
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setSelectedItem(null)}>
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label>Status</Label>
                  <Badge className={`mt-1 ${getStatusColor(selectedItem.status)}`}>
                    {selectedItem.status.replace('-', ' ')}
                  </Badge>
                </div>
                <div>
                  <Label>Condition</Label>
                  <Badge className={`mt-1 ${getConditionColor(selectedItem.condition)}`}>
                    {selectedItem.condition}
                  </Badge>
                </div>
                <div>
                  <Label>Category</Label>
                  <p className="mt-1">{selectedItem.category} - {selectedItem.subcategory}</p>
                </div>
                <div>
                  <Label>SKU</Label>
                  <p className="mt-1">{selectedItem.sku}</p>
                      </div>
                    </div>

              <Separator />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <Label>Description</Label>
                  <p className="mt-1 text-muted-foreground">{selectedItem.description}</p>
                </div>
                <div>
                  <Label>Location</Label>
                  <div className="mt-1 space-y-1">
                    <p><strong>Warehouse:</strong> {selectedItem.location}</p>
                    <p><strong>Shelf:</strong> {selectedItem.shelf}</p>
                    <p><strong>Bin:</strong> {selectedItem.bin}</p>
                  </div>
                      </div>
                    </div>

              <Separator />

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label>Current Stock</Label>
                  <p className="mt-1 text-lg font-semibold">{selectedItem.currentStock} {selectedItem.unit}</p>
                </div>
                <div>
                  <Label>Min Stock</Label>
                  <p className="mt-1">{selectedItem.minStock} {selectedItem.unit}</p>
                      </div>
                <div>
                  <Label>Max Stock</Label>
                  <p className="mt-1">{selectedItem.maxStock} {selectedItem.unit}</p>
                    </div>
                <div>
                  <Label>Reorder Point</Label>
                  <p className="mt-1">{selectedItem.reorderPoint} {selectedItem.unit}</p>
                      </div>
                    </div>

              <Separator />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <Label>Supplier Information</Label>
                  <div className="mt-1 space-y-1">
                    <p><strong>Supplier:</strong> {selectedItem.supplier}</p>
                    <p><strong>Contact:</strong> {selectedItem.supplierContact}</p>
                    <p><strong>Lead Time:</strong> {selectedItem.leadTime} days</p>
                      </div>
                    </div>
                <div>
                  <Label>Financial Information</Label>
                  <div className="mt-1 space-y-1">
                    <p><strong>Unit Cost:</strong> ${selectedItem.unitCost}</p>
                    <p><strong>Total Value:</strong> ${selectedItem.totalValue.toFixed(2)}</p>
                    <p><strong>Last Updated:</strong> {selectedItem.lastUpdated.toLocaleDateString()}</p>
                    </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button className="flex-1" onClick={() => setShowStockAdjustment(true)}>
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Adjust Stock
                </Button>
                <Button variant="outline" className="flex-1" onClick={() => createReorderOrder(selectedItem)}>
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Create Order
                </Button>
                <Button variant="outline" className="flex-1">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Item
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
