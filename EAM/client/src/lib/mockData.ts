// Comprehensive Mock Data for EAM System

export interface Asset {
  id: number;
  name: string;
  assetId: string;
  type: string;
  location: string;
  status: string;
  criticality: string;
  latitude?: number;
  longitude?: number;
  manufacturer: string;
  model: string;
  serialNumber: string;
  installationDate: string;
  lastMaintenance: string;
  nextMaintenance: string;
  department: string;
  cost: number;
  condition: string;
  locationDetails: string;
  specifications: Record<string, any>;
  maintenanceHistory: MaintenanceRecord[];
  documents: Document[];
}

export interface WorkOrder {
  id: number;
  workOrderId: string;
  title: string;
  description: string;
  type: 'preventive' | 'corrective' | 'emergency' | 'inspection';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  assignedTo: string;
  assignedBy: string;
  assetId: string;
  assetName: string;
  location: string;
  estimatedHours: number;
  actualHours: number;
  estimatedCost: number;
  actualCost: number;
  scheduledDate: string;
  startDate: string;
  completionDate: string;
  parts: InventoryItem[];
  labor: LaborRecord[];
  notes: string;
  attachments: Document[];
}

export interface InventoryItem {
  id: number;
  itemId: string;
  name: string;
  description: string;
  category: string;
  subcategory: string;
  manufacturer: string;
  partNumber: string;
  unit: string;
  quantity: number;
  minQuantity: number;
  maxQuantity: number;
  unitCost: number;
  totalValue: number;
  location: string;
  shelf: string;
  bin: string;
  supplier: string;
  lastOrderDate: string;
  leadTime: number;
  status: 'in-stock' | 'low-stock' | 'out-of-stock' | 'on-order';
  condition: 'new' | 'refurbished' | 'used';
  expiryDate?: string;
  barcode?: string;
  rfidTag?: string;
}

export interface MaintenanceSchedule {
  id: number;
  scheduleId: string;
  assetId: string;
  assetName: string;
  type: 'preventive' | 'predictive' | 'condition-based';
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  interval: number;
  lastPerformed: string;
  nextDue: string;
  estimatedDuration: number;
  estimatedCost: number;
  assignedTechnician: string;
  status: 'active' | 'paused' | 'completed';
  description: string;
  checklist: string[];
  parts: InventoryItem[];
}

export interface ProcurementItem {
  id: number;
  purchaseOrderId: string;
  itemName: string;
  description: string;
  category: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  supplier: string;
  supplierContact: string;
  orderDate: string;
  expectedDelivery: string;
  actualDelivery?: string;
  status: 'pending' | 'ordered' | 'shipped' | 'delivered' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  requester: string;
  approver: string;
  notes: string;
  attachments: Document[];
}

export interface FleetVehicle {
  id: number;
  vehicleId: string;
  name: string;
  type: 'truck' | 'car' | 'van' | 'equipment' | 'trailer';
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  vin: string;
  status: 'operational' | 'maintenance' | 'out-of-service' | 'retired';
  location: string;
  assignedTo: string;
  department: string;
  fuelType: string;
  fuelCapacity: number;
  currentFuel: number;
  mileage: number;
  lastService: string;
  nextService: string;
  insurance: string;
  registration: string;
  purchaseDate: string;
  purchaseCost: number;
  currentValue: number;
  maintenanceHistory: MaintenanceRecord[];
  fuelLog: FuelRecord[];
  documents: Document[];
}

export interface CalibrationRecord {
  id: number;
  calibrationId: string;
  assetId: string;
  assetName: string;
  instrumentType: string;
  manufacturer: string;
  model: string;
  serialNumber: string;
  calibrationDate: string;
  nextCalibration: string;
  calibratedBy: string;
  calibrationLab: string;
  certificateNumber: string;
  accuracy: string;
  uncertainty: string;
  status: 'calibrated' | 'due' | 'overdue' | 'failed';
  location: string;
  department: string;
  cost: number;
  notes: string;
  attachments: Document[];
}

export interface EnergyRecord {
  id: number;
  recordId: string;
  assetId: string;
  assetName: string;
  energyType: 'electricity' | 'gas' | 'water' | 'steam' | 'compressed-air';
  consumption: number;
  unit: string;
  readingDate: string;
  previousReading: number;
  currentReading: number;
  cost: number;
  efficiency: number;
  location: string;
  meterId: string;
  notes: string;
}

