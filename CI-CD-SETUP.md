# CI/CD Setup Documentation - Git-Based Deployment

This document provides step-by-step instructions for setting up automated deployment of your Narrari application using GitHub Actions with a git-based approach.

## Overview

The CI/CD pipeline uses a simplified, efficient approach:
1. **GitHub Actions** triggers on push to main branch
2. **SSH into your VM** using the `appleboy/ssh-action`
3. **Git pull** the latest code directly on the VM
4. **Build** both server and client on the VM
5. **Deploy** and restart services

This approach is much faster and more efficient than building locally and transferring files.

## Prerequisites

Before setting up the CI/CD pipeline, ensure you have:

1. **Azure VM** with Ubuntu/Linux running
2. **SSH access** to the VM with key-based authentication
3. **Git** installed on the VM
4. **Bun runtime** installed on the VM
5. **Node.js** installed on the VM
6. **Nginx** configured to serve from `/var/www/hayshin.dev/html`
7. **sudo privileges** for the deployment user

## Server Setup

### 1. Install Required Software on Azure VM

```bash
# Update system
sudo apt-get update

# Install Git
sudo apt-get install -y git

# Install Bun
curl -fsSL https://bun.sh/install | bash
source ~/.bashrc

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install additional tools
sudo apt-get install -y lsof curl bc nginx
```

### 2. Configure SSH Key Access

```bash
# On your local machine, generate SSH key if you don't have one
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"

# Copy public key to Azure VM
ssh-copy-id -i ~/.ssh/id_rsa.pub azureuser@20.153.200.5

# Test SSH connection
ssh -i ~/.ssh/id_rsa azureuser@20.153.200.5
```

### 3. Clone Repository on VM

```bash
# SSH into your VM
ssh -i ~/.ssh/id_rsa azureuser@20.153.200.5

# Clone your repository
git clone https://github.com/your-username/narrari.git /home/azureuser/narrari

# Set up Git credentials if needed
git config --global user.name "Your Name"
git config --global user.email "your_email@example.com"
```

### 4. Configure Nginx

Create or update `/etc/nginx/sites-available/hayshin.dev`:

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

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/hayshin.dev /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 5. Set Up Directories

```bash
# Create necessary directories
mkdir -p /home/azureuser/narrari-deploy
sudo mkdir -p /var/www/hayshin.dev/html
sudo chown -R azureuser:www-data /var/www/hayshin.dev/html
sudo chmod -R 755 /var/www/hayshin.dev/html
```

## GitHub Configuration

### 1. Repository Settings

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**

### 2. Required Secrets

Add these three secrets:

#### `SSH_HOST`
- **Value**: Your Azure VM's public IP address
- **Example**: `20.153.200.5`

#### `SSH_USER`
- **Value**: Your SSH username
- **Example**: `azureuser`

#### `SSH_PRIVATE_KEY`
- **Value**: Your complete private SSH key
- **How to get**: Run `cat ~/.ssh/id_rsa` and copy the entire output
- **Format**: Must include the header and footer lines:
  ```
  -----BEGIN OPENSSH PRIVATE KEY-----
  [key content]
  -----END OPENSSH PRIVATE KEY-----
  ```

### 3. Workflow File

The workflow file `.github/workflows/deploy.yml` uses the `appleboy/ssh-action` to:
- SSH into your VM
- Pull the latest code
- Build server and client
- Deploy and restart services
- Verify the deployment

## Database Configuration (Optional)

If using PostgreSQL:

```bash
# Install PostgreSQL
sudo apt-get install -y postgresql postgresql-contrib

# Create database and user
sudo -u postgres psql << EOF
CREATE DATABASE narrari;
CREATE USER narrari_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE narrari TO narrari_user;
\q
EOF
```

## Deployment Process

### Automatic Deployment

The deployment happens automatically when you:
1. Push to the `main` branch
2. The GitHub Action will:
   - SSH into your VM
   - Pull latest code from git
   - Build server with Bun
   - Build client with npm
   - Deploy server to `/home/azureuser/narrari-deploy`
   - Deploy client to `/var/www/hayshin.dev/html`
   - Restart services and verify

### Manual Deployment

You can also deploy manually using the deployment script:

```bash
# SSH into your server
ssh -i ~/.ssh/id_rsa azureuser@20.153.200.5

# Use the deployment script
cd /home/azureuser/narrari
chmod +x scripts/deploy.sh

# Full deployment
./scripts/deploy.sh deploy

# Other commands
./scripts/deploy.sh status    # Check status
./scripts/deploy.sh restart   # Restart server
./scripts/deploy.sh logs      # View logs
./scripts/deploy.sh verify    # Verify deployment
```

## Monitoring and Troubleshooting

### Check Deployment Status

Monitor deployments in the **Actions** tab of your GitHub repository.

