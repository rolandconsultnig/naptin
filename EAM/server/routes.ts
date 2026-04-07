import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./auth";
import { dbManager } from "./db";
import {
  insertAssetSchema,
  insertWorkOrderSchema,
  insertMaintenanceScheduleSchema,
  insertInventoryItemSchema,
  insertWorkOrderPartSchema,
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Health check endpoint for Railway
  app.get('/api/health', (req, res) => {
    res.status(200).json({ 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  });

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      // Return user without password
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Dashboard routes
  app.get('/api/dashboard/stats', isAuthenticated, async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Asset routes
  app.get('/api/assets', isAuthenticated, async (req, res) => {
    try {
      const { search } = req.query;
      let assets;
      
      if (search && typeof search === 'string') {
        assets = await storage.searchAssets(search);
      } else {
        assets = await storage.getAssets();
      }
      
      res.json(assets);
    } catch (error) {
      console.error("Error fetching assets:", error);
      res.status(500).json({ message: "Failed to fetch assets" });
    }
  });

  app.get('/api/assets/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const asset = await storage.getAsset(id);
      
      if (!asset) {
        return res.status(404).json({ message: "Asset not found" });
      }
      
      res.json(asset);
    } catch (error) {
      console.error("Error fetching asset:", error);
      res.status(500).json({ message: "Failed to fetch asset" });
    }
  });

  app.post('/api/assets', isAuthenticated, async (req: any, res) => {
    try {
      const validatedData = insertAssetSchema.parse(req.body);
      
      // Generate unique asset ID
      const assetCount = await storage.getAssets();
      const assetId = `AST-${String(assetCount.length + 1).padStart(4, '0')}`;
      
      const asset = await storage.createAsset({
        ...validatedData,
        assetId,
      });
      
      res.status(201).json(asset);
    } catch (error) {
      console.error("Error creating asset:", error);
      res.status(400).json({ message: "Failed to create asset" });
    }
  });

  app.put('/api/assets/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertAssetSchema.partial().parse(req.body);
      
      const asset = await storage.updateAsset(id, validatedData);
      res.json(asset);
    } catch (error) {
      console.error("Error updating asset:", error);
      res.status(400).json({ message: "Failed to update asset" });
    }
  });

  app.delete('/api/assets/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteAsset(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting asset:", error);
      res.status(500).json({ message: "Failed to delete asset" });
    }
  });

  // Work order routes
  app.get('/api/work-orders', isAuthenticated, async (req: any, res) => {
    try {
      const { assetId, userId } = req.query;
      let workOrders;
      
      if (assetId) {
        workOrders = await storage.getWorkOrdersByAsset(parseInt(assetId as string));
      } else if (userId) {
        workOrders = await storage.getWorkOrdersByUser(userId as string);
      } else {
        workOrders = await storage.getWorkOrders();
      }
      
      res.json(workOrders);
    } catch (error) {
      console.error("Error fetching work orders:", error);
      res.status(500).json({ message: "Failed to fetch work orders" });
    }
  });

  app.get('/api/work-orders/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const workOrder = await storage.getWorkOrder(id);
      
      if (!workOrder) {
        return res.status(404).json({ message: "Work order not found" });
      }
      
      res.json(workOrder);
    } catch (error) {
      console.error("Error fetching work order:", error);
      res.status(500).json({ message: "Failed to fetch work order" });
    }
  });

  app.post('/api/work-orders', isAuthenticated, async (req: any, res) => {
    try {
      const validatedData = insertWorkOrderSchema.parse({
        ...req.body,
        requestedBy: req.user.id,
      });
      
      // Generate unique work order ID
      const workOrders = await storage.getWorkOrders();
      const year = new Date().getFullYear();
      const workOrderId = `WO-${year}-${String(workOrders.length + 1).padStart(3, '0')}`;
      
      const workOrder = await storage.createWorkOrder({
        ...validatedData,
        workOrderId,
      });
      
      res.status(201).json(workOrder);
    } catch (error) {
      console.error("Error creating work order:", error);
      res.status(400).json({ message: "Failed to create work order" });
    }
  });

  app.put('/api/work-orders/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertWorkOrderSchema.partial().parse(req.body);
      
      const workOrder = await storage.updateWorkOrder(id, validatedData);
      res.json(workOrder);
    } catch (error) {
      console.error("Error updating work order:", error);
      res.status(400).json({ message: "Failed to update work order" });
    }
  });

  app.delete('/api/work-orders/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteWorkOrder(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting work order:", error);
      res.status(500).json({ message: "Failed to delete work order" });
    }
  });

  // Maintenance schedule routes
  app.get('/api/maintenance-schedules', isAuthenticated, async (req, res) => {
    try {
      const { upcoming } = req.query;
      let schedules;
      
      if (upcoming === 'true') {
        schedules = await storage.getUpcomingMaintenance();
      } else {
        schedules = await storage.getMaintenanceSchedules();
      }
      
      res.json(schedules);
    } catch (error) {
      console.error("Error fetching maintenance schedules:", error);
      res.status(500).json({ message: "Failed to fetch maintenance schedules" });
    }
  });

  app.post('/api/maintenance-schedules', isAuthenticated, async (req: any, res) => {
    try {
      const validatedData = insertMaintenanceScheduleSchema.parse(req.body);
      
      const schedule = await storage.createMaintenanceSchedule(validatedData);
      res.status(201).json(schedule);
    } catch (error) {
      console.error("Error creating maintenance schedule:", error);
      res.status(400).json({ message: "Failed to create maintenance schedule" });
    }
  });

  app.put('/api/maintenance-schedules/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertMaintenanceScheduleSchema.partial().parse(req.body);
      
      const schedule = await storage.updateMaintenanceSchedule(id, validatedData);
      res.json(schedule);
    } catch (error) {
      console.error("Error updating maintenance schedule:", error);
      res.status(400).json({ message: "Failed to update maintenance schedule" });
    }
  });

  app.delete('/api/maintenance-schedules/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteMaintenanceSchedule(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting maintenance schedule:", error);
      res.status(500).json({ message: "Failed to delete maintenance schedule" });
    }
  });

  // Inventory routes
  app.get('/api/inventory', isAuthenticated, async (req, res) => {
    try {
      const { lowStock } = req.query;
      let items;
      
      if (lowStock === 'true') {
        items = await storage.getLowStockItems();
      } else {
        items = await storage.getInventoryItems();
      }
      
      res.json(items);
    } catch (error) {
      console.error("Error fetching inventory items:", error);
      res.status(500).json({ message: "Failed to fetch inventory items" });
    }
  });

  app.post('/api/inventory', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertInventoryItemSchema.parse(req.body);
      
      const item = await storage.createInventoryItem(validatedData);
      res.status(201).json(item);
    } catch (error) {
      console.error("Error creating inventory item:", error);
      res.status(400).json({ message: "Failed to create inventory item" });
    }
  });

  app.put('/api/inventory/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertInventoryItemSchema.partial().parse(req.body);
      
      const item = await storage.updateInventoryItem(id, validatedData);
      res.json(item);
    } catch (error) {
      console.error("Error updating inventory item:", error);
      res.status(400).json({ message: "Failed to update inventory item" });
    }
  });

  app.delete('/api/inventory/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteInventoryItem(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting inventory item:", error);
      res.status(500).json({ message: "Failed to delete inventory item" });
    }
  });

  // Work order parts routes
  app.get('/api/work-orders/:id/parts', isAuthenticated, async (req, res) => {
    try {
      const workOrderId = parseInt(req.params.id);
      const parts = await storage.getWorkOrderParts(workOrderId);
      res.json(parts);
    } catch (error) {
      console.error("Error fetching work order parts:", error);
      res.status(500).json({ message: "Failed to fetch work order parts" });
    }
  });

  app.post('/api/work-orders/:id/parts', isAuthenticated, async (req, res) => {
    try {
      const workOrderId = parseInt(req.params.id);
      const validatedData = insertWorkOrderPartSchema.parse({
        ...req.body,
        workOrderId,
      });
      
      const part = await storage.addWorkOrderPart(validatedData);
      res.status(201).json(part);
    } catch (error) {
      console.error("Error adding work order part:", error);
      res.status(400).json({ message: "Failed to add work order part" });
    }
  });

  // Procurement routes
  app.get('/api/procurement', isAuthenticated, async (req, res) => {
    try {
      // For now, return mock data
      const { mockProcurement } = await import("../client/src/lib/mockData");
      res.json(mockProcurement);
    } catch (error) {
      console.error("Error fetching procurement items:", error);
      res.status(500).json({ message: "Failed to fetch procurement items" });
    }
  });

  // Fleet routes
  app.get('/api/fleet', isAuthenticated, async (req, res) => {
    try {
      // For now, return mock data
      const { mockFleet } = await import("../client/src/lib/mockData");
      res.json(mockFleet);
    } catch (error) {
      console.error("Error fetching fleet vehicles:", error);
      res.status(500).json({ message: "Failed to fetch fleet vehicles" });
    }
  });

  // Calibration routes
  app.get('/api/calibration', isAuthenticated, async (req, res) => {
    try {
      // For now, return mock data
      const { mockCalibration } = await import("../client/src/lib/mockData");
      res.json(mockCalibration);
    } catch (error) {
      console.error("Error fetching calibration records:", error);
      res.status(500).json({ message: "Failed to fetch calibration records" });
    }
  });

  // Energy routes
  app.get('/api/energy', isAuthenticated, async (req, res) => {
    try {
      // For now, return mock data
      const { mockEnergy } = await import("../client/src/lib/mockData");
      res.json(mockEnergy);
    } catch (error) {
      console.error("Error fetching energy records:", error);
      res.status(500).json({ message: "Failed to fetch energy records" });
    }
  });

  // Documents routes
  app.get('/api/documents', isAuthenticated, async (req, res) => {
    try {
      // For now, return mock data
      const { mockDocuments } = await import("../client/src/lib/mockData");
      res.json(mockDocuments);
    } catch (error) {
      console.error("Error fetching documents:", error);
      res.status(500).json({ message: "Failed to fetch documents" });
    }
  });

  // Database management routes
  app.get('/api/database/status', isAuthenticated, async (req, res) => {
    try {
      const status = await dbManager.getStatus();
      res.json(status);
    } catch (error) {
      console.error("Error getting database status:", error);
      res.status(500).json({ message: "Failed to get database status" });
    }
  });

  app.post('/api/database/test-connections', isAuthenticated, async (req, res) => {
    try {
      const connections = await dbManager.testConnections();
      res.json(connections);
    } catch (error) {
      console.error("Error testing database connections:", error);
      res.status(500).json({ message: "Failed to test database connections" });
    }
  });

  app.post('/api/database/sync/:table', isAuthenticated, async (req, res) => {
    try {
      const { table } = req.params;
      const result = await dbManager.syncData(table);
      res.json(result);
    } catch (error) {
      console.error("Error syncing data:", error);
      res.status(500).json({ message: "Failed to sync data" });
    }
  });

  app.post('/api/database/sync-all', isAuthenticated, async (req, res) => {
    try {
      const tables = ['users', 'assets', 'workOrders', 'maintenanceSchedules', 'inventory'];
      const results = [];
      
      for (const table of tables) {
        const result = await dbManager.syncData(table);
        results.push({ table, ...result });
      }
      
      res.json({ 
        message: "Sync completed", 
        results 
      });
    } catch (error) {
      console.error("Error syncing all data:", error);
      res.status(500).json({ message: "Failed to sync all data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
