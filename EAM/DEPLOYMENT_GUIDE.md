# EAM System Deployment Guide

## Overview
This guide covers deploying the complete EAM (Enterprise Asset Management) system with both frontend and backend.

## Platform Options

### 🚀 **Recommended: Railway** (Best for full-stack + database)
- ✅ Full-stack support
- ✅ PostgreSQL database included
- ✅ Automatic deployments
- ✅ Free tier available

### 🌐 **Alternative: Render**
- ✅ Full-stack hosting
- ✅ PostgreSQL database
- ✅ Good free tier
- ✅ Easy setup

### ☁️ **Alternative: Heroku**
- ✅ Traditional full-stack platform
- ✅ PostgreSQL add-ons
- ✅ Well-established
- ⚠️ No free tier anymore

## Quick Deployment: Railway

### 1. **Prepare Your Repository**
```bash
# Ensure all changes are committed
git add .
git commit -m "Add full-stack deployment config"
git push origin main
```

### 2. **Deploy to Railway**
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your EAM repository
5. Railway will automatically detect the configuration

### 3. **Set Environment Variables**
In Railway dashboard, add these environment variables:
```
NODE_ENV=production
DATABASE_URL=postgresql://... (Railway will provide this)
```

### 4. **Database Setup**
1. Railway will automatically create a PostgreSQL database
2. The `DATABASE_URL` will be provided automatically
3. Run database migrations: `npm run db:push` (Railway can do this)

## Alternative: Render Deployment

### 1. **Deploy to Render**
1. Go to [render.com](https://render.com)
2. Sign up and connect GitHub
3. Click "New" → "Web Service"
4. Connect your repository
5. Use these settings:
   - **Build Command**: `npm run build:render`
   - **Start Command**: `npm run start:prod`
   - **Environment**: Node

### 2. **Add PostgreSQL Database**
1. In Render dashboard, create a new PostgreSQL database
2. Copy the connection string
3. Add as environment variable: `DATABASE_URL`

## Build Commands

### For Railway:
```bash
npm run build:railway
```

### For Render:
```bash
npm run build:render
```

### For General Full-Stack:
```bash
npm run build:fullstack
```

## Environment Variables

### Required:
```
NODE_ENV=production
DATABASE_URL=postgresql://username:password@host:port/database
```

### Optional:
```
PORT=4200 (or platform default)
SESSION_SECRET=your-secret-key
```

## Database Setup

### 1. **Run Migrations**
After deployment, run database migrations:
```bash
npm run db:push
```

### 2. **Create Admin User**
The system will create a default admin user:
- **Username**: admin
- **Password**: admin123

## Health Check

The application includes a health check endpoint:
```
GET /api/health
```

Returns:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "production"
}
```

## Troubleshooting

### Common Issues:

1. **Database Connection Failed**
   - Check `DATABASE_URL` environment variable
   - Ensure database is running
   - Verify network access

2. **Build Fails**
   - Check Node.js version (use 18+)
   - Ensure all dependencies are installed
   - Check for TypeScript errors

3. **Port Issues**
   - Most platforms use `PORT` environment variable
   - Application defaults to port 4200

### Logs
Check platform-specific logs:
- **Railway**: Dashboard → Service → Logs
- **Render**: Dashboard → Service → Logs
- **Heroku**: `heroku logs --tail`

## Post-Deployment

### 1. **Test the Application**
- Visit your deployed URL
- Test login with admin/admin123
- Navigate through different modules

### 2. **Update DNS (Optional)**
- Add custom domain in platform dashboard
- Configure SSL certificate

### 3. **Monitor Performance**
- Check platform metrics
- Monitor database performance
- Set up alerts if needed

## Security Considerations

### 1. **Change Default Credentials**
- Update admin password after first login
- Create additional users as needed

### 2. **Environment Variables**
- Never commit sensitive data to repository
- Use platform secrets management

### 3. **Database Security**
- Use strong passwords
- Enable SSL connections
- Regular backups

## Support

For deployment issues:
1. Check platform documentation
2. Review application logs
3. Verify environment variables
4. Test locally first 