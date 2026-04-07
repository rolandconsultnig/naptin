#!/usr/bin/env python3
"""
Setup PostgreSQL database for Owl-talk
"""
import sys
import os
from pathlib import Path

# Try to import psycopg2
try:
    import psycopg2
    from psycopg2 import sql
except ImportError:
    print("Installing psycopg2...")
    os.system(f"{sys.executable} -m pip install psycopg2-binary")
    import psycopg2
    from psycopg2 import sql

def setup_database(password):
    """Create database and user"""
    try:
        # Connection parameters
        conn_params = {
            'host': 'localhost',
            'port': '5432',
            'user': 'postgres',
            'password': password,
            'database': 'postgres'  # Connect to default database first
        }
        
        print(f"Connecting to PostgreSQL...")
        
        # Connect to PostgreSQL
        conn = psycopg2.connect(**conn_params)
        conn.autocommit = True
        cursor = conn.cursor()
        
        # Create database if it doesn't exist
        try:
            cursor.execute("CREATE DATABASE owltalkdb")
            print("[OK] Database 'owltalkdb' created")
        except psycopg2.errors.DuplicateDatabase:
            print("[OK] Database 'owltalkdb' already exists")
        
        conn.close()
        
        # Now connect to the new database and set up schema
        conn_params['database'] = 'owltalkdb'
        conn = psycopg2.connect(**conn_params)
        cursor = conn.cursor()
        
        # Run schema initialization
        print("Initializing database schema...")
        from src.models.user import db
        from main import app
        
        with app.app_context():
            db.create_all()
        
        print("[OK] Database schema created")
        
        # Create admin user if it doesn't exist
        print("Creating admin user...")
        from src.models.user import User
        
        with app.app_context():
            admin = User.query.filter_by(username='admin').first()
            if not admin:
                admin = User(
                    username='admin',
                    email='admin@owltalk.com',
                    is_admin=True
                )
                admin.set_password('admin123')
                db.session.add(admin)
                db.session.commit()
                print("[OK] Admin user created (username: admin, password: admin123)")
            else:
                print("[OK] Admin user already exists")
        
        cursor.close()
        conn.close()
        
        print("\n✅ Database setup complete!")
        return True
        
    except Exception as e:
        print(f"\n❌ Error setting up database: {e}")
        print("\nPlease ensure:")
        print("  1. PostgreSQL is running")
        print("  2. Password is correct")
        print("  3. PostgreSQL is accessible on localhost:5432")
        return False

if __name__ == '__main__':
    if len(sys.argv) > 1:
        password = sys.argv[1]
    else:
        password = 'Samolan123'  # Default password
    
    success = setup_database(password)
    sys.exit(0 if success else 1)

