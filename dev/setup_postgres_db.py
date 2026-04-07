#!/usr/bin/env python3
"""
Setup PostgreSQL database for Owl-talk
"""
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

# Database configuration
DB_NAME = "owltalkdb"
DB_USER = "postgres"
DB_PASSWORD = "Samolan123"
DB_HOST = "localhost"
DB_PORT = "5432"

def create_database():
    """Create the PostgreSQL database"""
    try:
        # Connect to PostgreSQL (default database 'postgres')
        conn = psycopg2.connect(
            host=DB_HOST,
            port=DB_PORT,
            user=DB_USER,
            password=DB_PASSWORD,
            database="postgres"
        )
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        
        cursor = conn.cursor()
        
        # Check if database exists
        cursor.execute(f"SELECT 1 FROM pg_catalog.pg_database WHERE datname = '{DB_NAME}'")
        exists = cursor.fetchone()
        
        if exists:
            print(f"✅ Database '{DB_NAME}' already exists")
        else:
            # Create database
            cursor.execute(f"CREATE DATABASE {DB_NAME}")
            print(f"✅ Database '{DB_NAME}' created successfully")
        
        cursor.close()
        conn.close()
        print(f"✅ Database setup complete!")
        print(f"   Database: {DB_NAME}")
        print(f"   User: {DB_USER}")
        print(f"   Host: {DB_HOST}:{DB_PORT}")
        
        return True
    except psycopg2.Error as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    create_database()

