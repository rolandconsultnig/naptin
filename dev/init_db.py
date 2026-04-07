#!/usr/bin/env python3
"""
Initialize Owl-talk database with schema and data
"""
import sys
import os

# Add the project root to the path
sys.path.insert(0, os.path.dirname(__file__))

from main import app, db
from src.models.user import User, Message, Group, GroupMember, Call, Meeting, MeetingParticipant
from werkzeug.security import generate_password_hash

def init_database():
    """Initialize database with tables and default data"""
    with app.app_context():
        try:
            # Check if tables exist
            from sqlalchemy import inspect
            inspector = inspect(db.engine)
            existing_tables = inspector.get_table_names()
            
            if existing_tables:
                print("✅ Database tables already exist - preserving user data")
                print(f"📊 Found {len(existing_tables)} existing tables")
            else:
                print("📦 Creating database tables...")
                db.create_all()
                print("✅ Tables created successfully")
            
            # Create default users
            print("\n👤 Creating default users...")
            
            # Check if admin already exists
            admin = User.query.filter_by(username='admin').first()
            if not admin:
                admin = User(
                    username='admin',
                    email='admin@owltalk.com',
                    password_hash=generate_password_hash('admin123'),
                    is_admin=True,
                    show_online_status=True,
                    show_last_seen=True,
                    allow_group_invites=True,
                    allow_direct_messages=True,
                    notifications_enabled=True,
                    sound_notifications=True
                )
                db.session.add(admin)
                db.session.commit()
                print("   ✅ Admin user created")
            else:
                print("   ℹ️ Admin user already exists")
            
            # Check if test user exists
            testuser = User.query.filter_by(username='testuser').first()
            if not testuser:
                testuser = User(
                    username='testuser',
                    email='test@owltalk.com',
                    password_hash=generate_password_hash('password123'),
                    show_online_status=True,
                    show_last_seen=True,
                    allow_group_invites=True,
                    allow_direct_messages=True,
                    notifications_enabled=True,
                    sound_notifications=True
                )
                db.session.add(testuser)
                db.session.commit()
                print("   ✅ Test user created")
            else:
                print("   ℹ️ Test user already exists")
            
            print("\n✅ Database initialization complete!")
            print("   Admin credentials:")
            print("   Username: admin")
            print("   Password: admin123")
            print("   Test user:")
            print("   Username: testuser")
            print("   Password: password123")
            
            return True
            
        except Exception as e:
            print(f"\n❌ Error initializing database: {e}")
            import traceback
            traceback.print_exc()
            return False

if __name__ == "__main__":
    init_database()
