# Railway Deployment Guide for EAM System

## Prerequisites

1. **Railway Account**: Sign up at [railway.app](https://railway.app)
2. **GitHub Repository**: Your EAM project should be on GitHub
3. **Database**: You'll need a PostgreSQL database (Railway provides this)

## Deployment Steps

### 1. Connect to Railway

1. Go to [railway.app](https://railway.app) and sign in
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Connect your GitHub account and select the `afrinict/EAM` repository
5. Click "Deploy Now"

### 2. Set Up Database

1. In your Railway project dashboard, click "New"
2. Select "Database" → "PostgreSQL"
3. Wait for the database to be provisioned
4. Copy the database connection string from the "Connect" tab

### 3. Configure Environment Variables

In your Railway project dashboard, go to the "Variables" tab and add:

```env
DATABASE_URL=your_railway_postgres_connection_string
NODE_ENV=production
PORT=4200
```

### 4. Deploy the Application

1. Railway will automatically detect the build configuration
2. The deployment will use the following files:
   - `railway.toml` - Railway configuration
   - `nixpacks.toml` - Build configuration
   - `Procfile` - Process definition
   - `package.json` - Dependencies and scripts

### 5. Monitor Deployment

1. Check the "Deployments" tab to monitor the build process
2. View logs to ensure everything is working correctly
3. The health check endpoint `/api/health` will be used to verify the deployment

## Configuration Files

### railway.toml
- Configures Railway-specific settings
- Sets health check endpoint
- Defines restart policies

### nixpacks.toml
- Defines the build process
- Specifies Node.js and PostgreSQL versions
- Configures build and start commands

### Procfile
- Tells Railway how to start the application
- Uses `npm start` command

### .railwayignore
- Excludes unnecessary files from deployment
- Reduces build time and deployment size

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `NODE_ENV` | Environment (production) | Yes |
| `PORT` | Port to run on (4200) | Yes |

## Health Check

The application includes a health check endpoint at `/api/health` that returns:

```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "production"
}
```

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check the build logs in Railway dashboard
   - Ensure all dependencies are in `package.json`
   - Verify TypeScript compilation

2. **Database Connection Issues**
   - Verify `DATABASE_URL` is correctly set
   - Check if the database is accessible
   - Ensure database schema is migrated

3. **Port Issues**
   - Railway automatically assigns ports
   - The app is configured to use port 4200
   - Check Railway's port configuration

### Logs

- View application logs in Railway dashboard
- Check both build and runtime logs
- Monitor health check responses

## Post-Deployment

1. **Test the Application**
   - Visit your Railway URL
   - Test login functionality
   - Verify all features work correctly

2. **Set Up Custom Domain** (Optional)
   - In Railway dashboard, go to "Settings"
   - Add a custom domain
   - Configure DNS settings

3. **Monitor Performance**
   - Use Railway's built-in monitoring
   - Set up alerts for downtime
   - Monitor database performance

## Support

- Railway Documentation: [docs.railway.app](https://docs.railway.app)
- Railway Discord: [discord.gg/railway](https://discord.gg/railway)
- Project Issues: GitHub repository issues 