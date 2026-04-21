# 🦉 Owl-talk - Professional Messaging Platform

A modern, enterprise-grade messaging application built with React, Flask, and Socket.IO. Features a professional UI template with comprehensive dashboard, real-time chat, and admin capabilities.

## ✨ Features

### 🎨 **Professional UI Template**
- **Modern Design System**: Clean, professional interface with consistent styling
- **Responsive Layout**: Works perfectly on desktop, tablet, and mobile
- **Component Library**: Reusable UI components (Button, Input, Card, etc.)
- **Professional Sidebar**: Navigation with active states and user management
- **Toast Notifications**: Beautiful success/error notifications

### 💬 **Real-time Messaging**
- **Instant Messaging**: Real-time chat with Socket.IO
- **User Presence**: Online/offline status indicators
- **Message History**: Persistent message storage
- **Typing Indicators**: Real-time typing status
- **File Sharing**: Support for attachments (ready for implementation)

### 📊 **Dashboard & Analytics**
- **Overview Dashboard**: Key metrics and statistics
- **Quick Actions**: Fast access to common tasks
- **Recent Activity**: Live activity feed
- **User Management**: Contact list and user profiles
- **Settings Panel**: Account and application settings

### 🔐 **Security & Authentication**
- **Secure Login**: Session-based authentication
- **Role-based Access**: Admin and user roles
- **CORS Protection**: Secure cross-origin requests
- **Password Hashing**: Secure password storage

## 🚀 Quick Start

## ⚠️ Legacy Route Notice

The legacy Owl-talk tenant routes are intentionally deprecated and return `410 Gone`:

- `/api/admin/tenants`
- `/api/admin/tenant-module-policy`
- `/api/admin/tenant-module-policy/:segment`
- `/api/admin/tenant-audit`
- `/api/tenant-policy`

These routes depended on retired legacy tenant tables. Use enterprise RBAC APIs (`/api/v1/admin/rbac/*`) for current multi-tenant governance and access control.

### Prerequisites
- Python 3.8+
- Node.js 18+
- npm or yarn

### Installation

1. **Clone and navigate to the project:**
   ```bash
   cd /home/fes/Downloads/dev
   ```

2. **Start the backend:**
   ```bash
   source venv/bin/activate
   python main.py
   ```

3. **Start the frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

4. **Access the application:**
   - Frontend: `http://localhost:3000`
   - Backend API: `http://localhost:5000`

## 🏗️ Architecture

### Frontend Structure
```
frontend/src/
├── components/          # Reusable UI components
│   └── ui/             # Core UI components (Button, Input, Card)
├── layouts/            # Layout components (Sidebar, Header)
├── pages/              # Page components (Login, Dashboard, Chat)
├── contexts/           # React contexts (Auth, Socket)
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
└── types/              # TypeScript type definitions
```

### Backend Structure
```
├── main.py             # Flask application entry point
├── src/
│   ├── models/         # Database models
│   └── routes/         # API routes
├── database/           # SQLite database files
└── requirements.txt    # Python dependencies
```

## 🎯 **Professional Template Components**

### Core UI Components
- **Button**: Multiple variants (primary, secondary, outline, ghost, danger)
- **Input**: Form inputs with error states and icons
- **Card**: Content containers with header, body, and footer
- **Sidebar**: Professional navigation with active states
- **Toast**: Notification system for user feedback

### Layout Components
- **AppLayout**: Main application layout with sidebar
- **Sidebar**: Professional navigation sidebar
- **Header**: Top navigation bar with user info

### Page Components
- **LoginPage**: Professional login form with validation
- **DashboardPage**: Analytics dashboard with metrics
- **ChatPage**: Real-time messaging interface
- **ContactsPage**: User management and contacts
- **SettingsPage**: Application and account settings

## 🔑 Demo Credentials

- **Admin Account**: `admin` / `admin123`
- **User Account**: `testuser` / `password123`

## 🎨 **Design System**

### Color Palette
- **Primary**: Blue (#2563eb)
- **Secondary**: Gray (#6b7280)
- **Success**: Green (#10b981)
- **Warning**: Yellow (#f59e0b)
- **Error**: Red (#ef4444)
- **Background**: Gray-50 (#f9fafb)

### Typography
- **Font Family**: Inter (system font stack)
- **Headings**: Font weights 600-700
- **Body**: Font weight 400
- **Small Text**: Font weight 500

### Spacing
- **Consistent spacing**: 4px base unit
- **Component padding**: 16px, 24px, 32px
- **Margins**: 8px, 16px, 24px, 32px

## 🔧 **Customization**

### Adding New Pages
1. Create component in `src/pages/`
2. Add route in `src/App.jsx`
3. Add navigation item in `src/layouts/Sidebar.jsx`

### Styling Components
- Use Tailwind CSS classes
- Follow the design system patterns
- Use the provided utility classes

### Adding Features
- Extend the context providers
- Add new API endpoints in backend
- Update the Socket.IO events

## 📱 **Responsive Design**

The template is fully responsive with:
- **Mobile-first approach**
- **Breakpoints**: sm (640px), md (768px), lg (1024px), xl (1280px)
- **Flexible layouts** that adapt to screen size
- **Touch-friendly** interface elements

## 🚀 **Production Deployment**

### Frontend Build
```bash
cd frontend
npm run build
```

### Backend Deployment
- Use a production WSGI server (Gunicorn)
- Set up environment variables
- Configure database (PostgreSQL recommended)
- Set up reverse proxy (Nginx)

## 🛠️ **Development**

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Code Style
- ESLint configuration included
- Prettier formatting recommended
- Component-based architecture
- Custom hooks for logic reuse

## 📄 **License**

This project is developed for educational and demonstration purposes.

---

**Built with ❤️ using React, Flask, Socket.IO, and Tailwind CSS**