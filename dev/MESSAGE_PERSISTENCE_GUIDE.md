# Message Persistence & LDAP Authentication Guide

## 📦 Message Persistence

### Overview
All messages, files, voice notes, and video messages are **automatically stored in the database** and persist across devices and sessions. Users can log in from any device and access their complete message history.

### How It Works

1. **Message Storage**
   - All messages (text, images, files, voice notes, videos) are stored in the `Message` table
   - Each message includes:
     - Content (text or reference to file)
     - File path, name, and size for attachments
     - Message type (text, image, file, voice)
     - Timestamp
     - Sender and receiver IDs

2. **File Attachments**
   - Files are stored in the `uploads/` directory
   - File paths are stored in the database
   - File URLs are generated automatically: `/api/uploads/{filename}`
   - All media types are supported:
     - Images (JPG, PNG, GIF, etc.)
     - Videos (MP4, AVI, etc.)
     - Documents (PDF, DOCX, etc.)
     - Voice notes (M4A, MP3, WAV, etc.)

3. **Cross-Device Synchronization**
   - When a user logs in, ALL their messages load from the database
   - Message history is synchronized automatically
   - Files are accessible from any device
   - Profile pictures and media gallery sync across devices

### Database Schema

```sql
Message Table:
- id: Primary key
- sender_id: Foreign key to User
- receiver_id: Foreign key to User
- content: Message content (text or null for file messages)
- message_type: text, image, file, voice
- timestamp: Message timestamp
- is_read: Read status
- is_deleted: Soft delete flag
- file_path: Path to file (e.g., "uploads/messages/abc123.jpg")
- file_name: Original filename
- file_size: File size in bytes
```

### API Endpoints

- `GET /api/messages/:user_id` - Get all messages between current user and target user
  - Returns ALL messages from database (excludes soft-deleted messages)
  - Includes file URLs for attachments
  - Ordered by timestamp

### Features

✅ **Automatic Persistence** - All messages saved to database immediately
✅ **File Support** - Images, videos, documents, voice notes
✅ **Cross-Device** - Access from any device on the network
✅ **Full History** - Complete message history loads on login
✅ **Media Playback** - File URLs generated for media playback
✅ **Soft Delete** - Messages marked as deleted, not removed

---

## 🔐 LDAP/Active Directory Authentication

### Overview
LDAP/Active Directory integration allows users to authenticate using their corporate credentials instead of creating separate accounts.

### Installation

The `ldap3` module is already installed. If you need to reinstall:

```bash
pip install ldap3==2.9.1
```

### Configuration

Set these environment variables or configure in the Admin Panel:

```bash
# LDAP Server Configuration
export LDAP_SERVER="ldap://your-domain.com"  # or IP address
export LDAP_PORT="389"                       # 389 for LDAP, 636 for LDAPS
export LDAP_BASE_DN="DC=example,DC=com"
export LDAP_BIND_DN_TEMPLATE="CN={username},CN=Users,DC=example,DC=com"
```

### API Endpoints

#### 1. Get LDAP Configuration
```http
GET /api/admin/ldap/config
Authorization: Required (Admin)
```
Returns current LDAP configuration.

#### 2. Set LDAP Configuration
```http
POST /api/admin/ldap/config
Content-Type: application/json

{
  "enabled": true,
  "server": "ldap://your-domain.com",
  "port": 389,
  "base_dn": "DC=example,DC=com",
  "bind_dn": "CN=admin,CN=Users,DC=example,DC=com",
  "bind_password": "password",
  "user_search_filter": "(sAMAccountName={username})",
  "user_dn_template": "CN={username},{base_dn}"
}
```

#### 3. Test LDAP Connection
```http
POST /api/admin/ldap/test
Content-Type: application/json

{
  "server": "ldap://your-domain.com",
  "port": 389,
  "bind_dn": "CN=admin,CN=Users,DC=example,DC=com",
  "bind_password": "password",
  "base_dn": "DC=example,DC=com"
}
```

Returns:
```json
{
  "success": true,
  "message": "LDAP connection successful"
}
```

#### 4. LDAP Authentication
```http
POST /api/admin/ldap/auth
Content-Type: application/json

{
  "username": "username",
  "password": "password"
}
```

Returns:
```json
{
  "success": true,
  "message": "LDAP authentication successful",
  "user": {
    "id": 1,
    "username": "username",
    "email": "username@domain.local",
    ...
  }
}
```

### LDAP Bind Templates

Common LDAP bind DN templates:

**Active Directory:**
```
CN={username},CN=Users,DC=example,DC=com
```

**OpenLDAP:**
```
uid={username},ou=people,dc=example,dc=com
```

**Generic:**
```
CN={username},{base_dn}
```

### Usage

1. **Configure LDAP** - Set up your LDAP server details in the Admin Panel
2. **Test Connection** - Use the test endpoint to verify LDAP connectivity
3. **Enable LDAP** - Set `enabled: true` in the configuration
4. **Authenticate** - Users can now log in using their LDAP credentials

### LDAP Integration Features

✅ **Enterprise Authentication** - Use corporate credentials
✅ **Automatic User Creation** - Users auto-created on first LDAP login
✅ **Status Sync** - User status synced to database
✅ **Test Connection** - Verify LDAP connection before enabling
✅ **Flexible Configuration** - Supports Active Directory, OpenLDAP, etc.

---

## 🚀 Usage Examples

### Example 1: User logs in from different device

1. User sends messages from Device A (Laptop)
2. User logs out
3. User logs in from Device B (Mobile)
4. **Result:** All messages from Device A are visible and accessible

### Example 2: Voice message playback

1. User sends voice message from mobile
2. File stored in `uploads/messages/voice_123.m4a`
3. Database stores path and metadata
4. User accesses from any device
5. **Result:** Voice message plays with file URL: `/api/uploads/messages/voice_123.m4a`

### Example 3: File sharing across devices

1. User uploads PDF from Desktop
2. Sends to another user
3. Receiver downloads on Mobile
4. **Result:** File accessible via database-recorded path

### Example 4: LDAP authentication

1. Admin configures LDAP in Admin Panel
2. Sets server, port, base DN
3. Tests connection - success
4. User logs in with domain credentials
5. **Result:** User authenticated via LDAP and logged in

---

## 📋 Checklist

### Message Persistence
- [x] Messages stored in database
- [x] Files stored in uploads directory
- [x] File paths in database
- [x] File URLs generated
- [x] All message types supported
- [x] Cross-device synchronization
- [x] Soft delete support

### LDAP Integration
- [x] LDAP module installed
- [x] Configuration endpoints
- [x] Test connection endpoint
- [x] Authentication endpoint
- [x] Environment variable support
- [x] Active Directory compatible
- [x] Auto user creation

---

## 🔧 Troubleshooting

### Messages not loading

1. Check database connection
2. Verify message records exist: `SELECT * FROM message WHERE sender_id = ?`
3. Check file paths in database
4. Verify file serving route is active

### LDAP connection fails

1. Verify server address and port
2. Check firewall rules
3. Test with `telnet` or `ldapsearch`
4. Verify bind DN format
5. Check LDAP server logs

### Files not accessible

1. Check `uploads/` directory permissions
2. Verify file paths in database
3. Check `/api/uploads/` route is working
4. Verify CORS settings

---

## 📝 Notes

- **Database-driven**: All data is stored in database, not in memory
- **Persistent**: Data survives server restarts
- **Scalable**: Can handle multiple devices per user
- **Secure**: LDAP authentication supported
- **Enterprise-ready**: Active Directory integration