### Common Issues

#### 1. SSH Connection Failed
**Symptoms**: `Permission denied (publickey)`
**Solutions**:
- Verify `SSH_HOST` and `SSH_USER` secrets
- Ensure `SSH_PRIVATE_KEY` includes header/footer lines
- Test SSH connection manually: `ssh -i ~/.ssh/id_rsa azureuser@20.153.200.5`

#### 2. Git Pull Failed
**Symptoms**: `fatal: could not read from remote repository`
**Solutions**:
- Ensure repository is public or SSH keys are configured for git
- Check repository URL in the deployment script
- Verify git credentials on VM

#### 3. Build Failed
**Symptoms**: `bun: command not found` or `npm: command not found`
**Solutions**:
- Ensure Bun and Node.js are installed and in PATH
- Check if `source ~/.bashrc` is needed
- Verify dependencies can be installed

#### 4. Server Not Starting
**Symptoms**: Server process exits immediately
**Solutions**:
```bash
# Check server logs
ssh azureuser@20.153.200.5
tail -f /home/azureuser/narrari-deploy/server.log

# Check environment variables
cat /home/azureuser/narrari-deploy/.env

# Manually test server
cd /home/azureuser/narrari-deploy
bun run index.js
```

#### 5. Client Not Accessible
**Symptoms**: 404 errors or blank page
**Solutions**:
- Check nginx status: `sudo systemctl status nginx`
- Verify file permissions: `ls -la /var/www/hayshin.dev/html`
- Test nginx config: `sudo nginx -t`
- Check nginx logs: `sudo tail -f /var/log/nginx/error.log`

### Debugging Commands

```bash
# Check server status
ps aux | grep narrari
netstat -tlnp | grep :3000

# Check nginx
sudo systemctl status nginx
sudo nginx -t

# Check logs
tail -f /home/azureuser/narrari-deploy/server.log
sudo tail -f /var/log/nginx/error.log

# Check disk space
df -h

# Check system resources
htop
```

## Environment Configuration

### Production Environment Variables

Create `/home/azureuser/narrari-deploy/.env`:

```env
NODE_ENV=production
PORT=3000
HOST=0.0.0.0
DATABASE_URL=postgresql://narrari_user:your_password@localhost:5432/narrari
LOG_LEVEL=info
CORS_ORIGIN=https://hayshin.dev
```

### Secure Environment Variables

For sensitive data like API keys:
1. Add them to GitHub Secrets
2. Reference them in the workflow
3. Create them on the server during deployment

## Security Considerations

1. **SSH Keys**: Never commit private keys to repository
2. **File Permissions**: Ensure proper permissions on deployed files
3. **Database**: Use strong passwords and limit access
4. **Firewall**: Configure UFW or similar:
   ```bash
   sudo ufw allow ssh
   sudo ufw allow 80
   sudo ufw allow 443
   sudo ufw enable
   ```
5. **SSL**: Configure SSL certificates for HTTPS

## Performance Optimization

1. **Build Caching**: Dependencies are cached between deployments
2. **Process Management**: Server is properly stopped before restart
3. **Nginx**: Serves static files efficiently
4. **Database**: Use connection pooling and proper indexes

## Advanced Configuration

### Custom Deployment Script

You can customize the deployment by modifying `scripts/deploy.sh`:

```bash
# Add custom build steps
# Add database migrations
# Add custom health checks
# Add rollback procedures
```

### Multiple Environments

For staging/production environments:
1. Create separate branches
2. Use different domain names
3. Configure environment-specific secrets
4. Modify workflow to trigger on different branches

## Backup and Recovery

### Database Backup

```bash
# Create backup script
cat > /home/azureuser/backup-db.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/home/azureuser/backups"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR
pg_dump narrari > $BACKUP_DIR/narrari_$DATE.sql
# Keep only last 7 days
find $BACKUP_DIR -name "narrari_*.sql" -mtime +7 -delete
EOF

chmod +x /home/azureuser/backup-db.sh

# Add to crontab
echo "0 2 * * * /home/azureuser/backup-db.sh" | crontab -
```

### Code Rollback

```bash
# Rollback to previous commit
cd /home/azureuser/narrari
git log --oneline -n 10  # See recent commits
git reset --hard <commit-hash>
./scripts/deploy.sh deploy
```

## Support and Maintenance

### Regular Maintenance

1. **System Updates**: Keep VM updated
2. **Log Rotation**: Configure log rotation
3. **Monitoring**: Set up monitoring and alerts
4. **SSL Renewal**: Automate SSL certificate renewal

### Getting Help

If you encounter issues:
1. Check the GitHub Actions logs
2. Review server logs using the deployment script
3. Verify all prerequisites are met
4. Test components individually

The simplified git-based approach provides better debugging capabilities and faster deployments while maintaining reliability and security.