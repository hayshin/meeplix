#!/bin/bash

# Deployment Verification Script for Narrari
# This script verifies that both server and client deployments are working correctly

set -e

# Configuration
SERVER_PORT=3000
CLIENT_WEB_ROOT="/var/www/hayshin.dev/html"
DEPLOY_DIR="/home/$USER/narrari-deploy"
LOG_FILE="$DEPLOY_DIR/server.log"
PID_FILE="$DEPLOY_DIR/server.pid"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test results
TESTS_PASSED=0
TESTS_FAILED=0
TESTS_TOTAL=0

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

# Test function
run_test() {
    local test_name="$1"
    local test_command="$2"

    TESTS_TOTAL=$((TESTS_TOTAL + 1))
    info "Running test: $test_name"

    if eval "$test_command"; then
        echo -e "${GREEN}✅ PASS: $test_name${NC}"
        TESTS_PASSED=$((TESTS_PASSED + 1))
        return 0
    else
        echo -e "${RED}❌ FAIL: $test_name${NC}"
        TESTS_FAILED=$((TESTS_FAILED + 1))
        return 1
    fi
}

# Server verification functions
verify_server_process() {
    if [ -f "$PID_FILE" ]; then
        local pid=$(cat "$PID_FILE")
        if kill -0 "$pid" 2>/dev/null; then
            return 0
        fi
    fi
    return 1
}

verify_server_port() {
    if lsof -Pi :$SERVER_PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0
    fi
    return 1
}

verify_server_http() {
    if curl -f -s --max-time 10 http://localhost:$SERVER_PORT/ >/dev/null 2>&1; then
        return 0
    fi
    return 1
}

verify_server_health() {
    local response=$(curl -s --max-time 10 http://localhost:$SERVER_PORT/ 2>/dev/null)
    if [ $? -eq 0 ] && [ -n "$response" ]; then
        return 0
    fi
    return 1
}

# Client verification functions
verify_client_files() {
    [ -f "$CLIENT_WEB_ROOT/index.html" ] && \
    [ -d "$CLIENT_WEB_ROOT/_app" ] && \
    [ -f "$CLIENT_WEB_ROOT/favicon.ico" ]
}

verify_client_permissions() {
    [ -r "$CLIENT_WEB_ROOT/index.html" ] && \
    [ -x "$CLIENT_WEB_ROOT" ]
}

verify_client_http() {
    if curl -f -s --max-time 10 http://localhost/ >/dev/null 2>&1; then
        return 0
    fi
    return 1
}

verify_nginx_running() {
    systemctl is-active --quiet nginx
}

verify_nginx_config() {
    sudo nginx -t >/dev/null 2>&1
}

# Database verification functions
verify_database_connection() {
    if [ -f "$DEPLOY_DIR/.env" ]; then
        source "$DEPLOY_DIR/.env"
        if [ -n "$DATABASE_URL" ]; then
            # Try to connect to database using psql
            if command -v psql >/dev/null 2>&1; then
                psql "$DATABASE_URL" -c "SELECT 1;" >/dev/null 2>&1
                return $?
            fi
        fi
    fi
    return 1
}

# System verification functions
verify_system_resources() {
    local cpu_usage=$(top -bn1 | grep "Cpu(s)" | sed "s/.*, *\([0-9.]*\)%* id.*/\1/" | awk '{print 100 - $1}')
    local memory_usage=$(free | grep Mem | awk '{printf("%.1f"), $3/$2 * 100.0}')
    local disk_usage=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')

    info "System Resources:"
    info "  CPU Usage: ${cpu_usage}%"
    info "  Memory Usage: ${memory_usage}%"
    info "  Disk Usage: ${disk_usage}%"

    # Check if resources are within acceptable limits
    if (( $(echo "$cpu_usage < 80" | bc -l) )) && \
       (( $(echo "$memory_usage < 80" | bc -l) )) && \
       (( disk_usage < 80 )); then
        return 0
    fi
    return 1
}

verify_log_files() {
    if [ -f "$LOG_FILE" ]; then
        # Check if log file is recent (modified within last 5 minutes)
        if [ $(find "$LOG_FILE" -mmin -5) ]; then
            return 0
        fi
    fi
    return 1
}

# Main verification function
main() {
    log "🔍 Starting Narrari Deployment Verification"
    log "========================================="

    # Server tests
    log "🖥️  Server Verification Tests"
    run_test "Server process is running" "verify_server_process"
    run_test "Server port is listening" "verify_server_port"
    run_test "Server HTTP endpoint responds" "verify_server_http"
    run_test "Server health check passes" "verify_server_health"
    run_test "Server log file is recent" "verify_log_files"

    # Client tests
    log "🌐 Client Verification Tests"
    run_test "Client files are deployed" "verify_client_files"
    run_test "Client file permissions are correct" "verify_client_permissions"
    run_test "Nginx is running" "verify_nginx_running"
    run_test "Nginx configuration is valid" "verify_nginx_config"
    run_test "Client HTTP endpoint responds" "verify_client_http"

    # Database tests (optional)
    # log "🗄️  Database Verification Tests"
    # run_test "Database connection works" "verify_database_connection"

    # System tests
    log "⚙️  System Verification Tests"
    run_test "System resources are healthy" "verify_system_resources"

    # Summary
    log "========================================="
    log "📊 Verification Summary"
    log "  Total Tests: $TESTS_TOTAL"
    log "  Passed: $TESTS_PASSED"
    log "  Failed: $TESTS_FAILED"

    if [ $TESTS_FAILED -eq 0 ]; then
        log "🎉 All verification tests passed! Deployment is healthy."
        exit 0
    else
        error "❌ $TESTS_FAILED test(s) failed. Please check the deployment."

        # Show recent logs if server tests failed
        if [ -f "$LOG_FILE" ]; then
            error "Recent server logs:"
            tail -n 10 "$LOG_FILE"
        fi

        exit 1
    fi
}

# Command line options
case "${1:-verify}" in
    "verify")
        main
        ;;
    "quick")
        log "🚀 Quick Verification"
        run_test "Server responds" "verify_server_http"
        run_test "Client responds" "verify_client_http"
        if [ $TESTS_FAILED -eq 0 ]; then
            log "✅ Quick verification passed"
        else
            error "❌ Quick verification failed"
            exit 1
        fi
        ;;
    "server")
        log "🖥️  Server-only Verification"
        run_test "Server process is running" "verify_server_process"
        run_test "Server port is listening" "verify_server_port"
        run_test "Server HTTP endpoint responds" "verify_server_http"
        ;;
    "client")
        log "🌐 Client-only Verification"
        run_test "Client files are deployed" "verify_client_files"
        run_test "Nginx is running" "verify_nginx_running"
        run_test "Client HTTP endpoint responds" "verify_client_http"
        ;;
    "help")
        echo "Usage: $0 {verify|quick|server|client|help}"
        echo "  verify  - Full verification (default)"
        echo "  quick   - Quick health check"
        echo "  server  - Server-only verification"
        echo "  client  - Client-only verification"
        echo "  help    - Show this help message"
        exit 0
        ;;
    *)
        error "Unknown command: $1"
        echo "Use '$0 help' for usage information"
        exit 1
        ;;
esac