export interface Document {
  id: number;
  documentId: string;
  title: string;
  description: string;
  type: 'manual' | 'procedure' | 'certificate' | 'drawing' | 'report' | 'contract';
  category: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  uploadedBy: string;
  uploadDate: string;
  lastModified: string;
  version: string;
  status: 'active' | 'archived' | 'draft';
  tags: string[];
  relatedAsset?: string;
  relatedWorkOrder?: string;
  accessLevel: 'public' | 'restricted' | 'confidential';
}

export interface MaintenanceRecord {
  id: number;
  recordId: string;
  assetId: string;
  workOrderId: string;
  type: 'preventive' | 'corrective' | 'emergency';
  description: string;
  performedBy: string;
  performedDate: string;
  duration: number;
  cost: number;
  parts: InventoryItem[];
  notes: string;
  attachments: Document[];
}

export interface LaborRecord {
  id: number;
  recordId: string;
  workOrderId: string;
  technician: string;
  hours: number;
  rate: number;
  total: number;
  date: string;
  description: string;
}

export interface FuelRecord {
  id: number;
  recordId: string;
  vehicleId: string;
  fuelType: string;
  quantity: number;
  cost: number;
  date: string;
  location: string;
  odometer: number;
  notes: string;
}

// Mock Data

export const mockAssets: Asset[] = [
  {
    id: 1,
    name: "Port Harcourt Refinery Unit 1",
    assetId: "PH-REF-001",
    type: "Refinery Unit",
    location: "Port Harcourt, Rivers State",
    status: "operational",
    criticality: "critical",
    latitude: 4.8156,
    longitude: 7.0498,
    manufacturer: "Shell Global Solutions",
    model: "CDU-1000",
    serialNumber: "PH-REF-001-2020",
    installationDate: "2020-03-15",
    lastMaintenance: "2024-01-15",
    nextMaintenance: "2024-07-15",
    department: "Refining",
    cost: 150000000,
    condition: "excellent",
    locationDetails: "Port Harcourt Refining Complex, Unit 1",
    specifications: {
      capacity: "210,000 bpd",
      pressure: "1500 psi",
      temperature: "350°C",
      efficiency: "95%"
    },
    maintenanceHistory: [],
    documents: []
  },
  {
    id: 2,
    name: "Kaduna Refinery Pump Station",
    assetId: "KD-REF-002",
    type: "Pump Station",
    location: "Kaduna, Kaduna State",
    status: "operational",
    criticality: "high",
    latitude: 10.5222,
    longitude: 7.4384,
    manufacturer: "Sulzer",
    model: "HPP-500",
    serialNumber: "KD-REF-002-2019",
    installationDate: "2019-08-20",
    lastMaintenance: "2024-02-10",
    nextMaintenance: "2024-08-10",
    department: "Refining",
    cost: 25000000,
    condition: "good",
    locationDetails: "Kaduna Refining Complex, Pump Station A",
    specifications: {
      flowRate: "5000 L/min",
      pressure: "2000 psi",
      power: "500 kW",
      efficiency: "88%"
    },
    maintenanceHistory: [],
    documents: []
  },
  {
    id: 3,
    name: "Warri Pipeline Compressor",
    assetId: "WR-PIPE-003",
    type: "Compressor",
    location: "Warri, Delta State",
    status: "maintenance",
    criticality: "high",
    latitude: 5.5560,
    longitude: 5.7936,
    manufacturer: "Atlas Copco",
    model: "GA-110",
    serialNumber: "WR-PIPE-003-2021",
    installationDate: "2021-11-10",
    lastMaintenance: "2024-03-01",
    nextMaintenance: "2024-09-01",
    department: "Pipeline Operations",
    cost: 35000000,
    condition: "good",
    locationDetails: "Warri Pipeline Station, Compressor House",
    specifications: {
      capacity: "110 m³/min",
      pressure: "8 bar",
      power: "110 kW",
      efficiency: "92%"
    },
    maintenanceHistory: [],
    documents: []
  },
  {
    id: 4,
    name: "Lagos Terminal Storage Tank",
    assetId: "LG-TERM-004",
    type: "Storage Tank",
    location: "Lagos, Lagos State",
    status: "operational",
    criticality: "medium",
    latitude: 6.5244,
    longitude: 3.3792,
    manufacturer: "Tank Engineering Co.",
    model: "ST-50000",
    serialNumber: "LG-TERM-004-2018",
    installationDate: "2018-05-12",
    lastMaintenance: "2024-01-20",
    nextMaintenance: "2024-07-20",
    department: "Terminal Operations",
    cost: 45000000,
    condition: "excellent",
    locationDetails: "Lagos Petroleum Terminal, Tank Farm A",
    specifications: {
      capacity: "50,000 barrels",
      diameter: "30 meters",
      height: "15 meters",
      material: "Carbon Steel"
    },
    maintenanceHistory: [],
    documents: []
  },
  {
    id: 5,
    name: "Calabar Loading Arm",
    assetId: "CB-TERM-005",
    type: "Loading Equipment",
    location: "Calabar, Cross River State",
    status: "operational",
    criticality: "medium",
    latitude: 4.9757,
    longitude: 8.3417,
    manufacturer: "Emco Wheaton",
    model: "LA-2000",
    serialNumber: "CB-TERM-005-2022",
    installationDate: "2022-02-28",
    lastMaintenance: "2024-02-15",
    nextMaintenance: "2024-08-15",
    department: "Terminal Operations",
    cost: 18000000,
    condition: "good",
    locationDetails: "Calabar Petroleum Terminal, Berth 2",
    specifications: {
      flowRate: "2000 L/min",
      pressure: "10 bar",
      reach: "15 meters",
      swivel: "360°"
    },
    maintenanceHistory: [],
    documents: []
  },
  {
    id: 6,
    name: "Dangote Refinery CDU Unit",
    assetId: "DG-REF-006",
    type: "Refinery Unit",
    location: "Lagos, Lagos State",
    status: "operational",
    criticality: "critical",
    latitude: 6.5244,
    longitude: 3.3792,
    manufacturer: "Dangote Industries",
    model: "CDU-650K",
    serialNumber: "DG-REF-006-2023",
    installationDate: "2023-05-22",
    lastMaintenance: "2024-06-01",
    nextMaintenance: "2024-12-01",
    department: "Refining",
    cost: 500000000,
    condition: "excellent",
    locationDetails: "Dangote Petroleum Refinery, CDU Complex",
    specifications: {
      capacity: "650,000 bpd",
      pressure: "1800 psi",
      temperature: "380°C",
      efficiency: "97%"
    },
    maintenanceHistory: [],
    documents: []
  },
  {
    id: 7,
    name: "Kano Depot Pump Station",
    assetId: "KN-DEP-007",
    type: "Pump Station",
    location: "Kano, Kano State",
    status: "operational",
    criticality: "high",
    latitude: 11.9914,
    longitude: 8.5317,
    manufacturer: "Grundfos",
    model: "CR-45",
    serialNumber: "KN-DEP-007-2020",
    installationDate: "2020-09-15",
    lastMaintenance: "2024-03-15",
    nextMaintenance: "2024-09-15",
    department: "Distribution",
    cost: 15000000,
    condition: "good",
    locationDetails: "Kano Petroleum Depot, Pump House",
    specifications: {
      flowRate: "3000 L/min",
      pressure: "1500 psi",
      power: "300 kW",
      efficiency: "90%"
    },
    maintenanceHistory: [],
    documents: []
  },
  {
    id: 8,
    name: "Maiduguri Storage Facility",
    assetId: "MD-DEP-008",
    type: "Storage Facility",
    location: "Maiduguri, Borno State",
    status: "operational",
    criticality: "medium",
    latitude: 11.8333,
    longitude: 13.1500,
    manufacturer: "Storage Solutions Ltd",
    model: "SF-25000",
    serialNumber: "MD-DEP-008-2021",
    installationDate: "2021-04-10",
    lastMaintenance: "2024-02-28",
    nextMaintenance: "2024-08-28",
    department: "Distribution",
    cost: 30000000,
    condition: "good",
    locationDetails: "Maiduguri Petroleum Depot, Storage Complex",
    specifications: {
      capacity: "25,000 barrels",
      tanks: "5 units",
      material: "Stainless Steel",
      security: "24/7 monitoring"
    },
    maintenanceHistory: [],
    documents: []
  },
  {
    id: 9,
    name: "Port Harcourt Terminal Loading Arm",
    assetId: "PH-TERM-009",
    type: "Loading Equipment",
    location: "Port Harcourt, Rivers State",
    status: "operational",
    criticality: "high",
    latitude: 4.8156,
    longitude: 7.0498,
    manufacturer: "Emco Wheaton",
    model: "LA-3000",
    serialNumber: "PH-TERM-009-2021",
    installationDate: "2021-07-08",
    lastMaintenance: "2024-04-10",
    nextMaintenance: "2024-10-10",
    department: "Terminal Operations",
    cost: 22000000,
    condition: "excellent",
    locationDetails: "Port Harcourt Terminal, Berth 1",
    specifications: {
      flowRate: "3000 L/min",
      pressure: "12 bar",
      reach: "18 meters",
      swivel: "360°"
    },
    maintenanceHistory: [],
    documents: []
  },
  {
    id: 10,
    name: "Warri Refinery Heat Exchanger",
    assetId: "WR-REF-010",
    type: "Heat Exchanger",
    location: "Warri, Delta State",
    status: "operational",
    criticality: "high",
    latitude: 5.5560,
    longitude: 5.7936,
    manufacturer: "Alfa Laval",
    model: "HE-5000",
    serialNumber: "WR-REF-010-2022",
    installationDate: "2022-01-20",
    lastMaintenance: "2024-05-15",
    nextMaintenance: "2024-11-15",
    department: "Refining",
    cost: 28000000,
    condition: "good",
    locationDetails: "Warri Refining Complex, Heat Exchange Unit",
    specifications: {
      capacity: "5000 kW",
      temperature: "400°C",
      pressure: "2000 psi",
      efficiency: "94%"
    },
    maintenanceHistory: [],
    documents: []
  },
  {
    id: 11,
    name: "Lagos Pipeline Valve Station",
    assetId: "LG-PIPE-011",
    type: "Valve Station",
    location: "Lagos, Lagos State",
    status: "operational",
    criticality: "medium",
    latitude: 6.5244,
    longitude: 3.3792,
    manufacturer: "Cameron",
    model: "VS-200",
    serialNumber: "LG-PIPE-011-2020",
    installationDate: "2020-11-30",
    lastMaintenance: "2024-01-10",
    nextMaintenance: "2024-07-10",
    department: "Pipeline Operations",
    cost: 12000000,
    condition: "good",
    locationDetails: "Lagos Pipeline Network, Valve Station 3",
    specifications: {
      pressure: "2500 psi",
      diameter: "24 inches",
      type: "Ball Valve",
      automation: "Remote controlled"
    },
    maintenanceHistory: [],
    documents: []
  },
  {
    id: 12,
    name: "Kaduna Refinery Control System",
    assetId: "KD-REF-012",
    type: "Control System",
    location: "Kaduna, Kaduna State",
    status: "operational",
    criticality: "critical",
    latitude: 10.5222,
    longitude: 7.4384,
    manufacturer: "Honeywell",
    model: "Experion PKS",
    serialNumber: "KD-REF-012-2021",
    installationDate: "2021-03-15",
    lastMaintenance: "2024-06-20",
    nextMaintenance: "2024-12-20",
    department: "Automation",
    cost: 45000000,
    condition: "excellent",
    locationDetails: "Kaduna Refining Complex, Control Room",
    specifications: {
      type: "DCS System",
      redundancy: "Triple",
      uptime: "99.9%",
      integration: "Full plant"
    },
    maintenanceHistory: [],
    documents: []
  },
  {
    id: 13,
    name: "Calabar Terminal Security System",
    assetId: "CB-TERM-013",
    type: "Security System",
    location: "Calabar, Cross River State",
    status: "operational",
    criticality: "high",
    latitude: 4.9757,
    longitude: 8.3417,
    manufacturer: "Hikvision",
    model: "SS-1000",
    serialNumber: "CB-TERM-013-2022",
    installationDate: "2022-08-12",
    lastMaintenance: "2024-03-25",
    nextMaintenance: "2024-09-25",
    department: "Security",
    cost: 8000000,
    condition: "excellent",
    locationDetails: "Calabar Terminal, Security Control Center",
    specifications: {
      cameras: "50 units",
      coverage: "100%",
      recording: "24/7",
      analytics: "AI-powered"
    },
    maintenanceHistory: [],
    documents: []
  },
  {
    id: 14,
    name: "Port Harcourt Fire Suppression System",
    assetId: "PH-SAF-014",
    type: "Fire Suppression",
    location: "Port Harcourt, Rivers State",
    status: "operational",
    criticality: "critical",
    latitude: 4.8156,
    longitude: 7.0498,
    manufacturer: "Tyco",
    model: "FSS-5000",
    serialNumber: "PH-SAF-014-2020",
    installationDate: "2020-06-18",
    lastMaintenance: "2024-04-05",
    nextMaintenance: "2024-10-05",
    department: "Safety",
    cost: 35000000,
    condition: "excellent",
    locationDetails: "Port Harcourt Complex, Fire Station",
    specifications: {
      capacity: "5000 gallons",
      coverage: "Complete facility",
      response: "30 seconds",
      type: "Foam system"
    },
    maintenanceHistory: [],
    documents: []
  },
  {
    id: 15,
    name: "Warri Terminal Power Generator",
    assetId: "WR-TERM-015",
    type: "Power Generator",
    location: "Warri, Delta State",
    status: "operational",
    criticality: "high",
    latitude: 5.5560,
    longitude: 5.7936,
    manufacturer: "Caterpillar",
    model: "CAT-3512",
    serialNumber: "WR-TERM-015-2021",
    installationDate: "2021-09-25",
    lastMaintenance: "2024-05-10",
    nextMaintenance: "2024-11-10",
    department: "Utilities",
    cost: 25000000,
    condition: "good",
    locationDetails: "Warri Terminal, Power House",
    specifications: {
      capacity: "2000 kW",
      fuel: "Diesel",
      runtime: "72 hours",
      redundancy: "Dual units"
    },
    maintenanceHistory: [],
    documents: []
  }
];

