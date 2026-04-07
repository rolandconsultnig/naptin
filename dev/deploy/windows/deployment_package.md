# Owl-talk Windows Deployment Package

## 📦 What's Included

This deployment package includes:

1. **install.bat** - Automated installation script
2. **start-server.bat** - Server startup script
3. **setup_database.py** - Database setup automation
4. **setup_https.bat** - SSL certificate generation
5. **create_service.bat** - Windows service creation
6. **UNINSTALL.bat** - Complete removal script
7. **README.md** - Detailed documentation
8. **INSTALL_INSTRUCTIONS.txt** - User-friendly instructions

## 🚀 Quick Installation

1. Run `install.bat` as Administrator
2. Install prerequisites if prompted:
   - Python 3.8+
   - Node.js 16+
   - PostgreSQL 12+
3. Enter PostgreSQL password when prompted
4. Wait for installation to complete
5. Run `start-server.bat` to start the server
6. Access at: http://localhost:3000

## 🎯 Features

### Automated Installation
- ✅ Python virtual environment creation
- ✅ Automatic dependency installation
- ✅ Database setup and initialization
- ✅ SSL certificate generation
- ✅ Admin user creation

### Windows Service Support
- ✅ Install as Windows service
- ✅ Auto-start on boot
- ✅ Background operation
- ✅ Service management

### Easy Management
- ✅ Simple start/stop scripts
- ✅ Complete uninstaller
- ✅ Configuration management
- ✅ Troubleshooting guides

## 📋 System Requirements

### Minimum Requirements
- **OS:** Windows 10 or later
- **RAM:** 2GB
- **Disk Space:** 500MB
- **Network:** Internet connection (for initial setup)

### Prerequisites
- **Python 3.8+**
- **Node.js 16+**
- **PostgreSQL 12+**

## 🔧 Configuration

### Default Settings
- Backend Port: 5117 (HTTPS)
- Frontend Port: 3000 (HTTP)
- Database: PostgreSQL (localhost:5432)
- Default Username: admin
- Default Password: admin123

### Customization
Edit these files to change configuration:
- `main.py` - Backend settings
- `frontend/vite.config.js` - Frontend settings
- `start-server.bat` - Server startup options

## 📚 Documentation

- **README.md** - Complete installation guide
- **INSTALL_INSTRUCTIONS.txt** - Quick start guide
- **deployment_package.md** - This file

## 🎓 Usage

### Basic Usage
```cmd
# Install
install.bat

# Start server
start-server.bat

# Stop server
Ctrl+C in the console
```

### Windows Service Usage
```cmd
# Install service
create_service.bat

# Start service
net start "Owl-talk"

# Stop service
net stop "Owl-talk"

# View service status
services.msc
```

### Uninstall
```cmd
# Run uninstaller
UNINSTALL.bat

# Manual database cleanup (if needed)
psql -U postgres -c "DROP DATABASE owltalkdb;"
```

## 🛠️ Troubleshooting

### Common Issues

1. **"Python not found"**
   - Install Python from python.org
   - Check "Add to PATH" during installation

2. **"Module not found"**
   - Run: `venv\Scripts\activate`
   - Run: `pip install -r requirements.txt`

3. **"Database connection failed"**
   - Check PostgreSQL service is running
   - Verify password in main.py
   - Check PostgreSQL is on localhost:5432

4. **"Port already in use"**
   - Stop other applications using ports 3000/5117
   - Change ports in configuration files

## 📞 Support

For additional help:
1. Check the main project README
2. Review error logs
3. Check PostgreSQL and Python installation

## ✅ Verification

After installation, verify everything works:

```cmd
# Check backend
curl https://localhost:5117/health

# Check frontend
Start browser: http://localhost:3000

# Check database
psql -U postgres -d owltalkdb -c "SELECT COUNT(*) FROM user;"
```

## 🎉 Success!

Once installed, you have:
- ✅ Full Owl-talk server running
- ✅ PostgreSQL database configured
- ✅ HTTPS/SSL enabled
- ✅ Admin user created
- ✅ Network access enabled
- ✅ All features working

Enjoy using Owl-talk! 🦉

