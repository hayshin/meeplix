#!/bin/bash

# Simplified Git-based Deployment Script for Narrari
# This script pulls code from git and builds/deploys on the server

set -e

# Configuration
REPO_DIR="/home/$USER/narrari"
DEPLOY_DIR="/home/$USER/narrari-deploy"
WEB_ROOT="/var/www/hayshin.dev/html"
SERVER_PORT=3000
LOG_FILE="$DEPLOY_DIR/server.log"
PID_FILE="$DEPLOY_DIR/server.pid"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
}

info() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] INFO: $1${NC}"
}

# Function to check if port is in use
check_port() {
    if lsof -Pi :$SERVER_PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Function to stop existing server
stop_server() {
    log "🛑 Stopping existing server..."

    # Try to stop using PID file first
    if [ -f "$PID_FILE" ]; then
        local pid=$(cat "$PID_FILE")
        if kill -0 "$pid" 2>/dev/null; then
            log "Stopping server with PID $pid"
            kill -TERM "$pid" 2>/dev/null || true
            sleep 3

            # Force kill if still running
            if kill -0 "$pid" 2>/dev/null; then
                warn "Server still running, force killing..."
                kill -9 "$pid" 2>/dev/null || true
            fi
        fi
        rm -f "$PID_FILE"
    fi

    # Fallback: kill any process on the port
    if check_port; then
        warn "Port $SERVER_PORT still in use, finding and killing process..."
        local port_pid=$(lsof -ti :$SERVER_PORT)
        if [ -n "$port_pid" ]; then
            kill -TERM "$port_pid" 2>/dev/null || true
            sleep 2
            if kill -0 "$port_pid" 2>/dev/null; then
                kill -9 "$port_pid" 2>/dev/null || true
            fi
        fi
    fi

    # Additional cleanup
    pkill -f "narrari.*index.js" 2>/dev/null || true
    pkill -f "bun.*index.js" 2>/dev/null || true

    log "Server stopped"
}

# Function to pull or clone repository
update_code() {
    log "📥 Updating code from repository..."

    if [ -d "$REPO_DIR" ]; then
        log "Repository exists, pulling latest changes..."
        cd "$REPO_DIR"

        # Store current branch
        local current_branch=$(git rev-parse --abbrev-ref HEAD)

        # Fetch and reset to latest
        git fetch origin
        git reset --hard origin/$current_branch
        git clean -fd

        log "Code updated to latest commit: $(git rev-parse --short HEAD)"
    else
        error "Repository directory not found: $REPO_DIR"
        error "Please clone the repository first or run with 'clone' option"
        exit 1
    fi
}

# Function to build server
build_server() {
    log "🔧 Building server..."
    cd "$REPO_DIR/server"

    # Install dependencies
    log "Installing server dependencies..."
    bun install

    # Build server
    log "Building server application..."
    mkdir -p "$REPO_DIR/build/server"
    bun build src/index.ts --outdir "$REPO_DIR/build/server" --target bun

    log "Server build completed"
}

# Function to build client
build_client() {
    log "🎨 Building client..."
    cd "$REPO_DIR/client"

    # Install dependencies
    log "Installing client dependencies..."
    npm ci

    # Build client
    log "Building client application..."
    npm run build

    log "Client build completed"
}

# Function to deploy server
deploy_server() {
    log "📦 Deploying server..."

    # Create deployment directory
    mkdir -p "$DEPLOY_DIR"

    # Copy built server files
    cp -r "$REPO_DIR/build/server"/* "$DEPLOY_DIR/"
    cp "$REPO_DIR/server/package.json" "$DEPLOY_DIR/"
    cp "$REPO_DIR/server/bun.lock" "$DEPLOY_DIR/" 2>/dev/null || true

    # Setup environment variables
    if [ ! -f "$DEPLOY_DIR/.env" ]; then
        log "📝 Creating production .env file..."
        cat > "$DEPLOY_DIR/.env" << 'EOF'
NODE_ENV=production
PORT=3000
HOST=0.0.0.0
DATABASE_URL=postgresql://narrari_user:password@localhost:5432/narrari
LOG_LEVEL=info
EOF
        chmod 600 "$DEPLOY_DIR/.env"
        warn "Please update .env file with your actual configuration"
    fi

    # Install production dependencies
    cd "$DEPLOY_DIR"
    log "Installing production dependencies..."
    bun install --production

    log "Server deployment completed"
}

# Function to deploy client
deploy_client() {
    log "🌐 Deploying client..."

    # Remove old client files
    sudo rm -rf "$WEB_ROOT"/*

    # Copy new client files
    sudo cp -r "$REPO_DIR/client/build"/* "$WEB_ROOT/"

    # Set proper permissions
    sudo chown -R www-data:www-data "$WEB_ROOT"
    sudo chmod -R 755 "$WEB_ROOT"

    log "Client deployment completed"
}

# Function to start server
start_server() {
    log "🚀 Starting server..."
    cd "$DEPLOY_DIR"

    # Create log directory
    mkdir -p "$(dirname "$LOG_FILE")"

    # Start server in background
    nohup bun run index.js > "$LOG_FILE" 2>&1 &
    local server_pid=$!

    # Save PID
    echo "$server_pid" > "$PID_FILE"

    log "Server started with PID $server_pid"

    # Wait and verify server started
    sleep 3
    if ! kill -0 "$server_pid" 2>/dev/null; then
        error "Server failed to start. Check logs:"
        tail -n 20 "$LOG_FILE"
        exit 1
    fi

    log "Server is running successfully"
}

# Function to restart nginx
restart_nginx() {
    log "🔄 Restarting nginx..."
    sudo systemctl reload nginx
    log "Nginx restarted"
}

# Function to verify deployment
verify_deployment() {
    log "✅ Verifying deployment..."

    # Check server process
    if [ -f "$PID_FILE" ]; then
        local pid=$(cat "$PID_FILE")
        if kill -0 "$pid" 2>/dev/null; then
            log "✅ Server is running (PID: $pid)"
        else
            error "❌ Server process not running"
            return 1
        fi
    else
        error "❌ PID file not found"
        return 1
    fi

    # Check server HTTP response
    if curl -f -s --max-time 10 http://localhost:$SERVER_PORT/ >/dev/null; then
        log "✅ Server is responding"
    else
        error "❌ Server not responding"
        return 1
    fi

    # Check client files
    if [ -f "$WEB_ROOT/index.html" ]; then
        log "✅ Client files deployed"
    else
        error "❌ Client files not found"
        return 1
    fi

    # Check client HTTP response
    if curl -f -s --max-time 10 http://localhost/ >/dev/null; then
        log "✅ Client is accessible"
    else
        warn "⚠️  Client may not be accessible via HTTP"
    fi

    log "🎉 Deployment verification completed successfully!"
}

# Function to show status
show_status() {
    log "📊 Server Status:"

    if [ -f "$PID_FILE" ]; then
        local pid=$(cat "$PID_FILE")
        if kill -0 "$pid" 2>/dev/null; then
            echo "✅ Server is running (PID: $pid)"
        else
            echo "❌ Server is not running (stale PID file)"
        fi
    else
        echo "❌ No PID file found"
    fi

    if check_port; then
        echo "✅ Port $SERVER_PORT is listening"
    else
        echo "❌ Port $SERVER_PORT is not listening"
    fi

    if [ -f "$LOG_FILE" ]; then
        echo "📋 Recent logs:"
        tail -n 10 "$LOG_FILE"
    fi
}

# Function to clone repository
clone_repository() {
    log "📥 Cloning repository..."

    if [ -d "$REPO_DIR" ]; then
        warn "Repository directory already exists: $REPO_DIR"
        read -p "Do you want to remove it and re-clone? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            rm -rf "$REPO_DIR"
        else
            log "Skipping clone"
            return 0
        fi
    fi

    # Clone repository (you'll need to update this URL)
    git clone https://github.com/your-username/narrari.git "$REPO_DIR"
    log "Repository cloned successfully"
}

# Full deployment process
full_deploy() {
    log "🚀 Starting full deployment process..."

    update_code
    stop_server
    build_server
    build_client
    deploy_server
    deploy_client
    start_server
    restart_nginx
    verify_deployment

    log "🎉 Full deployment completed successfully!"
    log "📊 Deployment summary:"
    log "   Server PID: $(cat $PID_FILE 2>/dev/null || echo 'N/A')"
    log "   Server Port: $SERVER_PORT"
    log "   Client Path: $WEB_ROOT"
    log "   Repository: $REPO_DIR"
    log "   Deployment: $DEPLOY_DIR"
}

# Command line interface
case "${1:-deploy}" in
    "deploy")
        full_deploy
        ;;
    "clone")
        clone_repository
        ;;
    "update")
        update_code
        ;;
    "build")
        update_code
        build_server
        build_client
        ;;
    "start")
        start_server
        verify_deployment
        ;;
    "stop")
        stop_server
        ;;
    "restart")
        stop_server
        start_server
        verify_deployment
        ;;
    "status")
        show_status
        ;;
    "logs")
        if [ -f "$LOG_FILE" ]; then
            tail -f "$LOG_FILE"
        else
            error "Log file not found: $LOG_FILE"
        fi
        ;;
    "verify")
        verify_deployment
        ;;
    *)
        echo "Usage: $0 {deploy|clone|update|build|start|stop|restart|status|logs|verify}"
        echo ""
        echo "Commands:"
        echo "  deploy  - Full deployment (default)"
        echo "  clone   - Clone repository"
        echo "  update  - Update code from git"
        echo "  build   - Update and build both server and client"
        echo "  start   - Start server"
        echo "  stop    - Stop server"
        echo "  restart - Restart server"
        echo "  status  - Show server status"
        echo "  logs    - Follow server logs"
        echo "  verify  - Verify deployment"
        exit 1
        ;;
esac
