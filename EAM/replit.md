# Enterprise Asset Management System

## Overview

This is a full-stack Enterprise Asset Management (EAM) system built with modern web technologies. The application provides comprehensive asset lifecycle management, maintenance scheduling, inventory tracking, and work order management for enterprise environments.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Framework**: Radix UI components with Tailwind CSS for styling
- **Form Handling**: React Hook Form with Zod validation
- **Build Tool**: Vite for fast development and optimized builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM with PostgreSQL
- **Authentication**: Replit Auth with OpenID Connect
- **Session Management**: Express sessions with PostgreSQL storage

### Database Strategy
- **Primary Database**: PostgreSQL (configured for Neon serverless)
- **ORM**: Drizzle ORM for type-safe database operations
- **Migrations**: Drizzle Kit for schema management
- **Connection**: Serverless-compatible connection pooling

## Key Components

### Asset Management Module
- Centralized asset registry with hierarchical organization
- Asset profiles with detailed metadata (manufacturer, model, serial numbers)
- Location-based asset tracking
- Criticality ratings and status management
- Document attachments and version control
- Meter readings and usage tracking

### Work Order Management
- Work order creation and lifecycle management
- Priority-based task assignment
- Time tracking and cost management
- Asset-specific work order history
- Status workflow (pending → in progress → completed → cancelled)

### Maintenance Scheduling
- Preventive, corrective, emergency, and inspection schedules
- Time-based, usage-based, and condition-based scheduling
- Automated maintenance task generation
- Resource allocation and technician assignment

### Inventory Management
- Parts and supplies tracking
- Stock level monitoring with low-stock alerts
- Supplier management and lead time tracking
- Work order parts consumption tracking
- Cost tracking and budgeting

### Reporting & Analytics
- Dashboard with key performance indicators
- Asset utilization and performance metrics
- Maintenance cost analysis
- Work order completion trends
- Inventory turnover reports

## Data Flow

### Authentication Flow
1. Users authenticate via Replit's OpenID Connect provider
2. Session tokens are stored in PostgreSQL with automatic expiration
3. API requests include session cookies for authentication
4. Role-based access control determines user permissions

### Asset Data Flow
1. Asset information is created/updated through React forms
2. Data validation occurs client-side (Zod) and server-side
3. Drizzle ORM handles database operations with type safety
4. TanStack Query manages caching and optimistic updates
5. Real-time updates refresh relevant UI components

### Work Order Workflow
1. Work orders are created manually or auto-generated from schedules
2. Assignment notifications and status updates flow through the system
3. Parts consumption is tracked and inventory is automatically updated
4. Completion triggers maintenance history updates and cost calculations

## External Dependencies

### UI and Styling
- **Radix UI**: Comprehensive component library for accessibility
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library for consistent iconography
- **Class Variance Authority**: Type-safe component variants

### Data Management
- **TanStack Query**: Server state management and caching
- **React Hook Form**: Form state management
- **Zod**: Runtime type validation and schema definition
- **Date-fns**: Date manipulation and formatting

### Database and Authentication
- **Neon Database**: Serverless PostgreSQL hosting
- **Drizzle ORM**: Type-safe database toolkit
- **Replit Auth**: Integrated authentication service
- **Express Session**: Session management middleware

## Deployment Strategy

### Development Environment
- Vite dev server with hot module replacement
- TypeScript compilation with strict type checking
- ESLint and Prettier for code quality
- Development-specific error overlays and debugging tools

### Production Build
- Vite production build with code splitting and optimization
- Server bundling with esbuild for Node.js deployment
- Static asset optimization and CDN-ready outputs
- Environment-specific configuration management

### Database Management
- Schema migrations through Drizzle Kit
- Connection pooling for serverless environments
- Automated backup and point-in-time recovery
- Environment-specific database credentials

### Security Considerations
- HTTPS-only cookies for session management
- CSRF protection through SameSite cookie policies
- Input validation at multiple layers
- Role-based access control for API endpoints
- Secure session storage with automatic expiration

The system is designed for scalability and maintainability, with clear separation of concerns between frontend and backend, type safety throughout the stack, and modern development practices for enterprise-grade asset management.