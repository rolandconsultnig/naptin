#!/bin/bash

echo "🦉 Starting Owl-talk Development Environment"
echo "=========================================="

# Get LAN IP
LAN_IP=$(hostname -I | awk '{print $1}')
echo "📡 LAN IP: $LAN_IP"
echo ""

# Kill any existing processes on required ports
echo "🧹 Cleaning up ports 3000 and 5117..."
lsof -ti:3000 2>/dev/null | xargs kill -9 2>/dev/null || true
lsof -ti:5117 2>/dev/null | xargs kill -9 2>/dev/null || true
sleep 1
echo "✅ Ports cleaned"
echo ""

# Setup HTTPS if certificates don't exist
if [ ! -d "ssl" ] || [ ! -f "ssl/cert.pem" ]; then
    echo "🔐 Setting up HTTPS for network calls..."
    bash setup_https.sh
    echo ""
fi

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "🔧 Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install Python dependencies
echo "📦 Installing Python dependencies..."
pip install -r requirements.txt

# Initialize database
echo "🗄️ Initializing database..."
python init_db.py

# Start Backend Server
echo "🚀 Starting Backend Server..."
python main.py &
BACKEND_PID=$!

# Check if HTTPS is enabled for messaging
if [ -f "ssl/cert.pem" ]; then
    echo "✅ Backend started (PID: $BACKEND_PID) on https://$LAN_IP:5117"
else
    echo "✅ Backend started (PID: $BACKEND_PID) on http://$LAN_IP:5117"
fi
echo ""

# Wait for backend to start
echo "⏳ Waiting for backend to initialize..."
sleep 3

# Test backend
if curl -s -k https://$LAN_IP:5117/health > /dev/null 2>&1 || curl -s http://$LAN_IP:5117/health > /dev/null 2>&1; then
    echo "✅ Backend is responding"
else
    echo "❌ Backend is not responding"
fi
echo ""

# Start Frontend (if frontend directory exists)
if [ -d "frontend" ]; then
    echo "🌐 Starting Frontend..."
    cd frontend
    
    # Install dependencies if node_modules doesn't exist
    if [ ! -d "node_modules" ]; then
        echo "📦 Installing frontend dependencies..."
        npm install
    fi
    
           npm run dev &
           FRONTEND_PID=$!
           
           # Check if HTTPS is enabled
           if [ -f "../ssl/cert.pem" ]; then
               echo "✅ Frontend started (PID: $FRONTEND_PID) on https://$LAN_IP:3000"
           else
               echo "✅ Frontend started (PID: $FRONTEND_PID) on http://$LAN_IP:3000"
           fi
    echo ""
    cd ..
fi

echo "🎉 Owl-talk is running!"
echo "======================"

# Check if HTTPS is enabled
if [ -f "ssl/cert.pem" ]; then
    echo "🔐 HTTPS ENABLED - Network calls will work!"
    echo "🔧 Backend API:    https://$LAN_IP:5117"
    echo "🌐 Frontend:       https://$LAN_IP:3000"
    echo "🛡️ Admin Panel:    https://$LAN_IP:3000/admin"
    echo ""
    echo "📱 Works on LAN, WAN, and Internet like Teams/Zoom!"
    echo "⚠️  Accept self-signed certificate when prompted"
else
    echo "🔧 Backend API:    http://$LAN_IP:5117"
    echo "🌐 Frontend:       http://$LAN_IP:3000"
    echo "🛡️ Admin Panel:    http://$LAN_IP:3000/admin"
    echo ""
    echo "📱 Works on LAN (no SSL)"
fi
echo ""
echo "Press Ctrl+C to stop all services"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping all services..."
    kill $BACKEND_PID 2>/dev/null
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null
    fi
    echo "✅ All services stopped"
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Wait for user to stop
wait