export const mockWorkOrders: WorkOrder[] = [
  {
    id: 1,
    workOrderId: "WO-2024-001",
    title: "Preventive Maintenance - Port Harcourt Refinery Unit 1",
    description: "Scheduled preventive maintenance for CDU-1000 unit including filter replacement, oil change, and performance testing.",
    type: "preventive",
    priority: "high",
    status: "in-progress",
    assignedTo: "John Smith",
    assignedBy: "Maintenance Manager",
    assetId: "PH-REF-001",
    assetName: "Port Harcourt Refinery Unit 1",
    location: "Port Harcourt, Rivers State",
    estimatedHours: 24,
    actualHours: 18,
    estimatedCost: 50000,
    actualCost: 45000,
    scheduledDate: "2024-07-15",
    startDate: "2024-07-15",
    completionDate: "2024-07-16",
    parts: [],
    labor: [],
    notes: "All filters replaced successfully. Unit performance within specifications.",
    attachments: []
  },
  {
    id: 2,
    workOrderId: "WO-2024-002",
    title: "Emergency Repair - Warri Pipeline Compressor",
    description: "Emergency repair of compressor bearing failure. Immediate attention required to restore pipeline operations.",
    type: "emergency",
    priority: "critical",
    status: "completed",
    assignedTo: "Mike Johnson",
    assignedBy: "Operations Manager",
    assetId: "WR-PIPE-003",
    assetName: "Warri Pipeline Compressor",
    location: "Warri, Delta State",
    estimatedHours: 8,
    actualHours: 12,
    estimatedCost: 15000,
    actualCost: 18000,
    scheduledDate: "2024-07-10",
    startDate: "2024-07-10",
    completionDate: "2024-07-10",
    parts: [],
    labor: [],
    notes: "Bearing replaced successfully. Compressor back online.",
    attachments: []
  },
  {
    id: 3,
    workOrderId: "WO-2024-003",
    title: "Inspection - Lagos Terminal Storage Tank",
    description: "Annual inspection of storage tank including thickness measurement, corrosion assessment, and structural integrity check.",
    type: "inspection",
    priority: "medium",
    status: "pending",
    assignedTo: "Sarah Wilson",
    assignedBy: "Safety Manager",
    assetId: "LG-TERM-004",
    assetName: "Lagos Terminal Storage Tank",
    location: "Lagos, Lagos State",
    estimatedHours: 16,
    actualHours: 0,
    estimatedCost: 8000,
    actualCost: 0,
    scheduledDate: "2024-07-20",
    startDate: "",
    completionDate: "",
    parts: [],
    labor: [],
    notes: "Scheduled for next week. Safety equipment prepared.",
    attachments: []
  }
];

