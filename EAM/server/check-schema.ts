import { db } from "./db";
import { sql } from "drizzle-orm";

async function checkSchema() {
  try {
    console.log("Checking database schema...");
    
    // Check if tables exist
    const tables = await db.execute(sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log("\n=== EXISTING TABLES ===");
    console.log(tables);
    
    // Check assets table if it exists
    const assetsColumns = await db.execute(sql`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'assets' AND table_schema = 'public'
      ORDER BY ordinal_position
    `);
    
    console.log("\n=== ASSETS TABLE COLUMNS ===");
    console.log(assetsColumns);
    
    // Check work_orders table if it exists
    const workOrdersColumns = await db.execute(sql`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'work_orders' AND table_schema = 'public'
      ORDER BY ordinal_position
    `);
    
    console.log("\n=== WORK_ORDERS TABLE COLUMNS ===");
    console.log(workOrdersColumns);
    
    // Check maintenance_schedules table if it exists
    const maintenanceColumns = await db.execute(sql`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'maintenance_schedules' AND table_schema = 'public'
      ORDER BY ordinal_position
    `);
    
    console.log("\n=== MAINTENANCE_SCHEDULES TABLE COLUMNS ===");
    console.log(maintenanceColumns);
    
    // Check inventory_items table if it exists
    const inventoryColumns = await db.execute(sql`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'inventory_items' AND table_schema = 'public'
      ORDER BY ordinal_position
    `);
    
    console.log("\n=== INVENTORY_ITEMS TABLE COLUMNS ===");
    console.log(inventoryColumns);
    
  } catch (error) {
    console.error("Error checking schema:", error);
  }
}

checkSchema(); 