import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from "@shared/schema";

// Primary database (local)
const PRIMARY_DATABASE_URL = process.env['DATABASE_URL'] || "postgres://postgres:Samolan123@localhost:5456/nnpcres_db";

// Secondary database (Neon)
const SECONDARY_DATABASE_URL = process.env['NEON_DATABASE_URL'] || "postgresql://neondb_owner:npg_CFiJSD8t3HEO@ep-hidden-cell-a2yu7tbe-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

// Create primary database connection
export const primaryClient = postgres(PRIMARY_DATABASE_URL, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
});

// Create secondary database connection
export const secondaryClient = postgres(SECONDARY_DATABASE_URL, {
  max: 5,
  idle_timeout: 20,
  connect_timeout: 10,
  ssl: 'require'
});

// Primary database instance
export const primaryDb = drizzle(primaryClient, { schema });

// Secondary database instance
export const secondaryDb = drizzle(secondaryClient, { schema });

// Default database (primary)
export const db = primaryDb;

// Database manager for handling dual database operations
export class DatabaseManager {
  private static instance: DatabaseManager;
  
  private constructor() {}
  
  static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  // Test connections
  async testConnections() {
    try {
      // Test primary connection
      await primaryClient`SELECT 1`;
      console.log('✅ Primary database connection successful');
      
      // Test secondary connection
      await secondaryClient`SELECT 1`;
      console.log('✅ Secondary database (Neon) connection successful');
      
      return { primary: true, secondary: true };
    } catch (error) {
      console.error('❌ Database connection test failed:', error);
      return { primary: false, secondary: false };
    }
  }

  // Sync data between databases
  async syncData(tableName: string) {
    try {
      console.log(`🔄 Syncing data for table: ${tableName}`);
      
      // Get data from primary
      const primaryData = await primaryDb.select().from(schema[tableName as keyof typeof schema] as any);
      
      // Insert/update in secondary
      if (primaryData.length > 0) {
        await secondaryDb.insert(schema[tableName as keyof typeof schema] as any).values(primaryData);
        console.log(`✅ Synced ${primaryData.length} records to secondary database`);
      }
      
      return { success: true, count: primaryData.length };
    } catch (error) {
      console.error(`❌ Sync failed for ${tableName}:`, error);
      return { success: false, error };
    }
  }

  // Get database status
  async getStatus() {
    const connections = await this.testConnections();
    return {
      primary: {
        url: PRIMARY_DATABASE_URL.replace(/\/\/.*@/, '//***:***@'),
        connected: connections.primary
      },
      secondary: {
        url: SECONDARY_DATABASE_URL.replace(/\/\/.*@/, '//***:***@'),
        connected: connections.secondary
      }
    };
  }
}

// Export database manager instance
export const dbManager = DatabaseManager.getInstance();