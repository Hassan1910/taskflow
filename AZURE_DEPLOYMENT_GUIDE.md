# Azure Deployment Guide for TaskFlow

This guide will help you deploy your Next.js TaskFlow application to Azure App Service.

## Prerequisites

1. Azure account (create one at https://azure.microsoft.com/free/)
2. Azure CLI installed (https://docs.microsoft.com/cli/azure/install-azure-cli)
3. Node.js and npm installed locally
4. Git installed

## Step 1: Prepare Your Database

### Option A: Azure SQL Database (Recommended)

1. **Create Azure SQL Database:**
   - Go to Azure Portal (https://portal.azure.com)
   - Click "Create a resource" → "Databases" → "SQL Database"
   - Fill in the details:
     - Resource group: Create new or use existing
     - Database name: `taskflow-db`
     - Server: Create new server
     - Compute + storage: Basic or Standard tier
   
2. **Configure Firewall:**
   - In SQL Database → "Networking"
   - Add your current IP address
   - Enable "Allow Azure services and resources to access this server"

3. **Get Connection String:**
   - Go to your database → "Connection strings"
   - Copy the ADO.NET connection string
   - Format it for Prisma:
   ```
   sqlserver://SERVER.database.windows.net:1433;database=DATABASE_NAME;user=USERNAME;password=PASSWORD;encrypt=true;trustServerCertificate=false;
   ```

### Option B: Use Existing SQL Server

If you already have a SQL Server database, ensure it's accessible from Azure.

## Step 2: Create Azure App Service

### Using Azure Portal:

1. **Create Web App:**
   - Go to Azure Portal
   - Click "Create a resource" → "Web App"
   - Fill in details:
     - Name: `taskflow-app` (must be unique)
     - Runtime stack: Node 20 LTS
     - Operating System: Linux
     - Region: Choose nearest to your users
     - Plan: Basic B1 or higher

2. **Configure Environment Variables:**
   - Go to your App Service → "Configuration" → "Application settings"
   - Add these variables:

   ```
   DATABASE_URL=your_sql_server_connection_string
   NEXTAUTH_URL=https://your-app-name.azurewebsites.net
   NEXTAUTH_SECRET=your_generated_secret_key
   NODE_ENV=production
   WEBSITE_NODE_DEFAULT_VERSION=~20
   ```

   **Generate NEXTAUTH_SECRET:**
   ```bash
   openssl rand -base64 32
   ```

3. **Configure Startup Command:**
   - In "Configuration" → "General settings"
   - Set Startup Command to: `node server.js`

## Step 3: Deploy Your Application

### Method 1: GitHub Actions (Recommended)

1. **Push your code to GitHub** (if not already done)

2. **Set up GitHub Actions:**
   - In Azure Portal → Your App Service → "Deployment Center"
   - Source: GitHub
   - Authorize and select your repository
   - Azure will automatically create a workflow file

3. **Update the generated workflow** (`.github/workflows/azure-webapps-node.yml`):
   ```yaml
   # The workflow should include:
   - name: Install dependencies
     run: npm ci
   
   - name: Generate Prisma Client
     run: npx prisma generate
   
   - name: Build application
     run: npm run build
   ```

4. **Push changes** - deployment will happen automatically

### Method 2: Azure CLI

1. **Login to Azure:**
   ```bash
   az login
   ```

2. **Create Resource Group (if needed):**
   ```bash
   az group create --name taskflow-rg --location eastus
   ```

3. **Create App Service Plan:**
   ```bash
   az appservice plan create --name taskflow-plan --resource-group taskflow-rg --sku B1 --is-linux
   ```

4. **Create Web App:**
   ```bash
   az webapp create --resource-group taskflow-rg --plan taskflow-plan --name taskflow-app --runtime "NODE|20-lts"
   ```

5. **Configure Environment Variables:**
   ```bash
   az webapp config appsettings set --resource-group taskflow-rg --name taskflow-app --settings \
     DATABASE_URL="your_connection_string" \
     NEXTAUTH_URL="https://taskflow-app.azurewebsites.net" \
     NEXTAUTH_SECRET="your_secret" \
     NODE_ENV="production"
   ```

6. **Deploy from Local Git:**
   ```bash
   # Build locally
   npm run build
   
   # Deploy
   az webapp deployment source config-local-git --name taskflow-app --resource-group taskflow-rg
   
   # Add Azure remote and push
   git remote add azure <deployment_url_from_above_command>
   git push azure main:master
   ```

### Method 3: VS Code Extension

1. **Install Azure App Service Extension** in VS Code

2. **Right-click your App Service** → "Deploy to Web App"

3. **Select your build folder** (.next/standalone)

## Step 4: Run Database Migrations

After deployment, you need to run Prisma migrations:

### Option A: Using Azure CLI

```bash
# SSH into your app
az webapp ssh --name taskflow-app --resource-group taskflow-rg

# Run migrations
cd /home/site/wwwroot
npx prisma db push
```

### Option B: Using Kudu Console

1. Go to: `https://taskflow-app.scm.azurewebsites.net/`
2. Click "Debug console" → "CMD"
3. Navigate to site/wwwroot
4. Run: `npx prisma db push`

## Step 5: Configure Email (Optional)

If using email functionality:

1. **Add email settings to App Service Configuration:**
   ```
   EMAIL_SERVER=smtp.gmail.com
   EMAIL_FROM=your-email@gmail.com
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-app-password
   ```

2. For Gmail, use App Passwords: https://support.google.com/accounts/answer/185833

## Step 6: Set Up Custom Domain (Optional)

1. Go to App Service → "Custom domains"
2. Click "Add custom domain"
3. Follow the verification steps
4. Add SSL certificate for HTTPS

## Step 7: Configure Monitoring

1. **Enable Application Insights:**
   - Go to your App Service → "Application Insights"
   - Click "Turn on Application Insights"
   - This will help you monitor errors and performance

2. **View Logs:**
   - Go to "Log stream" to see real-time logs
   - Use "Diagnose and solve problems" for troubleshooting

## Common Issues and Solutions

### Issue: Database Connection Fails
**Solution:** 
- Verify connection string format
- Check firewall rules in Azure SQL
- Ensure "Allow Azure services" is enabled

### Issue: Build Fails
**Solution:**
- Check Node.js version matches (20 LTS)
- Verify all dependencies are in package.json
- Check build logs in Azure Portal

### Issue: App Crashes on Startup
**Solution:**
- Check startup command is `node server.js`
- Verify environment variables are set
- Check logs in Log Stream

### Issue: Prisma Client Not Generated
**Solution:**
- Ensure `postinstall` script runs: `"postinstall": "prisma generate"`
- Manually run in Kudu console: `npx prisma generate`

### Issue: File Upload Fails
**Solution:**
- Azure App Service has ephemeral storage
- Use Azure Blob Storage for file uploads
- Update attachment handling code

## Performance Optimization

1. **Enable HTTP/2:** Automatic on Azure

2. **Configure CDN (Optional):**
   - For static assets and images
   - Azure CDN integrates easily with App Service

3. **Scale Up/Out:**
   - Go to "Scale up" to increase instance size
   - Go to "Scale out" to add more instances

4. **Add Redis Cache (Optional):**
   - For session storage and caching
   - Azure Cache for Redis

## Estimated Costs

- **Basic B1 App Service:** ~$13/month
- **Azure SQL Database (Basic):** ~$5/month
- **Total:** ~$18-20/month

For production, consider Standard tier for better performance.

## Support and Resources

- Azure Documentation: https://docs.microsoft.com/azure/app-service/
- Next.js Deployment: https://nextjs.org/docs/deployment
- Prisma + Azure: https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-azure

## Deployment Checklist

- [ ] Database created and configured
- [ ] Firewall rules set for database
- [ ] App Service created
- [ ] Environment variables configured
- [ ] Startup command set to `node server.js`
- [ ] Code deployed
- [ ] Database migrations run
- [ ] Application tested
- [ ] Monitoring enabled
- [ ] Logs checked for errors

---

**Need Help?** Check Azure Portal's "Diagnose and solve problems" or Azure support documentation.
