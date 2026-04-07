import { db } from "./db";
import { sql } from "drizzle-orm";
import bcrypt from "bcryptjs";

async function migrateDatabase() {
  try {
    console.log("Starting database migration...");

    // Create admin user if it doesn't exist
    try {
      const userCount = await db.execute(sql`SELECT COUNT(*) FROM users WHERE username = 'admin'`);
      if (userCount[0]?.['count'] === '0') {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash('admin123', saltRounds);
        
        await db.execute(sql`
          INSERT INTO users (id, username, password, email, first_name, last_name, role, created_at, updated_at)
          VALUES ('1752146292132', 'admin', ${hashedPassword}, 'admin@nnpc.com', 'System', 'Administrator', 'admin', NOW(), NOW())
        `);
        console.log("✓ Created admin user (admin/admin123)");
      } else {
        console.log("✓ Admin user already exists");
      }
    } catch (error) {
      console.log("Admin user creation error:", error);
    }

    // Add missing columns to assets table
    try {
      await db.execute(sql`
        ALTER TABLE assets 
        ADD COLUMN IF NOT EXISTS user_id VARCHAR REFERENCES users(id),
        ADD COLUMN IF NOT EXISTS asset_id VARCHAR UNIQUE NOT NULL DEFAULT 'AST-0001'
      `);
      console.log("✓ Added user_id and asset_id columns to assets table");
    } catch (error) {
      console.log("Assets table columns already exist or error:", error);
    }

    // Add missing columns to work_orders table
    try {
      await db.execute(sql`
        ALTER TABLE work_orders 
        ADD COLUMN IF NOT EXISTS cost DECIMAL(10,2),
        ADD COLUMN IF NOT EXISTS work_order_id VARCHAR UNIQUE NOT NULL DEFAULT 'WO-2024-001'
      `);
      console.log("✓ Added cost and work_order_id columns to work_orders table");
    } catch (error) {
      console.log("Work orders table columns already exist or error:", error);
    }

    // Add missing columns to maintenance_schedules table
    try {
      await db.execute(sql`
        ALTER TABLE maintenance_schedules 
        ADD COLUMN IF NOT EXISTS assigned_to VARCHAR REFERENCES users(id)
      `);
      console.log("✓ Added assigned_to column to maintenance_schedules table");
    } catch (error) {
      console.log("Maintenance schedules table column already exists or error:", error);
    }

    // Add missing columns to inventory_items table
    try {
      await db.execute(sql`
        ALTER TABLE inventory_items 
        ADD COLUMN IF NOT EXISTS part_number VARCHAR UNIQUE NOT NULL DEFAULT 'PART-001',
        ADD COLUMN IF NOT EXISTS current_stock INTEGER DEFAULT 0,
        ADD COLUMN IF NOT EXISTS min_stock INTEGER DEFAULT 0
      `);
      console.log("✓ Added missing columns to inventory_items table");
    } catch (error) {
      console.log("Inventory items table columns already exist or error:", error);
    }

    // Create work_order_parts table if it doesn't exist
    try {
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS work_order_parts (
          id SERIAL PRIMARY KEY,
          work_order_id INTEGER REFERENCES work_orders(id) NOT NULL,
          inventory_item_id INTEGER REFERENCES inventory_items(id) NOT NULL,
          quantity_used INTEGER NOT NULL,
          unit_cost DECIMAL(10,2),
          created_at TIMESTAMP DEFAULT NOW()
        )
      `);
      console.log("✓ Created work_order_parts table");
    } catch (error) {
      console.log("Work order parts table already exists or error:", error);
    }

    // Insert sample data if tables are empty
    const assetCount = await db.execute(sql`SELECT COUNT(*) FROM assets`);
    if (assetCount[0]?.['count'] === '0') {
      await db.execute(sql`
        INSERT INTO assets (asset_id, name, description, type, category, manufacturer, model, serial_number, location, status, criticality, purchase_date, acquisition_cost, warranty_expiry, user_id, created_at, updated_at)
        VALUES 
        ('AST-0001', 'Port Harcourt Refinery Unit 1', 'Main distillation unit for crude oil processing', 'Equipment', 'Refinery', 'Siemens', 'S7-1500', 'SN-001', 'Port Harcourt', 'operational', 'high', '2020-01-15', 5000000.00, '2025-01-15', '1752146292132', NOW(), NOW()),
        ('AST-0002', 'Warri Refinery Compressor', 'High-pressure gas compressor', 'Equipment', 'Compressor', 'Atlas Copco', 'GA-110', 'SN-002', 'Warri', 'operational', 'medium', '2019-06-20', 2500000.00, '2024-06-20', '1752146292132', NOW(), NOW()),
        ('AST-0003', 'Kaduna Refinery Pump Station', 'Main pump station for crude oil transfer', 'Equipment', 'Pump', 'Grundfos', 'CR-45', 'SN-003', 'Kaduna', 'maintenance', 'high', '2018-12-10', 1800000.00, '2023-12-10', '1752146292132', NOW(), NOW())
      `);
      console.log("✓ Inserted sample assets");
    }

    const workOrderCount = await db.execute(sql`SELECT COUNT(*) FROM work_orders`);
    if (workOrderCount[0]?.['count'] === '0') {
      await db.execute(sql`
        INSERT INTO work_orders (work_order_id, title, description, asset_id, type, priority, status, assigned_to, requested_by, scheduled_date, due_date, estimated_hours, cost, created_at, updated_at)
        VALUES 
        ('WO-2024-001', 'Preventive Maintenance - Unit 1', 'Routine maintenance for Port Harcourt Refinery Unit 1', 1, 'preventive', 'medium', 'pending', '1752146292132', '1752146292132', '2024-01-15 08:00:00', '2024-01-16 17:00:00', 16.00, 5000.00, NOW(), NOW()),
        ('WO-2024-002', 'Compressor Repair', 'Emergency repair for Warri compressor', 2, 'corrective', 'high', 'in_progress', '1752146292132', '1752146292132', '2024-01-10 06:00:00', '2024-01-12 18:00:00', 24.00, 15000.00, NOW(), NOW()),
        ('WO-2024-003', 'Pump Station Inspection', 'Annual inspection of Kaduna pump station', 3, 'inspection', 'low', 'completed', '1752146292132', '1752146292132', '2024-01-05 09:00:00', '2024-01-05 17:00:00', 8.00, 2000.00, NOW(), NOW())
      `);
      console.log("✓ Inserted sample work orders");
    }

    const inventoryCount = await db.execute(sql`SELECT COUNT(*) FROM inventory_items`);
    if (inventoryCount[0]?.['count'] === '0') {
      await db.execute(sql`
        INSERT INTO inventory_items (part_number, name, description, category, manufacturer, unit_price, current_stock, min_stock, max_stock, location, supplier, lead_time, created_at, updated_at)
        VALUES 
        ('PART-001', 'Oil Filter', 'High-performance oil filter for refinery equipment', 'Filters', 'Fram', 150.00, 50, 10, 100, 'Warehouse A', 'Fram Supplies', 3, NOW(), NOW()),
        ('PART-002', 'Pressure Sensor', 'Digital pressure sensor for monitoring systems', 'Sensors', 'Honeywell', 500.00, 25, 5, 50, 'Warehouse B', 'Honeywell Industrial', 7, NOW(), NOW()),
        ('PART-003', 'Motor Bearing', 'Heavy-duty motor bearing for industrial use', 'Bearings', 'SKF', 800.00, 15, 3, 30, 'Warehouse A', 'SKF Nigeria', 5, NOW(), NOW()),
        ('PART-004', 'Control Valve', 'Precision control valve for process control', 'Valves', 'Fisher', 2500.00, 8, 2, 20, 'Warehouse C', 'Emerson Process', 10, NOW(), NOW()),
        ('PART-005', 'Gasket Set', 'Complete gasket set for pump maintenance', 'Seals', 'Garlock', 300.00, 30, 5, 60, 'Warehouse A', 'Garlock Sealing', 4, NOW(), NOW())
      `);
      console.log("✓ Inserted sample inventory items");
    }

    const maintenanceCount = await db.execute(sql`SELECT COUNT(*) FROM maintenance_schedules`);
    if (maintenanceCount[0]?.['count'] === '0') {
      await db.execute(sql`
        INSERT INTO maintenance_schedules (name, description, asset_id, schedule_type, frequency, frequency_unit, is_active, last_completed, next_due, assigned_to, created_at, updated_at)
        VALUES 
        ('Monthly Oil Change', 'Regular oil change for Unit 1', 1, 'time_based', 30, 'days', true, '2023-12-15 08:00:00', '2024-01-15 08:00:00', '1752146292132', NOW(), NOW()),
        ('Quarterly Inspection', 'Quarterly inspection of compressor', 2, 'time_based', 90, 'days', true, '2023-10-15 09:00:00', '2024-01-15 09:00:00', '1752146292132', NOW(), NOW()),
        ('Annual Overhaul', 'Annual complete overhaul of pump station', 3, 'time_based', 365, 'days', true, '2023-01-10 07:00:00', '2024-01-10 07:00:00', '1752146292132', NOW(), NOW())
      `);
      console.log("✓ Inserted sample maintenance schedules");
    }

    console.log("✅ Database migration completed successfully!");
  } catch (error) {
    console.error("❌ Database migration failed:", error);
    throw error;
  }
}

// Run migration if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateDatabase()
    .then(() => {
      console.log("Migration completed successfully");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Migration failed:", error);
      process.exit(1);
    });
}

export { migrateDatabase }; 