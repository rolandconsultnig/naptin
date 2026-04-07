import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  decimal,
  boolean,
  date,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// ============================================================================
// EXISTING TABLES (Enhanced)
// ============================================================================

// Session storage table
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Enhanced Users table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  username: varchar("username").unique().notNull(),
  password: varchar("password").notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  role: varchar("role").default("technician").notNull(), // admin, manager, technician, viewer, operator
  department: varchar("department"),
  phone: varchar("phone"),
  employeeId: varchar("employee_id"),
  isActive: boolean("is_active").default(true),
  lastLogin: timestamp("last_login"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Enhanced Assets table with hierarchical structure
export const assets = pgTable("assets", {
  id: serial("id").primaryKey(),
  assetId: varchar("asset_id").unique().notNull(),
  name: varchar("name").notNull(),
  description: text("description"),
  type: varchar("type").notNull(), // HVAC, Vehicle, Equipment, Building, etc.
  category: varchar("category").notNull(),
  manufacturer: varchar("manufacturer"),
  model: varchar("model"),
  serialNumber: varchar("serial_number"),
  barcode: varchar("barcode").unique(),
  rfidTag: varchar("rfid_tag").unique(),
  location: varchar("location").notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  status: varchar("status").default("operational").notNull(), // operational, maintenance, out_of_service, idle, retired
  criticality: varchar("criticality").default("medium").notNull(), // critical, high, medium, low
  parentAssetId: integer("parent_asset_id").references(() => assets.id), // Hierarchical structure
  purchaseDate: date("purchase_date"),
  acquisitionCost: decimal("acquisition_cost", { precision: 12, scale: 2 }),
  currentValue: decimal("current_value", { precision: 12, scale: 2 }),
  depreciationMethod: varchar("depreciation_method"), // straight_line, declining_balance, etc.
  usefulLife: integer("useful_life"), // in years
  warrantyExpiry: date("warranty_expiry"),
  insuranceExpiry: date("insurance_expiry"),
  assignedTo: varchar("assigned_to").references(() => users.id),
  department: varchar("department"),
  facility: varchar("facility"),
  floor: varchar("floor"),
  room: varchar("room"),
  specifications: jsonb("specifications"), // Technical specifications
  documents: jsonb("documents"), // Related documents
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ============================================================================
// WORK ORDER MANAGEMENT (Enhanced)
// ============================================================================

// Enhanced Work Orders table
export const workOrders = pgTable("work_orders", {
  id: serial("id").primaryKey(),
  workOrderId: varchar("work_order_id").unique().notNull(),
  title: varchar("title").notNull(),
  description: text("description"),
  assetId: integer("asset_id").references(() => assets.id).notNull(),
  type: varchar("type").notNull(), // preventive, corrective, emergency, inspection, project
  priority: varchar("priority").default("medium").notNull(), // critical, high, medium, low
  status: varchar("status").default("pending").notNull(), // pending, approved, in_progress, completed, cancelled, overdue
  workflowStage: varchar("workflow_stage").default("draft"), // draft, submitted, approved, assigned, in_progress, completed
  assignedTo: varchar("assigned_to").references(() => users.id),
  requestedBy: varchar("requested_by").references(() => users.id),
  approvedBy: varchar("approved_by").references(() => users.id),
  scheduledDate: timestamp("scheduled_date"),
  dueDate: timestamp("due_date"),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  estimatedHours: decimal("estimated_hours", { precision: 6, scale: 2 }),
  actualHours: decimal("actual_hours", { precision: 6, scale: 2 }),
  laborCost: decimal("labor_cost", { precision: 10, scale: 2 }),
  materialCost: decimal("material_cost", { precision: 10, scale: 2 }),
  totalCost: decimal("total_cost", { precision: 10, scale: 2 }),
  safetyNotes: text("safety_notes"),
  qualityNotes: text("quality_notes"),
  notes: text("notes"),
  attachments: jsonb("attachments"), // File attachments
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Work Order Tasks (for complex work orders)
export const workOrderTasks = pgTable("work_order_tasks", {
  id: serial("id").primaryKey(),
  workOrderId: integer("work_order_id").references(() => workOrders.id).notNull(),
  taskName: varchar("task_name").notNull(),
  description: text("description"),
  sequence: integer("sequence").notNull(),
  estimatedHours: decimal("estimated_hours", { precision: 5, scale: 2 }),
  actualHours: decimal("actual_hours", { precision: 5, scale: 2 }),
  status: varchar("status").default("pending").notNull(), // pending, in_progress, completed
  assignedTo: varchar("assigned_to").references(() => users.id),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ============================================================================
// MAINTENANCE MANAGEMENT
// ============================================================================

// Enhanced Maintenance Schedules
export const maintenanceSchedules = pgTable("maintenance_schedules", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  description: text("description"),
  assetId: integer("asset_id").references(() => assets.id).notNull(),
  scheduleType: varchar("schedule_type").notNull(), // time_based, usage_based, condition_based, predictive
  frequency: integer("frequency"), // days for time_based, hours/miles for usage_based
  frequencyUnit: varchar("frequency_unit"), // days, hours, miles, cycles
  conditionThreshold: decimal("condition_threshold", { precision: 10, scale: 2 }), // For condition-based
  isActive: boolean("is_active").default(true),
  lastCompleted: timestamp("last_completed"),
  nextDue: timestamp("next_due"),
  assignedTo: varchar("assigned_to").references(() => users.id),
  estimatedDuration: integer("estimated_duration"), // in minutes
  estimatedCost: decimal("estimated_cost", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Maintenance History
export const maintenanceHistory = pgTable("maintenance_history", {
  id: serial("id").primaryKey(),
  assetId: integer("asset_id").references(() => assets.id).notNull(),
  workOrderId: integer("work_order_id").references(() => workOrders.id),
  maintenanceType: varchar("maintenance_type").notNull(), // preventive, corrective, emergency, inspection
  performedBy: varchar("performed_by").references(() => users.id),
  performedAt: timestamp("performed_at").notNull(),
  description: text("description"),
  findings: text("findings"),
  recommendations: text("recommendations"),
  cost: decimal("cost", { precision: 10, scale: 2 }),
  downtime: integer("downtime"), // in minutes
  createdAt: timestamp("created_at").defaultNow(),
});

// ============================================================================
// INVENTORY & SPARE PARTS MANAGEMENT
// ============================================================================

// Enhanced Inventory Items
export const inventoryItems = pgTable("inventory_items", {
  id: serial("id").primaryKey(),
  partNumber: varchar("part_number").unique().notNull(),
  name: varchar("name").notNull(),
  description: text("description"),
  category: varchar("category").notNull(),
  subcategory: varchar("subcategory"),
  manufacturer: varchar("manufacturer"),
  supplier: varchar("supplier"),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }),
  currentStock: integer("current_stock").default(0),
  minStock: integer("min_stock").default(0),
  maxStock: integer("max_stock"),
  reorderPoint: integer("reorder_point"),
  location: varchar("location"),
  warehouse: varchar("warehouse"),
  shelf: varchar("shelf"),
  bin: varchar("bin"),
  leadTime: integer("lead_time"), // days
  shelfLife: integer("shelf_life"), // days
  isCritical: boolean("is_critical").default(false),
  barcode: varchar("barcode").unique(),
  specifications: jsonb("specifications"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Work order parts (junction table)
export const workOrderParts = pgTable("work_order_parts", {
  id: serial("id").primaryKey(),
  workOrderId: integer("work_order_id").references(() => workOrders.id).notNull(),
  inventoryItemId: integer("inventory_item_id").references(() => inventoryItems.id).notNull(),
  quantityUsed: integer("quantity_used").notNull(),
  unitCost: decimal("unit_cost", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Bill of Materials (BOM)
export const billOfMaterials = pgTable("bill_of_materials", {
  id: serial("id").primaryKey(),
  parentItemId: integer("parent_item_id").references(() => inventoryItems.id).notNull(),
  childItemId: integer("child_item_id").references(() => inventoryItems.id).notNull(),
  quantity: decimal("quantity", { precision: 8, scale: 3 }).notNull(),
  unit: varchar("unit").default("each"), // each, kg, m, etc.
  isOptional: boolean("is_optional").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// ============================================================================
// PROCUREMENT & PURCHASING
// ============================================================================

// Vendors/Suppliers
export const vendors = pgTable("vendors", {
  id: serial("id").primaryKey(),
  vendorCode: varchar("vendor_code").unique().notNull(),
  name: varchar("name").notNull(),
  contactPerson: varchar("contact_person"),
  email: varchar("email"),
  phone: varchar("phone"),
  address: text("address"),
  city: varchar("city"),
  state: varchar("state"),
  country: varchar("country"),
  postalCode: varchar("postal_code"),
  website: varchar("website"),
  taxId: varchar("tax_id"),
  paymentTerms: varchar("payment_terms"),
  creditLimit: decimal("credit_limit", { precision: 12, scale: 2 }),
  isActive: boolean("is_active").default(true),
  rating: integer("rating"), // 1-5 stars
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Purchase Requisitions
export const purchaseRequisitions = pgTable("purchase_requisitions", {
  id: serial("id").primaryKey(),
  requisitionNumber: varchar("requisition_number").unique().notNull(),
  title: varchar("title").notNull(),
  description: text("description"),
  requestedBy: varchar("requested_by").references(() => users.id).notNull(),
  department: varchar("department"),
  priority: varchar("priority").default("normal").notNull(), // urgent, high, normal, low
  status: varchar("status").default("draft").notNull(), // draft, submitted, approved, rejected, ordered
  totalAmount: decimal("total_amount", { precision: 12, scale: 2 }),
  approvedBy: varchar("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Purchase Orders
export const purchaseOrders = pgTable("purchase_orders", {
  id: serial("id").primaryKey(),
  purchaseOrderNumber: varchar("purchase_order_number").unique().notNull(),
  vendorId: integer("vendor_id").references(() => vendors.id).notNull(),
  requisitionId: integer("requisition_id").references(() => purchaseRequisitions.id),
  orderDate: date("order_date").notNull(),
  expectedDelivery: date("expected_delivery"),
  status: varchar("status").default("open").notNull(), // open, partially_received, received, closed, cancelled
  subtotal: decimal("subtotal", { precision: 12, scale: 2 }),
  tax: decimal("tax", { precision: 12, scale: 2 }),
  shipping: decimal("shipping", { precision: 12, scale: 2 }),
  totalAmount: decimal("total_amount", { precision: 12, scale: 2 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ============================================================================
// FLEET MANAGEMENT
// ============================================================================

// Fleet Vehicles
export const fleetVehicles = pgTable("fleet_vehicles", {
  id: serial("id").primaryKey(),
  assetId: integer("asset_id").references(() => assets.id).notNull(),
  vehicleType: varchar("vehicle_type").notNull(), // truck, car, forklift, crane, etc.
  make: varchar("make").notNull(),
  model: varchar("model").notNull(),
  year: integer("year"),
  licensePlate: varchar("license_plate").unique(),
  vin: varchar("vin").unique(),
  fuelType: varchar("fuel_type"), // gasoline, diesel, electric, hybrid
  fuelCapacity: decimal("fuel_capacity", { precision: 6, scale: 2 }),
  currentMileage: integer("current_mileage"),
  lastServiceMileage: integer("last_service_mileage"),
  insuranceProvider: varchar("insurance_provider"),
  insurancePolicy: varchar("insurance_policy"),
  insuranceExpiry: date("insurance_expiry"),
  registrationExpiry: date("registration_expiry"),
  assignedDriver: varchar("assigned_driver").references(() => users.id),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Fuel Management
export const fuelTransactions = pgTable("fuel_transactions", {
  id: serial("id").primaryKey(),
  vehicleId: integer("vehicle_id").references(() => fleetVehicles.id).notNull(),
  transactionDate: timestamp("transaction_date").notNull(),
  fuelType: varchar("fuel_type").notNull(),
  quantity: decimal("quantity", { precision: 8, scale: 3 }).notNull(), // gallons/liters
  unitPrice: decimal("unit_price", { precision: 6, scale: 3 }),
  totalCost: decimal("total_cost", { precision: 10, scale: 2 }),
  odometerReading: integer("odometer_reading"),
  station: varchar("station"),
  driver: varchar("driver").references(() => users.id),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ============================================================================
// CALIBRATION & COMPLIANCE MANAGEMENT
// ============================================================================

// Calibration Records
export const calibrationRecords = pgTable("calibration_records", {
  id: serial("id").primaryKey(),
  assetId: integer("asset_id").references(() => assets.id).notNull(),
  calibrationType: varchar("calibration_type").notNull(), // internal, external, verification
  calibrationDate: date("calibration_date").notNull(),
  nextCalibrationDate: date("next_calibration_date").notNull(),
  calibratedBy: varchar("calibrated_by").references(() => users.id),
  calibrationStandard: varchar("calibration_standard"),
  uncertainty: decimal("uncertainty", { precision: 8, scale: 6 }),
  result: varchar("result").notNull(), // pass, fail, conditional
  certificateNumber: varchar("certificate_number"),
  notes: text("notes"),
  attachments: jsonb("attachments"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Compliance Records
export const complianceRecords = pgTable("compliance_records", {
  id: serial("id").primaryKey(),
  assetId: integer("asset_id").references(() => assets.id),
  complianceType: varchar("compliance_type").notNull(), // ISO, OSHA, FDA, EPA, etc.
  requirement: varchar("requirement").notNull(),
  dueDate: date("due_date").notNull(),
  completedDate: date("completed_date"),
  status: varchar("status").default("pending").notNull(), // pending, in_progress, completed, overdue
  responsiblePerson: varchar("responsible_person").references(() => users.id),
  notes: text("notes"),
  attachments: jsonb("attachments"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ============================================================================
// ENERGY & UTILITIES MANAGEMENT
// ============================================================================

// Energy Consumption
export const energyConsumption = pgTable("energy_consumption", {
  id: serial("id").primaryKey(),
  assetId: integer("asset_id").references(() => assets.id).notNull(),
  energyType: varchar("energy_type").notNull(), // electricity, gas, water, steam, etc.
  readingDate: timestamp("reading_date").notNull(),
  readingValue: decimal("reading_value", { precision: 12, scale: 4 }).notNull(),
  unit: varchar("unit").notNull(), // kWh, m³, gallons, etc.
  cost: decimal("cost", { precision: 10, scale: 2 }),
  meterNumber: varchar("meter_number"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ============================================================================
// DOCUMENT MANAGEMENT
// ============================================================================

// Documents
export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  documentNumber: varchar("document_number").unique().notNull(),
  title: varchar("title").notNull(),
  description: text("description"),
  documentType: varchar("document_type").notNull(), // manual, procedure, warranty, contract, etc.
  category: varchar("category"),
  assetId: integer("asset_id").references(() => assets.id),
  fileName: varchar("file_name"),
  filePath: varchar("file_path"),
  fileSize: integer("file_size"),
  mimeType: varchar("mime_type"),
  version: varchar("version").default("1.0"),
  isActive: boolean("is_active").default(true),
  uploadedBy: varchar("uploaded_by").references(() => users.id),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
  expiryDate: date("expiry_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ============================================================================
// AUDIT & LOGGING
// ============================================================================

// Audit Logs
export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  action: varchar("action").notNull(), // create, update, delete, login, logout, etc.
  tableName: varchar("table_name").notNull(),
  recordId: varchar("record_id"),
  oldValues: jsonb("old_values"),
  newValues: jsonb("new_values"),
  ipAddress: varchar("ip_address"),
  userAgent: text("user_agent"),
  timestamp: timestamp("timestamp").defaultNow(),
});

// ============================================================================
// RELATIONS
// ============================================================================

export const usersRelations = relations(users, ({ many }) => ({
  assets: many(assets),
  assignedWorkOrders: many(workOrders, { relationName: "assignedTo" }),
  requestedWorkOrders: many(workOrders, { relationName: "requestedBy" }),
  approvedWorkOrders: many(workOrders, { relationName: "approvedBy" }),
  maintenanceSchedules: many(maintenanceSchedules),
  maintenanceHistory: many(maintenanceHistory),
  fleetVehicles: many(fleetVehicles),
  fuelTransactions: many(fuelTransactions),
  documents: many(documents),
  auditLogs: many(auditLogs),
}));

export const assetsRelations = relations(assets, ({ one, many }) => ({
  user: one(users, {
    fields: [assets.assignedTo],
    references: [users.id],
  }),
  parentAsset: one(assets, {
    fields: [assets.parentAssetId],
    references: [assets.id],
    relationName: "parentChild",
  }),
  childAssets: many(assets, { relationName: "parentChild" }),
  workOrders: many(workOrders),
  maintenanceSchedules: many(maintenanceSchedules),
  maintenanceHistory: many(maintenanceHistory),
  calibrationRecords: many(calibrationRecords),
  complianceRecords: many(complianceRecords),
  energyConsumption: many(energyConsumption),
  documents: many(documents),
  fleetVehicle: one(fleetVehicles),
}));

// ============================================================================
// INSERT SCHEMAS
// ============================================================================

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAssetSchema = createInsertSchema(assets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertWorkOrderSchema = createInsertSchema(workOrders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMaintenanceScheduleSchema = createInsertSchema(maintenanceSchedules).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertInventoryItemSchema = createInsertSchema(inventoryItems).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertWorkOrderPartSchema = createInsertSchema(workOrderParts).omit({
  id: true,
  createdAt: true,
});

// ============================================================================
// TYPES
// ============================================================================

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Asset = typeof assets.$inferSelect;
export type InsertAsset = z.infer<typeof insertAssetSchema>;

export type WorkOrder = typeof workOrders.$inferSelect;
export type InsertWorkOrder = z.infer<typeof insertWorkOrderSchema>;

export type MaintenanceSchedule = typeof maintenanceSchedules.$inferSelect;
export type InsertMaintenanceSchedule = z.infer<typeof insertMaintenanceScheduleSchema>;

export type InventoryItem = typeof inventoryItems.$inferSelect;
export type InsertInventoryItem = z.infer<typeof insertInventoryItemSchema>;

export type WorkOrderPart = typeof workOrderParts.$inferSelect;
export type InsertWorkOrderPart = z.infer<typeof insertWorkOrderPartSchema>;

export type Vendor = typeof vendors.$inferSelect;
export type FleetVehicle = typeof fleetVehicles.$inferSelect;
export type CalibrationRecord = typeof calibrationRecords.$inferSelect;
export type ComplianceRecord = typeof complianceRecords.$inferSelect;
export type Document = typeof documents.$inferSelect;
export type AuditLog = typeof auditLogs.$inferSelect; 