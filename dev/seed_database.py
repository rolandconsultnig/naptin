#!/usr/bin/env python3
"""
Seed Owl-talk database with sample data
"""
import sys
import os

# Add the project root to the path
sys.path.insert(0, os.path.dirname(__file__))

from main import app, db
from src.models.user import User, Message, Group, GroupMember, Call, Meeting, MeetingParticipant
from werkzeug.security import generate_password_hash
from datetime import datetime, timedelta

def seed_database():
    """Seed database with sample data"""
    with app.app_context():
        try:
            print("🌱 Seeding database...\n")
            
            # Clear existing data
            print("🗑️  Clearing existing data...")
            MeetingParticipant.query.delete()
            Meeting.query.delete()
            Call.query.delete()
            Message.query.delete()
            GroupMember.query.delete()
            Group.query.delete()
            User.query.delete()
            db.session.commit()
            print("   ✅ Existing data cleared\n")
            
            # Create users
            print("👥 Creating users...")
            users = []
            
            users_data = [
                {"username": "admin", "email": "admin@owltalk.com", "password": "admin123", "is_admin": True},
                {"username": "testuser", "email": "test@owltalk.com", "password": "password123", "is_admin": False},
                {"username": "alice", "email": "alice@owltalk.com", "password": "password123", "is_admin": False},
                {"username": "bob", "email": "bob@owltalk.com", "password": "password123", "is_admin": False},
                {"username": "charlie", "email": "charlie@owltalk.com", "password": "password123", "is_admin": False},
            ]
            
            for user_data in users_data:
                user = User(
                    username=user_data["username"],
                    email=user_data["email"],
                    password_hash=generate_password_hash(user_data["password"]),
                    is_admin=user_data.get("is_admin", False),
                    status="online" if user_data["username"] in ["admin", "alice"] else "offline",
                    show_online_status=True,
                    show_last_seen=True,
                    allow_group_invites=True,
                    allow_direct_messages=True,
                    notifications_enabled=True,
                    sound_notifications=True
                )
                db.session.add(user)
                users.append(user)
            
            db.session.commit()
            print(f"   ✅ Created {len(users)} users\n")
            
            # Create sample groups
            print("👥 Creating groups...")
            groups_data = [
                {"name": "Development Team", "description": "Our awesome dev team", "members": ["admin", "alice", "bob"]},
                {"name": "Marketing", "description": "Marketing department", "members": ["admin", "charlie"]},
            ]
            
            for group_data in groups_data:
                group = Group(
                    name=group_data["name"],
                    description=group_data.get("description"),
                    created_by=next(u for u in users if u.username == group_data["members"][0]).id
                )
                db.session.add(group)
                db.session.commit()
                
                # Add members
                for username in group_data["members"]:
                    member_user = next((u for u in users if u.username == username), None)
                    if member_user:
                        member = GroupMember(
                            group_id=group.id,
                            user_id=member_user.id,
                            role="admin" if username == group_data["members"][0] else "member"
                        )
                        db.session.add(member)
                
                db.session.commit()
                print(f"   ✅ Created group: {group.name} with {len(group_data['members'])} members")
            
            print()
            
            # Create sample messages
            print("💬 Creating sample messages...")
            admin_user = next(u for u in users if u.username == "admin")
            alice_user = next(u for u in users if u.username == "alice")
            bob_user = next(u for u in users if u.username == "bob")
            
            messages = [
                (admin_user.id, alice_user.id, "Hello Alice! 👋"),
                (alice_user.id, admin_user.id, "Hi Admin! How are you?"),
                (admin_user.id, alice_user.id, "Great! Working on Owl-talk."),
                (admin_user.id, bob_user.id, "Hey Bob! 🦉"),
                (bob_user.id, admin_user.id, "Hey! What's up?"),
            ]
            
            for sender_id, receiver_id, content in messages:
                message = Message(
                    sender_id=sender_id,
                    receiver_id=receiver_id,
                    content=content,
                    message_type="text",
                    timestamp=datetime.utcnow() - timedelta(hours=len(messages) - messages.index((sender_id, receiver_id, content)))
                )
                db.session.add(message)
            
            db.session.commit()
            print(f"   ✅ Created {len(messages)} sample messages\n")
            
            # Create sample calls
            print("📞 Creating sample call history...")
            calls = [
                (admin_user.id, alice_user.id, "audio", "ended", 120),
                (alice_user.id, bob_user.id, "video", "ended", 300),
            ]
            
            for caller_id, receiver_id, call_type, status, duration in calls:
                call = Call(
                    caller_id=caller_id,
                    receiver_id=receiver_id,
                    call_type=call_type,
                    status=status,
                    started_at=datetime.utcnow() - timedelta(days=1),
                    ended_at=datetime.utcnow() - timedelta(days=1) + timedelta(seconds=duration),
                    duration=duration
                )
                db.session.add(call)
            
            db.session.commit()
            print(f"   ✅ Created {len(calls)} call history records\n")
            
            # Create sample meetings
            print("🎥 Creating sample meetings...")
            import secrets
            meeting_code = secrets.token_urlsafe(8).upper()[:8]
            
            meeting1 = Meeting(
                title="Team Standup",
                description="Daily standup meeting",
                host_id=admin_user.id,
                meeting_code=meeting_code,
                meeting_type="meeting",
                status="scheduled",
                allow_screen_sharing=True,
                allow_presentation=True
            )
            db.session.add(meeting1)
            db.session.commit()
            
            # Add participants
            for user in [admin_user, alice_user, bob_user]:
                participant = MeetingParticipant(
                    meeting_id=meeting1.id,
                    user_id=user.id,
                    role="host" if user.username == "admin" else "participant"
                )
                db.session.add(participant)
            
            db.session.commit()
            print(f"   ✅ Created meeting: {meeting1.title} (Code: {meeting_code})\n")
            
            print("✅ Database seeding complete!")
            print("\n📊 Summary:")
            print(f"   👥 Users: {len(users)}")
            print(f"   💬 Messages: {len(messages)}")
            print(f"   👥 Groups: {len(groups_data)}")
            print(f"   📞 Calls: {len(calls)}")
            print(f"   🎥 Meetings: 1")
            print("\n🔑 Login Credentials:")
            print("   Admin: admin / admin123")
            print("   Test: testuser / password123")
            print("   Alice: alice / password123")
            print("   Bob: bob / password123")
            print("   Charlie: charlie / password123")
            
            return True
            
        except Exception as e:
            print(f"\n❌ Error seeding database: {e}")
            import traceback
            traceback.print_exc()
            return False

if __name__ == "__main__":
    seed_database()