export const mockInventory: InventoryItem[] = [
  {
    id: 1,
    itemId: "INV-001",
    name: "High Pressure Pump Bearing",
    description: "SKF 6318-2RS1 bearing for high pressure pumps",
    category: "Bearings",
    subcategory: "Pump Bearings",
    manufacturer: "SKF",
    partNumber: "6318-2RS1",
    unit: "piece",
    quantity: 15,
    minQuantity: 5,
    maxQuantity: 50,
    unitCost: 250,
    totalValue: 3750,
    location: "Main Warehouse",
    shelf: "A-15",
    bin: "B-03",
    supplier: "SKF Nigeria",
    lastOrderDate: "2024-06-15",
    leadTime: 14,
    status: "in-stock",
    condition: "new"
  },
  {
    id: 2,
    itemId: "INV-002",
    name: "Pipeline Valve Actuator",
    description: "Electric actuator for 12-inch pipeline valves",
    category: "Valves",
    subcategory: "Actuators",
    manufacturer: "Rotork",
    partNumber: "IQT-12-24V",
    unit: "piece",
    quantity: 3,
    minQuantity: 2,
    maxQuantity: 10,
    unitCost: 8500,
    totalValue: 25500,
    location: "Main Warehouse",
    shelf: "B-08",
    bin: "C-12",
    supplier: "Rotork Africa",
    lastOrderDate: "2024-05-20",
    leadTime: 21,
    status: "low-stock",
    condition: "new"
  },
  {
    id: 3,
    itemId: "INV-003",
    name: "Refinery Heat Exchanger Tubes",
    description: "Stainless steel tubes for heat exchangers",
    category: "Heat Exchangers",
    subcategory: "Tubes",
    manufacturer: "Tubular Solutions",
    partNumber: "SS-304-25mm",
    unit: "meter",
    quantity: 200,
    minQuantity: 100,
    maxQuantity: 500,
    unitCost: 45,
    totalValue: 9000,
    location: "Main Warehouse",
    shelf: "C-22",
    bin: "D-05",
    supplier: "Tubular Solutions Ltd",
    lastOrderDate: "2024-06-10",
    leadTime: 7,
    status: "in-stock",
    condition: "new"
  },
  {
    id: 4,
    itemId: "INV-004",
    name: "Compressor Oil Filter",
    description: "High efficiency oil filter for Atlas Copco compressors",
    category: "Filters",
    subcategory: "Oil Filters",
    manufacturer: "Atlas Copco",
    partNumber: "OF-110-AC",
    unit: "piece",
    quantity: 0,
    minQuantity: 10,
    maxQuantity: 30,
    unitCost: 180,
    totalValue: 0,
    location: "Main Warehouse",
    shelf: "A-05",
    bin: "B-08",
    supplier: "Atlas Copco Nigeria",
    lastOrderDate: "2024-07-01",
    leadTime: 10,
    status: "out-of-stock",
    condition: "new"
  },
  {
    id: 5,
    itemId: "INV-005",
    name: "Storage Tank Level Sensor",
    description: "Ultrasonic level sensor for storage tanks",
    category: "Sensors",
    subcategory: "Level Sensors",
    manufacturer: "Endress+Hauser",
    partNumber: "FMR-20",
    unit: "piece",
    quantity: 8,
    minQuantity: 3,
    maxQuantity: 15,
    unitCost: 3200,
    totalValue: 25600,
    location: "Main Warehouse",
    shelf: "D-12",
    bin: "E-03",
    supplier: "Endress+Hauser Nigeria",
    lastOrderDate: "2024-06-25",
    leadTime: 14,
    status: "in-stock",
    condition: "new"
  }
];

