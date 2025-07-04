# CI/CD Setup Documentation

This document provides step-by-step instructions for setting up automated deployment of your Narrari application using GitHub Actions.

## Overview

The CI/CD pipeline automatically deploys your application when you push to the main branch. It builds both the ElysiaJS server and SvelteKit client, then deploys them to your Azure VM.

## Prerequisites

Before setting up the CI/CD pipeline, ensure you have:

1. **Azure VM** with Ubuntu/Linux running
2. **SSH access** to the VM
3. **Bun runtime** installed on the VM
4. **Node.js** installed on the VM
5. **Nginx** configured to serve from `/var/www/hayshin.dev/html`
6. **sudo privileges** for the deployment user

## Server Setup

### 1. Install Required Software on Azure VM

```bash
# Install Bun
curl -fsSL https://bun.sh/install | bash

# Install Node.js (if not already installed)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install additional tools
sudo apt-get update
sudo apt-get install -y lsof curl
```

### 2. Configure Nginx

Ensure your Nginx configuration serves the SvelteKit static files:

```nginx
server {
    listen 80;
    server_name hayshin.dev www.hayshin.dev;
    
    root /var/www/hayshin.dev/html;
    index index.html;
    
    # Handle SvelteKit routing
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # API proxy to ElysiaJS server
    location /api/ {
        proxy_pass http://localhost:3000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 3. Set Up Directories

```bash
# Create deployment directory
mkdir -p /home/azureuser/narrari-deploy

# Ensure web directory exists with correct permissions
sudo mkdir -p /var/www/hayshin.dev/html
sudo chown -R azureuser:www-data /var/www/hayshin.dev/html
sudo chmod -R 755 /var/www/hayshin.dev/html
```

## GitHub Secrets Configuration

You need to configure the following secrets in your GitHub repository:

### 1. Go to Repository Settings

1. Navigate to your GitHub repository
2. Go to **Settings** > **Secrets and variables** > **Actions**
3. Click **New repository secret**

### 2. Add Required Secrets

Add these secrets one by one:

#### `SSH_HOST`
- **Value**: Your Azure VM's public IP address
- **Example**: `20.153.200.5`

#### `SSH_USER` 
- **Value**: Your SSH username
- **Example**: `azureuser`

#### `SSH_PRIVATE_KEY`
- **Value**: Your private SSH key content
- **How to get**: Run `cat ~/.ssh/id_rsa` on your local machine and copy the entire output
- **Format**: Should start with `-----BEGIN OPENSSH PRIVATE KEY-----` and end with `-----END OPENSSH PRIVATE KEY-----`

### 3. Generate SSH Key (if needed)

If you don't have an SSH key pair:

```bash
# Generate new SSH key
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"

# Copy public key to Azure VM
ssh-copy-id -i ~/.ssh/id_rsa.pub azureuser@20.153.200.5

# Get private key for GitHub secret
cat ~/.ssh/id_rsa
```

## Database Configuration

If your application uses PostgreSQL, ensure it's configured on your Azure VM:

```bash
# Install PostgreSQL
sudo apt-get install -y postgresql postgresql-contrib

# Create database and user
sudo -u postgres psql -c "CREATE DATABASE narrari;"
sudo -u postgres psql -c "CREATE USER narrari_user WITH PASSWORD 'your_password';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE narrari TO narrari_user;"
```

Add database environment variables to your server by creating `/home/azureuser/narrari-deploy/.env`:

```env
DATABASE_URL=postgresql://narrari_user:your_password@localhost:5432/narrari
PORT=3000
NODE_ENV=production
```

## Deployment Process

### Automatic Deployment

The deployment happens automatically when you:
1. Push to the `main` or `master` branch
2. Manually trigger the workflow from GitHub Actions tab

### Manual Deployment

You can also manually deploy using the deployment script on your server:

```bash
# SSH into your server
ssh -i ~/.ssh/id_rsa azureuser@20.153.200.5

# Navigate to deployment directory
cd /home/azureuser/narrari-deploy

# Use deployment script
./deploy-server.sh deploy    # Full deployment
./deploy-server.sh restart   # Restart server
./deploy-server.sh status    # Check status
./deploy-server.sh logs      # View logs
```

## Monitoring and Troubleshooting

### Check Deployment Status

Monitor your deployments in the GitHub Actions tab of your repository. Each deployment will show:
- ✅ Build successful
- ✅ Server deployed
- ✅ Client deployed
- ✅ Verification passed

### Common Issues

#### 1. SSH Connection Failed
- Verify SSH_HOST and SSH_USER secrets are correct
- Ensure SSH_PRIVATE_KEY is the complete private key
- Check that your public key is in `~/.ssh/authorized_keys` on the server

#### 2. Server Not Starting
```bash
# Check server logs
ssh azureuser@20.153.200.5
cd /home/azureuser/narrari-deploy
./deploy-server.sh logs
```

#### 3. Client Not Accessible
- Check Nginx configuration
- Verify file permissions: `ls -la /var/www/hayshin.dev/html`
- Restart Nginx: `sudo systemctl restart nginx`

#### 4. Port Already in Use
```bash
# Find process using port 3000
lsof -ti :3000

# Kill process if needed
kill -9 $(lsof -ti :3000)
```

### Server Monitoring

Check server status:
```bash
# Server process
ps aux | grep narrari-deploy

# Port usage
netstat -tlnp | grep :3000

# System resources
htop
```

## Environment Variables

Create environment-specific configurations:

### Production Environment (.env)
```env
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/narrari
```

### Development Environment
Keep sensitive data in GitHub Secrets and reference them in your workflow if needed.

## Security Considerations

1. **SSH Keys**: Never commit SSH keys to your repository
2. **Database Credentials**: Use environment variables
3. **API Keys**: Store in GitHub Secrets
4. **File Permissions**: Ensure proper permissions on deployed files
5. **Firewall**: Configure firewall rules to allow only necessary ports

## Workflow Customization

You can customize the deployment workflow by editing `.github/workflows/deploy.yml`:

- **Change branches**: Modify the `branches` array
- **Add tests**: Include testing steps before deployment
- **Environment-specific deployments**: Add conditional logic
- **Notification**: Add Slack/Discord notifications

## Performance Optimization

1. **Build Caching**: The workflow caches dependencies for faster builds
2. **Parallel Jobs**: Consider splitting client/server builds
3. **Deployment Scripts**: Use the robust deployment script for better reliability

## Backup Strategy

Consider implementing:
1. **Database backups** before deployments
2. **Rolling deployments** with health checks
3. **Rollback procedures** for failed deployments

## Support

If you encounter issues:
1. Check GitHub Actions logs
2. Review server logs using the deployment script
3. Verify all prerequisites are met
4. Ensure all secrets are correctly configured

The deployment system includes comprehensive logging and status checking to help diagnose issues quickly.