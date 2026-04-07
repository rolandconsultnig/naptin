import {
  users,
  assets,
  workOrders,
  maintenanceSchedules,
  inventoryItems,
  workOrderParts,
  type User,
  type UpsertUser,
  type InsertUser,
  type Asset,
  type InsertAsset,
  type WorkOrder,
  type InsertWorkOrder,
  type MaintenanceSchedule,
  type InsertMaintenanceSchedule,
  type InventoryItem,
  type InsertInventoryItem,
  type WorkOrderPart,
  type InsertWorkOrderPart,
} from "../shared/schema";
import { db } from "./db";
import { eq, desc, asc, count, sql, and, or, like } from "drizzle-orm";

// Mock data imports
import { 
  mockAssets, 
  mockWorkOrders, 
  mockMaintenanceSchedules, 
  mockInventory
} from "./mockData";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Asset operations
  getAssets(): Promise<Asset[]>;
  getAsset(id: number): Promise<Asset | undefined>;
  createAsset(asset: InsertAsset): Promise<Asset>;
  updateAsset(id: number, asset: Partial<InsertAsset>): Promise<Asset>;
  deleteAsset(id: number): Promise<void>;
  searchAssets(query: string): Promise<Asset[]>;
  
  // Work order operations
  getWorkOrders(): Promise<WorkOrder[]>;
  getWorkOrder(id: number): Promise<WorkOrder | undefined>;
  createWorkOrder(workOrder: InsertWorkOrder): Promise<WorkOrder>;
  updateWorkOrder(id: number, workOrder: Partial<InsertWorkOrder>): Promise<WorkOrder>;
  deleteWorkOrder(id: number): Promise<void>;
  getWorkOrdersByAsset(assetId: number): Promise<WorkOrder[]>;
  getWorkOrdersByUser(userId: string): Promise<WorkOrder[]>;
  
  // Maintenance schedule operations
  getMaintenanceSchedules(): Promise<MaintenanceSchedule[]>;
  getMaintenanceSchedule(id: number): Promise<MaintenanceSchedule | undefined>;
  createMaintenanceSchedule(schedule: InsertMaintenanceSchedule): Promise<MaintenanceSchedule>;
  updateMaintenanceSchedule(id: number, schedule: Partial<InsertMaintenanceSchedule>): Promise<MaintenanceSchedule>;
  deleteMaintenanceSchedule(id: number): Promise<void>;
  getUpcomingMaintenance(): Promise<MaintenanceSchedule[]>;
  
  // Inventory operations
  getInventoryItems(): Promise<InventoryItem[]>;
  getInventoryItem(id: number): Promise<InventoryItem | undefined>;
  createInventoryItem(item: InsertInventoryItem): Promise<InventoryItem>;
  updateInventoryItem(id: number, item: Partial<InsertInventoryItem>): Promise<InventoryItem>;
  deleteInventoryItem(id: number): Promise<void>;
  getLowStockItems(): Promise<InventoryItem[]>;
  
  // Work order parts operations
  getWorkOrderParts(workOrderId: number): Promise<WorkOrderPart[]>;
  addWorkOrderPart(part: InsertWorkOrderPart): Promise<WorkOrderPart>;
  removeWorkOrderPart(id: number): Promise<void>;
  
  // Dashboard analytics
  getDashboardStats(): Promise<{
    totalAssets: number;
    activeWorkOrders: number;
    completedWorkOrders: number;
    overdueMaintenance: number;
    lowStockItems: number;
    assetsByStatus: { status: string; count: number }[];
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      return user;
    } catch (error) {
      console.error("Error fetching user from database:", error);
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.username, username));
      return user;
    } catch (error) {
      console.error("Error fetching user by username from database:", error);
      return undefined;
    }
  }

  async createUser(userData: InsertUser): Promise<User> {
    try {
      const [user] = await db
        .insert(users)
        .values(userData)
        .returning();
      return user;
    } catch (error) {
      console.error("Error creating user in database:", error);
      throw error;
    }
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    try {
      const [user] = await db
        .insert(users)
        .values(userData)
        .onConflictDoUpdate({
          target: users.id,
          set: {
            ...userData,
            updatedAt: new Date(),
          },
        })
        .returning();
      return user;
    } catch (error) {
      console.error("Error upserting user in database:", error);
      throw error;
    }
  }

  // Asset operations
  async getAssets(): Promise<Asset[]> {
    try {
      return await db.select().from(assets).orderBy(desc(assets.createdAt));
    } catch (error) {
      console.error("Error fetching assets from database, using mock data:", error);
      return mockAssets as any[];
    }
  }

  async getAsset(id: number): Promise<Asset | undefined> {
    try {
      const [asset] = await db.select().from(assets).where(eq(assets.id, id));
      return asset;
    } catch (error) {
      console.error("Error fetching asset from database:", error);
      return mockAssets.find(a => a.id === id) as any;
    }
  }

  async createAsset(asset: InsertAsset): Promise<Asset> {
    try {
      const [newAsset] = await db.insert(assets).values(asset).returning();
      return newAsset;
    } catch (error) {
      console.error("Error creating asset in database:", error);
      throw error;
    }
  }

  async updateAsset(id: number, asset: Partial<InsertAsset>): Promise<Asset> {
    try {
      const [updatedAsset] = await db
        .update(assets)
        .set({ ...asset, updatedAt: new Date() })
        .where(eq(assets.id, id))
        .returning();
      return updatedAsset;
    } catch (error) {
      console.error("Error updating asset in database:", error);
      throw error;
    }
  }

  async deleteAsset(id: number): Promise<void> {
    try {
      await db.delete(assets).where(eq(assets.id, id));
    } catch (error) {
      console.error("Error deleting asset from database:", error);
      throw error;
    }
  }

  async searchAssets(query: string): Promise<Asset[]> {
    try {
      return await db
        .select()
        .from(assets)
        .where(
          or(
            like(assets.name, `%${query}%`),
            like(assets.assetId, `%${query}%`),
            like(assets.location, `%${query}%`),
            like(assets.type, `%${query}%`)
          )
        )
        .orderBy(desc(assets.createdAt));
    } catch (error) {
      console.error("Error searching assets in database, using mock data:", error);
      return mockAssets.filter(asset => 
        asset.name.toLowerCase().includes(query.toLowerCase()) ||
        asset.assetId.toLowerCase().includes(query.toLowerCase()) ||
        asset.location.toLowerCase().includes(query.toLowerCase()) ||
        asset.type.toLowerCase().includes(query.toLowerCase())
      ) as any[];
    }
  }

  // Work order operations
  async getWorkOrders(): Promise<WorkOrder[]> {
    try {
      return await db.select().from(workOrders).orderBy(desc(workOrders.createdAt));
    } catch (error) {
      console.error("Error fetching work orders from database, using mock data:", error);
      return mockWorkOrders as any[];
    }
  }

  async getWorkOrder(id: number): Promise<WorkOrder | undefined> {
    try {
      const [workOrder] = await db.select().from(workOrders).where(eq(workOrders.id, id));
      return workOrder;
    } catch (error) {
      console.error("Error fetching work order from database:", error);
      return mockWorkOrders.find(wo => wo.id === id) as any;
    }
  }

  async createWorkOrder(workOrder: InsertWorkOrder): Promise<WorkOrder> {
    try {
      const [newWorkOrder] = await db.insert(workOrders).values(workOrder).returning();
      return newWorkOrder;
    } catch (error) {
      console.error("Error creating work order in database:", error);
      throw error;
    }
  }

  async updateWorkOrder(id: number, workOrder: Partial<InsertWorkOrder>): Promise<WorkOrder> {
    try {
      const [updatedWorkOrder] = await db
        .update(workOrders)
        .set({ ...workOrder, updatedAt: new Date() })
        .where(eq(workOrders.id, id))
        .returning();
      return updatedWorkOrder;
    } catch (error) {
      console.error("Error updating work order in database:", error);
      throw error;
    }
  }

  async deleteWorkOrder(id: number): Promise<void> {
    try {
      await db.delete(workOrders).where(eq(workOrders.id, id));
    } catch (error) {
      console.error("Error deleting work order from database:", error);
      throw error;
    }
  }

  async getWorkOrdersByAsset(assetId: number): Promise<WorkOrder[]> {
    try {
      return await db
        .select()
        .from(workOrders)
        .where(eq(workOrders.assetId, assetId))
        .orderBy(desc(workOrders.createdAt));
    } catch (error) {
      console.error("Error fetching work orders by asset from database:", error);
      return mockWorkOrders.filter(wo => wo.assetId === assetId.toString()) as any[];
    }
  }

  async getWorkOrdersByUser(userId: string): Promise<WorkOrder[]> {
    try {
      return await db
        .select()
        .from(workOrders)
        .where(eq(workOrders.assignedTo, userId))
        .orderBy(desc(workOrders.createdAt));
    } catch (error) {
      console.error("Error fetching work orders by user from database:", error);
      return mockWorkOrders.filter(wo => wo.assignedTo === userId) as any[];
    }
  }

  // Maintenance schedule operations
  async getMaintenanceSchedules(): Promise<MaintenanceSchedule[]> {
    try {
      return await db.select().from(maintenanceSchedules).orderBy(asc(maintenanceSchedules.nextDue));
    } catch (error) {
      console.error("Error fetching maintenance schedules from database, using mock data:", error);
      return mockMaintenanceSchedules as any[];
    }
  }

  async getMaintenanceSchedule(id: number): Promise<MaintenanceSchedule | undefined> {
    try {
      const [schedule] = await db.select().from(maintenanceSchedules).where(eq(maintenanceSchedules.id, id));
      return schedule;
    } catch (error) {
      console.error("Error fetching maintenance schedule from database:", error);
      return mockMaintenanceSchedules.find(ms => ms.id === id) as any;
    }
  }

  async createMaintenanceSchedule(schedule: InsertMaintenanceSchedule): Promise<MaintenanceSchedule> {
    try {
      const [newSchedule] = await db.insert(maintenanceSchedules).values(schedule).returning();
      return newSchedule;
    } catch (error) {
      console.error("Error creating maintenance schedule in database:", error);
      throw error;
    }
  }

  async updateMaintenanceSchedule(id: number, schedule: Partial<InsertMaintenanceSchedule>): Promise<MaintenanceSchedule> {
    try {
      const [updatedSchedule] = await db
        .update(maintenanceSchedules)
        .set({ ...schedule, updatedAt: new Date() })
        .where(eq(maintenanceSchedules.id, id))
        .returning();
      return updatedSchedule;
    } catch (error) {
      console.error("Error updating maintenance schedule in database:", error);
      throw error;
    }
  }

  async deleteMaintenanceSchedule(id: number): Promise<void> {
    try {
      await db.delete(maintenanceSchedules).where(eq(maintenanceSchedules.id, id));
    } catch (error) {
      console.error("Error deleting maintenance schedule from database:", error);
      throw error;
    }
  }

  async getUpcomingMaintenance(): Promise<MaintenanceSchedule[]> {
    try {
      const today = new Date();
      const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
      return await db
        .select()
        .from(maintenanceSchedules)
        .where(
          and(
            eq(maintenanceSchedules.isActive, true),
            sql`${maintenanceSchedules.nextDue} <= ${thirtyDaysFromNow.toISOString()}`
          )
        )
        .orderBy(asc(maintenanceSchedules.nextDue));
    } catch (error) {
      console.error("Error fetching upcoming maintenance from database, using mock data:", error);
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      return mockMaintenanceSchedules.filter(ms => 
        ms.isActive && new Date(ms.nextDue) < thirtyDaysFromNow
      ) as any[];
    }
  }

  // Inventory operations
  async getInventoryItems(): Promise<InventoryItem[]> {
    try {
      return await db.select().from(inventoryItems).orderBy(asc(inventoryItems.name));
    } catch (error) {
      console.error("Error fetching inventory items from database, using mock data:", error);
      return mockInventory as any[];
    }
  }

  async getInventoryItem(id: number): Promise<InventoryItem | undefined> {
    try {
      const [item] = await db.select().from(inventoryItems).where(eq(inventoryItems.id, id));
      return item;
    } catch (error) {
      console.error("Error fetching inventory item from database:", error);
      return mockInventory.find(item => item.id === id) as any;
    }
  }

  async createInventoryItem(item: InsertInventoryItem): Promise<InventoryItem> {
    try {
      const [newItem] = await db.insert(inventoryItems).values(item).returning();
      return newItem;
    } catch (error) {
      console.error("Error creating inventory item in database:", error);
      throw error;
    }
  }

  async updateInventoryItem(id: number, item: Partial<InsertInventoryItem>): Promise<InventoryItem> {
    try {
      const [updatedItem] = await db
        .update(inventoryItems)
        .set({ ...item, updatedAt: new Date() })
        .where(eq(inventoryItems.id, id))
        .returning();
      return updatedItem;
    } catch (error) {
      console.error("Error updating inventory item in database:", error);
      throw error;
    }
  }

  async deleteInventoryItem(id: number): Promise<void> {
    try {
      await db.delete(inventoryItems).where(eq(inventoryItems.id, id));
    } catch (error) {
      console.error("Error deleting inventory item from database:", error);
      throw error;
    }
  }

  async getLowStockItems(): Promise<InventoryItem[]> {
    try {
      return await db
        .select()
        .from(inventoryItems)
        .where(sql`${inventoryItems.currentStock} <= ${inventoryItems.minStock}`)
        .orderBy(asc(inventoryItems.currentStock));
    } catch (error) {
      console.error("Error fetching low stock items from database, using mock data:", error);
      return mockInventory.filter(item => item.currentStock <= item.minStock) as any[];
    }
  }

  // Work order parts operations
  async getWorkOrderParts(workOrderId: number): Promise<WorkOrderPart[]> {
    try {
      return await db
        .select()
        .from(workOrderParts)
        .where(eq(workOrderParts.workOrderId, workOrderId));
    } catch (error) {
      console.error("Error fetching work order parts from database:", error);
      return [];
    }
  }

  async addWorkOrderPart(part: InsertWorkOrderPart): Promise<WorkOrderPart> {
    try {
      const [newPart] = await db.insert(workOrderParts).values(part).returning();
      return newPart;
    } catch (error) {
      console.error("Error adding work order part in database:", error);
      throw error;
    }
  }

  async removeWorkOrderPart(id: number): Promise<void> {
    try {
      await db.delete(workOrderParts).where(eq(workOrderParts.id, id));
    } catch (error) {
      console.error("Error removing work order part from database:", error);
      throw error;
    }
  }

  // Dashboard analytics
  async getDashboardStats(): Promise<{
    totalAssets: number;
    activeWorkOrders: number;
    completedWorkOrders: number;
    overdueMaintenance: number;
    lowStockItems: number;
    assetsByStatus: { status: string; count: number }[];
  }> {
    try {
      const [totalAssets] = await db.select({ count: count() }).from(assets);
      const [activeWorkOrders] = await db.select({ count: count() }).from(workOrders).where(eq(workOrders.status, 'in-progress'));
      const [completedWorkOrders] = await db.select({ count: count() }).from(workOrders).where(eq(workOrders.status, 'completed'));
      const [lowStockItems] = await db.select({ count: count() }).from(inventoryItems).where(sql`${inventoryItems.currentStock} <= ${inventoryItems.minStock}`);
      
      const assetsByStatus = await db
        .select({ status: assets.status, count: count() })
        .from(assets)
        .groupBy(assets.status);

      return {
        totalAssets: totalAssets.count,
        activeWorkOrders: activeWorkOrders.count,
        completedWorkOrders: completedWorkOrders.count,
        overdueMaintenance: 0, // Calculate based on maintenance schedules
        lowStockItems: lowStockItems.count,
        assetsByStatus: assetsByStatus.map(row => ({ status: row.status, count: row.count }))
      };
    } catch (error) {
      console.error("Error fetching dashboard stats from database, using mock data:", error);
      return {
        totalAssets: mockAssets.length,
        activeWorkOrders: mockWorkOrders.filter(wo => wo.status === 'in-progress').length,
        completedWorkOrders: mockWorkOrders.filter(wo => wo.status === 'completed').length,
        overdueMaintenance: mockMaintenanceSchedules.filter(ms => 
          ms.status === 'active' && new Date(ms.nextDue) < new Date()
        ).length,
        lowStockItems: mockInventory.filter(item => item.currentStock <= item.minStock).length,
        assetsByStatus: [
          { status: 'operational', count: mockAssets.filter(a => a.status === 'operational').length },
          { status: 'maintenance', count: mockAssets.filter(a => a.status === 'maintenance').length },
          { status: 'down', count: mockAssets.filter(a => a.status === 'down').length }
        ]
      };
    }
  }
}

export const storage = new DatabaseStorage();