export const mockMaintenanceSchedules: MaintenanceSchedule[] = [
  {
    id: 1,
    scheduleId: "MS-2024-001",
    assetId: "PH-REF-001",
    assetName: "Port Harcourt Refinery Unit 1",
    type: "preventive",
    frequency: "monthly",
    interval: 1,
    lastPerformed: "2024-06-15",
    nextDue: "2024-07-15",
    estimatedDuration: 24,
    estimatedCost: 50000,
    assignedTechnician: "John Smith",
    status: "active",
    description: "Monthly preventive maintenance including filter replacement and performance testing",
    checklist: [
      "Check oil levels",
      "Replace air filters",
      "Test performance parameters",
      "Inspect for leaks",
      "Update maintenance log"
    ],
    parts: []
  },
  {
    id: 2,
    scheduleId: "MS-2024-002",
    assetId: "KD-REF-002",
    assetName: "Kaduna Refinery Pump Station",
    type: "preventive",
    frequency: "quarterly",
    interval: 3,
    lastPerformed: "2024-04-10",
    nextDue: "2024-07-10",
    estimatedDuration: 16,
    estimatedCost: 25000,
    assignedTechnician: "Mike Johnson",
    status: "active",
    description: "Quarterly pump maintenance and calibration",
    checklist: [
      "Inspect pump bearings",
      "Check alignment",
      "Calibrate flow meters",
      "Test emergency shutdown",
      "Update calibration records"
    ],
    parts: []
  }
];

