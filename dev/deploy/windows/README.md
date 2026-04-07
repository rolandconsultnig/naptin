# Owl-talk Windows Deployment Package

This package provides automated installation and deployment of Owl-talk on Windows.

## Quick Start

1. **Run the installer:**
   ```
   install.bat
   ```
   (Run as Administrator)

2. **Start the server:**
   ```
   start-server.bat
   ```

## Manual Installation Steps

### Prerequisites

Install the following software:

1. **Python 3.8+**
   - Download: https://www.python.org/downloads/
   - During installation, check "Add Python to PATH"

2. **Node.js 16+**
   - Download: https://nodejs.org/
   - Install LTS version

3. **PostgreSQL 12+**
   - Download: https://www.postgresql.org/download/windows/
   - During installation:
     - Set port to: 5432 (default)
     - Create password for 'postgres' user
     - Default password used by scripts: `Samolan123`

### Installation

1. **Extract Owl-talk** to a folder (e.g., `C:\Owl-talk`)

2. **Run the installer:**
   ```cmd
   cd C:\Owl-talk\deploy\windows
   install.bat
   ```

3. **The installer will:**
   - Create Python virtual environment
   - Install Python dependencies
   - Install Node.js dependencies
   - Create PostgreSQL database
   - Generate SSL certificates
   - Create admin user

4. **Start the server:**
   ```cmd
   start-server.bat
   ```

## Default Credentials

- **Username:** admin
- **Password:** admin123

## Configuration

### Database Connection

Default connection: `postgresql://postgres:Samolan123@localhost:5432/owltalkdb`

To change credentials, edit: `main.py`
```python
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://username:password@localhost:5432/dbname'
```

### Server Ports

- **Backend:** https://localhost:5117
- **Frontend:** http://localhost:3000

To change ports, edit: `main.py` and `frontend/vite.config.js`

## Troubleshooting

### PostgreSQL Connection Failed

1. Check PostgreSQL service is running:
   ```cmd
   services.msc
   ```
   Look for "postgresql-x64-XX" service

2. Check credentials in `main.py`

### Port Already in Use

1. Stop any existing server instances
2. Change ports in configuration files
3. Restart server

### Python Module Errors

```cmd
cd C:\Owl-talk
venv\Scripts\activate
pip install -r requirements.txt
```

### Node Module Errors

```cmd
cd C:\Owl-talk\frontend
npm install
```

## Accessing the Application

### Local Access
- Frontend: http://localhost:3000
- Backend API: https://localhost:5117

### Network Access
Find your LAN IP:
```cmd
ipconfig
```

Access from other devices:
- Frontend: http://YOUR_IP:3000
- Backend: https://YOUR_IP:5117

## Automatic Startup

To start Owl-talk automatically on Windows startup:

1. Create a shortcut to `start-server.bat`
2. Press `Win+R` and type: `shell:startup`
3. Copy the shortcut to the startup folder

## Files Included

- `install.bat` - Main installation script
- `setup_database.py` - Database setup script
- `setup_https.bat` - SSL certificate generation
- `start-server.bat` - Server startup script
- `README.md` - This file

## Support

For issues or questions, refer to the main project documentation.

