import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL);

async function fixDatabaseColumns() {
  try {
    console.log('Adding missing database columns...');

    // Add user_id column to assets table if it doesn't exist
    try {
      await sql`
        ALTER TABLE assets 
        ADD COLUMN IF NOT EXISTS user_id VARCHAR(255)
      `;
      console.log('✓ Added user_id column to assets table');
    } catch (error) {
      console.log('user_id column already exists or error:', error.message);
    }

    // Add cost column to work_orders table if it doesn't exist
    try {
      await sql`
        ALTER TABLE work_orders 
        ADD COLUMN IF NOT EXISTS cost DECIMAL(10,2) DEFAULT 0.00
      `;
      console.log('✓ Added cost column to work_orders table');
    } catch (error) {
      console.log('cost column already exists or error:', error.message);
    }

    // Add asset_id column to assets table if it doesn't exist
    try {
      await sql`
        ALTER TABLE assets 
        ADD COLUMN IF NOT EXISTS asset_id VARCHAR(255)
      `;
      console.log('✓ Added asset_id column to assets table');
    } catch (error) {
      console.log('asset_id column already exists or error:', error.message);
    }

    console.log('Database columns fixed successfully!');
  } catch (error) {
    console.error('Error fixing database columns:', error);
  } finally {
    await sql.end();
  }
}

fixDatabaseColumns(); 