export const mockProcurement: ProcurementItem[] = [
  {
    id: 1,
    purchaseOrderId: "PO-2024-001",
    itemName: "Compressor Oil Filters",
    description: "High efficiency oil filters for Atlas Copco compressors",
    category: "Filters",
    quantity: 50,
    unitCost: 180,
    totalCost: 9000,
    supplier: "Atlas Copco Nigeria",
    supplierContact: "sales@atlas-copco.ng",
    orderDate: "2024-07-01",
    expectedDelivery: "2024-07-15",
    status: "ordered",
    priority: "high",
    requester: "Maintenance Manager",
    approver: "Operations Director",
    notes: "Urgent order due to stockout",
    attachments: []
  },
  {
    id: 2,
    purchaseOrderId: "PO-2024-002",
    itemName: "Pipeline Valves",
    description: "12-inch ball valves for pipeline maintenance",
    category: "Valves",
    quantity: 10,
    unitCost: 2500,
    totalCost: 25000,
    supplier: "Valve Solutions Ltd",
    supplierContact: "info@valvesolutions.ng",
    orderDate: "2024-06-25",
    expectedDelivery: "2024-08-10",
    status: "ordered",
    priority: "medium",
    requester: "Pipeline Manager",
    approver: "Engineering Director",
    notes: "Standard replacement stock",
    attachments: []
  }
];

