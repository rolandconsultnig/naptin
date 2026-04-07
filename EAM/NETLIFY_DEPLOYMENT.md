# Netlify Deployment Guide

## Overview
This guide explains how to deploy the EAM (Enterprise Asset Management) frontend to Netlify.

## Important Notes

### ⚠️ Frontend-Only Deployment
This deployment will only include the **frontend** of your EAM application. The backend API and database functionality will not work without additional setup.

### 🔧 Required Backend Setup
To make the application fully functional, you'll need to:

1. **Deploy Backend Separately** (e.g., Heroku, Railway, or Vercel)
2. **Update API URLs** in the frontend to point to your deployed backend
3. **Set up Database** (PostgreSQL) on a cloud provider

## Deployment Steps

### 1. Build for Netlify
```bash
npm run build:netlify
```

### 2. Deploy to Netlify
- Connect your GitHub repository to Netlify
- Set build command: `npm run build:netlify`
- Set publish directory: `dist`
- Deploy

### 3. Environment Variables (Optional)
If you have a backend deployed, set these in Netlify:
- `VITE_API_URL` - Your backend API URL

## Current Limitations

### ❌ What Won't Work
- User authentication
- Database operations
- File uploads
- Real-time features
- API calls to backend

### ✅ What Will Work
- Static pages and navigation
- UI components
- Mock data display
- Frontend routing

## Alternative Deployment Options

### Full-Stack Deployment
For a complete EAM system, consider:

1. **Railway** - Full-stack deployment with PostgreSQL
2. **Render** - Backend + database hosting
3. **Heroku** - Traditional full-stack hosting
4. **Vercel** - Frontend + serverless functions

### Recommended Setup
```
Frontend: Netlify (this deployment)
Backend: Railway/Render
Database: PostgreSQL on Railway/Render
```

## Testing the Deployment
After deployment, you can:
- Navigate through the UI
- View mock data
- Test responsive design
- Verify static assets load correctly

## Next Steps
1. Deploy backend to a suitable platform
2. Update API endpoints in frontend code
3. Configure CORS on backend
4. Set up production database
5. Update environment variables 