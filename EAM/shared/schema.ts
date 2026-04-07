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

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  username: varchar("username").unique().notNull(),
  password: varchar("password").notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  role: varchar("role").default("technician").notNull(), // admin, manager, technician, viewer
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Assets table
export const assets = pgTable("assets", {
  id: serial("id").primaryKey(),
  assetId: varchar("asset_id").unique().notNull(),
  name: varchar("name").notNull(),
  description: text("description"),
  type: varchar("type").notNull(), // HVAC, Vehicle, Equipment, etc.
  category: varchar("category").notNull(),
  manufacturer: varchar("manufacturer"),
  model: varchar("model"),
  serialNumber: varchar("serial_number"),
  location: varchar("location").notNull(),
  status: varchar("status").default("operational").notNull(), // operational, maintenance, out_of_service, idle
  criticality: varchar("criticality").default("medium").notNull(), // high, medium, low
  purchaseDate: date("purchase_date"),
  acquisitionCost: decimal("acquisition_cost", { precision: 10, scale: 2 }),
  warrantyExpiry: date("warranty_expiry"),
  userId: varchar("user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Work orders table
export const workOrders = pgTable("work_orders", {
  id: serial("id").primaryKey(),
  workOrderId: varchar("work_order_id").unique().notNull(),
  title: varchar("title").notNull(),
  description: text("description"),
  assetId: integer("asset_id").references(() => assets.id).notNull(),
  type: varchar("type").notNull(), // preventive, corrective, emergency, inspection
  priority: varchar("priority").default("medium").notNull(), // critical, high, medium, low
  status: varchar("status").default("pending").notNull(), // pending, in_progress, completed, cancelled, overdue
  assignedTo: varchar("assigned_to").references(() => users.id),
  requestedBy: varchar("requested_by").references(() => users.id),
  scheduledDate: timestamp("scheduled_date"),
  dueDate: timestamp("due_date"),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  estimatedHours: decimal("estimated_hours", { precision: 5, scale: 2 }),
  actualHours: decimal("actual_hours", { precision: 5, scale: 2 }),
  cost: decimal("cost", { precision: 10, scale: 2 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Maintenance schedules table
export const maintenanceSchedules = pgTable("maintenance_schedules", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  description: text("description"),
  assetId: integer("asset_id").references(() => assets.id).notNull(),
  scheduleType: varchar("schedule_type").notNull(), // time_based, usage_based, condition_based
  frequency: integer("frequency"), // days for time_based, hours/miles for usage_based
  frequencyUnit: varchar("frequency_unit"), // days, hours, miles, cycles
  isActive: boolean("is_active").default(true),
  lastCompleted: timestamp("last_completed"),
  nextDue: timestamp("next_due"),
  assignedTo: varchar("assigned_to").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Inventory items table
export const inventoryItems = pgTable("inventory_items", {
  id: serial("id").primaryKey(),
  partNumber: varchar("part_number").unique().notNull(),
  name: varchar("name").notNull(),
  description: text("description"),
  category: varchar("category").notNull(),
  manufacturer: varchar("manufacturer"),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }),
  currentStock: integer("current_stock").default(0),
  minStock: integer("min_stock").default(0),
  maxStock: integer("max_stock"),
  location: varchar("location"),
  supplier: varchar("supplier"),
  leadTime: integer("lead_time"), // days
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

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  assets: many(assets),
  assignedWorkOrders: many(workOrders, { relationName: "assignedTo" }),
  requestedWorkOrders: many(workOrders, { relationName: "requestedBy" }),
  maintenanceSchedules: many(maintenanceSchedules),
}));

export const assetsRelations = relations(assets, ({ one, many }) => ({
  user: one(users, {
    fields: [assets.userId],
    references: [users.id],
  }),
  workOrders: many(workOrders),
  maintenanceSchedules: many(maintenanceSchedules),
}));

export const workOrdersRelations = relations(workOrders, ({ one, many }) => ({
  asset: one(assets, {
    fields: [workOrders.assetId],
    references: [assets.id],
  }),
  assignedUser: one(users, {
    fields: [workOrders.assignedTo],
    references: [users.id],
    relationName: "assignedTo",
  }),
  requestedByUser: one(users, {
    fields: [workOrders.requestedBy],
    references: [users.id],
    relationName: "requestedBy",
  }),
  workOrderParts: many(workOrderParts),
}));

export const maintenanceSchedulesRelations = relations(maintenanceSchedules, ({ one }) => ({
  asset: one(assets, {
    fields: [maintenanceSchedules.assetId],
    references: [assets.id],
  }),
  assignedUser: one(users, {
    fields: [maintenanceSchedules.assignedTo],
    references: [users.id],
  }),
}));

export const inventoryItemsRelations = relations(inventoryItems, ({ many }) => ({
  workOrderParts: many(workOrderParts),
}));

export const workOrderPartsRelations = relations(workOrderParts, ({ one }) => ({
  workOrder: one(workOrders, {
    fields: [workOrderParts.workOrderId],
    references: [workOrders.id],
  }),
  inventoryItem: one(inventoryItems, {
    fields: [workOrderParts.inventoryItemId],
    references: [inventoryItems.id],
  }),
}));

// Insert schemas
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

export const insertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  updatedAt: true,
});

// Types
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