export const mockFleet: FleetVehicle[] = [
  {
    id: 1,
    vehicleId: "FLEET-001",
    name: "Maintenance Truck 1",
    type: "truck",
    make: "Toyota",
    model: "Hilux",
    year: 2022,
    licensePlate: "NNPC-001",
    vin: "JTDKARFU123456789",
    status: "operational",
    location: "Port Harcourt",
    assignedTo: "John Smith",
    department: "Maintenance",
    fuelType: "Diesel",
    fuelCapacity: 80,
    currentFuel: 45,
    mileage: 25000,
    lastService: "2024-06-15",
    nextService: "2024-09-15",
    insurance: "Active",
    registration: "Valid",
    purchaseDate: "2022-03-15",
    purchaseCost: 25000000,
    currentValue: 20000000,
    maintenanceHistory: [],
    fuelLog: [],
    documents: []
  },
  {
    id: 2,
    vehicleId: "FLEET-002",
    name: "Inspection Van",
    type: "van",
    make: "Ford",
    model: "Transit",
    year: 2021,
    licensePlate: "NNPC-002",
    vin: "WF0EXXGBB1234567",
    status: "operational",
    location: "Lagos",
    assignedTo: "Sarah Wilson",
    department: "Safety",
    fuelType: "Diesel",
    fuelCapacity: 75,
    currentFuel: 30,
    mileage: 35000,
    lastService: "2024-05-20",
    nextService: "2024-08-20",
    insurance: "Active",
    registration: "Valid",
    purchaseDate: "2021-08-10",
    purchaseCost: 22000000,
    currentValue: 18000000,
    maintenanceHistory: [],
    fuelLog: [],
    documents: []
  }
];

export const mockCalibration: CalibrationRecord[] = [
  {
    id: 1,
    calibrationId: "CAL-2024-001",
    assetId: "PH-REF-001",
    assetName: "Port Harcourt Refinery Unit 1",
    instrumentType: "Pressure Transmitter",
    manufacturer: "Emerson",
    model: "3051S",
    serialNumber: "PT-001-2020",
    calibrationDate: "2024-06-15",
    nextCalibration: "2024-12-15",
    calibratedBy: "Calibration Lab",
    calibrationLab: "NNPC Calibration Center",
    certificateNumber: "CAL-2024-001",
    accuracy: "±0.1%",
    uncertainty: "±0.05%",
    status: "calibrated",
    location: "Port Harcourt",
    department: "Refining",
    cost: 5000,
    notes: "All parameters within specifications",
    attachments: []
  }
];

export const mockEnergy: EnergyRecord[] = [
  {
    id: 1,
    recordId: "ENG-2024-001",
    assetId: "PH-REF-001",
    assetName: "Port Harcourt Refinery Unit 1",
    energyType: "electricity",
    consumption: 5000,
    unit: "kWh",
    readingDate: "2024-07-01",
    previousReading: 4500,
    currentReading: 5000,
    cost: 750000,
    efficiency: 95,
    location: "Port Harcourt",
    meterId: "MTR-001",
    notes: "Normal consumption pattern"
  }
];

