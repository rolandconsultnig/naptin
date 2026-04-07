-- Migration to fix database schema mismatches
-- Add missing columns to match the Drizzle schema

-- Add user_id column to assets table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'assets' AND column_name = 'user_id'
    ) THEN
        ALTER TABLE assets ADD COLUMN user_id VARCHAR;
    END IF;
END $$;

-- Add cost column to work_orders table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'work_orders' AND column_name = 'cost'
    ) THEN
        ALTER TABLE work_orders ADD COLUMN cost DECIMAL(10,2);
    END IF;
END $$;

-- Add asset_id column to assets table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'assets' AND column_name = 'asset_id'
    ) THEN
        ALTER TABLE assets ADD COLUMN asset_id VARCHAR UNIQUE NOT NULL DEFAULT 'AST-' || nextval('assets_id_seq');
    END IF;
END $$;

-- Add work_order_id column to work_orders table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'work_orders' AND column_name = 'work_order_id'
    ) THEN
        ALTER TABLE work_orders ADD COLUMN work_order_id VARCHAR UNIQUE NOT NULL DEFAULT 'WO-' || nextval('work_orders_id_seq');
    END IF;
END $$;

-- Update existing records to have proper IDs if they don't have them
UPDATE assets SET asset_id = 'AST-' || LPAD(id::text, 4, '0') WHERE asset_id IS NULL OR asset_id = 'AST-' || nextval('assets_id_seq');
UPDATE work_orders SET work_order_id = 'WO-' || LPAD(id::text, 4, '0') WHERE work_order_id IS NULL OR work_order_id = 'WO-' || nextval('work_orders_id_seq'); 