export const mockDocuments: Document[] = [
  {
    id: 1,
    documentId: "DOC-2024-001",
    title: "Port Harcourt Refinery Operating Manual",
    description: "Comprehensive operating manual for Port Harcourt Refinery Unit 1",
    type: "manual",
    category: "Operations",
    fileName: "PH_Refinery_Manual_v2.1.pdf",
    fileSize: 5242880,
    fileType: "pdf",
    uploadedBy: "Technical Writer",
    uploadDate: "2024-01-15",
    lastModified: "2024-06-15",
    version: "2.1",
    status: "active",
    tags: ["refinery", "operations", "manual"],
    relatedAsset: "PH-REF-001",
    accessLevel: "restricted"
  },
  {
    id: 2,
    documentId: "DOC-2024-002",
    title: "Safety Procedures - Pipeline Operations",
    description: "Standard operating procedures for pipeline operations",
    type: "procedure",
    category: "Safety",
    fileName: "Pipeline_Safety_Procedures.pdf",
    fileSize: 2097152,
    fileType: "pdf",
    uploadedBy: "Safety Manager",
    uploadDate: "2024-03-10",
    lastModified: "2024-07-01",
    version: "1.5",
    status: "active",
    tags: ["safety", "pipeline", "procedures"],
    accessLevel: "public"
  }
];

// Map Points for Asset Map
export const mapPoints = {
  refineries: [
    {
      id: "ref-1",
      name: "Port Harcourt Refinery",
      type: "refinery",
      latitude: 4.8156,
      longitude: 7.0498,
      status: "operational",
      description: "NNPC Port Harcourt Refining Complex",
      capacity: "210,000 bpd",
      operator: "NNPC"
    },
    {
      id: "ref-2",
      name: "Kaduna Refinery",
      type: "refinery",
      latitude: 10.5222,
      longitude: 7.4384,
      status: "operational",
      description: "NNPC Kaduna Refining Complex",
      capacity: "110,000 bpd",
      operator: "NNPC"
    },
    {
      id: "ref-3",
      name: "Warri Refinery",
      type: "refinery",
      latitude: 5.5560,
      longitude: 5.7936,
      status: "operational",
      description: "NNPC Warri Refining Complex",
      capacity: "125,000 bpd",
      operator: "NNPC"
    },
    {
      id: "ref-4",
      name: "Dangote Refinery",
      type: "refinery",
      latitude: 6.5244,
      longitude: 3.3792,
      status: "operational",
      description: "Dangote Petroleum Refinery",
      capacity: "650,000 bpd",
      operator: "Dangote Group"
    }
  ],
  infrastructure: [
    {
      id: "inf-1",
      name: "Lagos Terminal",
      type: "infrastructure",
      latitude: 6.5244,
      longitude: 3.3792,
      status: "operational",
      description: "Lagos Petroleum Terminal",
      operator: "NNPC"
    },
    {
      id: "inf-2",
      name: "Port Harcourt Terminal",
      type: "infrastructure",
      latitude: 4.8156,
      longitude: 7.0498,
      status: "operational",
      description: "Port Harcourt Petroleum Terminal",
      operator: "NNPC"
    },
    {
      id: "inf-3",
      name: "Calabar Terminal",
      type: "infrastructure",
      latitude: 4.9757,
      longitude: 8.3417,
      status: "operational",
      description: "Calabar Petroleum Terminal",
      operator: "NNPC"
    },
    {
      id: "inf-4",
      name: "Kano Depot",
      type: "infrastructure",
      latitude: 11.9914,
      longitude: 8.5317,
      status: "operational",
      description: "Kano Petroleum Depot",
      operator: "NNPC"
    },
    {
      id: "inf-5",
      name: "Maiduguri Depot",
      type: "infrastructure",
      latitude: 11.8333,
      longitude: 13.1500,
      status: "operational",
      description: "Maiduguri Petroleum Depot",
      operator: "NNPC"
    }
  ],
  pipelines: [
    {
      id: "pipe-1",
      name: "Port Harcourt - Kaduna Pipeline",
      type: "pipeline",
      latitude: 7.5,
      longitude: 6.5,
      status: "operational",
      description: "Major crude oil pipeline from Port Harcourt to Kaduna"
    },
    {
      id: "pipe-2",
      name: "Warri - Kaduna Pipeline",
      type: "pipeline",
      latitude: 8.0,
      longitude: 6.0,
      status: "operational",
      description: "Crude oil pipeline from Warri to Kaduna"
    },
    {
      id: "pipe-3",
      name: "Lagos - Ibadan Pipeline",
      type: "pipeline",
      latitude: 7.0,
      longitude: 3.5,
      status: "operational",
      description: "Product pipeline from Lagos to Ibadan"
    },
    {
      id: "pipe-4",
      name: "Kaduna - Kano Pipeline",
      type: "pipeline",
      latitude: 11.0,
      longitude: 8.0,
      status: "operational",
      description: "Product pipeline from Kaduna to Kano"
    }
  ]
}; 